# Screen Inventory Builder - Reference

## Screen Specification Template

```markdown
## Screen: [Name]

**Route**: `/path/:param`
**Pattern**: [List/Detail/Form/Canvas/Settings]
**Auth Required**: [Yes/No]

### Purpose
[One sentence: what this screen does]

### User Context
[When/why user arrives here]

### Inputs
- [Data needed to render]
- API: `METHOD /endpoint` → Response shape

### Outputs
- **Actions**: [Buttons, links, forms]
- **Data Modified**: [What changes]

### States
1. Loading: [How it looks]
2. Empty: [First-time/no data]
3. Populated: [Normal state]
4. Error: [Failure handling]

### Navigation
- **From**: [Entry points]
- **To**: [Exit points]
- **Breadcrumbs**: [If applicable]

### Acceptance Criteria
- [ ] [Functional requirement]
- [ ] [Performance requirement]
- [ ] [Accessibility requirement]
```

## Common Screen Patterns

### List View Pattern
- Dashboard, search results, table views
- **Inputs**: Query params (page, sort, filter), API data
- **States**: Loading (skeleton), Empty (CTA), Populated (items), Error
- **Actions**: Create new, view detail, bulk actions, pagination
- **Example**: Board list, user list, transaction history

### Detail View Pattern
- Single item display
- **Inputs**: Item ID (URL param), API fetch
- **States**: Loading, Not Found (404), Populated, Error
- **Actions**: Edit, delete, share, related actions
- **Example**: Board canvas, user profile, order detail

### Form Pattern
- Create/edit screens
- **Inputs**: Existing data (edit mode), validation rules
- **States**: Empty (create), Populated (edit), Submitting, Success, Error
- **Actions**: Submit, cancel, autosave
- **Example**: Create board, edit profile, settings

### Settings Pattern
- Configuration screens
- **Inputs**: Current settings, API fetch
- **States**: Loading, Populated, Saving, Saved, Error
- **Actions**: Update fields, save, reset to defaults
- **Example**: Account settings, board settings, preferences

## State Documentation Best Practices

### Always Include These States
1. **Loading**: What user sees while data fetches
2. **Empty**: First-time or no data scenario
3. **Populated**: Normal, happy path
4. **Error**: API failure, network issue, validation error
5. **Success**: Confirmation after action (optional)

### State-Specific Details
- **Loading**: Skeleton UI, spinner, progress bar
- **Empty**: Helpful message + CTA ("Create your first...")
- **Error**: Clear message + retry/help action
- **Success**: Toast, banner, or inline confirmation

## Acceptance Criteria Guidelines

### Functional
- Core actions work as expected
- Data persists correctly
- Navigation flows properly
- Edge cases handled

### Performance
- Load time targets (e.g., < 2 seconds)
- Smooth animations (60fps)
- Responsive to user input

### Accessibility
- Keyboard navigation works
- Screen reader support (ARIA labels)
- Focus management
- Color contrast (WCAG 2.1 AA)
- Hit targets >= 44x44px (mobile)

### Responsive
- Works on mobile, tablet, desktop
- Touch-friendly on mobile
- Adaptive layouts

## Example: Complete Screen Spec

```markdown
## Screen: Login

**Route**: `/login`
**Pattern**: Form
**Auth Required**: No

### Purpose
Allow users to authenticate with email/password or OAuth providers.

### User Context
- New user clicking "Login" from landing page
- Existing user returning to app
- Redirected from protected page when not authenticated

### Inputs
- Query param: `?redirect=/dashboard` (where to go after login)
- No API call on load (form only)

### Outputs
- **Actions**:
  - Submit email/password → `POST /api/auth/login`
  - Click "Login with Google" → OAuth flow
  - Click "Forgot Password?" → `/forgot-password`
  - Click "Sign Up" → `/signup`
- **Data Modified**: Session token stored in cookie/localStorage

### States
1. **Empty**: Form fields blank, ready for input
2. **Submitting**: Button disabled, spinner, "Logging in..."
3. **Error**: Red border on fields, error message below form
   - "Invalid credentials"
   - "Account locked"
   - "Network error, please try again"
4. **Success**: Brief "Success!" message, then redirect to dashboard

### Navigation
- **From**: Landing page, any protected page (redirect), signup page
- **To**: Dashboard (or redirect param), Forgot Password, Sign Up
- **Breadcrumbs**: None

### Acceptance Criteria
- [ ] Email and password fields validate on blur
- [ ] Submit button disabled until form valid
- [ ] Enter key submits form
- [ ] OAuth buttons open popup/redirect correctly
- [ ] Error messages clear and actionable
- [ ] Success redirects to intended page (or dashboard)
- [ ] "Remember me" checkbox persists session
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces errors
- [ ] Mobile: keyboard type="email" for email field
- [ ] Rate limiting: max 5 attempts per minute
```

## Tips for Completeness

### Don't Forget
- **Permissions**: Who can access this screen?
- **Loading states**: Every API call needs a loading state
- **Empty states**: What if there's no data?
- **Error recovery**: Always provide a way forward
- **Mobile considerations**: Touch targets, keyboard types
- **Offline behavior**: What if network is down?

### Common Mistakes
- ❌ Forgetting empty state (first-time users)
- ❌ No error handling (API failures)
- ❌ Missing keyboard shortcuts
- ❌ Ignoring mobile responsiveness
- ❌ Vague acceptance criteria ("works well")

### Good Acceptance Criteria
- ✅ Specific: "Loads within 2 seconds"
- ✅ Testable: "Keyboard navigation works"
- ✅ Measurable: "Color contrast >= 4.5:1"
- ✅ User-focused: "User can complete task without mouse"

## Integration with Prompt Generation

The screen inventory feeds directly into prompt generation:

**For Figma Make:**
- Purpose → Project context
- Inputs/Outputs → Component requirements
- States → Variants to design
- Acceptance criteria → Design constraints

**For UX Pilot:**
- Purpose → Screen description
- Inputs/Outputs → Top-to-bottom element list
- States → State variations to generate
- Navigation → Flow connections

This structured inventory ensures no screen is missed and all prompts are comprehensive.
