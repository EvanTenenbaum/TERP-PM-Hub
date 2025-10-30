import * as fs from 'fs';
import * as path from 'path';

interface TerpKnowledge {
  bible: {
    full_text: string;
    sections: Record<string, string>;
  };
  protocols: Record<string, string>;
  context: Record<string, string>;
  standards: Record<string, string>;
  patterns: {
    tech_stack: Record<string, string>;
    file_structure: Record<string, string>;
    naming_conventions: Record<string, string>;
  };
}

let cachedKnowledge: TerpKnowledge | null = null;

export function loadTerpKnowledge(): TerpKnowledge {
  if (cachedKnowledge) return cachedKnowledge;
  
  const knowledgePath = path.join(__dirname, 'terp-knowledge.json');
  const data = fs.readFileSync(knowledgePath, 'utf-8');
  cachedKnowledge = JSON.parse(data);
  
  return cachedKnowledge!;
}

/**
 * Get the full Bible (DEVELOPMENT_PROTOCOLS.md)
 */
export function getBible(): string {
  const knowledge = loadTerpKnowledge();
  return knowledge.bible.full_text;
}

/**
 * Get specific Bible section
 */
export function getBibleSection(sectionName: string): string | null {
  const knowledge = loadTerpKnowledge();
  return knowledge.bible.sections[sectionName] || null;
}

/**
 * Get project context
 */
export function getProjectContext(): string {
  const knowledge = loadTerpKnowledge();
  return knowledge.context.project || '';
}

/**
 * Get design standards
 */
export function getDesignStandards(): string {
  const knowledge = loadTerpKnowledge();
  return knowledge.standards.design || '';
}

/**
 * Get agent onboarding protocol
 */
export function getAgentOnboarding(): string {
  const knowledge = loadTerpKnowledge();
  return knowledge.protocols.agent_onboarding || '';
}

/**
 * Get quick reference for developers
 */
export function getQuickReference(): string {
  const knowledge = loadTerpKnowledge();
  return knowledge.protocols.quick_reference || '';
}

/**
 * Get tech stack info
 */
export function getTechStack(): Record<string, string> {
  const knowledge = loadTerpKnowledge();
  return knowledge.patterns.tech_stack;
}

/**
 * Generate context for development agents
 * This includes all relevant protocols and standards
 */
export function generateAgentContext(featureType?: string): string {
  const bible = getBible();
  const context = getProjectContext();
  const techStack = getTechStack();
  
  return `
# TERP Development Context

## Project Overview
${context}

## Tech Stack
- Frontend: ${techStack.frontend}
- Backend: ${techStack.backend}
- Database: ${techStack.database}
- Auth: ${techStack.auth}
- Deployment: ${techStack.deployment}

## Development Protocols (The Bible)
${bible}

---

**IMPORTANT**: Follow ALL protocols in the Bible above. These are non-negotiable standards for TERP development.
`.trim();
}

/**
 * Get condensed protocol summary for code generation prompts
 */
export function getProtocolSummary(): string {
  const productionStandard = getBibleSection('Production-Ready Code Standard') || '';
  const qualityChecklist = getBibleSection('Quality Standards Checklist') || '';
  
  return `## TERP Development Standards

### Production-Ready Code
${productionStandard.substring(0, 1500)}

### Quality Checklist
${qualityChecklist.substring(0, 1000)}

Follow these standards for all code.`.trim();
}

/**
 * Get protocol compliance checklist
 */
export function getProtocolChecklist(): string[] {
  const bible = getBible();
  
  // Extract checklist items from Bible
  const checklistItems: string[] = [];
  const lines = bible.split('\n');
  
  for (const line of lines) {
    if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
      checklistItems.push(line.trim().substring(6));
    }
  }
  
  return checklistItems;
}
