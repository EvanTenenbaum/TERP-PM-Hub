// Watchdog Agent System V2: Prompt Generation Helpers

interface QueueItem {
  id: number;
  pmItemId: string;
  title: string;
  description: string;
  diagnosis: string;
  priority: string;
  estimatedMinutes: number;
  dependencies: string | string[] | null;
  qaRequirements: string;
  implementationSteps: string | string[] | null;
  status: string;
}

/**
 * Generate implementation prompt with progress tracking instructions
 */
export function generateImplementationPrompt(queueItem: QueueItem): string {
  const steps = typeof queueItem.implementationSteps === 'string' 
    ? JSON.parse(queueItem.implementationSteps) 
    : (queueItem.implementationSteps || []);
  
  const dependencies = typeof queueItem.dependencies === 'string'
    ? JSON.parse(queueItem.dependencies)
    : (queueItem.dependencies || []);

  return `# AUTONOMOUS IMPLEMENTATION WITH PROGRESS TRACKING

Queue Item: #${queueItem.id}
PM Item ID: ${queueItem.pmItemId}
Title: ${queueItem.title}

## CRITICAL: Write Progress Breadcrumbs

Every 5-10 minutes as you complete major steps, run this command:

\`\`\`bash
echo "$(date '+%Y-%m-%d %H:%M:%S') | Step [N] | [brief description of what you just completed]" >> /tmp/progress-${queueItem.id}.txt
\`\`\`

Example progress entries:
\`\`\`
2025-10-30 14:35:00 | Step 3 | Added tRPC endpoint for queue operations
2025-10-30 14:40:00 | Step 5 | Implemented Zod validation schema
2025-10-30 14:45:00 | Step 7 | Created React component with form UI
\`\`\`

When you complete ALL steps, run this command:

\`\`\`bash
echo "Completed at $(date '+%Y-%m-%d %H:%M:%S')" > /tmp/complete-${queueItem.id}.txt
\`\`\`

This allows continuation agents to pick up if you timeout.

---

## CRITICAL: No Premature Documentation

**DO NOT** create implementation summaries, documentation, or reports until ALL implementation steps are complete.

**Your task is to:**
1. ✅ Implement ALL steps listed below (1 through ${steps.length})
2. ✅ Write progress breadcrumbs as you complete each step
3. ✅ Test against QA requirements
4. ✅ ONLY THEN create completion marker

**If you find yourself:**
- Writing "implementation summary" before step ${steps.length}/${steps.length} is done
- Creating documentation before all code is written
- Stopping early due to "time and token constraints"

**You are violating autonomous execution principles.**

## Execution Directive

You have **60 minutes**. Your ONLY job is implementing steps 1-${steps.length}.

**DO:**
- ✅ Write code for every step
- ✅ Test your implementation
- ✅ Write progress breadcrumbs
- ✅ Fix errors and iterate
- ✅ Work until timeout or completion

**DON'T:**
- ❌ Create summaries before implementation is done
- ❌ Write documentation before code is complete
- ❌ Stop early to "save tokens"
- ❌ Worry about token limits - continuation agent will resume if needed

**Time/token constraints are NOT an excuse to skip implementation.**

If you run out of time, the continuation agent will pick up from your last progress breadcrumb. But you must keep coding until timeout or completion marker is written.

**Work until one of these conditions:**
1. All ${steps.length} steps complete → write /tmp/complete-${queueItem.id}.txt
2. 60-minute timeout → continuation agent resumes automatically

No exceptions. No early stopping. No summaries until done.

---

## Work Item Details

### Description
${queueItem.description}

### Technical Diagnosis
${queueItem.diagnosis}

### Priority
${queueItem.priority}

### Estimated Time
${queueItem.estimatedMinutes} minutes

### Dependencies
${dependencies.length > 0 ? dependencies.map((d: string) => `- ${d}`).join('\n') : 'None'}

### Implementation Steps

${steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

### QA Requirements

${queueItem.qaRequirements}

---

## Tech Stack Context

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Backend:** Node.js, tRPC, Drizzle ORM
- **Database:** MySQL (TiDB)
- **State Management:** React Query (via tRPC hooks)
- **UI Components:** shadcn/ui
- **Notifications:** Sonner toast

## Code Patterns to Follow

1. **API Endpoints:** Use tRPC router pattern (see server/routers.ts)
2. **Database:** Use Drizzle ORM with db.* helper functions (see server/db.ts)
3. **Client State:** Use tRPC hooks (trpc.queue.list.useQuery(), etc.)
4. **Validation:** Share Zod schemas between client and server
5. **UI:** Use shadcn/ui components (Button, Card, Input, etc.)
6. **Styling:** Use Tailwind utility classes

## File Locations

- Server routes: \`server/routers.ts\`
- Database helpers: \`server/db.ts\`
- Database schema: \`drizzle/schema.ts\`
- Client pages: \`client/src/pages/\`
- Client components: \`client/src/components/\`
- tRPC client: \`client/src/lib/trpc.ts\`

---

## Your Task

1. **Implement** all steps listed above
2. **Write progress** to /tmp/progress-${queueItem.id}.txt every 5-10 minutes
3. **Test** your implementation against QA requirements
4. **Mark complete** by writing to /tmp/complete-${queueItem.id}.txt
5. **Report** final status and any issues encountered

## Timeout Handling

You have **60 minutes** to complete this task. If you timeout:
- A continuation agent will read your progress file
- It will continue from your last completed step
- Your work won't be wasted

Work efficiently but thoroughly. Write clear, maintainable code that follows existing patterns.

**BEGIN IMPLEMENTATION NOW.**
`;
}

/**
 * Generate continuation prompt with smart checks
 */
export function generateContinuationPrompt(queueItemId: number, queueItem: QueueItem): string {
  const steps = typeof queueItem.implementationSteps === 'string' 
    ? JSON.parse(queueItem.implementationSteps) 
    : (queueItem.implementationSteps || []);

  return `# CONTINUATION AGENT - Assess and Continue if Needed

Queue Item: #${queueItemId}
PM Item ID: ${queueItem.pmItemId}
Title: ${queueItem.title}

---

## STEP 1: Check if Already Complete

First, check if the original agent completed the task:

\`\`\`bash
if [ -f /tmp/complete-${queueItemId}.txt ]; then
  echo "✅ COMPLETE: Task finished by original agent"
  cat /tmp/complete-${queueItemId}.txt
  
  # Call tRPC endpoint to mark complete
  # (You would use curl or similar to call the API)
  echo "Task is complete. Exiting."
  exit 0
fi
\`\`\`

---

## STEP 2: Check Progress Recency

Check if the original agent is still working (recent progress):

\`\`\`bash
if [ -f /tmp/progress-${queueItemId}.txt ]; then
  echo "📋 Reading progress file..."
  cat /tmp/progress-${queueItemId}.txt
  
  # Get last line and extract timestamp
  last_line=$(tail -1 /tmp/progress-${queueItemId}.txt)
  echo ""
  echo "Last progress entry: $last_line"
  
  # Extract timestamp (first field before |)
  last_time=$(echo "$last_line" | cut -d'|' -f1 | xargs)
  
  # Calculate time difference
  current_epoch=$(date +%s)
  last_epoch=$(date -d "$last_time" +%s 2>/dev/null || echo 0)
  diff=$((current_epoch - last_epoch))
  minutes=$((diff / 60))
  
  echo "Time since last progress: $minutes minutes"
  
  if [ $diff -lt 600 ]; then
    echo "⏳ ACTIVE: Progress < 10 min ago. Agent likely still working."
    echo "Exiting to avoid duplicate work."
    exit 0
  elif [ $diff -lt 1800 ]; then
    echo "⚠️  RECENT: Progress < 30 min ago. Checking code state..."
    # Continue to code assessment
  else
    echo "🔴 STALLED: Progress > 30 min ago. Agent appears stalled."
    echo "Continuing implementation..."
  fi
else
  echo "❌ NO PROGRESS FILE: Agent may have crashed or didn't start properly."
  echo "Starting implementation from beginning..."
fi
\`\`\`

---

## STEP 3: Assess Code State

Review what the original agent completed:

1. **Check git diff** (if using git):
   \`\`\`bash
   git diff --stat
   git log --oneline -5
   \`\`\`

2. **Check file timestamps** to see what was modified:
   \`\`\`bash
   find server client -name "*.ts" -o -name "*.tsx" -mmin -120 | head -20
   \`\`\`

3. **Review progress file** to identify last completed step:
   \`\`\`bash
   cat /tmp/progress-${queueItemId}.txt
   \`\`\`

4. **Determine next step** based on progress entries

---

## STEP 4: Continue Implementation

If task is incomplete, continue from where the original agent left off.

### Original Work Item

**Description:** ${queueItem.description}

**Diagnosis:** ${queueItem.diagnosis}

**Implementation Steps:**
${steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

**QA Requirements:**
${queueItem.qaRequirements}

### Your Continuation Task

1. **Identify** which steps are complete (from progress file and code review)
2. **Pick up** from the next incomplete step
3. **Implement** remaining steps
4. **Write your own progress** to /tmp/progress-${queueItemId}.txt
   - Mark your entries with [CONTINUATION] prefix
   - Example: \`echo "$(date '+%Y-%m-%d %H:%M:%S') | Step 9 | [CONTINUATION] Added error handling" >> /tmp/progress-${queueItemId}.txt\`
5. **Test** implementation against QA requirements
6. **Mark complete** when done:
   \`\`\`bash
   echo "Completed by continuation agent at $(date '+%Y-%m-%d %H:%M:%S')" > /tmp/complete-${queueItemId}.txt
   \`\`\`

---

## Tech Stack & Patterns

Same as original agent:
- React 19, TypeScript, Tailwind CSS 4
- tRPC, Drizzle ORM, MySQL
- Follow existing code patterns in server/routers.ts and client/src/

---

## Important Notes

- **Don't redo completed work** - Check code state carefully before starting
- **Write progress regularly** - Every major step completion
- **Mark complete when done** - Create /tmp/complete-${queueItemId}.txt
- **Report issues** - If you encounter blocking errors after 3 attempts

You have **60 minutes** to complete remaining work.

**BEGIN ASSESSMENT AND CONTINUATION NOW.**
`;
}
