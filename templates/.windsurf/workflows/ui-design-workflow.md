# UI Design Workflow
Generate UI design prompts for Figma Make and UX Pilot from finalized product specification.

## Steps

1. **Extract Information Architecture**
   - Ask user for product spec file path
   - Use @skills/extract-ia-and-flows/SKILL.md to parse spec
   - Generate sitemap and user flows
   - Save to `/tasks/ui/flows.md` and `/tasks/ui/sitemap.md`
   - Show summary: "Found X screens across Y sections"

2. **Build Screen Inventory** (User Checkpoint)
   - Use @skills/screen-inventory-builder/SKILL.md
   - Create detailed spec for each screen (purpose, inputs/outputs, states)
   - Save to `/tasks/ui/screen-inventory.md`
   - Ask: "Review screen inventory before continuing? (yes/no)"

3. **Define Design Tokens** (User Checkpoint)
   - Use @skills/style-token-suggester/SKILL.md
   - Extract visual preferences from spec
   - Generate color palette, typography, spacing
   - Validate accessibility (WCAG 2.1 AA)
   - Save to `/tasks/ui/style-tokens.json` and `/tasks/ui/style-recipe.md`
   - Ask: "Review design tokens? (yes/no)"

4. **Generate Figma Make Prompts**
   - Use @skills/prompt-writer-figma-make/SKILL.md
   - Create front-loaded global prompt with:
     * Project context and persona
     * All screens to generate
     * Component reuse strategy
     * Design system tokens
     * Accessibility requirements
   - Generate per-screen refinement prompts
   - Save to `/tasks/ui/figma-make/global-prompt.md` and per-screen files

5. **Generate UX Pilot Prompts**
   - Use @skills/prompt-writer-ux-pilot/SKILL.md
   - Create app context (one paragraph, structure only)
   - Generate per-screen top-to-bottom element breakdowns
   - Create style preferences (separate from structure)
   - Save to `/tasks/ui/ux-pilot/app-context.md`, `style-preferences.md`, and per-screen files

6. **Provide Usage Instructions**
   - Show file locations
   - Explain how to use prompts in Figma Make:
     * Start with global-prompt.md
     * Use per-screen prompts as follow-ups
     * Reference components from global prompt
   - Explain how to use prompts in UX Pilot:
     * Paste app-context.md in "Context" box
     * Paste style-preferences.md in "Style Preferences" box
     * Add each screen prompt as a new screen
     * Enable Hi-Fi mode and Deep Design
   - Provide tips for iteration

## Orchestration
- Delegate to @agents/ui-prompt-orchestrator.md for workflow coordination
- Maintain state in `/tasks/ui/workflow-state.json`
- Always pause for user approval after:
  * Screen inventory complete
  * Design tokens defined
  * Before generating prompts

## User Interaction Pattern
```
AI: Analyzing product spec...
    Found: MindCraft Board App (web platform)
    
    Extracting information architecture...
    ✓ 4 primary screens identified
    ✓ 3 core user flows mapped
    
    Review sitemap? (yes/no)

User: yes

AI: [Shows sitemap]
    
    Building screen inventory...
    ✓ Dashboard (Board List)
    ✓ Board Canvas
    ✓ Login/Signup
    ✓ Settings
    
    Review screen inventory? (yes/no)

User: yes

AI: [Shows screen inventory summary]
    
    Defining design tokens...
    ✓ Dark theme with bold accents
    ✓ Inter font, 16px base
    ✓ 8pt spacing grid
    ✓ WCAG AA validated
    
    Review tokens? (yes/no)

User: yes

AI: [Shows style-tokens.json]
    
    Generating prompts...
    ✓ Figma Make: global + 4 screens
    ✓ UX Pilot: context + style + 4 screens
    
    Files saved to tasks/ui/
    
    Next steps:
    1. Open Figma Make, paste global-prompt.md
    2. Or open UX Pilot, paste app-context + style-preferences
    3. Generate designs
    4. Iterate as needed
```

## Output Files
- `/tasks/ui/flows.md` - User journeys and flows
- `/tasks/ui/sitemap.md` - Site structure
- `/tasks/ui/screen-inventory.md` - Detailed screen specs
- `/tasks/ui/style-tokens.json` - Design tokens
- `/tasks/ui/style-recipe.md` - Style guide
- `/tasks/ui/figma-make/global-prompt.md` - Master prompt
- `/tasks/ui/figma-make/screen-*.md` - Per-screen refinements
- `/tasks/ui/ux-pilot/app-context.md` - App context
- `/tasks/ui/ux-pilot/style-preferences.md` - Styling
- `/tasks/ui/ux-pilot/screen-*.md` - Per-screen elements

## Prerequisites
- Finalized product specification (PRD or feature doc)
- Target platform known (web/mobile/desktop)
- Brand guidelines (optional)

## Notes
- Skills referenced: `skills/extract-ia-and-flows/SKILL.md`, `skills/screen-inventory-builder/SKILL.md`, `skills/style-token-suggester/SKILL.md`, `skills/prompt-writer-figma-make/SKILL.md`, `skills/prompt-writer-ux-pilot/SKILL.md`
- Agent: `agents/ui-prompt-orchestrator.md`
- Guide: `ai-dev-tasks/ui-design-guide.md`
- Always validate accessibility requirements in design tokens
- Separate structure from styling for UX Pilot
- Front-load details for Figma Make
