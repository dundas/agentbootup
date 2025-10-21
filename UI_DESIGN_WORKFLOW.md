# UI Design Prompt Generation Workflow - Implementation Summary

## Overview

Implemented a complete AI-powered UI design prompt generation system that transforms finalized product specifications into production-ready prompts for **Figma Make** and **UX Pilot**.

## Architecture

### Design Pattern: Sequential Pipeline with Quality Gates

```
Product Spec
    ↓
Extract IA & Flows (sitemap, user journeys)
    ↓ [Quality Gate: Review sitemap]
Build Screen Inventory (detailed specs)
    ↓ [Quality Gate: Review screens]
Define Design Tokens (colors, typography, accessibility)
    ↓ [Quality Gate: Review tokens]
Generate Figma Make Prompts (front-loaded)
    +
Generate UX Pilot Prompts (structure/style separated)
    ↓
Output: Production-ready prompts
```

## Components Created

### 1. Agent
**`ui-prompt-orchestrator.md`**
- Coordinates 5-phase workflow
- Maintains state across phases
- Enforces quality gates
- Validates accessibility requirements

### 2. Skills (5 skills, 7 files)

**`extract-ia-and-flows/`**
- Parses product spec for user journeys
- Generates sitemap and navigation model
- Identifies primary/secondary flows
- Outputs: `flows.md`, `sitemap.md`

**`screen-inventory-builder/`**
- Creates canonical screen list
- Defines purpose, inputs/outputs, states per screen
- Maps navigation relationships
- Outputs: `screen-inventory.md`

**`style-token-suggester/`**
- Extracts brand/visual preferences
- Generates design tokens (colors, typography, spacing)
- Validates WCAG 2.1 AA accessibility
- Outputs: `style-tokens.json`, `style-recipe.md`

**`prompt-writer-figma-make/`**
- Creates front-loaded global prompt
- Generates per-screen refinement prompts
- Emphasizes component reuse
- Outputs: `figma-make/global-prompt.md` + per-screen files

**`prompt-writer-ux-pilot/`**
- Creates app context (structure only)
- Generates per-screen top-to-bottom element lists
- Separates style preferences
- Outputs: `ux-pilot/app-context.md`, `style-preferences.md` + per-screen files

### 3. Commands & Workflows (2 files)
- `ui-design-workflow.md` (Claude Code command)
- `ui-design-workflow.md` (Windsurf workflow)

### 4. Documentation
- `ui-design-guide.md` - Complete user guide with examples

## Key Design Decisions

### Tool-Specific Optimization

**Figma Make Strategy: Front-Load Everything**
- Include all context in first prompt
- Mention all screens upfront
- Define component strategy early
- Specify design tokens immediately
- Use per-screen prompts as refinements

**Why?** Figma Make works best with comprehensive upfront context.

**UX Pilot Strategy: Separate Structure from Styling**
- App context: structure only (no colors/fonts)
- Style preferences: separate document for tool settings
- Per-screen: top-to-bottom element lists
- Enable Hi-Fi mode + Deep Design

**Why?** UX Pilot applies styling consistently when separated from structure.

### Quality Gates

**After Screen Inventory:**
- All user flows covered by screens
- No orphaned screens
- Clear acceptance criteria per screen

**After Design Tokens:**
- Color contrast meets WCAG 2.1 AA (4.5:1 minimum)
- Type scale is consistent
- Spacing follows 4pt or 8pt grid

**After Prompts:**
- Figma Make prompts include component reuse
- UX Pilot prompts separate structure from styling
- All screens have detailed element breakdowns
- Accessibility requirements explicit

## Usage Examples

### Basic Usage
```bash
# In Claude Code or Windsurf
/ui-design-workflow tasks/0001-prd-board-app.md
```

### What You Get

**Information Architecture:**
```
tasks/ui/
├── flows.md              # User journeys and flows
└── sitemap.md            # Complete site structure
```

**Screen Specifications:**
```
tasks/ui/
└── screen-inventory.md   # Detailed specs for all screens
```

**Design System:**
```
tasks/ui/
├── style-tokens.json     # Design tokens (JSON)
└── style-recipe.md       # Human-readable style guide
```

**Figma Make Prompts:**
```
tasks/ui/figma-make/
├── global-prompt.md      # Master prompt (use first)
├── screen-dashboard.md   # Per-screen refinements
├── screen-board-canvas.md
├── screen-login.md
└── screen-settings.md
```

**UX Pilot Prompts:**
```
tasks/ui/ux-pilot/
├── app-context.md        # App context (paste in Context box)
├── style-preferences.md  # Styling (paste in Style Preferences)
├── screen-dashboard.md   # Per-screen element lists
├── screen-board-canvas.md
├── screen-login.md
└── screen-settings.md
```

## Best Practices from Research

### Figma Make (Source: Figma Blog)
✅ **Front-load your first prompt with details**
✅ **Leverage your own components for consistency**
✅ **Break down complex projects into steps**
✅ **Integrate realistic data**
✅ **Clean up design files before importing**

### UX Pilot (Source: UX Pilot Docs, Medium)
✅ **Separate structure from styling**
✅ **Use top-to-bottom element lists**
✅ **Enable Hi-Fi mode and Deep Design**
✅ **Generate all screens at once for consistency**
✅ **Use "Global Edit" for cross-screen changes**

### Accessibility (Both Tools)
✅ **Validate contrast ratios (4.5:1 for text, 3:1 for UI)**
✅ **Specify focus indicators (2px outline)**
✅ **Define keyboard navigation**
✅ **Touch targets >= 44x44px (mobile)**
✅ **Include ARIA labels in descriptions**

## Example Output

### Figma Make Global Prompt
```markdown
Role: You are a senior UX designer generating a web product UI in Figma Make.

Project:
- Product: MindCraft. Purpose: Freeform board for brainstorming projects.
- Primary Persona: Solopreneurs. Key scenarios: Planning home renovation.

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

### UX Pilot App Context
```markdown
MindCraft is a web app for solopreneurs that allows them to brainstorm and organize projects by saving all relevant info in one board like links, notes, images, and drawings.

Primary screens: Login, Dashboard with board list, Board canvas workspace, Settings.

Global patterns: top bar with logo/search/profile menu, keyboard shortcuts, undo/redo, autosave indicators.

Do not include styling; structure only.
```

### UX Pilot Style Preferences
```markdown
Dark theme, transparency effects, bold accent colors, modern aesthetic, thin lines, rounded corners (8px), glassmorphism, subtle shadows.
```

## Workflow Phases

### Phase 1: Extract IA (2-3 minutes)
- Parse product spec
- Generate sitemap
- Map user flows
- **Output**: `flows.md`, `sitemap.md`

### Phase 2: Build Screen Inventory (5-10 minutes)
- Create screen list
- Define purpose, states, acceptance criteria
- **Output**: `screen-inventory.md`

### Phase 3: Define Design Tokens (3-5 minutes)
- Extract visual preferences
- Generate color palette, typography, spacing
- Validate accessibility
- **Output**: `style-tokens.json`, `style-recipe.md`

### Phase 4: Generate Figma Make Prompts (2-3 minutes)
- Create global prompt
- Generate per-screen refinements
- **Output**: `figma-make/*.md`

### Phase 5: Generate UX Pilot Prompts (2-3 minutes)
- Create app context
- Generate per-screen element lists
- Create style preferences
- **Output**: `ux-pilot/*.md`

**Total Time**: 15-25 minutes for complete prompt generation

## Integration with Existing Workflows

### After PRD Creation
```
PRD → UI Design Workflow → Figma Make/UX Pilot → Implementation
```

### With Code Review Workflow
```
PRD → UI Design → Implementation → Code Review → Merge
```

### Full Dev Pipeline
```
PRD → Tasks → UI Design → Implementation → Tests → Code Review → Deploy
```

## Success Metrics

The workflow is successful if:
- ✅ All screens from spec are included in inventory
- ✅ Design tokens meet accessibility requirements
- ✅ Figma Make prompts include component reuse
- ✅ UX Pilot prompts separate structure from styling
- ✅ Generated designs match product vision
- ✅ Prompts are clear and actionable

## Future Enhancements

### Potential Additions
1. **Component library integration** - Import existing design systems
2. **Multi-platform support** - Generate web + mobile + desktop prompts
3. **Visual reference gathering** - Auto-fetch inspiration from Mobbin/Dribbble
4. **Design system export** - Generate Figma variables or Style Dictionary tokens
5. **Accessibility testing** - Automated contrast checking and ARIA validation
6. **Prompt iteration** - Refine prompts based on tool output
7. **Team collaboration** - Share prompts and iterate with designers

## Related Systems

- **Code Review Workflow**: Reflection + Planning pattern for PR reviews
- **Dev Pipeline**: PRD → Tasks → Implementation workflow
- **Task Processor**: One-task-at-a-time execution with gates

## References

### Research Sources
- **Figma Blog**: "8 Essential Tips for Using Figma Make"
- **UX Pilot Docs**: "Generate UI with AI, directly in Figma"
- **Medium**: "Design by Prompting: What I Learned Using UXPilot"
- **Adam Fard**: "How To Create Pixel Perfect UI Designs With UX Pilot AI"

### Implementation Files
- Agent: `.claude/agents/ui-prompt-orchestrator.md`
- Skills: `.claude/skills/{extract-ia-and-flows, screen-inventory-builder, style-token-suggester, prompt-writer-figma-make, prompt-writer-ux-pilot}/`
- Command: `.claude/commands/ui-design-workflow.md`
- Workflow: `.windsurf/workflows/ui-design-workflow.md`
- Guide: `ai-dev-tasks/ui-design-guide.md`

---

**Status**: ✅ Complete and ready for use

**Next Steps**:
1. Test with a real product spec
2. Generate prompts for Figma Make and UX Pilot
3. Iterate on prompt quality based on tool output
4. Gather user feedback
5. Refine skill prompts and templates
