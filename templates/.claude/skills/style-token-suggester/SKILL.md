---
name: style-token-suggester
description: Generate design tokens (colors, typography, spacing, etc.) from product spec and brand guidelines.
---

# Style Token Suggester

## Goal
Create a comprehensive design token specification that can be used in both Figma Make and UX Pilot prompts.

## Inputs
- Product specification (for brand/visual preferences)
- Brand guidelines (if available)
- Target platform (web/mobile/desktop)
- Accessibility requirements (default: WCAG 2.1 AA)

## Process

### 1. Extract Visual Preferences
From spec, identify mentions of:
- Brand colors or mood ("modern", "professional", "playful")
- Typography preferences ("clean", "bold", "minimal")
- Visual style ("dark theme", "glassmorphism", "flat design")
- Reference products or inspirations

### 2. Generate Color Palette
**Primary Colors:**
- Primary (brand color, CTAs)
- Secondary (accents, highlights)
- Tertiary (optional, additional accents)

**Neutral Colors:**
- Surface (backgrounds)
- On-surface (text on backgrounds)
- Border (dividers, outlines)

**Semantic Colors:**
- Success (green tones)
- Warning (yellow/orange tones)
- Error (red tones)
- Info (blue tones)

**Validate Contrast:**
- Text on backgrounds: >= 4.5:1 (WCAG AA)
- Large text (18pt+): >= 3:1
- UI components: >= 3:1

### 3. Define Typography Scale
**Font Families:**
- Heading font (e.g., Inter, SF Pro, Roboto)
- Body font (often same as heading)
- Monospace (for code, if needed)

**Type Scale:**
- Display: 48-64px (hero text)
- H1: 32-40px
- H2: 24-28px
- H3: 20-24px
- Body: 16px (base)
- Small: 14px
- Caption: 12px

**Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.2 (headings)
- Normal: 1.5 (body)
- Relaxed: 1.75 (long-form content)

### 4. Spacing System
**Base Unit:** 4px or 8px

**Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### 5. Other Tokens
**Border Radius:**
- sm: 4px (buttons, inputs)
- md: 8px (cards)
- lg: 16px (modals)
- full: 9999px (pills, avatars)

**Elevation (Shadows):**
- Level 0: none (flat)
- Level 1: subtle (cards)
- Level 2: medium (dropdowns)
- Level 3: high (modals)
- Level 4: highest (tooltips)

**Transitions:**
- Fast: 150ms (hover states)
- Normal: 250ms (most animations)
- Slow: 350ms (page transitions)

### 6. Accessibility Targets
- Minimum contrast: 4.5:1 (text), 3:1 (UI)
- Focus indicators: visible, 2px outline
- Touch targets: >= 44x44px (mobile)
- Motion: respect prefers-reduced-motion
- Color: not sole indicator (use icons/text too)

## Output Format

### `tasks/ui/style-tokens.json`
```json
{
  "colors": {
    "primary": "#5B3AFF",
    "secondary": "#FF6B6B",
    "surface": {
      "background": "#FFFFFF",
      "elevated": "#F8F9FA"
    },
    "text": {
      "primary": "#1A1A1A",
      "secondary": "#6B7280",
      "disabled": "#9CA3AF"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Inter, system-ui, sans-serif",
      "body": "Inter, system-ui, sans-serif",
      "mono": "Fira Code, monospace"
    },
    "fontSize": {
      "display": "48px",
      "h1": "32px",
      "h2": "24px",
      "h3": "20px",
      "body": "16px",
      "small": "14px",
      "caption": "12px"
    },
    "fontWeight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "full": "9999px"
  },
  "elevation": {
    "0": "none",
    "1": "0 1px 3px rgba(0,0,0,0.12)",
    "2": "0 4px 6px rgba(0,0,0,0.12)",
    "3": "0 10px 20px rgba(0,0,0,0.15)",
    "4": "0 20px 40px rgba(0,0,0,0.2)"
  },
  "transition": {
    "fast": "150ms",
    "normal": "250ms",
    "slow": "350ms"
  }
}
```

### `tasks/ui/style-recipe.md`
```markdown
# Design Style Recipe - [Product Name]

## Visual Direction
- **Mood**: Modern, professional, clean
- **Theme**: Dark mode with transparency effects
- **Style**: Glassmorphism with bold accent colors
- **Inspiration**: Linear, Notion, Figma

## Color Usage
- **Primary (#5B3AFF)**: CTAs, links, active states
- **Secondary (#FF6B6B)**: Highlights, badges, notifications
- **Surface**: Dark backgrounds with subtle gradients
- **Text**: High contrast white/light gray on dark

## Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Semibold, tight line-height
- **Body**: Regular, comfortable reading size (16px)
- **Emphasis**: Use color and weight, not underlines

## Spacing & Layout
- **Grid**: 8pt base unit
- **Padding**: Generous whitespace (24-32px)
- **Cards**: 16px border radius, elevation level 1
- **Buttons**: 8px radius, 12px vertical padding

## Accessibility
- **Contrast**: All text meets WCAG AA (4.5:1)
- **Focus**: 2px solid outline, primary color
- **Touch Targets**: 44x44px minimum on mobile
- **Motion**: Subtle, respects prefers-reduced-motion

## Platform-Specific
- **Web**: Hover states, cursor changes
- **Mobile**: Touch feedback, swipe gestures
- **Desktop**: Keyboard shortcuts, drag and drop
```

## Validation Checklist
- [ ] Color contrast validated (WCAG AA)
- [ ] Typography scale is harmonious
- [ ] Spacing follows consistent system
- [ ] Tokens are named semantically (not "blue", but "primary")
- [ ] Accessibility requirements explicit
- [ ] Platform considerations included

## Interaction
- Present color palette visually (if possible)
- Ask: "Does this match your brand vision? (yes/no)"
- Allow iteration on colors, fonts, spacing before finalizing

## References
- See `reference.md` for token examples and contrast checking
- See `ui-prompt-orchestrator` agent for workflow context
