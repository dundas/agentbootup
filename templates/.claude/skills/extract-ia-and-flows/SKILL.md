---
name: extract-ia-and-flows
description: Parse product spec to extract information architecture, user journeys, sitemap, and primary flows.
---

# Extract IA and Flows

## Goal
Transform a product specification into structured information architecture and user flow documentation.

## Inputs
- Product specification (PRD, feature doc, or requirements)
- Target platform (web/mobile/desktop)

## Process

### 1. Identify User Personas
Extract primary and secondary personas from spec:
- Who are the users?
- What are their goals?
- What scenarios/use cases are described?

### 2. Map User Journeys
For each persona, identify key journeys:
- Entry points (how they arrive)
- Steps through the application
- Decision points and branches
- Exit points (completion/abandonment)

### 3. Build Sitemap
Create hierarchical structure:
- Top-level sections/modules
- Sub-pages and nested screens
- Navigation relationships
- Access control (public/authenticated/admin)

### 4. Define Primary Flows
Identify 3-5 critical flows:
- Onboarding/signup
- Core value delivery (main feature usage)
- Secondary features
- Settings/configuration
- Error recovery

### 5. Document Navigation Model
Specify navigation patterns:
- Global navigation (header/sidebar/tabs)
- Contextual navigation (breadcrumbs/back buttons)
- Deep linking requirements
- Search and discovery

## Output Format

### `tasks/ui/flows.md`
```markdown
# User Flows - [Product Name]

## Primary Persona: [Name]
**Goals**: [List]
**Scenarios**: [List]

### Flow 1: [Flow Name]
**Trigger**: [What starts this flow]
**Steps**:
1. [Screen/Action] → [Next Screen/Action]
2. [Screen/Action] → [Next Screen/Action]
3. [Decision Point]: If X → [Path A], else → [Path B]
4. [Completion State]

**Success Criteria**: [How we know it worked]
**Error Scenarios**: [What can go wrong]

### Flow 2: [Flow Name]
...

## Secondary Flows
- [List of less critical flows]
```

### `tasks/ui/sitemap.md`
```markdown
# Sitemap - [Product Name]

## Public Pages
- `/` - Landing/Home
- `/about` - About Us
- `/pricing` - Pricing Plans
- `/login` - Login
- `/signup` - Sign Up

## Authenticated Pages
- `/dashboard` - Dashboard (default after login)
  - `/dashboard/boards` - Board List
  - `/dashboard/board/:id` - Board Canvas
    - `/dashboard/board/:id/settings` - Board Settings
  - `/dashboard/profile` - User Profile
  - `/dashboard/settings` - Account Settings

## Admin Pages (if applicable)
- `/admin` - Admin Dashboard
- `/admin/users` - User Management

## Navigation Model
- **Global**: Top bar with logo, search, profile menu
- **Contextual**: Breadcrumbs on detail pages
- **Mobile**: Hamburger menu for global nav
```

## Validation Checklist
- [ ] All user personas identified
- [ ] Primary flows cover main value proposition
- [ ] Sitemap includes all screens mentioned in spec
- [ ] Navigation model is consistent across platform
- [ ] Entry/exit points clearly defined
- [ ] Error and edge case flows documented

## Interaction
- Present sitemap first: "Found 12 screens across 3 main sections"
- Ask: "Does this structure match your vision? Any screens missing?"
- Iterate based on feedback before proceeding to screen inventory

## References
- See `reference.md` for sitemap and flow examples
- See `ui-prompt-orchestrator` agent for workflow context
