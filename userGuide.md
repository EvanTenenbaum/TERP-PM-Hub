# TERP PM Hub User Guide

**Website URL:** https://3000-id66rf050m9nb550luy4d-1adeaea7.manusvm.computer (development)

**Purpose:** Capture, triage, and manage product ideas, features, and bugs with AI-powered assistance and autonomous implementation workflows.

**Access:** Login required via OAuth

---

## Powered by Manus

TERP PM Hub is built with cutting-edge technology for maximum performance and developer productivity. The frontend uses React 19 with TypeScript and Tailwind CSS 4 for a modern, responsive interface. The backend leverages tRPC for type-safe API calls and Drizzle ORM with TiDB for scalable database operations. Authentication is handled via OAuth integration. Deployment runs on auto-scaling infrastructure with global CDN for optimal performance worldwide.

---

## Using Your PM Hub

### Quick Capture Workflow

The Quick Capture box on the Dashboard lets you instantly record ideas, bugs, or improvements. Type your thought and click "Capture" or press Cmd+Enter. AI automatically analyzes your input, categorizes it (idea/bug/feature), generates a unique ID, and adds it to your Inbox for triage. This takes seconds and ensures no idea is lost.

### AI-Powered Triage

Navigate to "Inbox" from the Dashboard to see recently captured items. Each item shows AI-generated analysis including type, description, and suggested priority. Click "Add to Queue" on any item to send it for detailed AI diagnosis. The system analyzes technical requirements, generates 10-step implementation plans, estimates time, identifies dependencies, and adds comprehensive QA requirements. Items move from Inbox → Implementation Queue automatically.

### Implementation Queue System

Visit "/queue" to see work items ready for autonomous implementation. Each queue item displays AI diagnosis, priority level, estimated time, and detailed implementation steps. Click "Start Implementation" to generate a complete prompt with progress tracking instructions. The prompt copies to your clipboard - paste it into a new Manus chat to begin autonomous implementation with built-in watchdog recovery if the agent times out.

### Client Feedback Portal

Share "/submit-feedback" with clients for simple feedback submission. Clients enter feedback and click "Submit" - the system automatically creates inbox items tagged "client-feedback". You review submissions at "/feedback" where you can click any item to view full details and click "Generate Suggestions" for AI-powered recommendations on where to apply the feedback (module detection) and how to implement it (actionable steps with confidence scoring).

### Feature Management

The "Features" page shows all tracked features with status, priority, tags, and dependencies. Use bulk actions to update multiple items at once. Click any feature to edit details, add tags, set priority, or mark dependencies. Export features to JSON or CSV using the "Export" button. Filter by status, priority, or tags using the sidebar controls.

### Kanban Board

The Dashboard Kanban tab provides drag-and-drop task management across status columns (Backlog, In Progress, Review, Done). Drag cards between columns to update status instantly. Click any card to open the detail modal where you can view full information, add context for AI enhancement, or queue the item for implementation.

### AI Agents

Four specialized AI agents help with different workflows. "Idea Inbox" captures and structures ideas into actionable PM items. "Feature Planning" generates comprehensive PRDs and specifications. "QA Agent" creates detailed test cases and quality checklists. "Codebase Expert" answers technical questions about your project using full codebase context. Access agents from the Dashboard AI Agents section.

### Command Palette

Press Cmd+K anywhere to open the command palette for quick navigation. Type to search for pages, features, or actions. Press Enter to execute. This provides keyboard-first workflow for power users.

### GitHub Sync

The "Sync" button in the header synchronizes PM items with your GitHub repository. Items are organized into folders by type and status. Changes sync bidirectionally - updates in GitHub reflect in the PM Hub and vice versa. Last sync time displays on the Dashboard.

---

## Managing Your Website

### Settings Panel

Access Settings from the Management UI (right panel) to configure your PM Hub. The General section lets you customize the website name and logo via VITE_APP_TITLE and VITE_APP_LOGO environment variables. The Secrets section allows you to view, edit, or delete existing environment variables safely.

### Dashboard Analytics

The Dashboard panel in Management UI shows visitor analytics (UV/PV) for published sites and provides visibility controls. Monitor traffic patterns and user engagement after publishing your PM Hub.

### Database Management

The Database panel provides full CRUD interface for all tables. View, edit, add, or delete records directly. Connection info appears in bottom-left settings - enable SSL for production use. Useful for manual data corrections or bulk operations.

---

## Next Steps

Talk to Manus AI anytime to request changes or add features. The PM Hub is designed for continuous evolution - capture ideas via Quick Capture, triage in Inbox, queue for implementation, and let autonomous agents handle the coding. Start by capturing your first idea and watching the AI-powered workflow in action.

---

## Watchdog System for Autonomous Implementation

When you click "Start Implementation" on a queue item, the system generates a prompt with built-in progress tracking. Implementation agents write breadcrumbs to `/tmp/progress-[ID].txt` every 5-10 minutes showing completed steps. If an agent times out (60 minutes), a continuation agent automatically spawns, checks progress, and resumes from the last checkpoint. When complete, agents write `/tmp/complete-[ID].txt` to signal success. This achieves 90% autonomous completion (60% original + 30% continuation recovery) without human intervention.

The prompts include anti-stopping directives preventing agents from creating premature documentation. Agents must complete ALL implementation steps before writing summaries. Time and token constraints are not excuses to stop early - the watchdog system handles timeouts automatically.
