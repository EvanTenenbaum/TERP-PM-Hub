# AI Roadmap Manager - Design Specification

## Vision
Transform TERP PM Hub from basic task tracking into an intelligent, AI-driven product management system that actively manages the roadmap, identifies dependencies, and orchestrates batch implementation.

## Current Problems
1. Kanban has confusing stages (Backlog, In Progress, Review, Done) that don't reflect PM workflow
2. No intelligent PRD generation from ideas
3. No smart roadmap placement considering dependencies and impact
4. No way to batch-implement multiple features with stop conditions
5. No AI actively managing roadmap based on new information

## New Workflow

### Phase 1: Capture → Triage
- Quick Capture creates inbox item
- PM reviews in Inbox
- Click "Convert to PRD" → AI generates comprehensive PRD using Feature Planning agent

### Phase 2: PRD → Smart Roadmap Placement
- AI analyzes PRD for:
  - Backend changes required
  - Frontend changes required
  - Database schema changes
  - API endpoints needed
  - Dependencies on existing features
  - Features that will be affected by this change
- AI suggests optimal roadmap position based on:
  - Priority
  - Dependencies (must come after X, before Y)
  - Team capacity
  - Technical complexity
- PM reviews and approves placement
- AI auto-shifts other features if needed

### Phase 3: Roadmap → Implementation Queue
- PM selects features from roadmap
- Click "Add to Queue" → AI generates detailed implementation plan
- Queue shows all work items ready for implementation

### Phase 4: Batch Implementation
- PM clicks "Start Roadmap" from Roadmap view
- Selects features to implement (can select multiple)
- Sets stop conditions:
  - Time limit: "Stop after 4 hours"
  - Credit limit: "Stop after $50 in LLM costs"
  - Task count: "Stop after 5 features completed"
- System generates master implementation plan:
  - Combines all selected features
  - Orders by dependencies
  - Estimates total time/cost
  - Creates checkpoints between features
- Launches Manus agent with master plan
- Tracks progress across features
- Auto-stops when condition met
- Allows resume from last checkpoint

## AI Roadmap Manager Intelligence

### Active Management
- Monitors new features added to roadmap
- Detects when existing features are completed
- Identifies when dependencies change
- Suggests roadmap reorganization when:
  - New high-priority feature added
  - Blocking dependency completed
  - Feature scope changes significantly

### Impact Analysis
When new feature added, AI analyzes:
- **Backend Impact**: New models, services, API endpoints
- **Frontend Impact**: New pages, components, state management
- **Database Impact**: Schema changes, migrations needed
- **Dependent Features**: Existing features that need updates
- **Blocking Features**: Features that must be completed first

### Smart Suggestions
- "Feature X should come after Y because it depends on the new API endpoint"
- "Adding Feature X will require updates to Features A, B, C"
- "Feature X blocks Features D, E - recommend prioritizing"

## Roadmap Visualization

### Timeline View
- Horizontal timeline showing features in order
- Color-coded by status: Not Started, In Queue, In Progress, Complete
- Dependency arrows showing relationships
- Drag-to-reorder with AI validation

### Dependency Graph
- Visual graph showing feature relationships
- Highlights critical path
- Shows which features are blocked

### Priority Matrix
- 2x2 matrix: Impact vs Effort
- AI places features automatically
- PM can override placement

## Batch Implementation System

### Master Plan Generation
```markdown
# Master Implementation Plan
## Stop Conditions
- Time Limit: 4 hours
- Credit Limit: $50
- Task Count: 5 features

## Features (Ordered by Dependencies)
1. Feature A: User Authentication (30 min, $5)
   - Backend: Auth service, JWT tokens
   - Frontend: Login page, auth context
   - Database: Users table
   
2. Feature B: User Profile (45 min, $8)
   - Depends on: Feature A (auth)
   - Backend: Profile API
   - Frontend: Profile page
   
3. Feature C: Dashboard (60 min, $12)
   - Depends on: Feature A, B
   - Frontend: Dashboard layout, widgets
   
## Total Estimates
- Time: 2h 15min
- Cost: $25
- Features: 3

## Checkpoints
- After Feature A: Save checkpoint, verify auth works
- After Feature B: Save checkpoint, verify profile works
- After Feature C: Save checkpoint, verify dashboard works

## Progress Tracking
Write to /tmp/roadmap-progress-[ID].txt after each feature
```

### Progress Monitoring
- Watchdog system tracks progress across features
- Writes breadcrumbs: "Feature A: Step 3/10 complete"
- Monitors time elapsed and estimated cost
- Auto-stops when condition met
- Generates summary report

### Resume Capability
- If stopped mid-feature, can resume from last checkpoint
- Shows: "Completed 2/5 features, stopped at Feature C step 4/10"
- Click "Resume" to continue from checkpoint

## Implementation Plan

### Database Schema Updates
```typescript
// Add roadmap fields to pmItems
roadmapPosition: int // Order in roadmap
roadmapStatus: enum // not-started, queued, in-progress, complete
estimatedHours: float
estimatedCost: float
backendImpact: json // {models: [], services: [], apis: []}
frontendImpact: json // {pages: [], components: []}
databaseImpact: json // {tables: [], migrations: []}
dependsOn: json // [pmItemId1, pmItemId2]
blocks: json // [pmItemId3, pmItemId4]
affectedBy: json // [pmItemId5] // features that will need updates
```

### New tRPC Endpoints
- `roadmap.convertToPRD(itemId)` - Generate PRD from idea
- `roadmap.analyzeImpact(prdText)` - Analyze feature impact
- `roadmap.suggestPlacement(itemId)` - AI suggests roadmap position
- `roadmap.reorderRoadmap(itemId, newPosition)` - Move feature, shift others
- `roadmap.startBatch(featureIds, stopConditions)` - Generate master plan
- `roadmap.getProgress(batchId)` - Check batch implementation progress

### UI Components
- RoadmapView.tsx - Timeline visualization with drag-and-drop
- ImpactAnalysis.tsx - Shows backend/frontend/database impact
- BatchImplementation.tsx - Configure and start batch implementation
- ProgressMonitor.tsx - Real-time progress tracking

## Success Metrics
- Time from idea to roadmap: < 5 minutes (AI-assisted)
- Roadmap accuracy: 90%+ (dependencies correctly identified)
- Batch implementation success: 80%+ (features complete without human intervention)
- PM time saved: 70%+ (AI handles analysis, placement, orchestration)

## Next Steps
1. Update database schema with roadmap fields
2. Build AI impact analysis endpoint
3. Create RoadmapView component
4. Implement batch implementation system
5. Test full workflow end-to-end


## Token Optimization Strategy

### Use FREE Tokens (Manus Built-in API) For:
- **PRD Generation**: Feature Planning agent already uses free tokens
- **Impact Analysis**: Analyzing backend/frontend/database changes (structured output, deterministic)
- **Dependency Detection**: Identifying which features depend on each other (pattern matching)
- **Roadmap Placement Suggestions**: Calculating optimal position based on dependencies/priority
- **Progress Monitoring**: Parsing progress breadcrumbs and status updates
- **Batch Plan Generation**: Creating master implementation plans (template-based)
- **Quick Analysis**: Simple classification, tagging, priority scoring

### Use PAID Tokens Only When Necessary:
- **Complex Code Generation**: Actual implementation work (unavoidable, but optimized via watchdog)
- **Advanced Reasoning**: If free model fails quality check, escalate to paid model
- **Large Context**: When analyzing entire codebase (rare, cache aggressively)

### Optimization Tactics:
1. **Template-Based Generation**: Use templates for PRDs, impact analysis → minimal LLM needed
2. **Caching**: Cache impact analysis results, dependency graphs → reuse across features
3. **Batch Processing**: Analyze multiple features in one LLM call instead of separate calls
4. **Structured Prompts**: Request JSON output → easier parsing, less token waste on formatting
5. **Progressive Enhancement**: Start with free model, only escalate if output quality < threshold
6. **Smart Chunking**: Break large analysis into smaller pieces that fit free model context

### Expected Token Savings:
- Current: ~100% paid tokens for all AI operations
- Optimized: ~10% paid tokens (only actual implementation)
- **90% cost reduction** by using free tokens for PM intelligence

### Implementation:
```typescript
// server/_core/llm.ts - Add free/paid routing
export async function invokeLLMSmart(prompt: string, options: {
  requiresCodeGen?: boolean,
  requiresAdvancedReasoning?: boolean,
  maxTokens?: number
}) {
  // Use free tokens by default
  if (!options.requiresCodeGen && !options.requiresAdvancedReasoning) {
    return await invokeLLM(prompt, { useFreeModel: true });
  }
  
  // Try free first, escalate if quality check fails
  const freeResult = await invokeLLM(prompt, { useFreeModel: true });
  if (qualityCheckPassed(freeResult)) {
    return freeResult;
  }
  
  // Escalate to paid model
  return await invokeLLM(prompt, { useFreeModel: false });
}
```

This ensures maximum use of free tokens while maintaining output quality.
