import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as github from "./github";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
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

        // Call LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const assistantMessage = typeof response.choices[0].message.content === "string" 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);

        // Save assistant message
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
});

export type AppRouter = typeof appRouter;
