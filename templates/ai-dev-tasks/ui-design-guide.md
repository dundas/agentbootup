# UI Design Prompt Generation Guide

This guide helps you use AI to transform product specifications into production-ready UI design prompts for Figma Make and UX Pilot.

## Overview

The UI design workflow automates the process of:
1. Extracting information architecture from product specs
2. Building comprehensive screen inventories
3. Defining design tokens and accessibility requirements
4. Generating tool-specific prompts (Figma Make and UX Pilot)

## When to Use This Workflow

- **After finalizing product spec** and ready to start UI design
- **Before opening design tools** to have clear direction
- **When onboarding designers** to provide comprehensive context
- **To maintain consistency** across multiple screens and flows

## Quick Start

### Option 1: Use the Command (Claude Code)
```
/ui-design-workflow tasks/0001-prd-board-app.md
```

### Option 2: Use the Workflow (Windsurf)
```
/ui-design-workflow
```
Then follow the prompts.

### Option 3: Manual Prompt
```
I have a finalized product spec at tasks/0001-prd-board-app.md.
Generate UI design prompts for Figma Make and UX Pilot.
```

## Workflow Phases

### Phase 1: Extract Information Architecture

**What happens:**
- Parses product spec for user personas and scenarios
- Identifies user journeys and key flows
- Generates sitemap with all screens
- Defines navigation model

**Output:** `tasks/ui/flows.md` and `tasks/ui/sitemap.md`

**Example Sitemap:**
```markdown
## Authenticated Pages
- `/dashboard` - Dashboard (default after login)
  - `/dashboard/boards` - Board List
  - `/dashboard/board/:id` - Board Canvas
    - `/dashboard/board/:id/settings` - Board Settings
  - `/dashboard/profile` - User Profile
```

### Phase 2: Build Screen Inventory

**What happens:**
- Creates detailed spec for each screen
- Defines purpose, inputs/outputs, user states
- Documents all screen states (loading, empty, error, success)
- Maps navigation relationships
- Defines acceptance criteria

**Output:** `tasks/ui/screen-inventory.md`

**Example Screen Spec:**
```markdown
## Screen: Board Canvas

**Route**: `/board/:id`
**Pattern**: Canvas/Workspace

### Purpose
Main workspace where users add, arrange, and interact with board items.

### States
1. Loading: Canvas skeleton with toolbar
2. Empty: "Add your first note" tooltip
3. Populated: Items on canvas, interactive
4. Error: "Failed to save" toast with retry

### Acceptance Criteria
- [ ] Drag and drop works smoothly (60fps)
- [ ] Autosave triggers after 2 seconds
- [ ] Keyboard shortcuts work (N: note, D: draw)
- [ ] Accessibility: focus order, ARIA labels
```

### Phase 3: Define Design Tokens

**What happens:**
- Extracts brand/visual preferences from spec
- Generates color palette with accessibility validation
- Defines typography scale and weights
- Creates spacing system (4pt or 8pt grid)
- Specifies border radius, elevation, transitions

**Output:** `tasks/ui/style-tokens.json` and `tasks/ui/style-recipe.md`

**Example Tokens:**
```json
{
  "colors": {
    "primary": "#5B3AFF",
    "surface": {
      "background": "#1A1A1A",
      "elevated": "#2A2A2A"
    },
    "text": {
      "primary": "#FFFFFF",
      "secondary": "#9CA3AF"
    }
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": {
      "h1": "32px",
      "body": "16px"
    }
  },
  "spacing": {
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  }
}
```

### Phase 4: Generate Figma Make Prompts

**What happens:**
- Creates front-loaded global prompt with full context
- Includes all screens, components, tokens, accessibility
- Generates per-screen refinement prompts
- Emphasizes component reuse

**Output:** `tasks/ui/figma-make/global-prompt.md` and per-screen files

**Key Difference:** Figma Make works best with **front-loaded details**. Put everything in the first prompt.

**Example Global Prompt:**
```markdown
Role: You are a senior UX designer generating a web product UI in Figma Make.

Project:
- Product: MindCraft. Purpose: Freeform board for brainstorming projects.
- Primary Persona: Solopreneurs. Key scenarios: Planning home renovation, buying a car.

Scope:
- Generate: Dashboard, Board Canvas, Login, Settings
- Use Auto Layout, responsive frames, 8pt spacing grid
- Reuse components: top bar, sidebar, card, modal, button

Design System:
- Color: primary #5B3AFF, surface #1A1A1A, success #10B981
- Type: Inter, sizes 12/14/16/20/24/32, weights 400/600/700
- Spacing: 4,8,12,16,24,32,48, Radius: 4,8,16

Accessibility: WCAG 2.1 AA, 4.5:1 contrast, focus states, 44x44 hit areas
```

### Phase 5: Generate UX Pilot Prompts

**What happens:**
- Creates app context (one paragraph, structure only)
- Generates per-screen top-to-bottom element breakdowns
- Creates separate style preferences
- Optimized for Hi-Fi mode and Deep Design

**Output:** `tasks/ui/ux-pilot/app-context.md`, `style-preferences.md`, and per-screen files

**Key Difference:** UX Pilot separates **structure from styling**. Styling goes in tool settings, not prompts.

**Example App Context:**
```markdown
MindCraft is a web app for solopreneurs that allows them to brainstorm and organize projects by saving all relevant info in one board like links, notes, images, and drawings.

Primary screens: Login, Dashboard with board list, Board canvas workspace, Settings.

Global patterns: top bar with logo/search/profile menu, keyboard shortcuts, undo/redo, autosave indicators.

Do not include styling; structure only.
```

**Example Style Preferences:**
```markdown
Dark theme, transparency effects, bold accent colors, modern aesthetic, thin lines, rounded corners (8px), glassmorphism, subtle shadows.
```

**Example Screen Prompt:**
```markdown
Screen: Board Canvas
Purpose: Freeform workspace to add notes, images, links, drawings; pan/zoom; resize; drag/drop.

Top-to-bottom blocks:
- Top Bar: Back button, Board title (editable), Mode toggle (Pan/Draw), Share, Settings, Autosave indicator
- Toolbar (Left): Select, Text Note, Image, Link, Checklist, Draw, Eraser
- Canvas Area: Infinite plane with grid, draggable/resizable items, multi-select, drop zone
- Right Panel: Properties (size, position, color, shadow), Layer list, Alignment tools
- Status Bar: Zoom controls, keyboard hints, Undo/Redo

States: Empty ("Add first note"), Loading (skeleton), Error (toast), Drawing Mode (overlay), Pan Mode (cursor change)

Interactions: Toggle Pan/Draw, Resize (anchor opposite corner), Pan (moves items + drawings), Zoom (pointer-centered)
```

## Tool-Specific Best Practices

### Figma Make

**✅ Do:**
- Front-load all details in first prompt
- Mention all screens upfront
- Define component strategy early
- Include design tokens immediately
- Use realistic sample data
- Reference components in follow-up prompts

**❌ Don't:**
- Start with vague prompts
- Add screens one at a time without context
- Forget to mention component reuse
- Skip accessibility requirements

**Workflow:**
1. Paste global-prompt.md as first prompt
2. Wait for Figma Make to generate initial structure
3. Use per-screen prompts as follow-ups to refine
4. Iterate with "Update this screen to..." prompts

### UX Pilot

**✅ Do:**
- Separate structure from styling
- Use top-to-bottom element lists
- Enable Hi-Fi mode and Deep Design
- Generate all screens at once
- Use "Global Edit" for cross-screen changes

**❌ Don't:**
- Include colors/fonts in screen prompts
- Mix styling with structure
- Generate screens one at a time
- Forget to enable Deep Design

**Workflow:**
1. Open UX Pilot, create new design file
2. Paste style-preferences.md in "Style Preferences" box
3. Paste app-context.md in "Context" box (click expand)
4. Select Hi-Fi mode, enable Deep Design
5. Add each screen: click "Add Screen", paste screen prompt
6. Generate all at once
7. Use "Global Edit" to refine across screens

## Example End-to-End Session

```
You: /ui-design-workflow tasks/0001-prd-board-app.md

AI: Analyzing product spec...
    
    Product: MindCraft Board App
    Platform: Web (desktop + mobile responsive)
    Users: Solopreneurs, lifestyle creatives
    
    Phase 1: Extracting IA...
    ✓ Sitemap: 4 primary screens
    ✓ Flows: 3 core user journeys
    
    Review sitemap? (yes/no)

You: yes

AI: [Shows sitemap with Dashboard, Board Canvas, Login, Settings]
    
    Looks good? (yes/no)

You: yes

AI: Phase 2: Building screen inventory...
    ✓ Dashboard: List view with board cards
    ✓ Board Canvas: Freeform workspace
    ✓ Login: Email/password + OAuth
    ✓ Settings: Account preferences
    
    Review screen inventory? (yes/no)

You: yes

AI: [Shows detailed screen specs]
    
    Phase 3: Defining design tokens...
    ✓ Dark theme with bold accents (#5B3AFF primary)
    ✓ Inter font, 16px base
    ✓ 8pt spacing grid
    ✓ WCAG AA validated (4.5:1 contrast)
    
    Review tokens? (yes/no)

You: yes

AI: [Shows style-tokens.json]
    
    Phase 4-5: Generating prompts...
    ✓ Figma Make: global + 4 screen prompts
    ✓ UX Pilot: context + style + 4 screen prompts
    
    📁 Files saved to tasks/ui/:
    
    Information Architecture:
    - flows.md
    - sitemap.md
    
    Screen Specifications:
    - screen-inventory.md
    
    Design System:
    - style-tokens.json
    - style-recipe.md
    
    Figma Make Prompts:
    - figma-make/global-prompt.md
    - figma-make/screen-dashboard.md
    - figma-make/screen-board-canvas.md
    - figma-make/screen-login.md
    - figma-make/screen-settings.md
    
    UX Pilot Prompts:
    - ux-pilot/app-context.md
    - ux-pilot/style-preferences.md
    - ux-pilot/screen-dashboard.md
    - ux-pilot/screen-board-canvas.md
    - ux-pilot/screen-login.md
    - ux-pilot/screen-settings.md
    
    Next Steps:
    
    For Figma Make:
    1. Open Figma Make
    2. Paste tasks/ui/figma-make/global-prompt.md
    3. Generate initial structure
    4. Use per-screen prompts to refine
    
    For UX Pilot:
    1. Open UX Pilot, create new file
    2. Paste style-preferences.md in "Style Preferences"
    3. Paste app-context.md in "Context"
    4. Enable Hi-Fi + Deep Design
    5. Add each screen prompt
    6. Generate all at once
    
    Ready to start designing!
```

## Common Scenarios

### Scenario 1: Starting from Scratch
**Situation:** You have a PRD, no designs yet

**Flow:**
1. Run `/ui-design-workflow tasks/prd.md`
2. Review screen inventory
3. Validate design tokens
4. Use Figma Make or UX Pilot prompts
5. Generate initial designs
6. Iterate based on output

### Scenario 2: Adding New Screens
**Situation:** Existing designs, need to add features

**Flow:**
1. Update product spec with new features
2. Run workflow again (will detect existing files)
3. Review new screens in inventory
4. Generate prompts for new screens only
5. Maintain consistency with existing design tokens

### Scenario 3: Redesigning Existing Product
**Situation:** Have old designs, want fresh look

**Flow:**
1. Create new product spec or update existing
2. Define new visual direction in spec
3. Run workflow to generate new tokens
4. Review token changes (colors, fonts, spacing)
5. Generate all prompts with new design system
6. Redesign all screens for consistency

### Scenario 4: Handoff to Designer
**Situation:** Need to brief a designer

**Flow:**
1. Run workflow to generate all documentation
2. Share `tasks/ui/` folder with designer
3. Designer reviews:
   - Screen inventory for requirements
   - Style tokens for design system
   - Flows for user journeys
4. Designer uses prompts or designs manually
5. Maintains consistency with tokens

## Troubleshooting

### "Prompts are too generic"
**Solution:**
- Add more detail to product spec
- Include specific data examples
- Refine screen inventory with edge cases
- Provide visual references or inspirations

### "Colors don't meet accessibility"
**Solution:**
- Review `style-tokens.json`
- Adjust colors to meet 4.5:1 contrast
- Use online contrast checkers
- Re-run token generation with adjustments

### "Missing screens in inventory"
**Solution:**
- Review sitemap for completeness
- Check product spec for mentioned features
- Add missing screens to inventory manually
- Re-run prompt generation

### "Figma Make output doesn't match vision"
**Solution:**
- Add more detail to global prompt
- Include visual references
- Use per-screen prompts to refine
- Iterate with follow-up prompts

### "UX Pilot designs lack detail"
**Solution:**
- Ensure Deep Design is enabled
- Check Hi-Fi mode is selected
- Add more specificity to screen prompts
- Use "Global Edit" to add missing elements

## Advanced Tips

### Reusing Design Systems
If you have an existing design system:
1. Export tokens to JSON format
2. Replace generated `style-tokens.json`
3. Update `style-recipe.md` to match
4. Re-run prompt generation with new tokens

### Multi-Platform Design
For web + mobile:
1. Run workflow twice (once per platform)
2. Use same design tokens for consistency
3. Adjust screen inventory for platform differences
4. Generate separate prompts per platform

### Component Libraries
To leverage existing components:
1. List components in product spec
2. Mention them in Figma Make global prompt
3. Reference them in per-screen prompts
4. UX Pilot: describe components in screen prompts

### Accessibility-First Design
To prioritize accessibility:
1. Set strict targets in config (WCAG AAA)
2. Review token contrast carefully
3. Include keyboard navigation in all screen specs
4. Test generated designs with screen readers

## Configuration

Create `.ui-design-config.json` (optional):
```json
{
  "platform": "web",
  "theme": "dark",
  "accessibility_target": "WCAG_2_1_AA",
  "design_system": {
    "base_unit": 8,
    "font_family": "Inter",
    "color_scheme": "custom"
  },
  "tools": {
    "figma_make": true,
    "ux_pilot": true
  }
}
```

## Related Resources

- **Agent**: `.claude/agents/ui-prompt-orchestrator.md`
- **Skills**:
  - `.claude/skills/extract-ia-and-flows/`
  - `.claude/skills/screen-inventory-builder/`
  - `.claude/skills/style-token-suggester/`
  - `.claude/skills/prompt-writer-figma-make/`
  - `.claude/skills/prompt-writer-ux-pilot/`
- **Command**: `.claude/commands/ui-design-workflow.md`
- **Workflow**: `.windsurf/workflows/ui-design-workflow.md`

## External Resources

- **Figma Make**: [8 Essential Tips for Using Figma Make](https://www.figma.com/blog/8-ways-to-build-with-figma-make/)
- **UX Pilot**: [Generate UI with AI, directly in Figma](https://uxpilot.ai/blogs/generate-ui-figma-ai)
- **Design Tokens**: [Design Tokens W3C Community Group](https://www.w3.org/community/design-tokens/)
- **Accessibility**: [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Tips for Success

1. **Start with a detailed spec** - The better your input, the better the output
2. **Review at each phase** - Don't skip the checkpoints
3. **Validate accessibility** - Check contrast ratios and keyboard navigation
4. **Iterate on prompts** - First generation is rarely perfect
5. **Maintain consistency** - Use the same design tokens across all screens
6. **Document decisions** - Keep notes on why you chose certain approaches
7. **Test with real tools** - Generate designs and see what works
8. **Learn from output** - Refine prompts based on what tools produce

---

**Remember**: This workflow generates prompts, not final designs. The prompts are starting points for Figma Make and UX Pilot to create designs, which you'll then iterate on and refine.
