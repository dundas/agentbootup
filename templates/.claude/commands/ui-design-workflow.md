---
name: ui-design-workflow
description: Generate UI design prompts for Figma Make and UX Pilot from finalized product spec.
---

# UI Design Workflow

Transform your finalized product specification into production-ready UI design prompts for Figma Make and UX Pilot.

## Usage

```
/ui-design-workflow [path-to-spec]
```

Or simply:
```
/ui-design-workflow
```
(Will prompt for spec file path)

## What This Does

1. **Extracts Information Architecture**
   - Parses product spec for user journeys and flows
   - Generates sitemap and navigation model
   - Identifies primary/secondary flows

2. **Builds Screen Inventory**
   - Creates complete list of all screens
   - Defines purpose, inputs/outputs, states per screen
   - Maps navigation relationships

3. **Defines Design Tokens**
   - Extracts brand/visual preferences
   - Generates color palette, typography, spacing
   - Validates accessibility (WCAG 2.1 AA)

4. **Generates Figma Make Prompts**
   - Front-loaded global prompt with full context
   - Per-screen refinement prompts
   - Component reuse strategy

5. **Generates UX Pilot Prompts**
   - App context (structure only)
   - Per-screen element breakdowns
   - Separate style preferences

6. **Provides Usage Instructions**
   - How to use prompts in each tool
   - Tips for iteration and refinement

## Example Session

```
You: /ui-design-workflow tasks/0001-prd-board-app.md

AI: Analyzing product spec...
    
    Found:
    - Product: MindCraft Board App
    - Platform: Web (desktop + mobile responsive)
    - Target Users: Solopreneurs, lifestyle creatives
    
    Extracting information architecture...
    ✓ Identified 4 primary screens
    ✓ Mapped 3 core user flows
    ✓ Generated sitemap
    
    Building screen inventory...
    ✓ Dashboard (Board List)
    ✓ Board Canvas
    ✓ Login/Signup
    ✓ Settings
    
    Defining design tokens...
    ✓ Color palette (dark theme with bold accents)
    ✓ Typography (Inter, 16px base)
    ✓ Spacing (8pt grid)
    ✓ Accessibility validated (WCAG AA)
    
    Generating Figma Make prompts...
    ✓ Global prompt created
    ✓ 4 screen refinement prompts created
    
    Generating UX Pilot prompts...
    ✓ App context created
    ✓ Style preferences created
    ✓ 4 screen prompts created
    
    📁 Files saved to tasks/ui/:
    - flows.md
    - sitemap.md
    - screen-inventory.md
    - style-tokens.json
    - style-recipe.md
    - figma-make/global-prompt.md
    - figma-make/screen-*.md
    - ux-pilot/app-context.md
    - ux-pilot/style-preferences.md
    - ux-pilot/screen-*.md
    
    Next Steps:
    1. Review screen inventory (tasks/ui/screen-inventory.md)
    2. Validate design tokens (tasks/ui/style-tokens.json)
    3. Use Figma Make prompts (start with global-prompt.md)
    4. Use UX Pilot prompts (app-context + per-screen)
    
    Ready to proceed? (yes/no)
```

## Workflow Steps

### Step 1: Extract IA and Flows
Uses `extract-ia-and-flows` skill to:
- Parse product spec for structure
- Generate sitemap and user flows
- Save to `tasks/ui/flows.md` and `tasks/ui/sitemap.md`

### Step 2: Build Screen Inventory
Uses `screen-inventory-builder` skill to:
- Create canonical screen list
- Define purpose, inputs/outputs, states
- Save to `tasks/ui/screen-inventory.md`

### Step 3: Define Design Tokens
Uses `style-token-suggester` skill to:
- Extract visual preferences
- Generate design tokens
- Validate accessibility
- Save to `tasks/ui/style-tokens.json` and `tasks/ui/style-recipe.md`

### Step 4: Generate Figma Make Prompts
Uses `prompt-writer-figma-make` skill to:
- Create front-loaded global prompt
- Generate per-screen refinement prompts
- Save to `tasks/ui/figma-make/`

### Step 5: Generate UX Pilot Prompts
Uses `prompt-writer-ux-pilot` skill to:
- Create app context (structure only)
- Generate per-screen element breakdowns
- Create style preferences
- Save to `tasks/ui/ux-pilot/`

### Step 6: Provide Instructions
- Show file locations
- Explain how to use prompts in each tool
- Provide tips for iteration

## Prerequisites

- Finalized product specification (PRD or similar)
- Clear understanding of target platform (web/mobile/desktop)
- Brand guidelines (optional, but helpful)

## Configuration

Create `.ui-design-config.json` in project root (optional):
```json
{
  "platform": "web",
  "theme": "dark",
  "accessibility_target": "WCAG_2_1_AA",
  "design_system": {
    "base_unit": 8,
    "font_family": "Inter",
    "color_scheme": "custom"
  }
}
```

## Output Files

All files saved to `tasks/ui/` directory:

**Information Architecture:**
- `flows.md` - User journeys and flows
- `sitemap.md` - Complete site structure

**Screen Specifications:**
- `screen-inventory.md` - Detailed screen specs

**Design System:**
- `style-tokens.json` - Design tokens (JSON)
- `style-recipe.md` - Human-readable style guide

**Figma Make Prompts:**
- `figma-make/global-prompt.md` - Master prompt
- `figma-make/screen-[name].md` - Per-screen refinements

**UX Pilot Prompts:**
- `ux-pilot/app-context.md` - App context paragraph
- `ux-pilot/style-preferences.md` - Styling to paste in tool
- `ux-pilot/screen-[name].md` - Per-screen element lists

## Tips

**For Best Results:**
- Start with a detailed product spec
- Include visual preferences in spec
- Review screen inventory before generating prompts
- Iterate on design tokens if needed
- Test prompts in tools and refine

**Figma Make Tips:**
- Use global prompt first
- Reference components in per-screen prompts
- Include realistic data
- Iterate with follow-up prompts

**UX Pilot Tips:**
- Paste app context in "Context" box
- Paste style preferences in "Style Preferences" box
- Enable Hi-Fi mode and Deep Design
- Generate all screens at once for consistency

## Troubleshooting

**"Spec file not found"**
- Verify file path is correct
- Use absolute or relative path from project root

**"Missing visual preferences"**
- Add brand colors, fonts, style to spec
- Or provide them when prompted

**"Too many screens"**
- Focus on primary screens first
- Generate secondary screens later
- Use `--subset` flag (if available)

**"Prompts too generic"**
- Add more detail to screen inventory
- Include specific data examples
- Refine design tokens

## Related Commands

- `/extract-ia` - Just extract information architecture
- `/build-screen-inventory` - Just build screen inventory
- `/generate-design-tokens` - Just generate design tokens
- `/figma-make-prompts` - Just generate Figma Make prompts
- `/ux-pilot-prompts` - Just generate UX Pilot prompts

## See Also

- `agents/ui-prompt-orchestrator.md`
- `skills/extract-ia-and-flows/`
- `skills/screen-inventory-builder/`
- `skills/style-token-suggester/`
- `skills/prompt-writer-figma-make/`
- `skills/prompt-writer-ux-pilot/`
- `ai-dev-tasks/ui-design-guide.md`
