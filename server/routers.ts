import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as github from "./github";
import { invokeLLM } from "./_core/llm";
import { analyzeFeatureComplexity } from "./complexityAnalyzer";
import { generateCode, loadSmartContext, createHandoffPackage } from "./codeGenerator";
import { SelfRegisterSchema, processSelfRegistration } from "./selfRegister";

export const appRouter = router({
  // Self-registration for Manus chats
  selfRegister: router({
    register: publicProcedure
      .input(SelfRegisterSchema)
      .mutation(async ({ input }) => {
        return await processSelfRegistration(input);
      }),
  }),
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // GitHub Sync
  sync: router({
    // Trigger full sync from GitHub
    triggerSync: protectedProcedure.mutation(async () => {
      const syncId = await db.createSyncRecord({
        syncType: "full",
        status: "in-progress",
        startedAt: new Date(),
      });

      try {
        const items = await github.getAllPMItems();

        for (const item of items) {
          await db.upsertPMItem({
            itemId: item.id,
            type: item.type,
            title: item.title,
            description: item.description || null,
            status: item.status,
            tags: item.tags || [],
            related: item.related || [],
            githubPath: item.githubPath,
            metadata: item.metadata || {},
            lastSyncedAt: new Date(),
            createdAt: new Date(item.created_at || Date.now()),
            updatedAt: new Date(item.updated_at || Date.now()),
          });
        }

        if (syncId) {
          await db.updateSyncRecord(syncId, {
            status: "success",
            itemCount: items.length,
            completedAt: new Date(),
          });
        }

        return {
          success: true,
          itemCount: items.length,
        };
      } catch (error: any) {
        if (syncId) {
          await db.updateSyncRecord(syncId, {
            status: "failed",
            error: error.message,
            completedAt: new Date(),
          });
        }

        throw error;
      }
    }),

    // Get latest sync status
    getLatestSync: protectedProcedure.query(async () => {
      return await db.getLatestSync("full");
    }),
  }),

  // PM Items
  pmItems: router({
    // Get all PM items
    list: protectedProcedure.query(async () => {
      return await db.getAllPMItems();
    }),

    // Get single PM item
    get: protectedProcedure.input(z.object({ itemId: z.string() })).query(async ({ input }) => {
      return await db.getPMItemById(input.itemId);
    }),

    // Update PM item
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(['FEAT', 'BUG', 'IDEA', 'IMPROVE', 'TECH']).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['inbox', 'backlog', 'planned', 'in-progress', 'completed', 'on-hold', 'archived']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        tags: z.array(z.string()).optional(),
        related: z.array(z.string()).optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updatePMItem(id, updates as any);
      }),

    // Delete PM item
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // TODO: Add cascade protection - check for dependencies
        await db.deletePMItem(input.id);
        return { success: true };
      }),

    // Enhance PM item with additional context using AI
    enhanceWithContext: protectedProcedure
      .input(z.object({
        itemId: z.string().optional(),
        id: z.number().optional(),
        context: z.string().min(10, 'Context must be at least 10 characters'),
      }))
      .mutation(async ({ input }) => {
        // Support both itemId (string) and id (number) for flexibility
        let item;
        if (input.itemId) {
          item = await db.getPMItemById(input.itemId);
        } else if (input.id) {
          // Get all items and find by numeric ID
          const allItems = await db.getAllPMItems();
          item = allItems.find(i => i.id === input.id);
        } else {
          throw new Error('Either itemId or id must be provided');
        }

        if (!item) {
          throw new Error('Item not found');
        }

        // Use LLM to analyze original item + new context and generate improvements
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a product management AI assistant. Analyze the original PM item and additional context provided by the user. Generate an enhanced version with:
1. Improved, more detailed description incorporating the new context
2. Recommended priority (low, medium, high, critical)
3. Suggested related items (array of item IDs if applicable)
4. Recommended status change if needed
5. Suggested tags to add

Return JSON only with: enhancedDescription, priority, relatedItems (array), suggestedStatus, suggestedTags (array), reasoning (brief explanation of changes).`,
            },
            {
              role: 'user',
              content: `Original Item:
Title: ${item.title}
Description: ${item.description || 'No description'}
Type: ${item.type}
Current Priority: ${item.priority || 'Not set'}
Current Status: ${item.status}
Current Tags: ${item.tags?.join(', ') || 'None'}
Current Related Items: ${item.related?.join(', ') || 'None'}

Additional Context:
${input.context}

Please enhance this item based on the new context.`,
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'enhanced_item',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  enhancedDescription: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                  relatedItems: { type: 'array', items: { type: 'string' } },
                  suggestedStatus: { type: 'string', enum: ['inbox', 'backlog', 'planned', 'in-progress', 'completed', 'on-hold', 'archived'] },
                  suggestedTags: { type: 'array', items: { type: 'string' } },
                  reasoning: { type: 'string' },
                },
                required: ['enhancedDescription', 'priority', 'relatedItems', 'suggestedStatus', 'suggestedTags', 'reasoning'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const enhanced = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        // Update the item with AI enhancements
        const updates: any = {
          description: enhanced.enhancedDescription,
          priority: enhanced.priority as any,
        };
        
        // Add related items if provided
        if (enhanced.relatedItems.length > 0) {
          updates.related = enhanced.relatedItems;
        }
        
        // Merge suggested tags with existing tags
        if (enhanced.suggestedTags.length > 0) {
          const existingTags = item.tags || [];
          const allTags = [...existingTags, ...enhanced.suggestedTags];
          const uniqueTags = Array.from(new Set(allTags));
          updates.tags = uniqueTags;
        }
        
        // Only update status if it's a meaningful change
        if (enhanced.suggestedStatus !== item.status) {
          updates.status = enhanced.suggestedStatus as any;
        }

        await db.updatePMItem(item.id, updates);

        return {
          success: true,
          enhanced,
          itemId: item.itemId,
        };
      }),
  }),

  // Conversations
  conversations: router({
    // Create new conversation
    create: protectedProcedure
      .input(
        z.object({
          agentType: z.enum(["inbox", "planning", "qa", "expert"]),
          title: z.string(),
          relatedItemId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conversationId = await db.createConversation({
          userId: ctx.user.id,
          agentType: input.agentType,
          title: input.title,
          relatedItemId: input.relatedItemId || null,
          metadata: {},
        });

        return { conversationId };
      }),

    // List user conversations
    list: protectedProcedure
      .input(z.object({ agentType: z.enum(["inbox", "planning", "qa", "expert"]).optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserConversations(ctx.user.id, input.agentType);
      }),

    // Get conversation with messages
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const conversation = await db.getConversationById(input.id);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const msgs = await db.getConversationMessages(input.id);

      return {
        conversation,
        messages: msgs,
      };
    }),
  }),

  // Chat
  chat: router({
    // Send message to AI agent
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Save user message
        await db.createMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
          metadata: {},
        });

        // Get conversation context
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        // Get chat context from GitHub
        const agentType = conversation.agentType === "expert" ? "planning" : conversation.agentType;
        const contextContent = await github.getChatContext(agentType);

        // Get conversation history
        const history = await db.getConversationMessages(input.conversationId);

        // Build messages for LLM
        const llmMessages = [
          {
            role: "system" as const,
            content: contextContent,
          },
          ...history.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          })),
        ];

        // Call LLM with structured output for inbox agent
        const useStructured = conversation.agentType === 'inbox';
        
        const response = await invokeLLM({
          messages: llmMessages,
          ...(useStructured && {
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "inbox_item",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["FEAT", "BUG", "IDEA", "IMPROVE", "TECH"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    response: { type: "string" }
                  },
                  required: ["type", "title", "description", "priority", "response"],
                  additionalProperties: false
                }
              }
            }
          })
        });

        const rawContent = typeof response.choices[0].message.content === "string" 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);

        // For inbox agent, create PM item from structured response and extract user-friendly message
        let assistantMessage = rawContent;
        if (useStructured && conversation.agentType === 'inbox') {
          try {
            const parsed = JSON.parse(rawContent);
            await db.upsertPMItem({
              itemId: `TERP-${parsed.type}-${Date.now()}`,
              type: parsed.type,
              title: parsed.title,
              description: parsed.description,
              status: 'inbox',
              priority: parsed.priority,
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: { conversationId: input.conversationId }
            });
            
            // Extract the user-friendly response field for display
            assistantMessage = parsed.response || rawContent;
          } catch (e) {
            console.error('Failed to parse inbox item:', e);
            // Keep raw content if parsing fails
          }
        }

        // Save assistant message (user-friendly version for inbox, raw for others)
        await db.createMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: assistantMessage,
          metadata: {
            model: response.model,
            usage: response.usage,
          },
        });

        return {
          message: assistantMessage,
        };
      }),
  }),

  // Dev Agent
  devAgent: router({
    analyzeComplexity: protectedProcedure
      .input(z.object({ devBrief: z.string() }))
      .mutation(async ({ input }) => {
        const complexity = await analyzeFeatureComplexity(input.devBrief);
        return complexity;
      }),
    
    generateCode: protectedProcedure
      .input(z.object({ 
        featureId: z.string(),
        githubPath: z.string()
      }))
      .mutation(async ({ input }) => {
        const context = await loadSmartContext(input.featureId, input.githubPath);
        const result = await generateCode(input.featureId, context, undefined);
        return result;
      }),
    
    createHandoff: protectedProcedure
      .input(z.object({
        featureId: z.string(),
        generatedCode: z.record(z.string(), z.string()).optional(),
        issues: z.array(z.object({
          type: z.enum(['syntax', 'type', 'import', 'lint']),
          message: z.string(),
          line: z.number().optional(),
          autoFixable: z.boolean()
        }))
      }))
      .mutation(async ({ input }) => {
        const handoffPrompt = await createHandoffPackage(
          input.featureId,
          input.generatedCode as Record<string, string> | undefined,
          input.issues
        );
        return { handoffPrompt };
      }),
  }),

  // Client Feedback Portal
  feedback: router({
    // List all feedback items
    list: protectedProcedure
      .input(z.object({ includeArchived: z.boolean().optional() }))
      .query(async ({ input }) => {
        const items = await db.getAllPMItems();
        
        // Filter to only IDEA and BUG types (client feedback)
        let feedbackItems = items.filter(item => item.type === 'IDEA' || item.type === 'BUG');
        
        // Filter out archived if requested
        if (!input.includeArchived) {
          feedbackItems = feedbackItems.filter(item => item.status !== 'archived');
        }
        
        return feedbackItems;
      }),
    
    // Get single feedback item with AI suggestions
    getWithSuggestions: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const item = await db.getPMItemById(input.id);
        if (!item) {
          throw new Error('Feedback not found');
        }
        
        // Generate suggestions if not already cached
        if (!item.aiSuggestions) {
          // Will be generated on-demand via generateSuggestions mutation
          return item;
        }
        
        return item;
      }),
    
    // Archive feedback item
    archive: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const item = await db.getPMItemById(input.id);
        if (!item) {
          throw new Error('Feedback not found');
        }
        await db.updatePMItem(item.id, { status: 'archived' });
        return { success: true };
      }),
    
    // Generate AI suggestions for feedback
    generateSuggestions: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const item = await db.getPMItemById(input.id);
        if (!item) {
          throw new Error('Feedback not found');
        }
        
        // Build prompt for AI suggestion generation
        const systemPrompt = `You are an expert product manager analyzing customer feedback for the TERP ERP system.

TERP has the following modules:
- Dashboard & Homepage
- Inventory Management (products, stock, locations, categories)
- Accounting (chart of accounts, transactions, bank reconciliation)
- Sales & Quotes (orders, pricing, client management)
- Reporting & Analytics

Analyze the feedback and provide:
1. WHERE to apply it (which modules/features)
2. HOW to implement it (technical approach, complexity, steps)
3. CONFIDENCE score (0-100) based on clarity and feasibility

Be specific, actionable, and consider TERP's existing architecture.`;
        
        const userPrompt = `Feedback Title: ${item.title}\n\nFeedback Description:\n${item.description || 'No description provided'}`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'feedback_suggestions',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  where: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of TERP modules/features where this feedback applies'
                  },
                  how: {
                    type: 'string',
                    description: 'Detailed implementation guidance with technical approach'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score 0-100 based on clarity and feasibility'
                  }
                },
                required: ['where', 'how', 'confidence'],
                additionalProperties: false
              }
            }
          }
        });
        
        const suggestions = JSON.parse(response.choices[0].message.content as string);
        suggestions.generatedAt = new Date().toISOString();
        
        // Save suggestions to database
        await db.updatePMItem(item.id, { aiSuggestions: suggestions });
        
        return suggestions;
      }),
    
    // Client-facing submission endpoint (no auth required for public feedback)
    submit: publicProcedure
      .input(z.object({
        feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
      }))
      .mutation(async ({ input }) => {
        // Create PM item directly from client feedback (simplified, working approach)
        const itemId = `TERP-IDEA-${Date.now()}`;
        const now = new Date();
        
        // Extract first 60 chars for title, rest for description
        const title = input.feedback.length > 60 
          ? input.feedback.substring(0, 57) + '...'
          : input.feedback;
        
        await db.upsertPMItem({
          itemId,
          title,
          description: input.feedback,
          type: 'IDEA', // Default to IDEA, PM can reclassify
          status: 'inbox',
          priority: 'medium',
          tags: ['client-feedback'],
          createdAt: now,
          updatedAt: now,
        });
        
        return { success: true, itemId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
