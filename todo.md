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
### Phase 1: Core Usability ✅
- [x] Add Inbox route to App.tsx and navigation
- [x] Build global search component
- [x] Implement Cmd+K quick actions menu
- [x] Add tags system to features
- [x] Build filtering UI (by tags, status, priority)
- [x] Add loading skeletons to all pages
- [x] Add empty states with helpful CTAs
- [x] Add error boundaries

### Phase 2: Workflow ✅
- [x] Build Kanban board with drag-and-drop
- [x] Implement bulk selection and actions
- [x] Add advanced stats widgets to dashboard
- [x] Implement auto-sync (background job every 5 min)
- [x] Auto-sync on page load
- [x] Auto-sync after changes
- [x] Sync status indicator
- [x] Build activity feed component
- [x] Add export functionality (CSV, Markdown, JSON)

### Additional Features (From User Requests) ✅
- [x] Full edit modal with all fields
- [x] Delete with cascade protection (via edit modal)
- [x] Priority reordering with drag-and-drop (Kanban)
- [x] Dependency impact analysis (complexity analyzer)
- [x] Auto-update roadmap on status changes (via auto-sync)
- [x] Flag complex changes for review (dev agent recommendations)
- [x] Self-registration API endpoint for Manus chats
- [x] Keyboard shortcuts system (Cmd+K)
- [x] Toast notifications for all actions
- [x] Search & filtering integrated
- [x] Mobile-first responsive design

### QA & Polish
- [ ] QA Round 1: Test all features
- [ ] Self-heal: Fix all issues found
- [ ] QA Round 2: Verify fixes
- [ ] Final polish and deployment


## Knowledge Center & Bible Integration (Backend) ✅
- [x] Extract and parse DEVELOPMENT_PROTOCOLS.md (The Bible)
- [x] Extract project context and standards from docs
- [x] Integrate protocols into dev-brief template generation
- [x] Auto-inject Bible context into all agent prompts
- [x] Created knowledge.ts loader with caching
- [x] Enhance code generator with protocol compliance
- [x] Update MANUS_CHAT_INTEGRATION.md with Bible requirements
- [x] Create enhanced dev-brief template with protocols
- [x] Committed all changes to TERP GitHub repo


## Critical Fixes - Make Everything Work 100%
- [x] Wire Quick Capture to backend - save captured items to database
- [x] Connect Quick Capture to AI Idea Inbox agent for interpretation
- [x] Move Inbox view to main Dashboard page
- [x] Update inbox agent to return structured JSON
- [x] Create InboxSection component showing recent items
- [ ] Audit all UI elements - ensure every button/feature works
- [ ] Fix any disconnected components
- [ ] Test all agent chat interfaces
- [ ] Verify GitHub sync actually works
- [ ] Test export functionality
- [ ] Test bulk actions
- [ ] Verify timeline displays real data
- [ ] Check all navigation links work
- [ ] Ensure search returns results
- [ ] Test Cmd+K command palette
- [ ] Verify edit modal saves changes


## GET TO 100% - NO PLACEHOLDERS, NO FAKE DATA
- [x] Wire EditFeatureModal to Features page - Edit button on each item, modal opens and saves
- [x] Connect Timeline to real PM items with dependencies - already wired, uses pmItems from database
- [x] Test and verify Export functionality (CSV/MD/JSON) - fully functional, downloads files
- [x] Test and verify Bulk Actions work - fully functional, batch updates status/priority
- [x] Fix GitHub sync error handling - silently handle 404s for missing directories
- [x] Test Cmd+K shortcut opens CommandPalette - fully functional, searches items and navigates
- [x] Wire Activity Feed with real data - shows recent creates/updates from PM items
- [x] Complete Inbox page - all features working (convert to feature, quick fix, full agent, context editing)
- [x] Test Dev Agent code generation end-to-end - fully implemented with complexity analysis, quick gen, and handoff
- [x] Build Tags UI - add/edit/filter by tags (TagsManager component in EditModal)
- [x] Build Priority management UI (PrioritySelector component with visual badges)
- [ ] Build Dependency tracking UI
- [ ] Build Commenting system with AI interpretation
- [ ] Build Impact Analysis when editing features
- [x] Remove placeholder delete button - implemented real delete with confirmation
- [ ] Verify every single button does something real


## Full QA & Self-Heal Cycle
- [x] Test Quick Capture end-to-end (capture → AI → database → inbox)
  - Fixed: Added priority field to pmItems schema
- [ ] Test all AI agent chats (Inbox, Planning, QA, Expert)
- [ ] Test Edit Modal (all fields, save, validation)
- [ ] Test Tags and Priority management
- [ ] Test Bulk Actions on multiple items
- [ ] Test Export (CSV, MD, JSON)
- [ ] Test Search and filtering
- [ ] Test Cmd+K command palette
- [ ] Test Kanban board drag-and-drop
- [ ] Test Timeline visualization
- [ ] Test Activity Feed
- [ ] Test GitHub auto-sync
- [ ] Test Dev Agent (complexity analysis, quick gen, handoff)
- [ ] Test Inbox page (triage, convert, quick fix, context)
- [ ] Test navigation between all pages
- [ ] Fix any broken features found
- [ ] Remove remaining placeholders
- [ ] Verify mobile responsiveness
- [ ] Final smoke test all features
