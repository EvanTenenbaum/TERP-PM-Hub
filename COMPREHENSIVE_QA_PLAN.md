# Comprehensive QA Plan - 99% Certainty Target

## Testing Methodology
- Test EVERY feature end-to-end in browser
- Verify database changes after each operation
- Test error handling and edge cases
- Test mobile responsiveness
- Document pass/fail for each test
- Fix immediately when issues found
- Re-test after fixes

## Core Features to Test

### 1. Authentication & Access
- [ ] Login works
- [ ] User session persists
- [ ] Logout works
- [ ] Unauthorized access blocked

### 2. Quick Capture
- [ ] Can submit idea
- [ ] Can submit bug
- [ ] Can submit improvement
- [ ] AI processes and creates PM item
- [ ] Item appears in inbox
- [ ] Database record created correctly

### 3. Inbox Management
- [ ] View all inbox items
- [ ] Filter by type (IDEA, BUG, IMPROVE)
- [ ] Add Context button works
- [ ] Context updates item in database
- [ ] Convert to Feature works
- [ ] Try Quick Fix - CURRENTLY PLACEHOLDER (needs fix)
- [ ] Full Agent copies context
- [ ] Archive item works

### 4. Kanban Board (NEW)
- [ ] All 5 columns display (Inbox, Backlog, Planned, In Progress, Completed)
- [ ] Cards display in correct columns
- [ ] Drag and drop between columns works
- [ ] Status updates in database after drag
- [ ] Click card opens detail modal
- [ ] Modal shows all item info
- [ ] Add Context textarea works
- [ ] AI enhancement processes context
- [ ] Description/priority/tags/related items update
- [ ] Success message shows
- [ ] Modal closes after enhancement

### 5. AI Agents (Chat)
- [ ] Idea Inbox agent - creates PM items with structured output
- [ ] Feature Planning agent - generates PRDs
- [ ] QA Agent - generates test cases
- [ ] Codebase Expert - answers questions
- [ ] Chat messages save to database
- [ ] Chat history persists
- [ ] Response rendering works (no JSON shown to user)

### 6. Client Feedback Portal
- [ ] /submit-feedback loads
- [ ] Client can submit feedback
- [ ] Feedback creates PM item with 'client-feedback' tag
- [ ] Item appears in PM inbox
- [ ] /feedback shows only client-feedback tagged items
- [ ] PM can generate AI suggestions
- [ ] Suggestions show where/how to apply feedback
- [ ] Archive feedback works

### 7. GitHub Sync
- [ ] Manual sync button works
- [ ] Syncs items from GitHub
- [ ] Auto-sync runs once per session
- [ ] Sync status displays correctly
- [ ] Last sync time accurate

### 8. Features Page
- [ ] Lists all FEAT type items
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Search works
- [ ] Bulk actions work
- [ ] Edit feature works
- [ ] Delete feature works
- [ ] Export works

### 9. Performance
- [ ] First load < 3s
- [ ] Subsequent loads < 500ms (with React Query cache)
- [ ] Auto-sync only runs once per session
- [ ] No unnecessary refetches

### 10. Mobile Responsiveness
- [ ] Dashboard responsive
- [ ] Kanban board usable on mobile
- [ ] Forms work on mobile
- [ ] Modals don't overflow
- [ ] Touch interactions work

### 11. Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid input shows validation errors
- [ ] Database errors don't crash app
- [ ] LLM errors handled gracefully

### 12. Database Integrity
- [ ] No orphaned records
- [ ] Foreign keys valid
- [ ] Timestamps accurate
- [ ] JSON fields parse correctly

## Known Issues to Fix
1. **Try Quick Fix** - Currently just shows toast, needs real implementation
2. **Client feedback submission** - Had 500 error, simplified to work but needs AI parsing restored
3. **Timeline removed** - Replaced with Kanban, verify no broken references

## Test Execution Order
1. Fix known issues first
2. Test core user flows (Quick Capture → Inbox → Kanban → AI Enhancement)
3. Test AI agents
4. Test client portal
5. Test edge cases and error handling
6. Test performance
7. Test mobile
8. Final verification pass

## Pass Criteria for 99% Certainty
- All core features work end-to-end
- No placeholders or "coming soon" features
- All database operations verified
- Error handling tested and working
- Performance targets met
- Mobile usability confirmed
- Zero critical bugs
- Zero broken features
