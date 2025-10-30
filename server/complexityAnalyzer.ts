import { invokeLLM } from "./_core/llm";

export interface ComplexityScore {
  score: number; // 0-100
  factors: {
    filesAffected: number;
    linesEstimate: number;
    dependencies: string[];
    hasDatabase: boolean;
    hasAuth: boolean;
    hasExternalAPI: boolean;
  };
  recommendation: 'quick' | 'full' | 'uncertain';
  reasoning: string;
}

export async function analyzeFeatureComplexity(devBrief: string): Promise<ComplexityScore> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a technical complexity analyzer. Analyze feature specifications and determine implementation complexity.

Output JSON only with this exact structure:
{
  "filesAffected": number,
  "linesEstimate": number,
  "dependencies": string[],
  "hasDatabase": boolean,
  "hasAuth": boolean,
  "hasExternalAPI": boolean,
  "score": number (0-100, where 0=trivial, 100=extremely complex),
  "recommendation": "quick" | "full" | "uncertain",
  "reasoning": "brief explanation"
}`
      },
      {
        role: "user",
        content: `Analyze this feature specification:\n\n${devBrief}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "complexity_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            filesAffected: { type: "number" },
            linesEstimate: { type: "number" },
            dependencies: { 
              type: "array",
              items: { type: "string" }
            },
            hasDatabase: { type: "boolean" },
            hasAuth: { type: "boolean" },
            hasExternalAPI: { type: "boolean" },
            score: { type: "number" },
            recommendation: { 
              type: "string",
              enum: ["quick", "full", "uncertain"]
            },
            reasoning: { type: "string" }
          },
          required: ["filesAffected", "linesEstimate", "dependencies", "hasDatabase", "hasAuth", "hasExternalAPI", "score", "recommendation", "reasoning"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from LLM");
  }

  const analysis = JSON.parse(content);

  return {
    score: analysis.score,
    factors: {
      filesAffected: analysis.filesAffected,
      linesEstimate: analysis.linesEstimate,
      dependencies: analysis.dependencies,
      hasDatabase: analysis.hasDatabase,
      hasAuth: analysis.hasAuth,
      hasExternalAPI: analysis.hasExternalAPI,
    },
    recommendation: analysis.recommendation,
    reasoning: analysis.reasoning,
  };
}

export function getComplexityLabel(score: number): string {
  if (score < 30) return "Simple";
  if (score < 60) return "Medium";
  return "Complex";
}

export function shouldUseQuickGen(complexity: ComplexityScore): boolean {
  return complexity.recommendation === "quick" && complexity.score < 40;
}
