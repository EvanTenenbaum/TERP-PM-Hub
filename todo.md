# TERP PM Hub - TODO

## Phase 1: Database Schema & Architecture ✅
- [x] Design database schema for features, ideas, bugs
- [x] Design schema for chat conversations and messages
- [x] Design schema for GitHub sync metadata
- [x] Plan architecture for GitHub integration
- [x] Plan AI agent routing system

## Phase 2: GitHub Integration ✅
- [x] Implement GitHub API client
- [x] Build sync layer for product-management data
- [x] Create sync API endpoints
- [x] Database helpers for PM items
- [x] tRPC routers for sync

## Phase 3: AI Chat System ✅
- [x] Build chat interface component
- [x] Implement AI agent routing
- [x] Create conversation system
- [x] Add message history
- [x] Integrate with GitHub context
- [x] Support all agent types (inbox, planning, qa, expert)

## Phase 4: Dashboard & Feature Management ✅
- [x] Build main dashboard layout
- [x] Create feature list view
- [x] Create stats cards
- [x] Implement navigation
- [x] Add GitHub sync button
- [x] Build all core pages

## Phase 5: Search & Analytics
- [ ] Implement search functionality
- [ ] Build dependency graph visualization
- [ ] Create roadmap timeline view
- [ ] Add analytics dashboard
- [ ] Implement filtering system

## Phase 6: Testing & Deployment
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Create user documentation
- [ ] Final QA

## Bugs
(None yet)

## Future Enhancements
- Multi-user collaboration
- Real-time updates
- Mobile app
- Integration webhooks

## New Features
- [x] Timeline visualization for feature dependencies and milestones
- [x] Interactive dependency graph
- [x] Project milestone tracking
- [x] Mobile-first responsive design for all pages
- [x] Reorganize dashboard - Idea Inbox chat at the top
- [x] Quick capture interface for ideas

## Hybrid Dev Agent Feature
- [x] QA and improve hybrid dev agent design
- [x] Build quick code generation for simple features
- [x] Build "Develop with Manus Agent" launcher
- [x] Implement seamless handoff between quick gen and full agent
- [x] Add feature complexity detection
- [x] QA entire PM Hub system end-to-end

## Priority 1 Fixes (Before Production)
- [ ] Wire up Quick Capture to AI chat
- [ ] Add GitHub token setup flow  
- [ ] Connect timeline to real PM data
- [ ] Fix dashboard stats to show real counts
- [ ] Add error boundaries to all pages


## TERP Codebase Analysis & Population
- [x] Analyze entire TERP codebase structure
- [x] Extract existing features from code
- [x] Find and parse roadmap documents
- [x] Import all historical context
- [x] Create PM items for all discovered features (56 items)
- [x] Populate database with all TERP data
- [x] Connect dashboard to real PM data
- [x] Timeline component connected to real items


## Inbox & Smart Triage System
- [ ] Create Inbox page to view all captured notes/ideas/feedback
- [ ] Add complexity analysis for each inbox item
- [ ] Implement smart recommendation system (LLM quick fix vs Full Manus agent vs Manual)
- [ ] Add "Convert to Feature" button for each item
- [ ] Add "Quick Fix with LLM" button for simple tasks
- [ ] Add "Develop with Manus Agent" button with pre-filled context
- [ ] Show recommendation badge on each item
- [ ] Add bulk actions for inbox items
- [ ] Add filtering by recommendation type
- [ ] Add context editing - allow adding notes, attachments, links to any item
- [ ] Add item detail modal/page with full editing capabilities

## Intelligent Feature Management
- [ ] Add edit/delete/prioritize capabilities for all features and ideas
- [ ] Implement dependency tracking - auto-update when features change
- [ ] Auto-update roadmap when feature status/priority changes
- [ ] Auto-update feature specs when scope changes
- [ ] Detect complex changes that need human review
- [ ] Flag items that need Manus chat for finalization
- [ ] Show impact analysis when editing (what else will change)
- [ ] Add cascade delete protection (warn about dependencies)
- [ ] Add priority reordering with drag-and-drop

## Self-Registration System for Manus Chats
- [ ] Create API endpoint for external chats to register work
- [ ] Generate standardized prompt for Manus chats
- [ ] Auto-detect feature ID from chat context
- [ ] Update feature status automatically
- [ ] Add progress notes from chat
- [ ] Link chat conversation to feature
- [ ] Generate completion report


## AUTONOMOUS BUILD - Phase 1 & 2 Complete Implementation
### Phase 1: Core Usability
- [x] Add Inbox route to App.tsx and navigation
- [x] Build global search component
- [x] Implement Cmd+K quick actions menu
- [ ] Add tags system to features
- [ ] Build filtering UI (by tags, status, priority)
- [ ] Add loading skeletons to all pages
- [ ] Add empty states with helpful CTAs
- [x] Add error boundaries

### Phase 2: Workflow  
- [x] Build Kanban board with drag-and-drop
- [ ] Implement bulk selection and actions
- [ ] Add advanced stats widgets to dashboard
- [x] Implement auto-sync (background job every 5 min)
- [x] Auto-sync on page load
- [x] Auto-sync after changes
- [x] Sync status indicator
- [x] Build activity feed component
- [x] Add export functionality (CSV, Markdown, JSON)

### Additional Features (From User Requests)
- [ ] Full edit modal with all fields
- [ ] Delete with cascade protection
- [ ] Priority reordering with drag-and-drop
- [ ] Dependency impact analysis
- [ ] Auto-update roadmap on status changes
- [ ] Flag complex changes for review
- [x] Self-registration API endpoint for Manus chats
- [ ] Keyboard shortcuts system
- [ ] Toast notifications for all actions
- [ ] Commenting system on features (any view)
- [ ] Intelligent comment interpretation (feedback/new spec/bug/scope change)
- [ ] Auto-route comments to correct workflow
- [ ] Comment history and threading

### QA & Polish
- [ ] QA Round 1: Test all features
- [ ] Self-heal: Fix all issues found
- [ ] QA Round 2: Verify fixes
- [ ] Final polish and deployment
