# TERP PM Hub

> AI-powered Product Management Hub for intelligent idea capture, triage, PRD generation, and implementation planning

[![GitHub](https://img.shields.io/badge/GitHub-EvanTenenbaum%2FTERP--PM--Hub-blue)](https://github.com/EvanTenenbaum/TERP-PM-Hub)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](version.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TERP Protocols](https://img.shields.io/badge/TERP-Development%20Protocols-orange)](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md)

## Overview

TERP PM Hub is a comprehensive product management system that leverages AI to streamline the entire product development workflow—from initial idea capture to implementation planning. Built with modern web technologies and integrated with Manus Forge AI, it automates tedious PM tasks while maintaining human oversight and control.

**Development Standards:** This project follows the [TERP Development Protocols](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md) for production-ready code, version management, and deployment procedures.

## Key Features

### 🎯 Quick Capture with AI Triage
- Instantly capture ideas, bugs, improvements, and feature requests
- AI automatically classifies and categorizes items (IDEA, BUG, IMPROVE, FEAT)
- Smart routing to appropriate workflows based on item type

### 📝 AI-Powered PRD Generation
- Transform simple ideas into comprehensive Product Requirements Documents
- Hybrid LLM approach combining free and paid models for cost efficiency
- Generates: Overview, User Stories, Requirements, Technical Approach, Edge Cases, QA Criteria
- Estimated cost: ~$0.0001-0.0005 per PRD

### 🔧 Implementation Queue
- AI analyzes complexity and generates detailed implementation plans
- Provides diagnosis, priority assessment, time estimates, and dependencies
- Comprehensive QA requirements and step-by-step implementation guides
- Queue management with status tracking (queued → in-progress → completed)

### 🔍 Advanced Search & Filtering
- Real-time search across titles, IDs, and descriptions
- Filter by status (Inbox, Backlog, Planned, In Progress, Completed, On Hold, Archived)
- Filter by type (Features, Ideas, Bugs, Improvements)

### 🔗 GitHub Integration
- Link PM items to GitHub repository files
- "View on GitHub" buttons for quick navigation
- Ready for issue creation integration (coming soon)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **TanStack Query** (React Query) for data fetching and caching
- **Tailwind CSS** + **shadcn/ui** for beautiful, accessible components
- **Vite** for lightning-fast builds

### Backend
- **Node.js** with Express
- **tRPC** for end-to-end type-safe API
- **Drizzle ORM** for type-safe database operations
- **MySQL** database

### AI Integration
- **Manus Forge API** (Gemini 2.5 Flash)
- Hybrid LLM approach for cost optimization
- Smart timeout and error handling

### Authentication
- OAuth integration with Manus
- JWT-based session management
- Owner-based access control

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- MySQL database
- Manus account with Forge API access

### Installation

```bash
# Clone the repository
git clone https://github.com/EvanTenenbaum/TERP-PM-Hub.git
cd TERP-PM-Hub

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-manus-user-id

# AI Integration
BUILT_IN_FORGE_API_KEY=your-manus-forge-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im

# GitHub Integration
GITHUB_TOKEN=your-github-token

# Application
VITE_APP_ID=your-app-id
VITE_APP_TITLE=TERP PM Hub
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

## Project Structure

```
terp-pm-hub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Utilities and helpers
│   └── public/            # Static assets
├── server/                # Backend Node.js application
│   ├── _core/            # Core server functionality
│   │   ├── llm.ts        # LLM integration
│   │   └── llm-smart.ts  # Hybrid LLM with timeout
│   ├── routers.ts        # tRPC routers
│   └── db.ts             # Database configuration
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Database schema definitions
│   └── migrations/       # SQL migration files
├── shared/               # Shared types and utilities
└── docs/                 # Documentation
    ├── HANDOFF_DOCUMENT.md
    ├── E2E_TEST_RESULTS.md
    └── QA_TEST_PLANS.md
```

## Database Schema

### Core Tables

**pmItems** - Product management items
- Stores ideas, bugs, improvements, and features
- Tracks status, priority, and GitHub integration
- Supports rich descriptions and metadata

**implementationQueue** - AI-analyzed work items
- Detailed implementation plans with AI-generated analysis
- Priority and time estimates
- Dependencies and QA requirements
- Step-by-step implementation guides

## Usage

### Quick Capture Workflow

1. Navigate to the Dashboard
2. Use the Quick Capture input to jot down an idea
3. AI automatically triages and categorizes the item
4. Item appears in the appropriate section (Inbox or Features)

### Convert to PRD

1. Go to Inbox and find an idea
2. Click "Convert to PRD"
3. AI generates a comprehensive PRD (takes ~10-30 seconds)
4. Item is converted to a Feature and moved to Features page

### Add to Implementation Queue

1. From Inbox or Features, click "Add to Queue"
2. AI analyzes the item and generates implementation plan
3. View the queue at `/queue` to see all planned work
4. Track progress with status updates

## Testing

Comprehensive E2E testing has been performed covering:
- ✅ Quick Capture → Inbox workflow
- ✅ AI triage classification
- ✅ PRD generation
- ✅ Implementation queue creation
- ✅ Search and filtering

See [E2E_TEST_RESULTS.md](E2E_TEST_RESULTS.md) for detailed test results.

## Known Issues

See [todo.md](todo.md) for the complete list of known bugs and planned improvements.

**High Priority Bugs**:
- BUG #1: Sync timestamp shows incorrect year
- BUG #3: Dashboard stats don't auto-update

**Medium Priority**:
- BUG #6: Kanban page route not implemented
- BUG #7: GitHub link paths need correction

## Documentation

- **[HANDOFF_DOCUMENT.md](HANDOFF_DOCUMENT.md)** - Comprehensive system documentation
- **[E2E_TEST_RESULTS.md](E2E_TEST_RESULTS.md)** - E2E testing results
- **[todo.md](todo.md)** - Feature tracking and bug list
- **[TRAINING_GUIDE.md](client/public/TRAINING_GUIDE.md)** - User training guide

## AI Credits & Cost

**Important**: The system uses the project owner's Manus Forge API credits for all AI operations, regardless of who is logged in. This is configured via the `BUILT_IN_FORGE_API_KEY` environment variable.

**Typical costs**:
- Quick Capture triage: ~$0.00001 per item
- PRD generation: ~$0.0001-0.0005 per PRD
- Implementation queue analysis: ~$0.0001 per item

To enable per-user credit usage, the authentication system would need to be modified to capture and use each user's individual API key.

## Performance

**Build Stats**:
- Build time: ~18 seconds
- Vendor chunk: 11MB (2.2MB gzipped)
- Total bundle size: ~13MB (2.5MB gzipped)

**Optimization Recommendations**:
- Implement dynamic imports for heavy dependencies (Mermaid, KaTeX)
- Add route-based code splitting
- Lazy load non-critical features

## Contributing

This is a private project for TERP. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Deployment

This project uses a GitHub-first development workflow:

- **Source of Truth:** GitHub repository
- **Deployment Environment:** Manus workspace
- **Version Management:** Follows TERP protocols (mandatory `version.json` updates)

### Quick Start

```bash
# Pull latest code from GitHub
git pull origin master

# Test locally
pnpm run dev

# Deploy via Manus checkpoint
# See DEPLOYMENT.md for full procedures
```

### Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment procedures and workflows
- [GITHUB_WORKFLOW.md](./GITHUB_WORKFLOW.md) - Git workflow and remote management
- [PER_USER_CREDIT_SYSTEM.md](./docs/PER_USER_CREDIT_SYSTEM.md) - Per-user API key documentation
- [TERP Development Protocols](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md) - Required development standards

## Roadmap

### High Priority
- [ ] Fix sync timestamp display (BUG #1)
- [ ] Add React Query invalidation for dashboard stats (BUG #3)
- [ ] Implement or remove Kanban board (BUG #6)
- [ ] Fix GitHub link path generation (BUG #7)

### Medium Priority
- [ ] Optimize bundle size (reduce 11MB vendor chunk)
- [ ] Add error boundaries
- [ ] Implement loading states throughout
- [ ] Add GitHub issue creation
- [ ] Implement Kanban drag-and-drop

### Future Enhancements
- [x] Per-user credit tracking (COMPLETED v1.0.0)
- [ ] Real-time collaboration
- [ ] Export to PDF/CSV
- [ ] Comments system
- [ ] Notifications
- [ ] PRD templates
- [ ] Bulk operations

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For questions or issues:
- Create an issue in this repository
- Contact: Evan Tenenbaum

## Acknowledgments

Built with:
- [Manus](https://manus.im) - AI platform and Forge API
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [tRPC](https://trpc.io) - End-to-end type safety
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database operations

---

**Version**: 1.0.0  
**Last Updated**: October 30, 2025  
**Status**: Production-ready with minor bugs to fix
