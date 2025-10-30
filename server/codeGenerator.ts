import { invokeLLM } from "./_core/llm";
import { getFileContent } from "./github";

export interface ValidationIssue {
  type: 'syntax' | 'type' | 'import' | 'lint';
  message: string;
  line?: number;
  autoFixable: boolean;
}

export interface GenerationResult {
  success: boolean;
  code?: string;
  files?: Record<string, string>;
  validation?: {
    valid: boolean;
    issues: ValidationIssue[];
  };
  error?: string;
}

export interface GenerationProgress {
  stage: 'loading_context' | 'analyzing_complexity' | 'generating_code' | 'validating' | 'auto_fixing' | 'complete' | 'error';
  progress: number;
  message?: string;
}

export async function loadSmartContext(featureId: string, githubPath: string): Promise<string> {
  try {
    // Load dev-brief
    const devBriefPath = `${githubPath}/features/in-progress/${featureId}/dev-brief.md`;
    const file = await getFileContent(devBriefPath);

    if (file) {
      return file.content;
    }

    throw new Error('Dev brief not found');
  } catch (error) {
    console.error('Error loading context:', error);
    throw new Error('Failed to load feature context from GitHub');
  }
}

export async function generateCode(
  featureId: string,
  context: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  try {
    onProgress?.({ stage: 'generating_code', progress: 40, message: 'Generating implementation...' });

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer implementing features for the TERP project.

Generate clean, production-ready code following these guidelines:
- Use TypeScript with proper typing
- Follow existing code patterns
- Include error handling
- Add inline comments for complex logic
- Use modern React patterns (hooks, functional components)
- Follow the project's conventions

Output the code in a structured JSON format:
{
  "files": {
    "path/to/file.ts": "file content",
    "path/to/another.tsx": "file content"
  },
  "summary": "Brief description of what was implemented"
}`
        },
        {
          role: "user",
          content: `Implement this feature:\n\n${context}\n\nGenerate the necessary code files.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "code_generation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              files: {
                type: "object",
                additionalProperties: { type: "string" }
              },
              summary: { type: "string" }
            },
            required: ["files", "summary"],
            additionalProperties: false
          }
        }
      }
    });

    onProgress?.({ stage: 'validating', progress: 70, message: 'Validating generated code...' });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    const result = JSON.parse(content);

    // Basic validation
    const validation = await validateGeneratedCode(result.files);

    onProgress?.({ stage: 'complete', progress: 100, message: 'Code generation complete!' });

    return {
      success: validation.valid,
      files: result.files,
      validation,
    };
  } catch (error) {
    onProgress?.({ stage: 'error', progress: 0, message: error instanceof Error ? error.message : 'Unknown error' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function validateGeneratedCode(files: Record<string, string>): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];

  // Basic validation checks
  for (const [path, content] of Object.entries(files)) {
    // Check for common syntax issues
    if (content.includes('undefined') && !content.includes('typeof undefined')) {
      issues.push({
        type: 'lint',
        message: `Potential undefined usage in ${path}`,
        autoFixable: false,
      });
    }

    // Check for missing imports (very basic)
    if (content.includes('React') && !content.includes('import') && !content.includes('from "react"')) {
      issues.push({
        type: 'import',
        message: `Missing React import in ${path}`,
        autoFixable: true,
      });
    }

    // Check for TypeScript files without types
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      const hasTypes = content.includes(': ') || content.includes('interface ') || content.includes('type ');
      if (!hasTypes && content.length > 100) {
        issues.push({
          type: 'type',
          message: `No type annotations found in ${path}`,
          autoFixable: false,
        });
      }
    }
  }

  return {
    valid: issues.filter(i => i.type === 'syntax' || i.type === 'import').length === 0,
    issues,
  };
}

export async function createHandoffPackage(
  featureId: string,
  generatedCode: Record<string, string> | undefined,
  issues: ValidationIssue[]
): Promise<string> {
  const devBriefUrl = `https://github.com/EvanTenenbaum/TERP/tree/main/product-management/features/in-progress/${featureId}/dev-brief.md`;

  const issuesText = issues.length > 0
    ? `\n\nIssues found:\n${issues.map(i => `- [${i.type}] ${i.message}`).join('\n')}`
    : '';

  const codeText = generatedCode
    ? `\n\nGenerated code:\n\`\`\`\n${JSON.stringify(generatedCode, null, 2)}\n\`\`\``
    : '';

  const prompt = `Continue development of ${featureId}

Dev-brief: ${devBriefUrl}${codeText}${issuesText}

Please review the generated code, fix any issues, and complete the implementation following the dev-brief requirements.`;

  // In a real implementation, this would create a Manus chat link
  // For now, return the prompt that should be used
  return prompt;
}
