# Client Feedback Portal - Design Specification

**Following TERP Development Protocols v2.1**

## Overview

A separate client-facing portal for submitting and viewing feedback, with AI-powered suggestions for where and how to apply feedback to the TERP system.

---

## Requirements

### Functional Requirements

1. **Separate URL/Route**: Accessible at `/feedback` or `/client-portal`
2. **Inbox View**: Display all feedback submissions in a clean list
3. **Full Message Display**: Show complete feedback content when selected
4. **AI Suggestions - Where**: AI analyzes feedback and suggests which TERP modules/features to apply it to
5. **AI Suggestions - How**: AI provides implementation guidance
6. **Archive Functionality**: Mark feedback as archived/resolved
7. **No PM Jargon**: Client-friendly language (no "TERP-FEAT-###", "dev-brief", etc.)
8. **Mobile-First**: Responsive design for all screen sizes

### Non-Functional Requirements

1. **Production-Ready**: No placeholders, all features functional
2. **Bible-Compliant**: Follow all TERP development protocols
3. **User-Friendly**: Simple, clean interface for non-technical users
4. **Fast**: Quick load times, efficient AI processing

---

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────┐
│  Client Feedback Portal        [Archive]│
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐  ┌─────────────────┐│
│  │ Feedback List │  │  Detail View    ││
│  │               │  │                 ││
│  │ [Item 1]      │  │  Full Message   ││
│  │ [Item 2]      │  │                 ││
│  │ [Item 3]      │  │  AI Suggestions ││
│  │               │  │  - Where        ││
│  │               │  │  - How          ││
│  │               │  │                 ││
│  │               │  │  [Archive]      ││
│  └───────────────┘  └─────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Components Needed

1. **FeedbackPortal.tsx** - Main page component
2. **FeedbackList.tsx** - Left panel with feedback items
3. **FeedbackDetail.tsx** - Right panel with full content + suggestions
4. **FeedbackItem.tsx** - Individual list item component

### Color Scheme

- Clean, professional design
- Use existing design system colors
- Highlight AI suggestions with accent color
- Archived items: muted/gray

---

## Data Model

### Feedback Item Structure

```typescript
{
  id: string;              // e.g., "TERP-IDEA-1761794869454"
  type: string;            // IDEA, BUG, IMPROVE, etc.
  title: string;           // User-friendly title
  description: string;     // Full feedback content
  status: string;          // 'inbox', 'archived'
  createdAt: Date;
  aiSuggestions?: {
    where: string[];       // Which modules/features to apply to
    how: string;           // Implementation guidance
    confidence: number;    // 0-100 confidence score
  }
}
```

---

## AI Suggestion Generation

### Where to Apply (Module Detection)

AI analyzes feedback and identifies relevant TERP modules:
- Inventory Management
- Accounting
- Sales & Quotes
- Dashboard
- Reporting
- etc.

### How to Implement

AI provides actionable guidance:
- Technical approach
- Complexity estimate
- Potential challenges
- Recommended next steps

### Implementation

Use existing `invokeLLM` with structured output:

```typescript
const suggestions = await invokeLLM({
  messages: [
    { role: "system", content: "Analyze feedback and suggest where/how to apply it to TERP..." },
    { role: "user", content: feedbackContent }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "feedback_suggestions",
      schema: {
        type: "object",
        properties: {
          where: { type: "array", items: { type: "string" } },
          how: { type: "string" },
          confidence: { type: "number" }
        }
      }
    }
  }
});
```

---

## Routes

### New Routes to Add

- `/feedback` - Main client portal page
- `/feedback/:id` - Direct link to specific feedback item (optional)

### API Endpoints (tRPC)

```typescript
feedback: router({
  // Get all feedback items (inbox + archived)
  list: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().optional() }))
    .query(async ({ input }) => { ... }),
  
  // Get single feedback with AI suggestions
  getWithSuggestions: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => { ... }),
  
  // Archive feedback item
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => { ... }),
  
  // Generate AI suggestions for feedback
  generateSuggestions: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => { ... }),
})
```

---

## Database Schema Updates

Add `aiSuggestions` field to `pmItems` table:

```typescript
aiSuggestions: text('ai_suggestions').$type<{
  where: string[];
  how: string;
  confidence: number;
  generatedAt: string;
}>(),
```

---

## Implementation Checklist

### Phase 1: Backend
- [ ] Add aiSuggestions field to schema
- [ ] Run `pnpm db:push` to migrate
- [ ] Create feedback tRPC router
- [ ] Implement list endpoint
- [ ] Implement getWithSuggestions endpoint
- [ ] Implement archive endpoint
- [ ] Implement generateSuggestions endpoint with LLM

### Phase 2: Frontend
- [ ] Create FeedbackPortal page component
- [ ] Create FeedbackList component
- [ ] Create FeedbackDetail component
- [ ] Create FeedbackItem component
- [ ] Add route to App.tsx
- [ ] Wire up tRPC queries/mutations
- [ ] Implement archive functionality
- [ ] Add loading states
- [ ] Add error handling

### Phase 3: AI Integration
- [ ] Design AI prompt for suggestion generation
- [ ] Test AI suggestions with sample feedback
- [ ] Refine prompt based on results
- [ ] Add confidence scoring
- [ ] Cache suggestions in database

### Phase 4: Polish
- [ ] Mobile responsive design
- [ ] Empty states
- [ ] Loading skeletons
- [ ] Error messages
- [ ] Accessibility (keyboard nav, ARIA labels)

---

## Bible Compliance Checklist

- [ ] No placeholders or stubs
- [ ] All buttons perform real actions
- [ ] Proper error handling
- [ ] User-friendly error messages
- [ ] Loading states for async operations
- [ ] Mobile-first responsive design
- [ ] Clean, maintainable code
- [ ] Proper TypeScript types
- [ ] No commented-out code
- [ ] Meaningful variable names

---

## Success Criteria

1. ✅ Client can view all feedback in clean interface
2. ✅ Client can see full message content
3. ✅ AI generates relevant "where to apply" suggestions
4. ✅ AI generates actionable "how to implement" guidance
5. ✅ Archive functionality works correctly
6. ✅ Mobile-responsive across all breakpoints
7. ✅ No errors in console
8. ✅ All TypeScript errors resolved
9. ✅ Production-ready code quality
10. ✅ Bible-compliant implementation
