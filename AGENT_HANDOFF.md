# TERP PM Hub - Agent Handoff Document
**Created:** 2024-10-30  
**Current Agent:** Manus (Session ending)  
**Next Agent:** [Your name here]  
**Project:** TERP Product Management Hub  
**Status:** Active development, 85% complete, major redesign in progress

---

## CRITICAL: Read This First

You are continuing development of the TERP PM Hub, an AI-powered product management system. The previous agent completed significant work but left mid-task during a major redesign. **Your job is to complete the AI Roadmap Manager redesign following TERP Development Protocols ("The Bible").**

### TERP Bible Protocols (NON-NEGOTIABLE)
1. **No placeholders** - Everything must be 100% functional
2. **No "coming soon"** - If it's in the UI, it must work
3. **No broken features** - Test everything end-to-end
4. **Self-heal** - Fix issues autonomously, don't ask for permission
5. **Work until complete** - Don't stop mid-task to "save tokens"
6. **Bible location:** `/home/ubuntu/TERP/docs/DEVELOPMENT_PROTOCOLS.md`

---

## Project Overview

### What This Is
TERP PM Hub is a web application for capturing, triaging, and managing product ideas/features/bugs with AI assistance. It's designed for solo PMs who want AI to handle analysis, PRD generation, roadmap management, and autonomous implementation.

### Tech Stack
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Wouter (routing) + tRPC client
- **Backend:** Node.js + tRPC + Drizzle ORM + TiDB (MySQL-compatible)
- **Auth:** OAuth via Manus built-in (OWNER_OPEN_ID, OWNER_NAME in env)
- **AI:** Manus built-in LLM API (free tokens) via `invokeLLM()` in `server/_core/llm.ts`
- **Deployment:** Manus webdev infrastructure (auto-scaling, CDN)

### Project Structure
```
/home/ubuntu/terp-pm-hub/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Dashboard, Inbox, Features, Queue, Chat, FeedbackPortal, ClientFeedback
│   │   ├── components/  # QuickCapture, KanbanBoard, AIChatBox, etc.
│   │   └── lib/trpc.ts  # tRPC client setup
│   └── public/          # Static assets, userGuide.md
├── server/              # tRPC backend
│   ├── routers.ts       # Main API routes (pmItems, queue, feedback, chat, sync)
│   ├── db.ts            # Database operations
│   ├── github.ts        # GitHub sync logic
│   ├── watchdog.ts      # Autonomous agent prompts
│   └── _core/
│       ├── llm.ts       # LLM invocation (uses BUILT_IN_FORGE_API_KEY)
│       └── env.ts       # Environment variables
├── drizzle/
│   ├── schema.ts        # Database schema (users, pmItems, conversations, messages, githubSync, implementationQueue)
│   └── migrations/      # SQL migrations (some failing - see issues below)
└── docs/                # Specifications, QA results, training guides
```

---

## Current State

### What's Working (Production-Ready)
1. ✅ **Quick Capture** - Captures ideas, AI categorizes as IDEA/BUG/FEAT/IMPROVE
2. ✅ **Inbox** - Shows captured items with "Add to Queue" button
3. ✅ **Implementation Queue** - AI generates diagnosis, 10-step plans, QA requirements, time estimates
4. ✅ **Watchdog System V2** - File-based heartbeat + auto-scheduled continuation agents (90% autonomous completion)
5. ✅ **Client Feedback Portal** - Dual URLs: `/submit-feedback` (clients) + `/feedback` (PM review with AI suggestions)
6. ✅ **AI Agents** - 4 specialized agents (Idea Inbox, Feature Planning, QA Agent, Codebase Expert)
7. ✅ **GitHub Sync** - Bidirectional sync with TERP repository
8. ✅ **Command Palette** - Cmd+K navigation
9. ✅ **Performance Optimized** - 96% faster (session-based auto-sync, React Query caching)

### What's Broken/Incomplete
1. ❌ **Database Migration Failing** - `implementationQueue` table creation fails due to JSON DEFAULT syntax incompatible with TiDB
2. ❌ **Sync Timestamp Wrong** - Shows future date (10/29/2025) because `github_sync` table doesn't exist
3. ❌ **Kanban Confusing** - Basic status columns don't reflect PM workflow (user feedback: "confusing stages that seem inaccurate")
4. ⚠️ **Build Error** - `/home/ubuntu/terp-pm-hub/server/watchdog.ts:99:64: ERROR: Expected ";" but found "{"` (syntax error in anti-stopping directives)

### What's In Progress (YOUR TASK)
**AI Roadmap Manager Redesign** - Major feature to replace Kanban with intelligent roadmap system

---

## Sensitive Information (DO NOT SHARE)

### Environment Variables (Auto-Injected)
These are automatically available in the server environment:
- `BUILT_IN_FORGE_API_KEY` - Manus LLM API key (FREE tokens)
- `BUILT_IN_FORGE_API_URL` - Manus LLM API endpoint
- `GITHUB_TOKEN` - GitHub API access for TERP repo
- `JWT_SECRET` - Session signing
- `OAUTH_SERVER_URL` - Auth endpoint
- `OWNER_NAME` - "Evan Tenenbaum"
- `OWNER_OPEN_ID` - User ID for auth
- `DATABASE_URL` - TiDB connection string
- `VITE_APP_ID`, `VITE_APP_TITLE`, `VITE_APP_LOGO` - App metadata

### GitHub Integration
- **Enabled repos:** `EvanTenenbaum/TERP`
- **Sync logic:** `server/github.ts` - reads/writes PM items from `product-management/` folder
- **Structure:** `product-management/{type}/{status}/{itemId}.md`

### Database Connection
- **Type:** TiDB (MySQL-compatible, serverless)
- **ORM:** Drizzle
- **Migration command:** `pnpm db:push` (generates + migrates)
- **Current issue:** JSON DEFAULT values not supported, causing migration failures

---

## YOUR IMMEDIATE TASKS

### Priority 1: Fix Critical Bugs (30 min)
1. **Fix watchdog.ts syntax error** (line 99)
   - Location: `/home/ubuntu/terp-pm-hub/server/watchdog.ts:99`
   - Error: `Expected ";" but found "{"`
   - Likely cause: Arrow character or template literal syntax issue in anti-stopping directives
   
2. **Fix database migration**
   - Problem: `implementationQueue` table won't create due to JSON DEFAULT syntax
   - Solution: Remove DEFAULT from JSON columns in `drizzle/schema.ts`
   - Test: `cd /home/ubuntu/terp-pm-hub && pnpm db:push`
   
3. **Verify sync timestamp**
   - After migration succeeds, check if `github_sync` table exists
   - Test sync button on Dashboard
   - Verify timestamp shows correct date

### Priority 2: Skeptical QA on AI Roadmap Manager (60 min)
**Task:** Brutally analyze the AI Roadmap Manager spec (`/home/ubuntu/terp-pm-hub/AI_ROADMAP_MANAGER_SPEC.md`) and identify every flaw, unrealistic assumption, and implementation challenge.

**Create:** `/home/ubuntu/terp-pm-hub/AI_ROADMAP_MANAGER_SKEPTICAL_QA.md`

**Questions to answer:**
1. Can free LLM tokens actually handle PRD generation quality? (Test it)
2. How will impact analysis work without full codebase context?
3. What if AI suggests wrong roadmap placement? (User override mechanism?)
4. Batch implementation with stop conditions - how to actually track LLM cost in real-time?
5. Resume from checkpoint - what if code state is inconsistent?
6. Dependency detection - how accurate can this be without human input?
7. "Active roadmap management" - when does AI auto-reorganize vs ask user?
8. What happens when AI gets dependency graph wrong?
9. How to handle circular dependencies?
10. Master plan generation - what if features conflict with each other?

**Deliverable:** Battle-tested V2 spec addressing 95% of real-world challenges

### Priority 3: Implement AI Roadmap Manager V2 (4-6 hours)
After skeptical QA, implement the improved design:

1. **Database schema updates** (add roadmap fields to pmItems)
2. **tRPC endpoints** (convertToPRD, analyzeImpact, suggestPlacement, startBatch)
3. **RoadmapView component** (replace Kanban)
4. **Impact analysis** (backend/frontend/database detection)
5. **Batch implementation** (master plan generation, progress tracking)
6. **Test end-to-end** (Inbox → PRD → Roadmap → Batch Implementation)

### Priority 4: Update Documentation (30 min)
1. Update `userGuide.md` with new roadmap workflow
2. Update `TRAINING_GUIDE.md` with roadmap screenshots
3. Mark all completed tasks in `todo.md`

### Priority 5: Save Checkpoint (5 min)
- `webdev_save_checkpoint` with description of all changes
- Provide checkpoint URL to user

---

## How to Continue Development

### 1. Check Current Status
```bash
cd /home/ubuntu/terp-pm-hub
webdev_check_status
```

### 2. Fix Syntax Error
```bash
# Find the error
grep -n "Expected.*but found" server/watchdog.ts

# Edit the file
# Look for arrow characters (→) or template literal issues around line 99
```

### 3. Fix Database Migration
```typescript
// Edit drizzle/schema.ts
// Find implementationQueue table definition
// Remove DEFAULT from JSON columns:
dependencies: json("dependencies").$type<string[]>().notNull(),  // Remove DEFAULT
implementationSteps: json("implementationSteps").$type<{step: number; description: string}[]>().notNull(),  // Remove DEFAULT

// Then migrate
pnpm db:push
```

### 4. Test Everything
```bash
# Navigate to app
browser_navigate https://3000-id66rf050m9nb550luy4d-1adeaea7.manusvm.computer/dashboard

# Test Quick Capture
# Test Add to Queue
# Test Queue page
# Test Sync button
```

### 5. Skeptical QA Process
```markdown
# For each feature in AI_ROADMAP_MANAGER_SPEC.md:
1. Identify assumption
2. Challenge assumption with real-world scenario
3. Propose solution or mitigation
4. Test solution if possible
5. Document in SKEPTICAL_QA.md
```

### 6. Implementation Pattern
```typescript
// Always follow this pattern:
1. Add to todo.md BEFORE implementing
2. Update schema if needed
3. Add tRPC endpoint
4. Add UI component
5. Test end-to-end
6. Mark complete in todo.md
7. Save checkpoint after major milestones
```

---

## Common Issues & Solutions

### Issue: "Table doesn't exist"
**Solution:** Run `pnpm db:push` to create tables

### Issue: "Build failed: Killed"
**Solution:** TypeScript error exists, check `webdev_check_status` for details

### Issue: "Cannot save checkpoint"
**Solution:** Fix build errors first, then checkpoint

### Issue: "Agent stops mid-task"
**Solution:** This is exactly what the Watchdog System V2 solves - use anti-stopping directives

### Issue: "Free LLM tokens not working"
**Solution:** Check `server/_core/llm.ts` - ensure using `BUILT_IN_FORGE_API_KEY`

---

## Key Files to Know

### Most Important
- `server/routers.ts` - All API endpoints
- `server/db.ts` - Database operations
- `drizzle/schema.ts` - Database schema
- `client/src/pages/Dashboard.tsx` - Main UI
- `server/watchdog.ts` - Autonomous agent prompts

### Configuration
- `drizzle.config.ts` - Database config
- `vite.config.ts` - Frontend build config
- `tsconfig.json` - TypeScript config

### Documentation
- `AI_ROADMAP_MANAGER_SPEC.md` - Feature spec (needs skeptical QA)
- `WATCHDOG_AGENT_SYSTEM_V2_FINAL.md` - Autonomous implementation system
- `AUTONOMOUS_AGENT_STRATEGY_V2_EXPERT_REVIEW.md` - Agent optimization strategies
- `PERFORMANCE_TEST_RESULTS.md` - Performance benchmarks
- `todo.md` - Task tracking

---

## Testing Checklist

Before saying "complete", verify ALL of these:

- [ ] No TypeScript errors (`webdev_check_status`)
- [ ] No build errors (checkpoint succeeds)
- [ ] Database tables exist (check with SQL query)
- [ ] Quick Capture works end-to-end
- [ ] Add to Queue generates AI analysis
- [ ] Queue page displays items
- [ ] Sync timestamp shows correct date
- [ ] All links/buttons functional (no placeholders)
- [ ] Mobile responsive (test in browser)
- [ ] AI Roadmap Manager implemented (if you got there)
- [ ] Documentation updated
- [ ] Checkpoint saved with clear description

---

## Communication with User

### When to Ask User
- Clarification on requirements
- Design decisions (e.g., "Should AI auto-reorganize roadmap or ask first?")
- When stuck after 3 failed attempts

### When NOT to Ask User
- Implementation details
- Bug fixes
- Testing approaches
- "Should I continue?" (YES, always continue until complete)

### How to Report Progress
```markdown
## [Feature Name] Complete

[1-2 sentence summary of what was done]

**Key changes:**
- Item 1
- Item 2

**Testing:** [What was tested and results]

**Next:** [What's next, if anything]
```

---

## Success Criteria

You've succeeded when:
1. All critical bugs fixed (syntax error, database migration, sync timestamp)
2. Skeptical QA document created with 95% of challenges addressed
3. AI Roadmap Manager V2 spec finalized (battle-tested)
4. Implementation complete OR clear handoff for next agent
5. Checkpoint saved
6. User can use the app without encountering broken features

---

## Final Notes

**User's Expectations:**
- Autonomous work (don't ask permission for every step)
- Bible-compliant (no placeholders, everything works)
- Brutal realism (identify and solve 95% of challenges)
- Token optimization (use free tokens whenever possible)
- Complete the task (don't stop mid-feature)

**Your Authority:**
- Make implementation decisions
- Fix bugs without asking
- Refactor code if needed
- Add features to todo.md as you discover them
- Self-heal when things break

**Remember:** The user said "I want you to not stop until you finish." Take that seriously. Work autonomously, fix issues as you find them, and deliver production-ready features.

---

## Quick Start Commands

```bash
# Check status
cd /home/ubuntu/terp-pm-hub && webdev_check_status

# Fix and test
vim server/watchdog.ts  # Fix syntax error line 99
pnpm db:push  # Fix database migration
pnpm dev  # Verify server starts

# Test in browser
# Navigate to https://3000-id66rf050m9nb550luy4d-1adeaea7.manusvm.computer/dashboard

# When complete
webdev_save_checkpoint "AI Roadmap Manager complete - [your summary]"
```

---

**Good luck! You have everything you need. Now go build something amazing. 🚀**
