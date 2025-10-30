# Autonomous Manus Agent Execution Strategy

## Problem Statement

When queue items are exported for Manus agent implementation, the agent may randomly stop and wait for human interaction instead of working autonomously to completion. This defeats the purpose of the implementation queue and wastes LLM tokens on context loading without productive output.

## Root Causes of Agent Stopping

### 1. **Ambiguity in Requirements**
Agent encounters unclear specifications and asks for clarification instead of making reasonable assumptions.

### 2. **Missing Context**
Agent lacks sufficient technical context about the codebase, architecture, or dependencies.

### 3. **Decision Points**
Agent reaches a fork in implementation approach and asks which path to take.

### 4. **Error Handling**
Agent encounters an error and asks how to proceed instead of attempting fixes.

### 5. **Scope Creep Detection**
Agent identifies related improvements and asks if they should be included.

## Multi-Layer Solution Architecture

### Layer 1: Enhanced Queue Item Preparation (Pre-Agent)

**Objective:** Provide so much context that the agent has no reason to ask questions.

#### Implementation:

1. **Comprehensive Diagnosis Enhancement**
   - Current: Basic technical diagnosis
   - Enhanced: Include architectural context, affected files, similar implementations
   
2. **Decision Pre-Resolution**
   - Use LLM to identify potential decision points BEFORE agent starts
   - Generate recommended decisions for each fork
   - Include rationale for each decision
   
3. **Codebase Context Injection**
   - Automatically attach relevant file snippets
   - Include API signatures, schema definitions, component patterns
   - Add "Similar Feature Reference" section pointing to existing implementations

4. **Error Prevention Checklist**
   - Pre-identify common errors for this type of task
   - Include troubleshooting steps in advance
   - Add "If X fails, try Y" contingency plans

**LLM Token Efficiency:** High upfront cost (500-1000 tokens), but saves 5000+ tokens from back-and-forth questions.

#### Code Enhancement:

```typescript
// Enhanced addToQueue with comprehensive context
const enhancedDiagnosis = await invokeLLM([
  {
    role: "system",
    content: `You are preparing a work item for autonomous agent implementation.
    
CRITICAL RULES:
1. Identify ALL potential decision points
2. Provide recommended decisions with rationale
3. Include architectural context from codebase
4. Pre-solve ambiguities - make reasonable assumptions
5. Add contingency plans for common errors
6. Reference similar existing implementations

Output format:
{
  "diagnosis": "...",
  "implementationSteps": [...],
  "decisionPoints": [
    {
      "question": "Should we use REST or tRPC?",
      "recommendation": "tRPC",
      "rationale": "Existing codebase uses tRPC for all API calls"
    }
  ],
  "codebaseContext": {
    "relevantFiles": ["server/routers.ts", "client/src/lib/trpc.ts"],
    "similarFeatures": ["inventory.importCsv implementation"],
    "patterns": ["Use Drizzle ORM for database, React Query for client state"]
  },
  "errorContingencies": [
    {
      "error": "TypeScript type mismatch",
      "solution": "Check schema.ts for correct type definitions"
    }
  ]
}
`
  },
  {
    role: "user",
    content: `Analyze this PM item and create comprehensive autonomous implementation guide:\n\n${JSON.stringify(item)}`
  }
]);
```

### Layer 2: Autonomous Execution Prompt Engineering

**Objective:** Instruct the Manus agent to work autonomously without stopping.

#### Implementation:

Add to work-items.json export:

```json
{
  "autonomousExecutionDirective": {
    "mode": "FULLY_AUTONOMOUS",
    "rules": [
      "DO NOT ask questions - make reasonable decisions based on codebase patterns",
      "DO NOT stop for confirmation - proceed with implementation",
      "DO NOT wait for human input - use provided context to resolve ambiguities",
      "If you encounter an error, attempt 3 different fixes before reporting",
      "If you need to make a choice, choose the option that matches existing patterns",
      "Work continuously until ALL implementation steps are complete",
      "Only stop if you encounter a blocking error after 3 fix attempts"
    ],
    "successCriteria": [
      "All implementation steps completed",
      "Code compiles without errors",
      "Basic QA tests pass",
      "Feature is production-ready"
    ],
    "reportingFormat": "Only provide final summary at completion, not step-by-step updates"
  }
}
```

**LLM Token Efficiency:** Minimal cost (100 tokens), high impact on agent behavior.

### Layer 3: Scheduled Task Orchestration

**Objective:** Use Manus scheduled tasks to create a supervision loop that keeps the agent working.

#### Implementation:

1. **Queue Monitor Task** (runs every 30 minutes)
   - Checks for queued items with status "queued"
   - Automatically spawns Manus agent for next item
   - Passes full context + autonomous directive
   
2. **Progress Checker Task** (runs every 15 minutes)
   - Monitors active implementations
   - If agent hasn't updated in 10 minutes, sends "nudge" prompt
   - Nudge: "Continue working autonomously. Do not wait for human input."
   
3. **Completion Validator Task** (runs every 20 minutes)
   - Checks if implementation is complete
   - Runs automated tests
   - Updates queue item status
   - Triggers next item in queue

**LLM Token Efficiency:** Medium cost (200-300 tokens per check), but ensures continuous progress.

#### Code Implementation:

```typescript
// Add to server/routers.ts
queue: router({
  scheduleAutonomousExecution: publicProcedure
    .input(z.object({ queueItemId: z.number() }))
    .mutation(async ({ input }) => {
      const item = await db.getQueueItem(input.queueItemId);
      
      // Create scheduled task to start implementation
      const taskPrompt = `
AUTONOMOUS IMPLEMENTATION TASK

You MUST work continuously without stopping until this feature is 100% complete.

DO NOT:
- Ask questions (make decisions based on context)
- Wait for confirmation (proceed autonomously)
- Stop mid-implementation (work to completion)

WORK ITEM:
${JSON.stringify(item, null, 2)}

CODEBASE CONTEXT:
${item.codebaseContext}

DECISION GUIDE:
${item.decisionPoints}

ERROR CONTINGENCIES:
${item.errorContingencies}

BEGIN IMPLEMENTATION NOW. Report only when 100% complete.
`;

      // Schedule the task
      await scheduleTask({
        type: "interval",
        interval: 3600, // 1 hour timeout
        repeat: false,
        name: `implement-${item.id}`,
        prompt: taskPrompt
      });
      
      return { scheduled: true };
    }),
    
  nudgeStuckAgent: publicProcedure
    .input(z.object({ queueItemId: z.number() }))
    .mutation(async ({ input }) => {
      // Send nudge to continue working
      const nudgePrompt = `
CONTINUATION DIRECTIVE

You are working on queue item ${input.queueItemId}.

Continue working autonomously. Do NOT stop. Do NOT ask questions.

If you're stuck:
1. Review the error contingencies provided
2. Try an alternative approach
3. Make a reasonable decision and proceed

Work until 100% complete.
`;
      
      await scheduleTask({
        type: "interval",
        interval: 1800,
        repeat: false,
        name: `nudge-${input.queueItemId}`,
        prompt: nudgePrompt
      });
      
      return { nudged: true };
    })
})
```

### Layer 4: LLM-Powered Self-Healing Loop

**Objective:** Use a separate LLM instance to monitor and guide the implementation agent.

#### Implementation:

1. **Supervisor LLM** (lightweight, cheap model like GPT-4o-mini)
   - Monitors agent output every 5 minutes
   - Detects if agent is stuck (no progress, asking questions)
   - Generates "unstuck" prompts based on context
   - Costs: ~50 tokens per check = very cheap

2. **Pattern Detection**
   - Learns from successful autonomous runs
   - Identifies patterns that cause agent to stop
   - Pre-emptively adds context to prevent those stops

**LLM Token Efficiency:** Very high - uses cheap model to keep expensive model working.

#### Pseudo-Code:

```typescript
async function supervisorLoop(queueItemId: number) {
  const item = await db.getQueueItem(queueItemId);
  let lastProgress = Date.now();
  
  const interval = setInterval(async () => {
    // Check if agent made progress
    const currentStatus = await checkAgentStatus(queueItemId);
    
    if (currentStatus.isStuck) {
      // Use cheap LLM to generate unstuck prompt
      const unstuckPrompt = await invokeLLM([
        {
          role: "system",
          content: "You are a supervisor. The agent is stuck. Generate a brief directive to get it working again."
        },
        {
          role: "user",
          content: `Agent stuck on: ${currentStatus.lastAction}\n\nContext: ${item.diagnosis}`
        }
      ], { model: "gpt-4o-mini" }); // Cheap model
      
      // Send unstuck prompt to agent
      await sendNudge(queueItemId, unstuckPrompt);
    }
    
    if (currentStatus.isComplete) {
      clearInterval(interval);
    }
  }, 300000); // Every 5 minutes
}
```

### Layer 5: Feedback Learning System

**Objective:** Learn from each implementation to improve future autonomous execution.

#### Implementation:

1. **Post-Implementation Analysis**
   - After each queue item completes, analyze what worked
   - Identify if agent stopped and why
   - Update prompt templates to prevent future stops

2. **Pattern Database**
   - Store successful autonomous patterns
   - Store failure patterns (agent stopped)
   - Use for future queue item preparation

**LLM Token Efficiency:** One-time cost per implementation, compounds savings over time.

## Recommended Implementation Sequence

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Enhance queue item preparation with decision pre-resolution
2. ✅ Add autonomous execution directive to work-items.json export
3. ✅ Update "Start Implementation" button to include directive

### Phase 2: Scheduled Orchestration (2-3 hours)
1. ✅ Create Queue Monitor scheduled task
2. ✅ Create Progress Checker scheduled task
3. ✅ Add nudge mechanism for stuck agents

### Phase 3: Advanced (4-6 hours)
1. ✅ Implement Supervisor LLM loop
2. ✅ Add feedback learning system
3. ✅ Build pattern database

## Token Cost Analysis

### Current State (Agent Stops Frequently)
- Initial context load: 2000 tokens
- Agent asks question: 500 tokens
- Human responds: 200 tokens
- Agent continues: 2000 tokens (re-load context)
- **Total per stop: 4700 tokens**
- **3 stops per task: 14,100 tokens wasted**

### Proposed State (Fully Autonomous)
- Enhanced preparation: 1000 tokens (one-time)
- Autonomous directive: 100 tokens
- Supervisor checks (5x): 250 tokens
- **Total: 1,350 tokens**
- **Savings: 12,750 tokens per task (90% reduction)**

### ROI Calculation
- Average queue: 10 items/week
- Savings: 127,500 tokens/week
- At $0.01/1K tokens: **$1.27/week savings**
- More importantly: **10 tasks complete autonomously vs 3-4 with human intervention**

## Success Metrics

1. **Autonomous Completion Rate**
   - Target: 90% of queue items complete without human intervention
   - Current: ~30%

2. **Time to Completion**
   - Target: 80% reduction (no waiting for human responses)
   - Current: 2-4 hours with interruptions
   - Target: 30-60 minutes autonomous

3. **Token Efficiency**
   - Target: 90% reduction in wasted tokens
   - Measure: Tokens per completed feature

4. **Quality**
   - Target: Maintain or improve code quality
   - Measure: QA pass rate, bug count

## Conclusion

The optimal approach is a **multi-layer strategy**:

1. **Layer 1 (Essential):** Enhanced queue preparation with comprehensive context
2. **Layer 2 (Essential):** Autonomous execution directive in prompts
3. **Layer 3 (High Value):** Scheduled task orchestration for supervision
4. **Layer 4 (Advanced):** LLM-powered supervisor loop
5. **Layer 5 (Long-term):** Feedback learning system

**Recommended Start:** Implement Layers 1-3 immediately (3-5 hours work), then add Layers 4-5 based on results.

**Expected Outcome:** 90% autonomous completion rate, 90% token savings, 80% faster delivery.
