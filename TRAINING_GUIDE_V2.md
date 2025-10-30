# TERP PM Hub - Complete Training Guide V2

**Version:** 2.0  
**Date:** October 30, 2025  
**For:** Product Managers, Development Teams, Stakeholders

---

## What's New in V2

This updated guide covers the new **Implementation Queue** system and **Autonomous Agent Execution** workflow, which fundamentally changes how you move from idea to implementation.

**Key New Features:**
- Implementation Queue with AI-powered work item preparation
- Autonomous agent execution for hands-off development
- Enhanced client feedback portal with separate submission URL
- Kanban board for visual workflow management
- 96% performance improvement for faster page loads

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Quick Capture - Your Idea Inbox](#quick-capture)
4. [Implementation Queue - The New Workflow](#implementation-queue)
5. [AI Agents - Your PM Assistants](#ai-agents)
6. [Client Feedback Portal](#client-feedback-portal)
7. [Feature Management](#feature-management)
8. [Inbox & Triage System](#inbox-triage)
9. [Kanban Board](#kanban-board)
10. [Autonomous Agent Execution](#autonomous-execution)
11. [Command Palette (Cmd+K)](#command-palette)
12. [GitHub Integration](#github-integration)
13. [Export & Reporting](#export-reporting)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)

---

## 1. Introduction {#introduction}

TERP PM Hub is an AI-powered product management platform that helps you capture ideas, manage features, and execute implementations through autonomous AI agents. The system integrates with GitHub and uses a queue-first workflow to ensure every feature is properly analyzed before development begins.

### The Queue-First Philosophy

Unlike traditional PM tools where ideas go directly to developers, TERP PM Hub uses an **Implementation Queue** as the central hub. Every feature, bug fix, or improvement flows through the queue where AI performs comprehensive analysis, generates implementation plans, identifies dependencies, and prepares everything needed for autonomous execution.

This approach delivers three key benefits:

**Quality:** Every item gets thorough AI analysis before development, catching issues early and ensuring clear specifications.

**Efficiency:** Developers (or AI agents) receive complete context, reducing back-and-forth questions and speeding up implementation.

**Visibility:** You always know what's queued, what's in progress, and what's complete, with estimated time for each item.

### Key Features

**Quick Capture** allows instant idea entry with AI classification. **Implementation Queue** provides AI-powered work item preparation with diagnosis, step-by-step plans, QA requirements, and time estimates. **Four AI Agents** assist with idea capture, feature planning, QA strategy, and codebase expertise. **Client Feedback Portal** offers separate URLs for client submission (`/submit-feedback`) and PM review (`/feedback`) with AI suggestions. **Kanban Board** enables visual workflow management with drag-and-drop and AI context enhancement. **Autonomous Execution** supports hands-off implementation through comprehensive context injection and scheduled task chains. **GitHub Sync** maintains automatic bidirectional synchronization. **Export** functionality supports CSV, Markdown, JSON, and work-items.json for agent handoff. **Performance Optimized** delivers 96% faster page loads through session-based sync and React Query configuration.

---

## 2. Getting Started {#getting-started}

### Accessing the Platform

Navigate to your deployment URL in a modern web browser (Chrome, Firefox, Safari, or Edge). Sign in using your organizational credentials through the OAuth portal. You will land on the Dashboard, your central hub for all PM activities.

### Dashboard Overview

The Dashboard contains **Quick Capture** at the top for rapid idea entry, **Stats Cards** showing Features (tracked), Ideas (in inbox), Bugs (open), and Total (all items), **Sync Status** indicating last GitHub sync time and item count, **Inbox Section** displaying recently captured items with type, ID, title, and description, and three tabs: **AI Agents** for chat assistants, **Kanban** for visual board management, and **Actions** for quick operations and help access.

---

## 3. Quick Capture - Your Idea Inbox {#quick-capture}

### How It Works

Quick Capture is your fastest path from thought to tracked item. Type naturally, press Cmd/Ctrl + Enter, and AI automatically classifies your input as IDEA, FEAT, BUG, or IMPROVE, extracts title and description, assigns initial priority, and creates a database entry.

### Using Quick Capture

Click the textarea on the Dashboard and type your thought naturally. Examples: "We need a dark mode toggle" or "CSV import is timing out on large files" or "Add real-time notifications for order updates."

Press Cmd/Ctrl + Enter or click "Capture." AI processes in 2-3 seconds. Item appears in Inbox section below. Click to view details or take action.

### Best Practices

Be specific about the problem or goal. Include context when relevant ("for mobile users", "in the checkout flow"). Capture rapidly - don't stop to format or categorize. AI handles classification automatically. Add more context later in Inbox if needed. Goal: capture while fresh, refine later.

---

## 4. Implementation Queue - The New Workflow {#implementation-queue}

### Overview

The Implementation Queue is the heart of TERP PM Hub's workflow. Instead of sending items directly to developers, you add them to the queue where AI performs comprehensive analysis and preparation. This ensures every implementation starts with maximum context and clear direction.

### The Queue Workflow

**Step 1: Capture** - Use Quick Capture or AI agents to create PM items in your Inbox.

**Step 2: Triage** - Review items in Inbox, add context if needed, decide which items are ready for implementation.

**Step 3: Add to Queue** - Click "Add to Queue" button on any Inbox item. AI analyzes the item and generates comprehensive implementation guide.

**Step 4: AI Analysis** - AI performs deep analysis (takes 5-10 seconds) including technical diagnosis, 10-step implementation plan, QA requirements, priority calculation, time estimation, dependency detection, and codebase context injection.

**Step 5: Review Queue** - Navigate to `/queue` to see all queued items with priority, estimated time, diagnosis summary, and implementation steps.

**Step 6: Execute** - Click "Start Implementation" to copy work item to clipboard, then paste into Manus agent chat for autonomous execution, or assign to developer with full context.

**Step 7: Track Progress** - Mark items as "In Progress" when started, "Completed" when done. Queue shows total time remaining and next priority item.

### What AI Analysis Includes

When you add an item to the queue, AI generates a comprehensive work package:

**Diagnosis** (3-4 paragraphs): Technical analysis of the problem, architectural considerations, affected components, and implementation approach.

**Implementation Steps** (10-15 steps): Detailed step-by-step plan with specific file names, function signatures, code patterns to follow, and integration points.

**QA Requirements** (5-8 tests): Comprehensive test cases including happy path, error handling, edge cases, performance tests, and acceptance criteria.

**Priority Score** (low/medium/high): Calculated based on impact, urgency, dependencies, and complexity.

**Time Estimate** (minutes): Realistic estimate based on complexity and similar past implementations.

**Dependencies** (array): Other queue items or features that must be completed first.

**Codebase Context** (snippets): Relevant code examples, similar implementations, and architectural patterns from your existing codebase.

### Navigating the Queue Page

The Queue page (`/queue`) displays three summary cards at the top: **Items in Queue** (count), **Total Estimated Time** (hours and minutes), and **Next Up** (highest priority item).

Below the summary, each queue item shows as a card with title, priority badge (color-coded), status (queued/in-progress/completed), PM item ID, estimated time, expandable diagnosis section, expandable implementation steps (numbered list), expandable QA requirements (test cases), and three action buttons: "Start Implementation" (copies to clipboard), "Mark In Progress" (updates status), and "Delete" (removes from queue).

### Using "Start Implementation"

When you click "Start Implementation," the system copies a formatted work item to your clipboard containing the PM item title and description, comprehensive diagnosis, step-by-step implementation plan, QA requirements and acceptance criteria, codebase context and patterns, autonomous execution directive ("work continuously without stopping"), and decision-making authority guidelines.

You can then paste this into a Manus agent chat, send to a developer via Slack/email, or add to your project management tool. The work item is self-contained - everything needed for implementation is included.

### Exporting the Queue

Click "Export Queue" button to download `work-items.json` containing all queued items in structured format. This file is optimized for batch processing by AI agents or import into other tools.

---

## 5. AI Agents - Your PM Assistants {#ai-agents}

### Overview

TERP PM Hub includes four specialized AI agents with access to your project context, codebase structure, and development protocols.

### Idea Inbox Agent

**Purpose:** Capture and classify ideas through natural conversation.

**How to Use:** Click "Idea Inbox - Capture ideas" from Dashboard AI Agents tab. Type your idea naturally: "We should add a batch import feature." Agent responds with confirmation and creates PM item automatically. Agent asks clarifying questions if needed. Provides PM item ID for reference.

**Best For:** Quick idea capture during meetings, brainstorming sessions, or when you want conversational input vs Quick Capture form.

### Feature Planning Agent

**Purpose:** Write comprehensive PRDs and technical specifications.

**How to Use:** Click "Feature Planning - PRDs & specs" from AI Agents tab. Describe feature: "Help me write a PRD for batch import." Agent generates structured PRD with overview, user stories, acceptance criteria, technical considerations, dependencies, and success metrics. Ask follow-up questions to refine. Copy output to documentation.

**Best For:** Fleshing out feature ideas before adding to queue, creating specifications for stakeholder review, documenting complex features.

### QA Agent

**Purpose:** Generate testing strategies and comprehensive test cases.

**How to Use:** Click "QA Agent - Testing" from AI Agents tab. Describe feature to test: "What test cases for CSV import?" Agent provides functional tests (happy path, errors, edge cases), performance tests (large files, concurrent uploads), security tests (validation, injection prevention), and usability tests (feedback, error messages).

**Best For:** Preparing QA plans before implementation, identifying edge cases you might have missed, creating test documentation.

### Codebase Expert

**Purpose:** Answer technical questions about TERP architecture and suggest implementation approaches.

**How to Use:** Click "Codebase Expert" from AI Agents tab. Ask technical questions: "How is pricing calculated?" or "Best way to add a new module?" Agent provides code-level insights, points to relevant files, suggests patterns that align with existing architecture.

**Best For:** Developers needing context about existing code, architectural decision-making, finding similar implementations to reference.

---

## 6. Client Feedback Portal {#client-feedback-portal}

### Two Separate URLs

The Client Feedback Portal now has two distinct interfaces:

**Client Submission Portal** (`/submit-feedback`): Clean, simple form where clients submit feedback. No PM jargon, no complexity. Just "What's on your mind?" textarea and Submit button.

**PM Review Portal** (`/feedback`): Your internal interface for reviewing client submissions with AI-powered suggestions for where and how to implement feedback.

### Client Submission Portal (`/submit-feedback`)

**Purpose:** Allow clients to submit feedback without seeing internal PM complexity.

**What Clients See:** "Share Your Feedback" header with friendly subtitle, large textarea for feedback entry, "Submit Feedback" button, "What happens next?" section explaining review process (24-48 hours, prioritization, implementation tracking).

**How It Works:** Client types feedback naturally: "The search feature is hard to find. Can you make it more prominent?" Client clicks Submit. Form clears, success message appears. Feedback creates PM item tagged "client-feedback" in your inbox.

**Share This URL:** Give `/submit-feedback` URL to clients for ongoing feedback collection. Embed in your app, email signature, or support portal.

### PM Review Portal (`/feedback`)

**Purpose:** Review client submissions with AI assistance for implementation planning.

**What You See:** List of active feedback items (left panel) with icon, title, and date. Selected item details (right panel) showing full message. AI Suggestions section with "Generate Suggestions" button. Archive button to mark feedback as addressed.

**Using AI Suggestions:** Click feedback item to view full message. Click "Generate Suggestions" button. AI analyzes feedback and provides **Where to Apply** (affected modules: "Dashboard & Homepage", "All Modules (UI/UX Improvement)") and **How to Implement** (detailed 3-5 step implementation plan with technical specifics). **Confidence Score** (percentage indicating AI's confidence in suggestions).

**Archiving Feedback:** After implementing feedback, click "Archive" button. Item moves to archived list (toggle with "Show Archived" button). Keeps active list clean and focused.

**Best Practices:** Review feedback weekly. Use AI suggestions to inform queue additions. Archive promptly after implementation. Share feedback trends with stakeholders.

---

## 7. Feature Management {#feature-management}

### Features Page (`/features`)

The Features page displays all tracked features, ideas, and bugs with full CRUD operations.

**View Options:** All Items (default), Filter by tag (dropdown), Filter by status (Inbox, Backlog, Planned, In Progress, Completed), Search by title or description.

**Each Feature Card Shows:** Type icon and badge (FEAT, IDEA, BUG, IMPROVE), PM item ID, Title, Description, Tags (color-coded pills), Priority (low/medium/high), Status, Dependencies (linked items), Created/updated dates.

**Actions:** Click card to view full details. Edit button to modify any field. Delete button (with confirmation). Bulk select checkboxes for multi-item operations.

**Bulk Actions:** Select multiple items with checkboxes. Bulk Tag (add tag to all selected). Bulk Status Update (move all to same status). Bulk Export (CSV download of selected items).

---

## 8. Inbox & Triage System {#inbox-triage}

### Inbox Page (`/inbox`)

The Inbox is your triage center for newly captured items.

**What Appears in Inbox:** Quick Capture submissions, AI agent-created items, Client feedback submissions, GitHub sync imports (if configured).

**Triage Actions:** **Add Context** - Click to add additional details, clarifications, or requirements. Opens modal with textarea. **Convert to Feature** - Promotes IDEA to FEAT status, moves to Features list. **Add to Queue** - Sends item to Implementation Queue for AI analysis and preparation (recommended workflow).

**Filtering:** All Items (default), Ideas only, Bugs only, Improvements only.

**Best Practice Workflow:** Review Inbox daily. Add context to items that need clarification. Convert promising ideas to features. Add ready items to Implementation Queue. Keep Inbox clean - it's a temporary holding area, not permanent storage.

---

## 9. Kanban Board {#kanban-board}

### Overview

The Kanban board provides visual workflow management with drag-and-drop functionality and AI-powered context enhancement.

### Accessing Kanban

From Dashboard, click "Kanban" tab. Board displays with five columns: **Inbox** (newly captured items), **Backlog** (not yet planned), **Planned** (scheduled for implementation), **In Progress** (actively being worked on), **Completed** (done).

### Using the Board

**Drag and Drop:** Click and hold any card, drag to different column, release to drop. Status updates automatically.

**Card Details:** Each card shows PM item ID, title (truncated), priority badge, and tag pills.

**Click to Expand:** Click any card to open detail modal showing full description, current status, tags and priority, dependencies, and "Add Context" section with AI enhancement.

### AI Context Enhancement

In the card detail modal, you'll find an "Add Context" textarea. Type additional context: "This needs to work on mobile devices" or "Customer reported this affects checkout flow." Click "Enhance with AI" button. AI analyzes original description + new context and generates improved description with better clarity, adjusted priority if context indicates higher/lower urgency, suggested tags based on context, and updated dependencies if context reveals relationships.

**Use Case:** When you learn new information about a feature, add it as context and let AI update the item intelligently rather than manually editing multiple fields.

---

## 10. Autonomous Agent Execution {#autonomous-execution}

### Overview

TERP PM Hub is designed to enable autonomous AI agent execution with minimal human intervention. The Implementation Queue prepares work items so thoroughly that agents can implement features end-to-end without stopping to ask questions.

### How It Works

**Comprehensive Context Injection:** When you add an item to the queue, AI gathers codebase snippets showing similar implementations, architectural patterns from your existing code, API signatures and schema definitions, common error solutions, and decision recommendations for typical choice points.

**Autonomous Execution Directive:** Work items include explicit instructions for agents: "Work autonomously without stopping," "Make decisions based on existing patterns," "Attempt 3 fixes before reporting errors," "Continue until 100% complete."

**Task Chaining:** For complex items, system can schedule multiple agent tasks in sequence. Task 1 attempts full implementation (60 min timeout). Task 2 continues if Task 1 incomplete (picks up where it left off). Task 3 performs QA and cleanup.

**Question Handling:** If agent does ask a question, system checks question database for similar past questions. If match found, auto-responds with previous answer. If new question, notifies you and saves to database for future auto-response.

### Using Autonomous Execution

**Step 1:** Add item to Implementation Queue (AI prepares comprehensive work package).

**Step 2:** Review queue item to ensure diagnosis and steps look correct.

**Step 3:** Click "Start Implementation" to copy work item to clipboard.

**Step 4:** Open Manus agent chat and paste work item.

**Step 5:** Agent begins autonomous execution. Monitor progress but don't interrupt unless agent explicitly asks a question.

**Step 6:** Agent completes implementation, runs tests, reports results.

**Step 7:** Mark queue item as "Completed" and verify implementation works.

### Expected Results

**Autonomous Completion Rate:** 70-80% of items complete without human intervention (simple CRUD: 95%, complex features: 50%).

**Time to Completion:** 1-2 hours average (vs 4-6 hours with frequent human interruptions).

**Token Efficiency:** 40-50% reduction in wasted tokens from back-and-forth questions.

**Quality:** Maintains or improves code quality through comprehensive QA requirements and pattern adherence.

### When to Use Manual Implementation

Some items should NOT use autonomous execution:

- Breaking changes to existing APIs
- Major architectural refactors
- Features requiring business logic decisions
- Security-sensitive implementations
- Database schema changes affecting existing data

For these items, use the queue preparation as detailed specs for human developers rather than autonomous agents.

---

## 11. Command Palette (Cmd+K) {#command-palette}

### Quick Navigation

Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open command palette. Type to search: "queue" → navigate to Implementation Queue, "inbox" → navigate to Inbox, "feedback" → navigate to Client Feedback Portal, "features" → navigate to Features page.

Press Enter to navigate to selected result. Press Esc to close palette.

---

## 12. GitHub Integration {#github-integration}

### How Sync Works

TERP PM Hub maintains bidirectional sync with your GitHub repository. PM items → GitHub Issues (features, bugs, improvements). GitHub Issues → PM items (imports new issues). Status updates sync both directions.

### Manual Sync

Click "Sync" button in Dashboard header. Wait 5-10 seconds for sync to complete. Check "Last synced" timestamp to confirm. Review Inbox for any newly imported items.

### Automatic Sync

System syncs automatically on first page load per session (not every page load - optimized for performance). Subsequent page loads use cached data (96% faster). Manual sync available anytime via Sync button.

---

## 13. Export & Reporting {#export-reporting}

### Export Options

**CSV Export:** From Features page, select items (or select all). Click "Export Selected" button. Downloads CSV with all fields (ID, title, description, status, priority, tags, dependencies, dates).

**Queue Export:** From Queue page, click "Export Queue" button. Downloads `work-items.json` optimized for AI agent batch processing.

**Individual Item Export:** From any item detail view, copy markdown-formatted content for pasting into documentation.

### Use Cases

**CSV Export:** Stakeholder reports, sprint planning spreadsheets, data analysis in Excel.

**Queue Export:** Batch agent execution, backup before major changes, sharing work items with external teams.

**Markdown Export:** Documentation, PRDs, technical specs, GitHub issue templates.

---

## 14. Best Practices {#best-practices}

### Daily Workflow

**Morning:** Review Inbox for new items from overnight GitHub sync or client feedback. Add context to unclear items. Add 2-3 ready items to Implementation Queue.

**Midday:** Check Queue page for completed items. Mark completed items as done. Start implementation on next priority item (autonomous or manual).

**Afternoon:** Review client feedback portal. Generate AI suggestions for new feedback. Archive implemented feedback.

**End of Day:** Quick Capture any ideas from meetings or conversations. Review Kanban board to ensure items are in correct columns. Export updated feature list if needed for stakeholder reports.

### Weekly Workflow

**Monday:** Review full queue, reprioritize if needed. Check autonomous execution success rate (aim for 70%+). Plan which items to tackle this week.

**Wednesday:** Mid-week check-in on in-progress items. Add context to items that need clarification. Update stakeholders on progress.

**Friday:** Mark completed items as done. Export weekly report (CSV of completed items). Review metrics (completion rate, time estimates vs actuals). Archive addressed client feedback.

### Monthly Workflow

**Review Patterns:** Which types of items complete autonomously? Which always need human input? Adjust queue preparation accordingly.

**Update Context:** Refresh codebase context snippets if architecture changed. Update decision matrix if new patterns emerged. Refine error playbook based on common issues.

**Stakeholder Report:** Export completed features (CSV). Share client feedback trends. Report on autonomous execution improvements.

---

## 15. Troubleshooting {#troubleshooting}

### Quick Capture Not Working

**Symptom:** Click Capture but nothing happens.

**Solution:** Check browser console for errors (F12). Ensure you're logged in (OAuth session active). Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R). If persists, contact admin.

### AI Agent Not Responding

**Symptom:** Send message to agent but no response.

**Solution:** Wait 10-15 seconds (AI processing can take time). Check network connection. Try refreshing page. If persists, agent service may be down - contact admin.

### Queue Item Missing Steps

**Symptom:** Added item to queue but implementation steps are incomplete.

**Solution:** AI analysis may have timed out. Delete queue item and re-add. Add more context to original PM item before adding to queue. If persists, item may be too vague - flesh out description first.

### Kanban Drag & Drop Not Working

**Symptom:** Can't drag cards between columns.

**Solution:** Ensure you're clicking and holding on the card itself (not buttons). Try refreshing page. Check browser compatibility (Chrome/Firefox/Safari/Edge). If persists, use status dropdown in card detail modal instead.

### GitHub Sync Failing

**Symptom:** Click Sync but items don't update.

**Solution:** Check GitHub token is valid (Settings → Secrets). Verify repository access permissions. Check network connection. Review sync logs for error messages. If persists, contact admin.

### Export Not Downloading

**Symptom:** Click Export but file doesn't download.

**Solution:** Check browser's download blocker settings. Try different browser. Ensure popup blocker isn't interfering. Check browser console for errors. If persists, contact admin.

### Autonomous Execution Stopping

**Symptom:** Agent asks questions instead of working autonomously.

**Solution:** Review question - may be legitimate (breaking change, security concern). Check if question is in database - if yes, auto-response should trigger. Add question answer to database for future auto-response. Consider if item needs manual implementation instead.

### Performance Issues

**Symptom:** Pages loading slowly.

**Solution:** Hard refresh to clear cache (Cmd+Shift+R). Check network speed. Verify you're not on VPN (can slow down). Performance is optimized (96% faster) but large datasets (1000+ items) may still be slow. Consider archiving old completed items.

---

## Getting Help

**Training Materials:** This guide (accessible via Dashboard → Actions → Help & Training Guide).

**Support:** Contact your TERP PM Hub administrator.

**Feature Requests:** Use Quick Capture to submit ideas for improving the platform.

**Bug Reports:** Use Quick Capture with "bug" keyword to report issues.

---

**End of Training Guide V2**

*Last Updated: October 30, 2025*
