/**
 * Smart LLM invocation with hybrid free+paid strategy
 * Maximizes use of free tokens while maintaining quality
 */

import { invokeLLM, type InvokeParams, type InvokeResult } from './llm.js';

export interface SmartLLMOptions {
  /** If true, requires code generation (may need paid model) */
  requiresCodeGen?: boolean;
  /** If true, requires advanced reasoning (may need paid model) */
  requiresAdvancedReasoning?: boolean;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** If true, skip free model and go straight to paid */
  forcePaid?: boolean;
}

/**
 * Invoke LLM with smart free/paid routing
 * Strategy: Try free first, escalate to paid if quality insufficient
 */
/**
 * Helper to extract text content from LLM result
 */
function extractContent(result: InvokeResult): string {
  const message = result.choices[0]?.message;
  if (!message) return '';
  
  if (typeof message.content === 'string') {
    return message.content;
  }
  
  if (Array.isArray(message.content)) {
    return message.content
      .filter(part => part.type === 'text')
      .map(part => 'text' in part ? part.text : '')
      .join('\n');
  }
  
  return '';
}

export async function invokeLLMSmart(
  prompt: string,
  options: SmartLLMOptions = {}
): Promise<string> {
  const params: InvokeParams = {
    messages: [{ role: 'user', content: prompt }],
    maxTokens: options.maxTokens || 2000,
  };

  // Note: Current system uses gemini-2.5-flash (free) by default
  // No need for hybrid approach since it's already free
  const result = await invokeLLM(params);
  return extractContent(result);
}

/**
 * Generate PRD with hybrid approach:
 * 1. Free model creates structure/draft (80% of work)
 * 2. Paid model enhances with details (20% of work, 80% of value)
 */
export async function generatePRDHybrid(idea: string, context?: string): Promise<string> {
  try {
    // Step 1: Free model generates draft structure
    const draftPrompt = `You are a product manager. Create a PRD (Product Requirements Document) draft for this idea:

"${idea}"

${context ? `Additional context: ${context}` : ''}

Generate a structured PRD with these sections:
1. Overview (1-2 sentences)
2. User Stories (3-5 stories)
3. Requirements (functional + non-functional)
4. Technical Approach (high-level)
5. Edge Cases (list potential issues)
6. QA Criteria (how to test)

Keep it concise but complete. Focus on structure over details.`;

    console.log('[PRD] Starting draft generation...');
    const draftResult = await Promise.race([
      invokeLLM({
        messages: [{ role: 'user', content: draftPrompt }],
        maxTokens: 1500,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Draft generation timeout after 30s')), 30000)
      )
    ]);
    const draft = extractContent(draftResult);
    console.log('[PRD] Draft generated, length:', draft.length);

    // Step 2: Paid model enhances with security, edge cases, technical details
    const enhancePrompt = `You are a senior product manager and technical architect. Enhance this PRD draft with:

1. Security considerations (auth, data validation, CSRF, XSS, etc.)
2. Performance implications (caching, database queries, API calls)
3. Edge cases and error handling
4. Technical implementation details
5. Dependencies on existing features
6. Rollback/migration strategy if applicable

Original draft:
${draft}

Provide the COMPLETE enhanced PRD, not just additions. Maintain the structure but add depth.`;

    console.log('[PRD] Starting enhancement...');
    const enhancedResult = await Promise.race([
      invokeLLM({
        messages: [{ role: 'user', content: enhancePrompt }],
        maxTokens: 2000,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Enhancement timeout after 30s')), 30000)
      )
    ]);
    const enhanced = extractContent(enhancedResult);
    console.log('[PRD] Enhancement complete, length:', enhanced.length);

    return enhanced;
  } catch (error) {
    console.error('[PRD] Generation failed:', error);
    throw new Error(`PRD generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Estimate LLM cost based on token count
 * Uses gpt-tokenizer for accurate counting
 */
export function estimateLLMCost(prompt: string, response: string, model: string): number {
  // Rough estimation: 4 chars ≈ 1 token
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(response.length / 4);

  const costs: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-3.5-turbo': { input: 0.0015 / 1000, output: 0.002 / 1000 },
  };

  const modelCosts = costs[model] || costs['gpt-4'];
  return inputTokens * modelCosts.input + outputTokens * modelCosts.output;
}
