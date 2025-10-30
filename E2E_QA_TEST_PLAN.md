# End-to-End QA Test Plan: Idea → Queue → Implementation

## Test Workflow

**Complete Flow:**
```
1. Quick Capture idea
2. Verify appears in Inbox
3. Convert to PRD
4. Verify PRD quality and item type change
5. Add to Implementation Queue
6. Verify queue entry with AI analysis
7. Start Implementation (copy prompt)
8. Verify watchdog instructions present
9. Mark complete
10. Verify completion tracking
```

## Test Cases

### Test 1: Quick Capture → Inbox
**Steps:**
1. Navigate to Dashboard
2. Enter "Add export to CSV feature for PM items" in Quick Capture
3. Click Capture
4. Wait for AI processing
5. Navigate to Inbox

**Expected Results:**
- ✅ Item created with TERP-IDEA-xxx ID
- ✅ Title extracted correctly
- ✅ Description auto-generated
- ✅ Type = IDEA
- ✅ Status = inbox
- ✅ Appears in Inbox list

**Potential Issues:**
- ❌ AI fails to categorize (timeout, API error)
- ❌ Item not appearing in Inbox (database issue)
- ❌ Duplicate items created

---

### Test 2: Convert to PRD
**Steps:**
1. Find IDEA item in Inbox
2. Click "Convert to PRD" button
3. Wait for AI generation
4. Check success toast
5. Refresh Inbox
6. View item details

**Expected Results:**
- ✅ Button shows "Generating PRD..." loading state
- ✅ Toast shows "PRD generated! Estimated cost: $X.XXXX"
- ✅ Item type changes from IDEA to FEAT
- ✅ Item status changes to backlog
- ✅ Description contains complete 6-section PRD
- ✅ PRD includes: User Stories, Technical Requirements, Security, Edge Cases, Dependencies, QA Criteria

**Potential Issues:**
- ❌ LLM API timeout (>30s)
- ❌ PRD quality poor (too short, missing sections)
- ❌ Item not updating in UI (cache issue)
- ❌ Type/status not changing
- ❌ estimatedCost field missing or null

---

### Test 3: Add to Implementation Queue
**Steps:**
1. Find FEAT item (from Test 2) in Inbox or Features page
2. Click "Add to Queue" button
3. Wait for AI analysis
4. Check success toast
5. Navigate to /queue
6. Find queued item

**Expected Results:**
- ✅ Button shows "Adding..." loading state
- ✅ Toast shows "Item added to implementation queue with AI analysis"
- ✅ Queue page shows item with:
  - Title
  - Priority score (1-100)
  - Estimated hours
  - 10-step implementation plan (diagnosis field)
  - Dependencies list
  - QA requirements
  - Status = pending

**Potential Issues:**
- ❌ AI analysis fails (LLM timeout)
- ❌ Queue item missing fields
- ❌ Implementation plan too vague or incomplete
- ❌ Priority score = 0 or null
- ❌ Dependencies not detected

---

### Test 4: Start Implementation
**Steps:**
1. On /queue page, find queued item
2. Click "Start Implementation" button
3. Check clipboard content
4. Verify prompt structure

**Expected Results:**
- ✅ Toast shows "Implementation prompt copied to clipboard"
- ✅ Clipboard contains:
  - Full PRD context
  - 10-step implementation plan
  - QA requirements
  - Progress tracking instructions: `echo "Step X: [description]" >> /tmp/progress-[ID].txt`
  - Completion marker instructions: `echo "complete" > /tmp/complete-[ID].txt`
  - Anti-stopping directives (DO NOT create summaries before completion)
  - Watchdog breadcrumb system explained

**Potential Issues:**
- ❌ Clipboard API fails (browser permissions)
- ❌ Prompt missing critical sections
- ❌ Progress file path incorrect
- ❌ Anti-stopping directives not strong enough

---

### Test 5: Watchdog System (Simulated)
**Steps:**
1. Manually create progress file: `echo "Step 1: Created schema" > /tmp/progress-12345.txt`
2. Wait 5 minutes
3. Check if continuation agent would be scheduled (65 min after start)
4. Manually create completion marker: `echo "complete" > /tmp/complete-12345.txt`

**Expected Results:**
- ✅ Progress file readable
- ✅ Completion marker detectable
- ✅ Continuation prompt includes recency check logic
- ✅ Continuation prompt includes completion check logic

**Potential Issues:**
- ❌ File permissions prevent writing
- ❌ Continuation agent can't read progress file
- ❌ No mechanism to schedule continuation (manual only)

---

### Test 6: Mark Complete
**Steps:**
1. On /queue page, find completed item
2. Click "Mark Complete" button (if exists)
3. Verify status update

**Expected Results:**
- ✅ Queue item status changes to completed
- ✅ Item removed from pending list
- ✅ Completion timestamp recorded

**Potential Issues:**
- ❌ No "Mark Complete" button exists
- ❌ Manual database update required
- ❌ Status doesn't update in UI

---

## Critical Path Issues to Investigate

### 1. LLM API Reliability
- **Risk:** Free Manus API might timeout on complex PRDs
- **Test:** Generate PRD for complex multi-module feature
- **Mitigation:** Add retry logic, fallback to simpler prompt

### 2. Database Schema Compatibility
- **Risk:** roadmapPosition, estimatedCost fields might not exist
- **Test:** Check actual database schema vs. code expectations
- **Mitigation:** Run SQL ALTER TABLE if needed

### 3. Queue Item Persistence
- **Risk:** Queue items might not save to database
- **Test:** Add item, restart server, check if still exists
- **Mitigation:** Verify db.createQueueItem actually commits

### 4. Clipboard API Browser Support
- **Risk:** Clipboard.writeText() fails in some browsers
- **Test:** Try in Firefox, Safari, mobile browsers
- **Mitigation:** Add fallback to textarea select+copy

### 5. Watchdog File Permissions
- **Risk:** Agent can't write to /tmp in production
- **Test:** Try writing /tmp/progress-test.txt from agent
- **Mitigation:** Use alternative path or database checkpoints

---

## Automated Test Execution Plan

1. **Setup:** Clear database, start fresh
2. **Test 1:** Quick Capture (automated via API call)
3. **Test 2:** Convert to PRD (automated via tRPC mutation)
4. **Test 3:** Add to Queue (automated via tRPC mutation)
5. **Test 4:** Verify queue entry (automated via database query)
6. **Test 5:** Generate implementation prompt (automated via endpoint)
7. **Verify:** All data persisted correctly

---

## Success Criteria

- ✅ 100% of tests pass without manual intervention
- ✅ No database errors
- ✅ No LLM API failures
- ✅ PRD quality score ≥ 8/10
- ✅ Implementation plan completeness ≥ 90%
- ✅ Watchdog instructions clear and actionable

---

## Failure Scenarios & Recovery

### Scenario 1: PRD Generation Fails
**Recovery:** Retry with simpler prompt, or allow manual PRD entry

### Scenario 2: Queue Analysis Fails
**Recovery:** Create queue item with minimal analysis, allow manual editing

### Scenario 3: Clipboard Copy Fails
**Recovery:** Display prompt in modal with manual copy button

### Scenario 4: Database Connection Lost
**Recovery:** Queue operations locally, sync when reconnected

---

## Next Steps After QA

1. Fix all critical bugs found
2. Add error handling for edge cases
3. Implement retry logic for LLM calls
4. Add loading states for all async operations
5. Create automated regression test suite
6. Document known limitations
