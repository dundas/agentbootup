---
name: prompt-writer-ux-pilot
description: Generate app context + per-screen prompts optimized for UX Pilot with separate styling.
---

# Prompt Writer - UX Pilot

## Goal
Create production-ready prompts for UX Pilot that separate structure from styling and work with Deep Design mode.

## Inputs
- Screen inventory (`tasks/ui/screen-inventory.md`)
- Design tokens (`tasks/ui/style-tokens.json`)
- Information architecture (`tasks/ui/flows.md`)
- Target platform

## Strategy: Structure First, Style Separate

UX Pilot works best when you:
1. Provide app context (one paragraph, structure only)
2. Add per-screen element breakdowns (top → bottom)
3. Set styling preferences in the tool itself (not in prompts)
4. Enable Hi-Fi mode and Deep Design for detailed output

## Process

### 1. Generate App Context
One paragraph describing the whole app:
- Who it's for
- Core value proposition
- Primary screens
- Global patterns
- **NO STYLING** (that goes in tool settings)

### 2. Generate Per-Screen Prompts
For each screen, create top-to-bottom element list:
- Purpose of screen
- UI blocks from top to bottom
- Interactive elements
- States (loading, empty, error)
- **NO STYLING** (colors, fonts, etc.)

### 3. Generate Style Preferences
Separate document with styling to paste into UX Pilot settings:
- Theme (dark/light)
- Visual style (modern, minimal, glassmorphism)
- Color preferences (bold, muted, etc.)
- Other aesthetic choices

## Output Format

### `tasks/ui/ux-pilot/app-context.md`

```markdown
# UX Pilot - App Context

**Paste this into the "Context" box in UX Pilot**

---

[Product Name] is a [platform type] for [target users] that allows them to [core value proposition]. 

Primary screens include: [Login], [Dashboard with board list], [Board canvas workspace], [Settings/Profile]. 

Global patterns: top bar with logo/search/profile menu, sidebar navigation (on some screens), keyboard shortcuts for common actions, undo/redo support, autosave indicators. 

Do not include styling; structure only. Use clear visual hierarchy, consistent spacing, and standard platform patterns.
```

### `tasks/ui/ux-pilot/style-preferences.md`

```markdown
# UX Pilot - Style Preferences

**Paste this into the "Style Preferences" box in UX Pilot**

---

Dark theme, transparency effects, bold accent colors, modern aesthetic, thin lines, rounded corners (8px), glassmorphism, subtle shadows, smooth animations.
```

### `tasks/ui/ux-pilot/screen-[name].md`

```markdown
# UX Pilot - [Screen Name]

**Add this as a new screen in UX Pilot**

---

Screen: [Screen Name]
Purpose: [One sentence: what user does here]

Top-to-bottom blocks:

- Top Bar: 
  * Logo (left, clickable → dashboard)
  * Search input (center, placeholder text)
  * Action button (right, e.g., "New Board")
  * Profile menu (far right, avatar with dropdown)

- Filters Section:
  * Sort dropdown (Last Modified, Name, Date)
  * View toggle (Grid/List icons)
  * Filter chips (My Boards, Shared, Archived)

- Main Content Area:
  * Grid of cards (responsive: 3 cols desktop, 2 tablet, 1 mobile)
  * Each card: thumbnail image, title text, metadata (date, owner avatar)
  * Hover state: elevation increase, action button appears

- Pagination (if needed):
  * Page numbers, prev/next buttons
  * Count text ("Showing X-Y of Z")

States:
- Empty: "Create your first board" message with CTA button
- Loading: Skeleton cards (6 placeholders)
- Error: Error message with retry button, icon

Interactions:
- Click card → navigate to detail
- Click action button → open modal
- Hover card → show additional actions
- Keyboard: Tab navigation, Enter to select

Acceptance:
- Named layers for all elements
- Consistent spacing between sections
- Keyboard shortcuts noted (if applicable)
- Focus order logical (top to bottom, left to right)
```

## Best Practices for UX Pilot

### Separate Structure from Style
- **Context/Screen prompts**: Only describe layout, hierarchy, elements
- **Style preferences**: Colors, fonts, visual effects go here
- This allows UX Pilot to apply styling consistently across all screens

### Top-to-Bottom Element Lists
- Start with topmost UI element
- Work down to bottom
- Use clear hierarchy (sections, sub-elements)
- Be specific about placement (left, center, right)

### Enable Deep Design
- In UX Pilot settings, turn on "Deep Design"
- Select "Hi-Fi" mode (not wireframe)
- This generates more detailed, production-ready designs

### Use Standard Patterns
- UX Pilot understands common UI patterns
- Reference standard components (dropdown, modal, card, etc.)
- Don't over-describe obvious patterns

## Example: Board Canvas Screen

```markdown
# UX Pilot - Board Canvas

Screen: Board Canvas
Purpose: Freeform workspace where users add notes, images, links, drawings; pan/zoom; resize; drag/drop items.

Top-to-bottom blocks:

- Top Bar:
  * Back button (left, → dashboard)
  * Board title (editable text input)
  * Mode toggle (Pan/Draw, icon buttons)
  * Share button (icon)
  * Settings button (icon)
  * Autosave indicator (right, spinner or checkmark)

- Toolbar (Left Side, vertical):
  * Select tool (cursor icon)
  * Text Note (T icon)
  * Image (image icon)
  * Link (link icon)
  * Checklist (checkbox icon)
  * Freehand Draw (pencil icon)
  * Eraser (eraser icon)
  * Hide toolbar button (collapse icon)

- Canvas Area (Main):
  * Infinite plane with subtle grid
  * Items: notes, images, links, checklists (draggable, resizable)
  * Resize handles on selected items (8 corners/edges)
  * Multi-select with Shift key
  * Marquee select by dragging
  * Drop zone (lower-right corner, for deleting items)

- Right Panel (Contextual, appears when item selected):
  * Properties header
  * Size inputs (width, height)
  * Position inputs (x, y)
  * Color picker
  * Border radius slider
  * Shadow toggle
  * Layer list (z-index)
  * Alignment tools (left, center, right, top, middle, bottom)

- Status Bar (Bottom):
  * Zoom controls (-, reset, +)
  * Zoom percentage display
  * Keyboard hints ("Hold Space to pan")
  * Undo/Redo buttons

States:
- Empty: "Create your first note" tooltip pointing to toolbar
- Loading: Canvas skeleton with toolbar visible
- Error: Non-blocking toast notification with retry
- Drawing Mode: Freehand overlay active, cursor changes to pencil
- Pan Mode: Cursor changes to hand, canvas draggable

Interactions:
- Toggle Pan/Draw: cursor icon changes, draw mode opens freehand overlay
- Resize: anchor opposite corner, maintain position while resizing
- Pan: moves both items and drawings together
- Zoom: keeps pointer-centered
- Drag: smooth 60fps movement
- Multi-select: Shift+click or marquee drag

Acceptance:
- Named layers for all elements
- Consistent spacing (8px grid)
- Keyboard shortcuts work (N: note, D: draw, Esc: cancel, Space: pan)
- Focus indicators visible
- Touch targets >= 44x44px on mobile
```

## Validation Checklist
- [ ] App context is one paragraph, structure only
- [ ] Style preferences separate from structure
- [ ] Per-screen prompts list elements top-to-bottom
- [ ] All states documented
- [ ] Interactions described
- [ ] No styling in screen prompts
- [ ] Acceptance criteria included

## Interaction
- Generate app context first
- Show to user: "Review app context? (yes/no)"
- Generate style preferences
- Generate per-screen prompts
- Save all to `tasks/ui/ux-pilot/`
- Provide usage instructions

## Usage Instructions for User

```markdown
## How to Use These Prompts in UX Pilot

1. **Open UX Pilot** and create a new design file
2. **Enter project name**
3. **Paste style preferences** into the "Style Preferences" box
4. **Select Hi-Fi mode** (not wireframe)
5. **Enable Deep Design** toggle
6. **Select platform** (Desktop/Mobile/Tablet)
7. **Paste app context** into the "Context" box (click expand button)
8. **Add screens**: For each screen, click "Add Screen" and paste the screen prompt
9. **Generate**: Click "Generate" and wait for UX Pilot to create designs
10. **Iterate**: Use "Global Edit" or per-section edit to refine designs

## Tips
- Generate all screens at once for consistency
- Use "Global Edit" to make changes across all screens
- Export to Figma when ready for handoff
- Iterate on prompts if output doesn't match vision
```

## References
- See `reference.md` for UX Pilot examples
- See UX Pilot docs: "Generate UI with AI, directly in Figma"
- See `ui-prompt-orchestrator` agent for workflow context
