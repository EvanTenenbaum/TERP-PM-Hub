# Queue-First Workflow Redesign (Bible-Compliant)

## Core Concept
**ALL development tasks flow through Implementation Queue before going to Manus agent.**

## Current (Broken) Flow
1. Capture idea/bug → Inbox
2. Click "Full Agent" → Copy to clipboard → Manual Manus chat
3. No tracking, no queue, no structure

## New (Bible-Compliant) Flow
1. **Capture** → Quick Capture creates PM item in Inbox
2. **Triage** → Review in Inbox, add context
3. **Add to Queue** → LLM analyzes, creates structured work item with:
   - Diagnosis of what needs to be done
   - Priority (critical/high/medium/low)
   - Estimated time (minutes)
   - Dependencies (other items that must be done first)
   - QA requirements
   - Specific implementation steps
4. **Queue Management** → View all queued work items, reorder by priority
5. **Export & Implement** → Export queue to work-items.json, give to Manus agent

## UI/UX Changes Required

### 1. Inbox Page
**REMOVE:**
- "Full Agent" button (copies to clipboard - not Bible-compliant)
- "Try Quick Fix" placeholder button

**ADD:**
- **"Add to Implementation Queue"** button (primary action)
- Shows modal with LLM-generated work item preview
- User can edit before adding to queue

### 2. Kanban Board
**REMOVE:**
- Direct "implement" actions

**ADD:**
- **"Queue for Implementation"** button in card detail modal
- Same LLM analysis + preview flow

### 3. Features Page
**ADD:**
- Bulk action: "Add Selected to Queue"
- Analyzes multiple items, creates queue entries

### 4. NEW: Implementation Queue Page (/queue)
**Features:**
- List view of all queued work items
- Sortable by priority, estimated time, dependencies
- Drag-to-reorder priority
- Dependency graph visualization
- Status: queued → in-progress → completed
- **Export to work-items.json** button
- **Send to Manus Agent** button (creates new chat with queue context)

### 5. Dashboard
**ADD:**
- Queue widget showing:
  - Items in queue (count)
  - Total estimated time
  - Next item to implement
  - Quick link to /queue

## Database Schema

### New Table: implementationQueue
```typescript
{
  id: number (auto-increment primary key)
  pmItemId: string (references pmItems.itemId)
  title: string
  description: text
  diagnosis: text (LLM-generated analysis)
  priority: enum('critical', 'high', 'medium', 'low')
  estimatedMinutes: number
  dependencies: json (array of pmItemIds)
  qaRequirements: text
  implementationSteps: json (array of strings)
  status: enum('queued', 'in-progress', 'completed', 'blocked')
  assignedTo: string (optional - for future team features)
  createdAt: timestamp
  updatedAt: timestamp
  completedAt: timestamp (nullable)
}
```

## LLM Analysis Prompt
When user clicks "Add to Queue", LLM receives:
```
PM Item: {title, description, type, tags, related}
Context: {user-provided additional context}

Generate structured work item with:
1. Diagnosis: What exactly needs to be built/fixed and why
2. Priority: Based on urgency, impact, dependencies
3. Estimated time: Realistic minutes to implement (60-90 min phases)
4. Dependencies: Other PM items that must be done first
5. QA requirements: How to verify it works
6. Implementation steps: Specific, actionable steps for agent
```

## work-items.json Export Format
```json
{
  "version": "1.0",
  "project": "TERP PM Hub",
  "generated": "2025-10-30T00:00:00Z",
  "items": [
    {
      "id": "TERP-FEAT-001",
      "title": "Dashboard & Homepage",
      "description": "...",
      "priority": "high",
      "estimatedMinutes": 90,
      "dependencies": [],
      "qaRequirements": "...",
      "steps": ["Step 1", "Step 2", "..."],
      "status": "queued"
    }
  ]
}
```

## Implementation Order (Bible-Compliant)
1. ✅ Create database schema + migration
2. ✅ Build tRPC router for queue operations
3. ✅ Update Inbox: remove broken buttons, add "Add to Queue"
4. ✅ Build queue analysis LLM endpoint
5. ✅ Build /queue page UI
6. ✅ Add export to work-items.json
7. ✅ Update Kanban with queue integration
8. ✅ Add Dashboard queue widget
9. ✅ Comprehensive QA testing
10. ✅ Fix any bugs found
11. ✅ Final verification

## Success Criteria (99% Certainty)
- ✅ All "Add to Queue" flows work end-to-end
- ✅ LLM analysis generates useful work items
- ✅ Queue page displays and manages items correctly
- ✅ Export generates valid work-items.json
- ✅ No placeholders, no broken buttons
- ✅ Database operations verified
- ✅ Mobile responsive
- ✅ Error handling tested
