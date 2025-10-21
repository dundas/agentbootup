---
name: screen-inventory-builder
description: Create canonical screen inventory with purpose, inputs/outputs, states, and acceptance criteria.
---

# Screen Inventory Builder

## Goal
Generate a complete, structured inventory of all screens in the application with detailed specifications for each.

## Inputs
- Information architecture (`tasks/ui/flows.md`, `tasks/ui/sitemap.md`)
- Product specification
- Target platform (web/mobile/desktop)

## Process

### 1. Extract Screen List
From sitemap and flows, compile all unique screens:
- Public pages
- Authenticated pages
- Admin pages (if applicable)
- Modals and overlays
- Error pages (404, 500, etc.)

### 2. For Each Screen, Define:

**Purpose**: What is this screen for? What user goal does it serve?

**User Context**: When/why does the user arrive here?

**Inputs**: What data/state does the screen need?
- URL parameters
- Query strings
- Previous screen data
- User session/auth state
- API data to fetch

**Outputs**: What can the user do here?
- Actions/buttons
- Forms to submit
- Navigation to other screens
- Data created/modified

**States**: What variations exist?
- Loading (skeleton/spinner)
- Empty (no data, first-time)
- Populated (normal state)
- Error (API failure, validation errors)
- Success (confirmation messages)

**Navigation**: How do users get here and leave?
- Entry points (from which screens?)
- Exit points (to which screens?)
- Back button behavior
- Breadcrumbs

**Acceptance Criteria**: How do we know it's done?
- Functional requirements
- Accessibility requirements
- Performance requirements
- Edge cases handled

### 3. Identify Shared Patterns
Group screens by pattern:
- List views (dashboard, search results)
- Detail views (single item)
- Forms (create/edit)
- Settings pages
- Modals/overlays

## Output Format

### `tasks/ui/screen-inventory.md`

```markdown
# Screen Inventory - [Product Name]

## Summary
- Total Screens: 12
- Public: 4
- Authenticated: 7
- Admin: 1
- Patterns: List (3), Detail (4), Form (3), Settings (2)

---

## Screen: Dashboard (Board List)

**Route**: `/dashboard`
**Pattern**: List View
**Auth Required**: Yes

### Purpose
Display all boards owned by or shared with the user. Primary landing page after login.

### User Context
- User just logged in
- User clicked "Back to Dashboard" from board canvas
- User clicked logo in top bar

### Inputs
- User ID (from session)
- API: `GET /api/boards` → Array of board objects

### Outputs
- **Actions**:
  - "New Board" button → Create board modal
  - Click board card → Navigate to `/board/:id`
  - Search boards → Filter list
  - Sort by (name, date, last modified)
- **Data Modified**: None (read-only)

### States
1. **Loading**: Skeleton cards while fetching boards
2. **Empty**: "Create your first board" CTA (first-time user)
3. **Populated**: Grid of board cards with thumbnails, names, dates
4. **Error**: "Failed to load boards" with retry button
5. **Search Results**: Filtered subset of boards

### Navigation
- **From**: Login page, Board canvas (back button), Any page (logo click)
- **To**: Board canvas, Profile, Settings, Logout
- **Breadcrumbs**: None (top-level)

### Acceptance Criteria
- [ ] Displays all user's boards (owned + shared)
- [ ] Boards load within 2 seconds
- [ ] Search filters boards in real-time
- [ ] Empty state shows helpful CTA
- [ ] Error state allows retry
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces board count
- [ ] Responsive on mobile (stacked cards)

---

## Screen: Board Canvas

**Route**: `/board/:id`
**Pattern**: Canvas/Workspace
**Auth Required**: Yes

### Purpose
Main workspace where users add, arrange, and interact with board items (notes, images, links, drawings).

### User Context
- User clicked a board from dashboard
- User opened a shared board link
- User created a new board

### Inputs
- Board ID (from URL parameter)
- API: `GET /api/boards/:id` → Board object with items
- User permissions (owner, editor, viewer)

### Outputs
- **Actions**:
  - Add items (note, image, link, checklist, drawing)
  - Move items (drag and drop)
  - Resize items (drag handles)
  - Delete items (drag to trash zone)
  - Toggle Pan/Draw mode
  - Zoom in/out
  - Share board
  - Export board
- **Data Modified**: Board items (create, update, delete, reposition)

### States
1. **Loading**: Canvas skeleton with toolbar
2. **Empty**: "Add your first note" tooltip/CTA
3. **Populated**: Items on canvas, interactive
4. **Drawing Mode**: Freehand drawing overlay active
5. **Pan Mode**: Cursor changes, canvas draggable
6. **Saving**: Autosave indicator (spinner or checkmark)
7. **Error**: "Failed to save" toast with retry
8. **Read-Only**: Viewer permission, no edit actions

### Navigation
- **From**: Dashboard, Direct link
- **To**: Dashboard (back button), Share modal, Settings
- **Breadcrumbs**: Dashboard > Board Name

### Acceptance Criteria
- [ ] All items load and render correctly
- [ ] Drag and drop works smoothly (60fps)
- [ ] Resize maintains aspect ratio (images)
- [ ] Pan mode moves canvas without selecting items
- [ ] Draw mode captures freehand strokes
- [ ] Autosave triggers after 2 seconds of inactivity
- [ ] Keyboard shortcuts work (N: note, D: draw, Space: pan)
- [ ] Undo/redo works (Cmd+Z, Cmd+Shift+Z)
- [ ] Zoom maintains cursor position
- [ ] Read-only mode disables edit actions
- [ ] Accessibility: focus order, ARIA labels

---

## Screen: [Next Screen]
...

```

## Validation Checklist
- [ ] All screens from sitemap included
- [ ] Each screen has clear purpose
- [ ] Inputs and outputs defined
- [ ] All states documented (loading, empty, error, success)
- [ ] Navigation paths complete (from/to)
- [ ] Acceptance criteria specific and testable
- [ ] Accessibility requirements included
- [ ] Edge cases considered

## Interaction
- Present summary first: "Found 12 screens: 4 public, 7 authenticated, 1 admin"
- Ask: "Review screen inventory before generating prompts? (yes/no)"
- Allow user to add missing screens or refine criteria

## References
- See `reference.md` for screen inventory examples
- See `ui-prompt-orchestrator` agent for workflow context
- See `extract-ia-and-flows` skill for input dependencies
