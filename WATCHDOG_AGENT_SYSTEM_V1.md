# Watchdog Agent System V1: Initial Design

## Problem Statement

Manus agents sometimes stall during implementation - they stop making progress without explicitly asking a question or completing the task. This wastes time and tokens. We need an automated system to detect stalls and spawn continuation agents to pick up where the stalled agent left off.

---

## Core Challenge

**The Fundamental Problem:** We cannot directly monitor a running Manus agent. Manus agents run in isolated execution environments with no API to check their status, read their output mid-execution, or interrupt them.

**What We CAN Do:**
- Schedule tasks to run at specific times
- Write to database from within agent prompts
- Read database state from scheduled tasks
- Spawn new agent tasks with custom prompts

**What We CANNOT Do:**
- Check if an agent is "running" vs "stalled"
- Read agent output before completion
- Send signals to running agents
- Kill or restart agents

---

## V1 Design: Progress Checkpoint System

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION AGENT (Task 1)                              │
│  - Receives work item from queue                            │
│  - Instructed to write progress checkpoints every 10 min    │
│  - Updates database: "Completed step 3 of 10"               │
│  - Continues working                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Writes to DB every 10 min
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PROGRESS TRACKING TABLE                                    │
│  - queue_item_id: 123                                       │
│  - last_checkpoint: "2025-10-30 14:35:00"                   │
│  - last_step: "Completed step 3: Added tRPC endpoint"       │
│  - status: "in_progress"                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Checked by watchdog
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  WATCHDOG TASK (Scheduled every 15 min)                     │
│  - Queries all in_progress items                            │
│  - Checks last_checkpoint timestamp                         │
│  - If > 20 min since last checkpoint → STALLED              │
│  - Spawns continuation agent with context                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Spawns if stalled
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CONTINUATION AGENT (Task 2)                                │
│  - Receives: original work item + last progress checkpoint  │
│  - Prompt: "Previous agent stalled at step 3. Continue..."  │
│  - Picks up from where Task 1 left off                      │
│  - Also writes checkpoints every 10 min                     │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
CREATE TABLE agent_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  queue_item_id INT NOT NULL,
  agent_task_name VARCHAR(255), -- e.g., "implement-123"
  last_checkpoint TIMESTAMP,
  last_step TEXT, -- Human-readable progress description
  completed_steps JSON, -- Array of completed step numbers
  status ENUM('in_progress', 'stalled', 'completed', 'failed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Implementation Agent Prompt (Modified)

```markdown
# AUTONOMOUS IMPLEMENTATION WITH PROGRESS TRACKING

You are implementing this feature autonomously. 

## CRITICAL: Progress Checkpoints

Every 10 minutes of work, you MUST update your progress by executing this SQL:

```sql
UPDATE agent_progress 
SET last_checkpoint = NOW(),
    last_step = 'Brief description of what you just completed',
    completed_steps = JSON_ARRAY_APPEND(completed_steps, '$', [step_number])
WHERE queue_item_id = [ITEM_ID];
```

Example checkpoints:
- "Completed step 2: Created database schema"
- "Completed step 5: Implemented tRPC endpoint"
- "Completed step 8: Added client-side UI component"

This allows the system to detect if you stall and spawn a continuation agent.

## Implementation Steps

[... rest of work item ...]
```

### Watchdog Task (Scheduled)

```typescript
// Schedule watchdog to run every 15 minutes
schedule({
  type: "cron",
  cron: "0 */15 * * * *", // Every 15 minutes
  repeat: true,
  name: "watchdog-agent-monitor",
  prompt: `
# WATCHDOG: Detect Stalled Agents

Check for stalled implementation agents and spawn continuation agents.

## Your Task

1. Query agent_progress table for items with status = 'in_progress'
2. For each item, check if last_checkpoint is > 20 minutes ago
3. If stalled, spawn a continuation agent:
   - Read the queue item details
   - Read the last progress checkpoint
   - Create a new scheduled task with continuation prompt
   - Update agent_progress status to 'stalled'

## SQL to Find Stalled Agents

\`\`\`sql
SELECT queue_item_id, last_step, completed_steps
FROM agent_progress
WHERE status = 'in_progress'
  AND last_checkpoint < NOW() - INTERVAL 20 MINUTE;
\`\`\`

## For Each Stalled Agent

1. Get queue item: \`SELECT * FROM implementationQueue WHERE id = [queue_item_id]\`
2. Spawn continuation agent (see template below)
3. Update status: \`UPDATE agent_progress SET status = 'stalled' WHERE queue_item_id = [id]\`

## Continuation Agent Template

For queue item [ID] that stalled at step [N]:

\`\`\`
Schedule a new task with this prompt:

"CONTINUATION AGENT - Picking up stalled implementation

Original work item: [FULL WORK ITEM]

Previous agent progress:
- Last checkpoint: [TIMESTAMP]
- Last completed step: [STEP DESCRIPTION]
- Completed steps: [ARRAY]

Your task: Continue from where the previous agent left off. Review what was completed, then proceed with remaining steps.

[REST OF AUTONOMOUS EXECUTION DIRECTIVE]
"
\`\`\`

Work autonomously. Report summary of actions taken.
`
});
```

### Continuation Agent Prompt

```markdown
# CONTINUATION AGENT - Recovering from Stalled Implementation

## Context

The previous implementation agent stalled during execution. You are picking up where it left off.

## Previous Agent Progress

**Last Checkpoint:** 2025-10-30 14:35:00  
**Last Step Completed:** "Completed step 3: Added tRPC endpoint"  
**Completed Steps:** [1, 2, 3]  
**Remaining Steps:** [4, 5, 6, 7, 8, 9, 10]

## Your Task

1. **Review what was done:** Check the codebase for changes made by previous agent
   - Look for new files created
   - Check git diff or file timestamps
   - Verify completed steps match the code state

2. **Identify where to continue:** Determine the next logical step based on:
   - Completed steps array
   - Current code state
   - Original implementation plan

3. **Continue implementation:** Pick up from step 4 and work through remaining steps

4. **Write progress checkpoints:** Update agent_progress table every 10 minutes

5. **Complete the feature:** Work until all steps are done or you encounter a blocking error

## Original Work Item

[FULL WORK ITEM WITH DIAGNOSIS, STEPS, QA REQUIREMENTS]

## CRITICAL: Update Progress

Every 10 minutes, execute:
```sql
UPDATE agent_progress 
SET last_checkpoint = NOW(),
    last_step = 'Your progress description',
    completed_steps = JSON_ARRAY_APPEND(completed_steps, '$', [step_number])
WHERE queue_item_id = [ITEM_ID];
```

BEGIN CONTINUATION NOW.
```

---

## Expected Behavior

### Scenario 1: Agent Works Smoothly (No Stall)

1. Implementation agent starts at 14:00
2. Writes checkpoint at 14:10: "Completed step 2"
3. Writes checkpoint at 14:20: "Completed step 5"
4. Writes checkpoint at 14:30: "Completed step 8"
5. Completes at 14:35, marks status = 'completed'
6. Watchdog checks at 14:15, 14:30, 14:45 - sees recent checkpoints, does nothing

**Result:** Feature implemented successfully, no intervention needed.

### Scenario 2: Agent Stalls (Watchdog Intervenes)

1. Implementation agent starts at 14:00
2. Writes checkpoint at 14:10: "Completed step 2"
3. **STALLS** - stops making progress (waiting for human input, infinite loop, etc.)
4. Watchdog checks at 14:15 - last checkpoint 5 min ago, OK
5. Watchdog checks at 14:30 - last checkpoint 20 min ago, OK (borderline)
6. Watchdog checks at 14:45 - last checkpoint 35 min ago, **STALLED**
7. Watchdog spawns continuation agent with context
8. Continuation agent starts at 14:46, reviews code, continues from step 3
9. Continuation agent completes remaining steps by 15:15

**Result:** Feature implemented despite stall, 30 min delay but recovered automatically.

### Scenario 3: Continuation Agent Also Stalls

1. Implementation agent stalls at step 3
2. Watchdog spawns continuation agent at 14:45
3. Continuation agent also stalls at step 5
4. Watchdog detects continuation stall at 15:15
5. Watchdog spawns second continuation agent
6. **After 2 continuation attempts, mark as 'failed' and notify human**

**Result:** System tried twice, but feature needs human intervention.

---

## Advantages

1. **Automatic Recovery:** No human needed for most stalls
2. **Progress Visibility:** Can see exactly where agent stopped
3. **Minimal Overhead:** Checkpoints are simple SQL updates (low token cost)
4. **Works with Manus Architecture:** Uses only available mechanisms (scheduled tasks, database)
5. **Graceful Degradation:** After 2 continuation attempts, escalates to human

---

## Disadvantages (To Be Addressed in Skeptical QA)

1. **Relies on Agent Compliance:** Agent must actually write checkpoints
2. **20-Minute Detection Window:** Stall isn't detected immediately
3. **Potential for Duplicate Work:** Continuation agent might redo some steps
4. **Database Writes from Prompts:** Assumes agents can execute SQL (may not be reliable)
5. **No Root Cause Analysis:** Doesn't identify WHY agent stalled

---

## Implementation Steps

1. Add `agent_progress` table to schema
2. Modify queue `addToQueue` to create initial progress record
3. Update implementation agent prompt template to include checkpoint instructions
4. Create watchdog scheduled task
5. Create continuation agent prompt template
6. Test with intentionally stalled agent (infinite loop or wait for input)
7. Measure recovery success rate

---

## Success Metrics

- **Stall Detection Rate:** % of actual stalls detected by watchdog (target: 90%+)
- **Recovery Success Rate:** % of stalls recovered by continuation agent (target: 70%+)
- **False Positive Rate:** % of non-stalled agents flagged as stalled (target: <5%)
- **Time to Recovery:** Average time from stall to continuation agent start (target: <25 min)

---

**END OF V1 DESIGN**

*Next: Skeptical QA and V2 Improvements*
