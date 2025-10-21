---
name: prompt-writer-figma-make
description: Generate front-loaded, component-aware prompts optimized for Figma Make.
---

# Prompt Writer - Figma Make

## Goal
Create production-ready prompts for Figma Make that leverage component reuse, design tokens, and accessibility requirements.

## Inputs
- Screen inventory (`tasks/ui/screen-inventory.md`)
- Design tokens (`tasks/ui/style-tokens.json`)
- Information architecture (`tasks/ui/flows.md`)
- Target platform

## Strategy: Front-Load Details

Figma Make works best when you provide comprehensive context upfront, then refine specific screens. This is the opposite of UX Pilot's approach.

## Process

### 1. Generate Global Prompt
Create one master prompt with:
- Project context and persona
- All screens to generate
- Component reuse strategy
- Design system tokens
- Accessibility requirements
- Layout constraints

### 2. Generate Per-Screen Refinement Prompts
For each screen, create follow-up prompts with:
- Specific layout (top → bottom)
- Data to display
- States (loading, empty, error)
- Interactions
- Components to reuse

## Output Format

### `tasks/ui/figma-make/global-prompt.md`

```markdown
# Figma Make - Global Prompt

**Use this as your FIRST prompt in Figma Make**

---

Role: You are a senior UX designer generating a [web/mobile/desktop] product UI in Figma Make.

Project:
- Product: [Name]. Purpose: [One-sentence value prop].
- Primary Persona: [Persona]. Key scenarios: [1-3 scenarios].

Scope:
- Generate the initial structure for these screens: [list all screens].
- Use Auto Layout, responsive frames for [breakpoints], 8pt spacing grid.
- Reuse components: [navigation, header, sidebar, table, form controls, modal, toast].
- Include realistic sample data (names, labels, empty states, errors).
- Accessibility: target WCAG 2.1 AA, minimum 4.5:1 contrast, focus states, hit areas >= 44x44.

Information Architecture:
- Navigation model: [sidebar/topbar/tabs]. Routes: [list].
- Global patterns: search, pagination, filters, bulk actions, undo/redo.

Design System:
- Use these tokens (map to closest Make components if needed):
  - Color: primary [#5B3AFF], surface [#FFFFFF], success [#10B981], warning [#F59E0B], error [#EF4444]
  - Type: [Inter], sizes [12/14/16/20/24/32], weights [Regular 400/Semibold 600/Bold 700]
  - Spacing: [4,8,12,16,24,32,48], Radius: [4,8,16], Elevation: [0/1/2/3]

Acceptance:
- Each screen includes: header/breadcrumb, main content with clear hierarchy, empty/loading/error states, primary/secondary CTAs, keyboard navigation.
- Use component variants for states (default/hover/focus/disabled/error).

Output: Create frames for each screen with named layers and components, ready to refine.
```

### `tasks/ui/figma-make/screen-[name].md`

```markdown
# Figma Make - [Screen Name] Refinement

**Use this as a FOLLOW-UP prompt after the global prompt**

---

Screen: [Screen Name]
Goal: [User outcome and key KPI]
Data: [Entity], fields [list], sample values [list]

Layout (top → bottom):
1) Header: [title, breadcrumb, actions]
2) Filters/Search: [fields, default values]
3) Content: [table/cards/canvas], columns/fields, batch actions
4) Side Panel/Modal: [when/how it opens], fields, validation

States: 
- Loading: [skeleton/spinner description]
- Empty: [message + CTA]
- Error: [message + retry button]
- No Results: [filters applied, no matches]

Interactions: 
- [Click actions]
- [Keyboard shortcuts]
- [Hover/focus states]

Components to reuse: [list from global prompt]

Acceptance: 
- [Must haves]
- [Accessibility notes]
```

## Best Practices for Figma Make

### Front-Load Everything
- Include all context in first prompt
- Mention all screens upfront
- Define component strategy early
- Specify design tokens immediately

### Component Reuse
- Explicitly list components to create
- Reference them in per-screen prompts
- Use variants for states
- Maintain consistency across screens

### Realistic Data
- Include sample names, emails, dates
- Show different data types (text, numbers, images)
- Demonstrate empty and populated states
- Use realistic content length

### Accessibility
- Specify contrast ratios
- Mention focus indicators
- Define keyboard navigation
- Include ARIA labels in descriptions

## Example: Dashboard Screen Prompt

```markdown
# Figma Make - Dashboard Refinement

Screen: Dashboard (Board List)
Goal: User sees all their boards and can create new ones or open existing boards.
Data: Board objects with {id, name, thumbnail, lastModified, owner, sharedWith[]}

Layout (top → bottom):
1) Top Bar: 
   - Logo (left)
   - Search input (center, placeholder "Search boards...")
   - "New Board" button (right, primary color)
   - Profile menu (far right, avatar + dropdown)

2) Filters (below top bar):
   - Sort dropdown: "Last Modified", "Name", "Date Created"
   - View toggle: Grid / List
   - Filter chips: "My Boards", "Shared with Me", "Archived"

3) Board Grid:
   - Cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile)
   - Each card: thumbnail preview, board name, last modified date, owner avatar
   - Hover: subtle elevation increase, "Open" button appears
   - Empty state: "Create your first board" with large CTA

4) Pagination (if > 20 boards):
   - Page numbers, prev/next buttons
   - "Showing 1-20 of 45 boards"

States:
- Loading: 6 skeleton cards with pulsing animation
- Empty: Centered illustration + "Create your first board" CTA
- Populated: Grid of board cards as described
- Error: "Failed to load boards. [Retry]" with error icon
- Search Results: Filtered cards + "X results for 'query'" + clear button

Interactions:
- Click card → Navigate to board canvas
- Click "New Board" → Modal with name input
- Hover card → Show "Open" button
- Keyboard: Tab navigation, Enter to open
- Search: Real-time filter as user types

Components to reuse:
- Top bar (from global)
- Button (primary, secondary variants)
- Card (with hover state)
- Modal (for new board)
- Empty state illustration

Acceptance:
- Cards load within 2 seconds
- Search filters in real-time
- Empty state is encouraging
- Keyboard navigation works
- Focus indicators visible
- Color contrast >= 4.5:1
```

## Validation Checklist
- [ ] Global prompt includes all screens
- [ ] Design tokens specified
- [ ] Component reuse strategy clear
- [ ] Per-screen prompts reference global components
- [ ] All states documented
- [ ] Accessibility requirements explicit
- [ ] Realistic data included

## Interaction
- Generate global prompt first
- Show to user: "Review global prompt before per-screen prompts? (yes/no)"
- Generate per-screen prompts
- Save all to `tasks/ui/figma-make/`

## References
- See `reference.md` for Figma Make best practices
- See Figma blog: "8 Essential Tips for Using Figma Make"
- See `ui-prompt-orchestrator` agent for workflow context
