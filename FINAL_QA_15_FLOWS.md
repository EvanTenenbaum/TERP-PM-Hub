# Final QA: 15 Randomized User Flows

## Flow 1: Quick Capture → Inbox → Add to Queue → Export
**Status:** TESTING
- [ ] Enter idea in Quick Capture
- [ ] Submit and verify it appears in Inbox
- [ ] Click "Add to Queue" button
- [ ] Verify AI analysis completes
- [ ] Navigate to /queue
- [ ] Verify item appears with diagnosis, steps, QA requirements
- [ ] Click "Export Queue"
- [ ] Verify work-items.json downloads

## Flow 2: Client Submits Feedback → PM Reviews with AI Suggestions
**Status:** TESTING
- [ ] Navigate to /submit-feedback
- [ ] Enter client feedback
- [ ] Submit form
- [ ] Verify success message
- [ ] Navigate to /feedback (PM view)
- [ ] Find submitted feedback
- [ ] Click "Generate Suggestions"
- [ ] Verify AI suggestions appear (where to apply, how to implement)
- [ ] Click "Archive"
- [ ] Verify item archived

## Flow 3: Kanban Drag & Drop → Add Context → AI Enhancement
**Status:** TESTING
- [ ] Navigate to Dashboard
- [ ] Click Kanban tab
- [ ] Drag card from Inbox to Backlog
- [ ] Verify status updates
- [ ] Click card to open detail modal
- [ ] Add context in text field
- [ ] Click "Enhance with AI"
- [ ] Verify description improves, priority adjusts

## Flow 4: GitHub Sync → View Features → Export
**Status:** TESTING
- [ ] Click Sync button
- [ ] Wait for sync to complete
- [ ] Navigate to /features
- [ ] Verify features loaded from GitHub
- [ ] Filter by tag
- [ ] Bulk select 3 features
- [ ] Click "Export Selected"
- [ ] Verify CSV downloads

## Flow 5: AI Agent Chat → Idea Inbox → Create PM Item
**Status:** TESTING
- [ ] Navigate to Dashboard
- [ ] Click "Idea Inbox" agent
- [ ] Send message: "Add user authentication"
- [ ] Verify AI responds
- [ ] Verify PM item created in inbox
- [ ] Check item has proper ID, type, description

## Flow 6: Mobile Quick Capture → Inbox Triage
**Status:** TESTING
- [ ] Resize browser to mobile (375px)
- [ ] Use Quick Capture on mobile
- [ ] Navigate to Inbox on mobile
- [ ] Verify responsive layout
- [ ] Tap "Add to Queue" on mobile
- [ ] Verify mobile-friendly queue page

## Flow 7: Feature Planning Agent → PRD Generation
**Status:** TESTING
- [ ] Navigate to /chat/planning
- [ ] Request PRD for "batch import feature"
- [ ] Verify AI generates structured PRD
- [ ] Verify markdown formatting
- [ ] Copy PRD content
- [ ] Verify clipboard works

## Flow 8: QA Agent → Test Case Generation
**Status:** TESTING
- [ ] Navigate to /chat/qa
- [ ] Request test cases for login feature
- [ ] Verify AI generates comprehensive test cases
- [ ] Verify edge cases included
- [ ] Verify format is actionable

## Flow 9: Command Palette (Cmd+K) → Quick Navigation
**Status:** TESTING
- [ ] Press Cmd+K (or Ctrl+K)
- [ ] Verify command palette opens
- [ ] Type "queue"
- [ ] Select Implementation Queue
- [ ] Verify navigation to /queue
- [ ] Press Cmd+K again
- [ ] Type "inbox"
- [ ] Verify navigation to /inbox

## Flow 10: Inbox → Convert to Feature → Edit → Save
**Status:** TESTING
- [ ] Navigate to /inbox
- [ ] Find IDEA item
- [ ] Click "Convert to Feature"
- [ ] Verify item moves to Features
- [ ] Navigate to /features
- [ ] Click edit on converted feature
- [ ] Change title, description, priority
- [ ] Save changes
- [ ] Verify updates persist

## Flow 11: Dashboard Stats → Drill Down → Filter
**Status:** TESTING
- [ ] View Dashboard stats cards
- [ ] Click "Ideas" card
- [ ] Verify navigation to filtered view
- [ ] Apply additional tag filter
- [ ] Verify count updates
- [ ] Clear filters
- [ ] Verify all items shown

## Flow 12: Queue → Start Implementation → Clipboard Integration
**Status:** TESTING
- [ ] Navigate to /queue
- [ ] Click "Start Implementation" on queue item
- [ ] Verify context copied to clipboard
- [ ] Open new Manus chat (simulate)
- [ ] Verify clipboard contains: diagnosis, steps, QA requirements
- [ ] Verify format is actionable for agent

## Flow 13: Bulk Actions → Tag Multiple Items → Export
**Status:** TESTING
- [ ] Navigate to /features
- [ ] Select 5 features with checkboxes
- [ ] Click "Bulk Tag"
- [ ] Add tag "sprint-1"
- [ ] Verify all 5 items tagged
- [ ] Export tagged items
- [ ] Verify CSV contains tag column

## Flow 14: Training Guide Access → Read Documentation
**Status:** TESTING
- [ ] Navigate to Dashboard
- [ ] Click Actions tab
- [ ] Click "Help & Training Guide"
- [ ] Verify TRAINING_GUIDE.md opens
- [ ] Verify screenshots load
- [ ] Verify all sections present
- [ ] Verify links work

## Flow 15: Error Handling → Network Failure → Retry
**Status:** TESTING
- [ ] Simulate network failure (browser DevTools)
- [ ] Try to Add to Queue
- [ ] Verify error toast appears
- [ ] Verify user-friendly error message
- [ ] Restore network
- [ ] Retry operation
- [ ] Verify success after retry

---

## Test Results Summary
- **Total Flows:** 15
- **Passed:** 0
- **Failed:** 0
- **In Progress:** 15
- **Blocked:** 0

## Issues Found
(Will be populated during testing)

## Performance Metrics
- Average page load time: TBD
- Queue AI analysis time: TBD
- Export generation time: TBD
- Mobile responsiveness: TBD
