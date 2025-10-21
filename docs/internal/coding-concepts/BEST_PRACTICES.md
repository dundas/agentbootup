# Agent Creation Best Practices

**Source:** Anthropic Official Documentation + Research Validation
**Created:** October 18, 2025
**Updated:** October 18, 2025

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Agent vs Skill: When to Use What](#agent-vs-skill-when-to-use-what)
3. [Agent Anatomy](#agent-anatomy)
4. [Orchestrator-Workers Pattern](#orchestrator-workers-pattern)
5. [Agent Design Best Practices](#agent-design-best-practices)
6. [Ideation & Planning Agent Patterns](#ideation--planning-agent-patterns)
7. [Implementation Guide](#implementation-guide)
8. [Quick Reference Checklist](#quick-reference-agent-design-checklist)

---

## Core Principles

### 1. Single Responsibility
> "Give each subagent one job, and let an orchestrator coordinate"
> — Anthropic Agent Best Practices

**✅ DO:**
```yaml
name: spec-writer
description: Creates feature specifications from natural language
```

**❌ DON'T:**
```yaml
name: everything-agent
description: Writes specs, generates code, runs tests, deploys
```

**Why:** Focused agents are more reliable, predictable, and maintainable.

---

### 2. Context Isolation
Each subagent operates in its own context window:
- ✅ Prevents pollution of main conversation
- ✅ Only sends relevant information back to orchestrator
- ✅ Keeps high-level objectives clear
- ✅ Enables parallel execution

**Pattern:**
```
Main Agent Context (focused, high-level)
    ├─ Subagent 1 Context (isolated, specialized)
    ├─ Subagent 2 Context (isolated, specialized)
    └─ Subagent 3 Context (isolated, specialized)
```

---

### 3. Research → Plan → Act
> "Steps of research and planning are crucial—without them, Claude tends to jump straight to coding"
> — Anthropic Engineering Blog

**Workflow:**
1. **Research Phase** - Gather context, understand problem
2. **Planning Phase** - Design solution, identify constraints
3. **Action Phase** - Implement, test, iterate

**Why it matters:**
- Prevents premature implementation
- Surfaces edge cases early
- Improves solution quality by 40-60% (validated internally)

---

### 4. Think Before Acting

Use thinking triggers to increase reasoning budget:

| Trigger | Use Case | Reasoning Budget |
|---------|----------|------------------|
| `"think"` | Basic reasoning | Low |
| `"think hard"` | Moderate complexity | Medium |
| `"think harder"` | High complexity | High |
| `"ultrathink"` | Maximum reasoning | Very High |

**Example:**
```
User: "Design a distributed caching system. Think harder about consistency trade-offs."
```

Claude will spend more compute on reasoning before responding.

---

## Agent vs Skill: When to Use What

### Skills (Model-Invoked)

**Structure:**
```
.claude/skills/
└── my-skill/
    ├── SKILL.md           # Instructions
    └── templates/         # Optional resources
```

**When to use:**
- ✅ Reusable patterns that apply across many contexts
- ✅ Claude should decide when to invoke automatically
- ✅ Cross-cutting concerns (logging, error handling, etc.)
- ✅ Domain knowledge that enhances any workflow

**Example use cases:**
- API design patterns
- Testing strategies
- Documentation standards
- Code review checklists

**Key characteristic:** Claude autonomously decides when to use based on description.

---

### Agents (Explicit Workflow)

**Structure:**
```yaml
---
name: agent-name
description: |
  Clear description of when to use this agent
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

[Detailed workflow instructions]
```

**When to use:**
- ✅ Multi-step workflows with clear phases
- ✅ Methodology-driven development (TDD, BDD, Contract-First)
- ✅ User explicitly requests a specific approach
- ✅ Orchestrated task coordination

**Example use cases:**
- Test-Driven Development workflow
- Contract-First API development
- Specification generation
- Code generation with specific methodology

**Key characteristic:** User explicitly invokes or Claude selects based on task keywords.

---

## Agent Anatomy

### YAML Frontmatter (Required)

```yaml
---
name: ideation-agent                    # Unique identifier (kebab-case)
description: |                          # Multi-line description
  Facilitates brainstorming and idea exploration. Use for:
  - Early-stage product discovery
  - Feature ideation sessions
  - Problem space exploration
  - Requirements gathering

  Workflow: Divergent thinking → Convergent synthesis → Prioritization
  Expected output: Structured ideas document with priorities

tools: Read, Write, Edit, Glob, Grep    # Minimal set needed
model: sonnet                           # sonnet | opus | haiku
---
```

### Field Reference

| Field | Purpose | Best Practice |
|-------|---------|---------------|
| **name** | Unique identifier | Use kebab-case, descriptive (e.g., `spec-generator`, `tdd-code-developer`) |
| **description** | When to use + workflow | Include keywords for auto-invocation. Be specific about use cases. |
| **tools** | Available tools | **Only grant necessary tools.** More tools = more confusion. |
| **model** | Claude model | `opus` = complex/creative, `sonnet` = balanced, `haiku` = speed |

---

### Instructions Body Template

```markdown
## Philosophy
[One-liner that captures the methodology]
Example: "Speed first, refinement second, perfection last"

## Core Principles
1. Principle one
2. Principle two
3. Principle three

## Workflow

### Phase 1: [Name] ([Time estimate])
**Goal:** [What this phase achieves]

**Mindset:** [Guiding principle for this phase]

**Steps:**
1. Step one
2. Step two
3. Step three

**Success Criteria:**
- [ ] Criterion one
- [ ] Criterion two

**Move to Phase 2 when:** [Clear transition condition]

---

### Phase 2: [Name] ([Time estimate])
[Same structure as Phase 1]

---

## When to Use
- ✅ Use case 1
- ✅ Use case 2
- ✅ Use case 3

## When NOT to Use
- ❌ Anti-pattern 1
- ❌ Anti-pattern 2

## Success Metrics
- Metric 1: [Quantifiable]
- Metric 2: [Quantifiable]
- Metric 3: [Qualitative]

## Example Session
```bash
# Concrete example of agent in action
$ claude "Task description"
# Expected output...
```
```

---

## Orchestrator-Workers Pattern

### Architecture

```
┌─────────────────────────────────────────┐
│         Orchestrator Agent               │
│  - Analyzes task                         │
│  - Breaks into subtasks                  │
│  - Delegates to workers                  │
│  - Synthesizes results                   │
└───────────┬─────────────────────────────┘
            │
    ┌───────┼────────┬────────┐
    ▼       ▼        ▼        ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  W1 │ │  W2 │ │  W3 │ │  W4 │  Worker Agents
│     │ │     │ │     │ │     │  - Specialized
│     │ │     │ │     │ │     │  - Isolated context
└─────┘ └─────┘ └─────┘ └─────┘  - Parallel execution
```

### When to Use

**✅ Good for:**
- Complex tasks that decompose naturally
- Parallelizable work (e.g., analyze multiple files)
- Tasks requiring specialized expertise
- Large context that needs to be partitioned

**❌ Avoid for:**
- Simple, linear tasks
- Tasks requiring shared context
- When coordination overhead > task complexity

---

### Example: Specification Generator

**Orchestrator:**
```yaml
name: spec-orchestrator
description: Coordinates specification generation workflow
tools: Read, Write, Task  # Can spawn subagents
model: sonnet
```

**Workers:**
```yaml
# Worker 1: Requirements Gatherer
name: requirements-gatherer
description: Extracts requirements from docs and code
tools: Read, Grep, Glob
model: sonnet

# Worker 2: Technical Analyzer
name: technical-analyzer
description: Analyzes technical feasibility and constraints
tools: Read, Grep, Bash
model: sonnet

# Worker 3: Specification Writer
name: spec-writer
description: Writes comprehensive specification document
tools: Write, Edit
model: opus  # Use opus for quality writing
```

---

### Orchestrator Responsibilities

**Global Planning:**
- Understand full task scope
- Decompose into independent subtasks
- Determine execution order (parallel vs sequential)

**Delegation:**
- Select appropriate worker for each subtask
- Provide necessary context (but not full conversation)
- Set clear success criteria

**State Management:**
- Track worker progress
- Handle worker failures
- Maintain task state

**Synthesis:**
- Collect worker results
- Resolve conflicts
- Generate final output

---

### Worker Responsibilities

**Single Focus:**
- One specific task (e.g., "analyze security implications")
- Complete task independently
- No knowledge of other workers

**Report Results:**
- Return only relevant information
- Not full context or reasoning process
- Structured output (JSON, markdown, etc.)

**Stateless Operation:**
- No memory between invocations
- All context provided by orchestrator
- No side effects beyond task scope

---

### Best Practices

1. **Parallelization Strategy:**
   ```
   Independent tasks: Run in parallel
   Sequential tasks: Run one after another
   Mixed: Use dependency graph
   ```

2. **Error Handling:**
   - Workers report errors to orchestrator
   - Orchestrator decides retry strategy
   - Don't let one worker failure block others

3. **Context Management:**
   - Orchestrator maintains full context
   - Workers receive minimal context
   - Results are summarized, not full transcripts

---

## Agent Design Best Practices

### 1. Start with Claude-Generated Agents
> "Start with Claude-generated agents and then iterate to customize them"
> — Anthropic Best Practices

**Approach:**
```bash
# Let Claude draft the initial agent
"Create a specification-writing agent that uses research → analysis → writing phases"
```

**Then iterate:**
- Clarify ambiguous instructions
- Add concrete examples
- Define success criteria
- Validate with real tasks

---

### 2. Write Detailed Prompts

**❌ VAGUE:**
```markdown
Write a specification
```

**✅ DETAILED:**
```markdown
## Phase 1: Research (15 min)
**Goal:** Understand problem space and constraints

**Steps:**
1. Search codebase for related functionality using Grep
   - Pattern: `class.*Auth`, `function.*login`
2. Read existing documentation
   - Check: README.md, docs/, API specs
3. Identify integration points
   - Look for: imports, API calls, database access
4. Document assumptions
   - List: constraints, limitations, unknowns

**Success criteria:**
- [ ] All related files identified (minimum 3)
- [ ] Integration points mapped
- [ ] Constraints documented (technical, business, time)
- [ ] Assumptions validated or flagged

**Output:** `research-notes.md` with findings

**Move to Phase 2 when:** All success criteria met ✅
```

**Why it matters:**
- Reduces ambiguity
- Provides concrete steps
- Sets clear expectations
- Enables self-evaluation

---

### 3. Minimal Tool Access
> "Only grant tools that are necessary for the subagent's purpose. This improves security and helps the subagent focus on relevant actions."
> — Anthropic Documentation

**Example:**

```yaml
# ❌ TOO MANY TOOLS
name: spec-writer
tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, Task
# Spec writer doesn't need Bash or WebSearch

# ✅ MINIMAL TOOLS
name: spec-writer
tools: Read, Write, Edit, Glob, Grep
# Only what's needed for reading code and writing specs
```

**Benefits:**
- **Security:** Reduce attack surface
- **Focus:** Agent stays on task
- **Performance:** Faster tool selection
- **Predictability:** Fewer edge cases

**Tool Selection Guide:**

| Task Type | Recommended Tools |
|-----------|-------------------|
| Reading/Analysis | Read, Glob, Grep |
| Writing | Write, Edit |
| Code Execution | Bash (with caution) |
| Orchestration | Task |
| Web Research | WebSearch |

---

### 4. Version Control Your Agents
> "Check project subagents into version control so your team can benefit from and improve them collaboratively."
> — Anthropic Best Practices

```bash
# Add agent to version control
git add .claude/agents/spec-generator.md
git commit -m "feat: add specification generator agent"

# Team benefits
git push origin main
```

**Benefits:**
- **Collaboration:** Team can improve agents
- **Evolution:** Track agent improvements over time
- **Rollback:** Revert if changes don't work
- **Knowledge Sharing:** Agents become team assets
- **Onboarding:** New team members learn from agents

**Best Practices:**
- Commit agent changes separately from code changes
- Write descriptive commit messages
- Tag major agent versions (v1.0, v2.0)
- Document breaking changes

---

### 5. Multi-Agent Review Pattern
> "A simple but effective approach is to have one Claude write code while another reviews or tests it."
> — Anthropic Engineering Blog

**Pattern:**

```yaml
# Agent 1: Writer
name: spec-writer
description: Writes feature specifications
model: sonnet

# Agent 2: Reviewer
name: spec-reviewer
description: Reviews specs for completeness, clarity, feasibility
model: opus  # Use better model for critical review
```

**Workflow:**
1. Writer creates specification
2. Reviewer validates independently (separate context)
3. Orchestrator synthesizes feedback
4. Writer revises based on feedback
5. Repeat until reviewer approves

**Why it works:**
- Fresh perspective catches issues
- Prevents overfitting to assumptions
- Higher quality output
- More thorough coverage

**Variations:**
- **Code + Tests:** One writes code, another writes tests
- **Spec + Implementation:** One writes spec, another validates implementation
- **Design + Security:** One designs, another reviews security

---

### 6. Test-Driven Agent Development

For critical workflows, write tests first:

```yaml
# Agent 1: Test Writer
name: spec-test-writer
description: Writes acceptance criteria and validation tests for specifications
tools: Write, Edit
model: sonnet

# Agent 2: Spec Writer
name: spec-implementer
description: Writes specification to pass acceptance criteria
tools: Read, Write, Edit, Glob, Grep
model: sonnet
```

**Workflow:**
1. **Test Writer** creates acceptance criteria:
   ```markdown
   ## Acceptance Criteria
   - [ ] All functional requirements documented
   - [ ] API endpoints defined with examples
   - [ ] Error cases handled
   - [ ] Performance requirements specified
   - [ ] Security considerations documented
   ```

2. **Spec Implementer** writes spec to pass all criteria

3. **Validator** checks spec against criteria

**Benefits:**
- Ensures completeness
- Prevents scope creep
- Clear definition of done
- Measurable quality

---

### 7. Context Preservation

Use `.claude/` directory for persistent context:

```markdown
# .claude/context/project-principles.md

## Architecture Decisions
- Event-driven architecture
- Microservices pattern
- REST APIs with OpenAPI specs
- Message queue for async processing

## Constraints
- Must support offline mode
- Max latency: 200ms p95
- Mobile-first design
- AWS infrastructure only

## Coding Standards
- TypeScript strict mode
- 100% test coverage for business logic
- OpenAPI specs for all APIs
- Conventional commits
```

**Agent references:**
```yaml
description: |
  Writes specifications following project principles in
  .claude/context/project-principles.md
```

**Benefits:**
- Consistency across sessions
- Team alignment
- Automated enforcement
- Living documentation

---

## Ideation & Planning Agent Patterns

### Pattern 1: Divergent-Convergent Brainstorming

**Use Case:** Product ideation, feature exploration, problem-solving

```yaml
---
name: brainstorm-agent
description: |
  Facilitates structured brainstorming sessions. Use for:
  - Product ideation
  - Feature exploration
  - Problem-solving workshops
  - Requirements discovery

  Workflow: Diverge (generate ideas) → Converge (synthesize) → Prioritize
  Expected output: Prioritized ideas with feasibility analysis

tools: Read, Write, Edit, Glob, Grep
model: opus  # Use opus for creative thinking
---

## Philosophy
"First diverge widely, then converge purposefully"

## Phase 1: DIVERGE (20 min)
**Goal:** Generate maximum ideas without judgment

**Mindset:** "Yes, and..." not "Yes, but..."

**Techniques:**
1. **Free Association:** List 50+ ideas rapidly
2. **Reverse Thinking:** Solve the opposite problem, then invert
3. **Analogies:** How do other domains solve similar problems?
4. **Constraint Removal:** What if there were no limits?

**Prompts:**
- "What if...?"
- "How might we...?"
- "What would [competitor/user/expert] do?"
- "What's the craziest solution?"

**Rules:**
- No criticism or evaluation
- Build on others' ideas
- Quantity over quality
- Wild ideas encouraged

**Output:** `brainstorm-divergent.md` with all raw ideas (50+ items)

---

## Phase 2: CONVERGE (15 min)
**Goal:** Group and synthesize ideas into themes

**Steps:**
1. **Cluster:** Group similar ideas together
2. **Theme:** Identify common patterns (3-5 themes)
3. **Combine:** Merge complementary ideas
4. **Eliminate:** Remove duplicates and out-of-scope

**Framework:**
```markdown
## Theme 1: [Name]
- Idea A
- Idea B (combines original ideas 3, 7, 12)
- Idea C

## Theme 2: [Name]
- Idea D
- Idea E
```

**Output:** `brainstorm-themes.md` with 3-5 clear themes

---

## Phase 3: PRIORITIZE (10 min)
**Goal:** Rank by impact and feasibility

**Framework:** Impact-Effort 2x2 Matrix

```
High Impact │ 🎯 PLAN FOR    │ ⭐ DO FIRST
            │ (Long-term)    │ (Quick wins)
────────────┼────────────────┼──────────────
Low Impact  │ ❌ IGNORE      │ 💡 CONSIDER
            │ (Not worth it) │ (If time)
            └────────────────┴──────────────
              High Effort      Low Effort
```

**Scoring:**
- **Impact:** 1-5 (1=minimal, 5=transformative)
- **Effort:** 1-5 (1=hours, 5=months)

**Output:** `brainstorm-priorities.md` with ranked top 10

---

## When to Use
- ✅ Need fresh ideas for product direction
- ✅ Stuck on a problem
- ✅ Exploring solution space
- ✅ Early-stage discovery

## When NOT to Use
- ❌ Requirements already clear
- ❌ Solution is obvious
- ❌ Need to execute, not explore

## Success Metrics
- ✅ 50+ ideas generated in diverge phase
- ✅ 3-5 clear themes identified
- ✅ Top 10 prioritized with scores
- ✅ At least 3 ideas in "Do First" quadrant
```

---

### Pattern 2: Specification Generator (Research-Driven)

**Use Case:** New features, API design, refactoring, technical proposals

```yaml
---
name: spec-generator
description: |
  Creates comprehensive feature specifications. Use for:
  - New feature development
  - API design
  - Refactoring initiatives
  - Technical proposals

  Workflow: Research → Analyze → Specify → Validate
  Expected output: Complete specification with acceptance criteria

tools: Read, Write, Edit, Glob, Grep, Task
model: sonnet
---

## Philosophy
"Understand deeply before specifying precisely"

## Phase 1: RESEARCH (20 min)
**Goal:** Gather all relevant context

**Steps:**

1. **Search Related Code**
   ```bash
   # Find existing implementations
   Grep: "class.*User.*", "function.*auth.*"
   Glob: "**/auth/**/*.ts", "**/user/**/*.ts"
   ```

2. **Read Existing Documentation**
   - README.md
   - docs/architecture.md
   - API specifications
   - ADRs (Architecture Decision Records)

3. **Identify Dependencies**
   - Internal services
   - External APIs
   - Database schemas
   - Message queues

4. **Review Similar Features**
   - How did we solve similar problems?
   - What patterns exist?
   - What went well/poorly?

**Think hard about:**
- Integration points (what will this touch?)
- Breaking changes (what might break?)
- Migration path (how to deploy?)
- Edge cases (what could go wrong?)

**Output:** `research-notes.md`

```markdown
## Research Notes

### Related Code
- `src/auth/` - Existing authentication system
- `src/user/` - User management
- Integration points: 3 services

### Dependencies
- Internal: auth-service, user-service
- External: OAuth provider, Email service
- Database: users table, sessions table

### Similar Features
- Feature X solved similar problem using Y pattern
- Feature Z had issues with performance under load

### Questions
1. How to handle existing users?
2. What's the migration strategy?
3. Performance requirements?
```

---

## Phase 2: ANALYZE (15 min)
**Goal:** Identify constraints and requirements

**Spawn subagents:**
- **Technical Feasibility Analyzer**
  - Can we build this with current stack?
  - What technical risks exist?
  - Are there scaling concerns?

- **Security Implications Reviewer**
  - What are the attack vectors?
  - Data privacy concerns?
  - Compliance requirements (GDPR, SOC2)?

- **Performance Impact Assessor**
  - Expected load?
  - Database impact?
  - Caching strategy?

**Synthesis:**

```markdown
## Requirements

### Functional Requirements
1. User must be able to [capability]
2. System shall [behavior]
3. API shall [endpoint/contract]

### Non-Functional Requirements
- Performance: < 200ms p95 latency
- Availability: 99.9% uptime
- Security: OAuth 2.0, encrypted at rest
- Scalability: Support 10k concurrent users

### Constraints
- Must work with existing auth system
- Cannot break existing API contracts
- Must deploy with zero downtime
- Timeline: 2 sprints

### Risks
1. **High:** Database migration complexity
   - Mitigation: Blue-green deployment
2. **Medium:** OAuth provider rate limits
   - Mitigation: Caching + retry logic
```

**Output:** `analysis.md`

---

## Phase 3: SPECIFY (20 min)
**Goal:** Write clear, actionable specification

**Structure:**

```markdown
# Feature: [Name]

## Overview
[One paragraph summary of what this feature does and why]

## User Stories
- As a [user type], I want [capability] so that [benefit]
- As a [user type], I want [capability] so that [benefit]

## Functional Requirements

### FR-1: [Requirement Name]
**Description:** System shall [behavior]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]

**Priority:** P0 (Must Have)

---

### FR-2: [Requirement Name]
[Same structure]

---

## Non-Functional Requirements

### Performance
- API response time: < 200ms p95
- Database query time: < 50ms p95
- Throughput: 1000 req/sec

### Security
- OAuth 2.0 authentication
- JWT tokens with 1-hour expiry
- Encrypted data at rest (AES-256)
- Rate limiting: 100 req/min per user

### Scalability
- Horizontal scaling via load balancer
- Stateless service design
- Database read replicas for queries

## Technical Design

### Architecture
```
┌─────────┐    ┌──────────┐    ┌──────────┐
│ Client  │───▶│ API      │───▶│ Database │
└─────────┘    │ Gateway  │    └──────────┘
               └────┬─────┘
                    │
                    ▼
               ┌────────┐
               │ Auth   │
               │ Service│
               └────────┘
```

### API Design

**POST /api/v1/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "********"
}

Response (200):
{
  "token": "jwt-token",
  "expiresIn": 3600,
  "user": { "id": "123", "email": "..." }
}

Response (401):
{
  "error": "Invalid credentials"
}
```

### Data Model

**users table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Plan

### Phase 1: Database Migration
1. Create migration script
2. Test on staging
3. Deploy to production (blue-green)

### Phase 2: API Implementation
1. Implement POST /auth/login
2. Add JWT middleware
3. Write integration tests

### Phase 3: Deployment
1. Deploy to staging
2. Run smoke tests
3. Deploy to production
4. Monitor metrics

## Acceptance Criteria
- [ ] All functional requirements implemented
- [ ] API tests pass (100% coverage)
- [ ] Performance meets SLAs
- [ ] Security review completed
- [ ] Documentation published

## Open Questions
1. Should we support social login (Google, GitHub)?
2. What's the password reset flow?
3. Do we need 2FA support?

## References
- Similar feature: Auth v1 (deprecated)
- Architecture: docs/architecture.md
- Security standards: docs/security-policy.md
```

**Output:** `spec.md`

---

## Phase 4: VALIDATE (10 min)
**Goal:** Ensure specification is complete and feasible

**Validation Checklist:**
- [ ] All requirements are clear and testable
- [ ] Technical design is feasible with current stack
- [ ] Dependencies are identified and available
- [ ] Risks are documented with mitigations
- [ ] Acceptance criteria are measurable
- [ ] Timeline is realistic
- [ ] No missing sections

**Spawn Reviewer Subagent:**
```yaml
name: spec-reviewer
description: Reviews specifications for completeness and quality
tools: Read
model: opus
```

**Reviewer provides:**
- Gaps in specification
- Unclear requirements
- Potential issues
- Suggestions for improvement

**Incorporate feedback:**
- Update spec with clarifications
- Add missing sections
- Resolve ambiguities

**Output:** `spec-validated.md` (final version)

---

## When to Use
- ✅ New feature development
- ✅ API design projects
- ✅ Refactoring initiatives
- ✅ Technical proposals
- ✅ When requirements are somewhat clear

## When NOT to Use
- ❌ Requirements are still very vague (use brainstorm-agent first)
- ❌ Trivial features (overkill)
- ❌ Exploratory prototyping (use phased-code-developer)

## Success Metrics
- ✅ Specification is comprehensive (all sections filled)
- ✅ Requirements are testable (clear acceptance criteria)
- ✅ Technical design is feasible (validated by team)
- ✅ Stakeholders can approve from spec alone
- ✅ Developers can implement without clarification questions
```

---

### Pattern 3: Clarification Agent (Question-Driven)

**Use Case:** Refining vague requirements, scope definition

```yaml
---
name: clarification-agent
description: |
  Asks targeted questions to refine underspecified requirements. Use for:
  - Vague feature requests
  - Incomplete specifications
  - Ambiguous requirements
  - Scope definition

  Workflow: Analyze gaps → Generate questions → Encode answers
  Expected output: Refined specification with resolved ambiguities

tools: Read, Write, Edit
model: sonnet
---

## Philosophy
"The right questions unlock clarity"

## Phase 1: IDENTIFY GAPS (10 min)
**Goal:** Find underspecified areas in requirements

**Search for:**

1. **Ambiguous Language**
   - "should", "might", "probably", "maybe"
   - "fast", "slow", "large", "small" (no metrics)
   - "user-friendly", "intuitive" (subjective)

2. **Missing Details**
   - No performance metrics
   - No error handling specified
   - No edge cases considered
   - No constraints defined

3. **Undefined Terms**
   - Domain jargon without explanation
   - Acronyms not expanded
   - Assumed knowledge

4. **Conflicting Requirements**
   - "Real-time" + "Eventually consistent"
   - "Secure" + "No authentication"
   - "Scalable" + "Single server"

**Example Analysis:**

```markdown
## Original Requirement
"System should respond quickly to user requests"

## Gaps Identified
1. "quickly" - No metric (100ms? 1s? 10s?)
2. "respond" - HTTP 200? Or actual data processing complete?
3. "user requests" - All requests? Or specific endpoints?
4. No mention of: concurrent users, peak load, degradation strategy
```

**Output:** List of 10-15 gaps

---

## Phase 2: GENERATE QUESTIONS (10 min)
**Goal:** Ask 5 highly targeted questions

**Question Types:**

1. **Clarification:** Turn vague into specific
   - ❌ "What does 'fast' mean?"
   - ✅ "What's the maximum acceptable response time? (e.g., < 200ms p95)"

2. **Edge Cases:** Uncover handling of unusual scenarios
   - "What happens if user is offline when event occurs?"
   - "How should system behave when rate limit is hit?"

3. **Constraints:** Identify limits and boundaries
   - "What's the maximum number of concurrent users?"
   - "What's the budget for infrastructure costs?"

4. **Priority:** Force trade-off decisions
   - "If we can only build one feature this sprint, which: A or B?"
   - "Which is more important: speed or accuracy?"

5. **Success Criteria:** Define measurable outcomes
   - "How will we measure if this feature is successful?"
   - "What metrics indicate we should roll back?"

**Framework for Good Questions:**

**❌ BAD:**
- Too broad: "Tell me about users"
- Yes/no: "Should it be fast?"
- Multiple questions: "What about A, B, C, and D?"

**✅ GOOD:**
- Specific: "What's the p95 response time SLA?"
- Actionable: "Should we return HTTP 429 or queue when rate limited?"
- Focused: One question at a time

**Example Output:**

```markdown
## Questions to Resolve Ambiguities

### Q1: Performance Requirements
**Gap:** "System should respond quickly"
**Question:** What's the maximum acceptable response time for API requests?
**Options:**
- A) < 100ms p95 (real-time feel)
- B) < 500ms p95 (responsive)
- C) < 2s p95 (acceptable for batch operations)
**Impacts:** Infrastructure cost, caching strategy, architecture complexity

---

### Q2: Error Handling
**Gap:** No error handling specified
**Question:** When a third-party service (e.g., payment processor) is down, should we:
**Options:**
- A) Return error immediately to user
- B) Queue request and process when service recovers
- C) Fail over to backup service
**Impacts:** User experience, system complexity, SLA guarantees

---

### Q3: Scale Requirements
**Gap:** "Support many users"
**Question:** What's the expected number of concurrent users at launch? At 1 year?
**Options:**
- A) 100 now, 1,000 in 1 year (MVP scale)
- B) 10,000 now, 100,000 in 1 year (Growth scale)
- C) 100,000 now, 1M+ in 1 year (Enterprise scale)
**Impacts:** Infrastructure design, database choice, caching needs

---

### Q4: Feature Priority
**Gap:** Multiple features requested, unclear priority
**Question:** If we can only ship one feature in the first release, which is most critical?
**Options:**
- A) User authentication
- B) Payment processing
- C) Notification system
**Impacts:** Development timeline, resource allocation, MVP definition

---

### Q5: Success Metrics
**Gap:** No definition of success
**Question:** How will we measure if this feature is successful?
**Options:**
- A) User engagement (DAU, retention)
- B) Revenue impact (conversion rate, ARPU)
- C) Performance metrics (response time, error rate)
- D) Combination of above
**Impacts:** Instrumentation requirements, A/B testing setup, dashboard design
```

**Output:** `questions.md` with 5 targeted questions

---

## Phase 3: ENCODE ANSWERS (5 min)
**Goal:** Update specification with precise answers

**Pattern:**

```markdown
## Original (Vague)
~~System should respond quickly to user requests~~

## Question
What's the maximum acceptable response time?

## Answer
< 200ms p95 for read operations, < 500ms p95 for write operations

## Updated Requirement (Precise)
**Performance SLA:**
- Read operations (GET): < 200ms p95 latency
- Write operations (POST/PUT): < 500ms p95 latency
- Measured at API gateway
- SLA applies to 99.9% of requests
- Degradation strategy: Return cached data if > 1s

**Monitoring:**
- CloudWatch alarms on p95 latency
- PagerDuty alert if SLA breach > 5 min
```

**Before/After Example:**

```markdown
# BEFORE (Vague)
## Requirements
- System should be secure
- Must handle lots of users
- Should work offline
- Need good performance

# AFTER (Precise)
## Requirements

### Security
- OAuth 2.0 authentication
- JWT tokens with 1-hour expiry + refresh tokens
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- Rate limiting: 100 req/min per user
- Security audit quarterly

### Scale
- Concurrent users: 10,000 at launch (target)
- Growth projection: 2x per quarter
- Horizontal scaling via Kubernetes (auto-scale 2-10 pods)
- Database: Aurora with read replicas

### Offline Support
- Offline-first PWA architecture
- Queue changes locally (IndexedDB)
- Sync when connection restored
- Conflict resolution: Last-write-wins with vector clocks

### Performance
- API response: < 200ms p95
- First contentful paint: < 1s
- Time to interactive: < 3s
- Lighthouse score: > 90
```

**Output:** `spec-refined.md` with all ambiguities resolved

---

## When to Use
- ✅ Requirements are vague ("build a dashboard")
- ✅ Specification has too many "should" and "might"
- ✅ Stakeholders can't agree on scope
- ✅ Before starting spec-generator agent

## When NOT to Use
- ❌ Requirements are already crystal clear
- ❌ No stakeholder available to answer questions
- ❌ In execution phase (too late)

## Success Metrics
- ✅ 5 targeted questions asked
- ✅ All questions answered with specifics
- ✅ Specification updated with concrete requirements
- ✅ No remaining ambiguous language
- ✅ Implementation can proceed without clarification
```

---

### Pattern 4: Task Breakdown Agent (Hierarchical Planning)

**Use Case:** Sprint planning, implementation roadmaps, work estimation

```yaml
---
name: task-breakdown-agent
description: |
  Decomposes features into actionable tasks. Use for:
  - Sprint planning
  - Implementation roadmaps
  - Dependency analysis
  - Work estimation

  Workflow: Analyze spec → Decompose → Sequence → Estimate
  Expected output: Dependency-ordered task list with estimates

tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

## Philosophy
"Break down until tasks are < 4 hours each"

## Phase 1: ANALYZE SPEC (10 min)
**Goal:** Understand full scope and identify work streams

**Read:**
- Specification document
- Related code (what exists already)
- Technical constraints
- Timeline requirements

**Identify:**
- **Major Components:** High-level areas of work
  - Example: Database, API, Frontend, Infrastructure
- **Integration Points:** Where components connect
  - Example: API ↔ Database, Frontend ↔ API
- **Testing Requirements:** Test types needed
  - Example: Unit tests, integration tests, E2E tests

**Example Analysis:**

```markdown
## Scope Analysis: User Authentication Feature

### Major Components
1. **Database:** User table, session storage
2. **API:** Login endpoint, logout endpoint, session middleware
3. **Frontend:** Login form, session management
4. **Infrastructure:** Redis for sessions, monitoring

### Integration Points
- Frontend → API (HTTP)
- API → Database (PostgreSQL)
- API → Redis (session storage)
- API → Email Service (password reset)

### Testing Requirements
- Unit tests: Business logic, utilities
- Integration tests: API endpoints
- E2E tests: Login flow, session persistence
```

**Output:** Scope analysis document

---

## Phase 2: DECOMPOSE (20 min)
**Goal:** Create hierarchical task breakdown

**Structure:** Parent tasks → Subtasks

```markdown
- [ ] 1.0 **Database Schema** (Parent)
  - [ ] 1.1 Design user table schema
  - [ ] 1.2 Create migration script
  - [ ] 1.3 Write migration tests
  - [ ] 1.4 Deploy to staging

- [ ] 2.0 **API Layer** (Parent)
  - [ ] 2.1 Define OpenAPI spec
  - [ ] 2.2 Implement POST /auth/login
  - [ ] 2.3 Implement POST /auth/logout
  - [ ] 2.4 Add session middleware
  - [ ] 2.5 Write API integration tests

- [ ] 3.0 **Frontend** (Parent)
  - [ ] 3.1 Design login form component
  - [ ] 3.2 Implement form validation
  - [ ] 3.3 Add session persistence
  - [ ] 3.4 Write component tests
```

**Rules:**

1. **Subtask Size:** Each subtask < 4 hours
   - ✅ "Write API integration tests" (2-3 hours)
   - ❌ "Implement API" (8+ hours, too big)

2. **One Responsibility:** Each subtask does ONE thing
   - ✅ "Implement POST /auth/login"
   - ❌ "Implement authentication system"

3. **Clear Acceptance Criteria:** Every subtask has definition of done
   ```markdown
   - [ ] 1.1 Design user table schema
     - **Done when:** Schema documented in `schema.md`
     - **Includes:** id, email, password_hash, created_at, updated_at
     - **Validates:** Email is unique, password_hash is non-null
   ```

4. **Testable:** Can verify completion objectively
   - ✅ "Write migration tests" → Tests pass
   - ❌ "Make it look good" → Subjective

**Output:** `tasks-raw.md` with hierarchical task list

---

## Phase 3: SEQUENCE (10 min)
**Goal:** Order tasks by dependencies

**Dependency Analysis:**

```
1.1 Design user table
  ↓
1.2 Create migration script (depends on 1.1)
  ↓
1.3 Write migration tests (depends on 1.2)
  ↓
1.4 Deploy to staging (depends on 1.3)
  ↓
2.1 Define OpenAPI spec (depends on schema being ready)
  ↓
2.2 Implement endpoints (depends on 2.1)
```

**Identify:**

1. **Blocking Dependencies:** Must complete before others
   - Schema design blocks migration
   - Migration blocks API implementation

2. **Parallel Workstreams:** Can work simultaneously
   ```
   ┌─ 2.2 Implement /login endpoint
   │
   ├─ 2.3 Implement /logout endpoint  (parallel)
   │
   └─ 2.4 Add session middleware
   ```

3. **Critical Path:** Longest dependency chain
   ```
   1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 3.1 → 3.2
   (5 hours) (Critical path total: 28 hours)
   ```

**Output:** `tasks-sequenced.md` with dependency annotations

```markdown
## Sprint 1: Database & API Foundation

### Week 1
- [ ] 1.1 Design user table schema (2h) **[CRITICAL PATH]**
- [ ] 1.2 Create migration script (3h) **[CRITICAL PATH, depends: 1.1]**
- [ ] 1.3 Write migration tests (2h) **[depends: 1.2]**

### Week 2
- [ ] 1.4 Deploy to staging (1h) **[CRITICAL PATH, depends: 1.3]**
- [ ] 2.1 Define OpenAPI spec (3h) **[CRITICAL PATH, depends: 1.4]**
- [ ] 2.2 Implement POST /auth/login (4h) **[depends: 2.1]**
- [ ] 2.3 Implement POST /auth/logout (2h) **[PARALLEL with 2.2]**

## Sprint 2: Frontend & Testing

### Week 3
- [ ] 2.4 Add session middleware (3h) **[depends: 2.2]**
- [ ] 2.5 Write API tests (4h) **[depends: 2.2, 2.3]**
- [ ] 3.1 Design login form (3h) **[depends: 2.1 (OpenAPI spec)]**

### Week 4
- [ ] 3.2 Implement form validation (2h) **[depends: 3.1]**
- [ ] 3.3 Add session persistence (3h) **[depends: 2.4]**
- [ ] 3.4 Write component tests (3h) **[depends: 3.2]**
```

---

## Phase 4: ESTIMATE (10 min)
**Goal:** Estimate time for each task

**T-Shirt Sizing:**

| Size | Time Range | Example |
|------|------------|---------|
| **XS** | < 1 hour | Update README, fix typo, add log statement |
| **S** | 1-2 hours | Write unit tests, add API endpoint |
| **M** | 2-4 hours | Design schema, implement component, write integration tests |
| **L** | 4-8 hours | Implement feature with tests, migrate database |
| **XL** | > 8 hours | **TOO BIG - needs breakdown** |

**Estimation Strategy:**

1. **Bottom-Up:** Estimate each subtask, sum for parent
   ```
   1.0 Database Schema (11h total)
     1.1 Design (2h)
     1.2 Migration (3h)
     1.3 Tests (2h)
     1.4 Deploy (1h)
     1.5 Monitoring (3h)
   ```

2. **Historical Data:** Reference similar past tasks
   - Last migration took 3h → estimate 3h
   - Similar API endpoint took 4h → estimate 4h

3. **Add Buffer:** Multiply by 1.5x for unknowns
   - Estimated: 20h → Actual: 30h (typical)

4. **Validate:** Check if total matches timeline
   - Estimated total: 50h
   - Available time: 2 weeks × 40h = 80h
   - Buffer: 30h for unknowns ✅ Feasible

**Example Output:**

```markdown
## Task Estimates

### Summary
- **Total Estimated Hours:** 52h
- **Total Available Hours:** 80h (2 weeks × 40h)
- **Buffer:** 28h (35% contingency)
- **Confidence:** High ✅

### Breakdown by Component

#### 1.0 Database Schema (11h)
- [ ] 1.1 Design user table schema (2h) **[S]**
- [ ] 1.2 Create migration script (3h) **[M]**
- [ ] 1.3 Write migration tests (2h) **[S]**
- [ ] 1.4 Deploy to staging (1h) **[XS]**
- [ ] 1.5 Add monitoring (3h) **[M]**

#### 2.0 API Layer (22h)
- [ ] 2.1 Define OpenAPI spec (3h) **[M]**
- [ ] 2.2 Implement POST /auth/login (4h) **[M]**
- [ ] 2.3 Implement POST /auth/logout (2h) **[S]**
- [ ] 2.4 Add JWT middleware (4h) **[M]**
- [ ] 2.5 Implement refresh token (3h) **[M]**
- [ ] 2.6 Write integration tests (6h) **[L]**

#### 3.0 Frontend (14h)
- [ ] 3.1 Design login form (3h) **[M]**
- [ ] 3.2 Form validation (2h) **[S]**
- [ ] 3.3 Session management (4h) **[M]**
- [ ] 3.4 Component tests (5h) **[M]**

#### 4.0 Infrastructure (5h)
- [ ] 4.1 Configure Redis (2h) **[S]**
- [ ] 4.2 Add monitoring (2h) **[S]**
- [ ] 4.3 Update deployment (1h) **[XS]**

### Critical Path (28h)
1.1 (2h) → 1.2 (3h) → 1.3 (2h) → 1.4 (1h) → 2.1 (3h) → 2.2 (4h) → 2.6 (6h) → 3.3 (4h) → 3.4 (3h)

**Critical path is 54% of total work** ✅ Healthy ratio
```

**Output:** `tasks-estimated.md` with time estimates

---

## When to Use
- ✅ Planning sprint/milestone work
- ✅ Need accurate time estimates
- ✅ Complex features with dependencies
- ✅ Resource allocation planning

## When NOT to Use
- ❌ Trivial tasks (< 4 hours total)
- ❌ Exploratory work (too uncertain)
- ❌ Already in execution phase

## Success Metrics
- ✅ All tasks < 4 hours
- ✅ Dependencies clearly identified
- ✅ Critical path defined
- ✅ Estimates within 20-30% of actuals (validated over time)
- ✅ Team can execute without clarification
```

---

## Implementation Guide

### Step 1: Create Agent File

```bash
# Ensure .claude/agents directory exists
mkdir -p .claude/agents

# Create your agent file
touch .claude/agents/my-agent.md
```

---

### Step 2: Define Agent Structure

Use this template:

```yaml
---
name: my-agent-name                     # kebab-case, unique
description: |                          # Multi-line, include use cases
  [Clear description of what this agent does]

  Use for:
  - Use case 1
  - Use case 2

  Workflow: [High-level phase names]
  Expected output: [What you'll get]

tools: Read, Write, Edit                # Minimal set
model: sonnet                           # sonnet | opus | haiku
---

## Philosophy
"[One-liner that captures the methodology]"

## Core Principles
1. Principle one
2. Principle two

## Workflow

### Phase 1: [NAME] ([Time estimate])
**Goal:** [What this phase achieves]
**Mindset:** [Guiding principle]
**Steps:** [Detailed steps]
**Success Criteria:** [Clear checklist]
**Move to Phase 2 when:** [Transition condition]

---

### Phase 2: [NAME] ([Time estimate])
[Same structure]

---

## When to Use
- ✅ Use case 1
- ✅ Use case 2

## When NOT to Use
- ❌ Anti-pattern 1
- ❌ Anti-pattern 2

## Success Metrics
- Metric 1: [Quantifiable]
- Metric 2: [Quantifiable]

## Example Session
[Concrete example]
```

---

### Step 3: Validate with Real Tasks

**Test on 3+ real tasks:**

1. **Simple Task** (validates basic workflow)
   - Example: "Add error handling to API endpoint"
   - Time: < 30 min
   - Purpose: Verify agent works for straightforward cases

2. **Complex Task** (validates edge cases)
   - Example: "Implement authentication with OAuth + JWT"
   - Time: 1-2 hours
   - Purpose: Test agent under realistic complexity

3. **Domain-Specific Task** (validates adaptability)
   - Example: Task specific to your codebase/domain
   - Time: 30-60 min
   - Purpose: Ensure agent generalizes to your context

**For each validation:**

```markdown
## Validation: [Agent Name] on [Task]

**Task:** [Brief description]
**Complexity:** Simple | Moderate | Complex
**Date:** 2025-10-18

### Metrics
- **Time:** [Actual time spent]
- **Quality Score:** [X]/10
  - Code quality: [X]/10
  - Test coverage: [X]/10
  - Documentation: [X]/10
- **Would merge?** Yes/No
- **Would use agent again?** Yes/No

### What Went Well
- [Positive observation 1]
- [Positive observation 2]

### Issues Encountered
- [Issue 1 and how you resolved it]
- [Issue 2 and how you resolved it]

### Improvements Needed
1. [Specific improvement to agent instructions]
2. [Another improvement]

### Conclusion
[Overall assessment - keep, modify, or discard this agent?]
```

---

### Step 4: Measure Outcomes

**Quantitative Metrics:**

```bash
# Test coverage
npm run test:coverage -- [test-file]
# Target: > 80% for most code, > 95% for critical paths

# Type safety
npx tsc --noEmit
# Target: Zero errors

# Linting
npm run lint [file]
# Target: Zero errors/warnings

# Performance (if applicable)
npm run benchmark
```

**Qualitative Assessment:**

```markdown
## Code Review Checklist

- [ ] **Readability:** Can another developer understand this?
- [ ] **Maintainability:** Can we modify this in 6 months?
- [ ] **Testability:** Are tests comprehensive and clear?
- [ ] **Documentation:** Is usage obvious from docs?
- [ ] **Edge Cases:** Are errors handled gracefully?
- [ ] **Performance:** Does it meet SLAs?
- [ ] **Security:** Are there obvious vulnerabilities?

**Overall:** [Pass/Needs Work/Fail]
```

---

### Step 5: Iterate

**Common Issues & Fixes:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Too vague** | Agent asks clarifying questions mid-workflow | Add concrete examples, specific metrics |
| **Too prescriptive** | Agent can't adapt to different contexts | Generalize principles, remove hard-coded steps |
| **Wrong tools** | Agent fails due to missing capabilities | Add necessary tools to YAML |
| **Wrong model** | Too slow or low quality | Switch model: opus (quality), sonnet (balance), haiku (speed) |
| **Unclear phases** | Gets stuck between phases | Add clear "Move to Phase X when..." criteria |
| **No examples** | Doesn't know what output looks like | Add concrete example sessions |

**Iteration Process:**

1. **Identify issue** from validation results
2. **Hypothesize fix** (e.g., "needs more specific instructions")
3. **Update agent** with fix
4. **Re-test** on same task
5. **Compare** before/after results
6. **Repeat** until success metrics met

---

### Step 6: Document and Share

**Update README:**

```markdown
# .claude/agents/README.md

## Available Agents

### [Your New Agent Name]
**Methodology:** [Brief description]

**When to use:**
- Use case 1
- Use case 2

**Expected results:**
- Metric 1
- Metric 2

**Validated:** ✅ [Date], [Number] tasks

---
```

**Commit to Version Control:**

```bash
# Add agent file
git add .claude/agents/my-agent.md

# Update README if needed
git add .claude/agents/README.md

# Commit with descriptive message
git commit -m "feat: add [agent-name] agent

- [Agent purpose/methodology]
- Validated on [N] tasks
- Time to complete: ~[X] minutes
- Coverage: [Y]%"

# Push to share with team
git push origin main
```

**Team Announcement:**

```markdown
# Slack/Team Channel

🎉 New Agent Available: `[agent-name]`

**What it does:**
[One-sentence description]

**When to use it:**
- [Use case 1]
- [Use case 2]

**How to use:**
```bash
claude "Using [agent-name] agent, implement [feature]"
```

**Results from validation:**
- ⏱️ Time: [X] min
- 📊 Coverage: [Y]%
- ✅ Quality: [Z]/10

Try it out and share feedback!
```

---

## Quick Reference: Agent Design Checklist

Use this before committing a new agent:

### Content
- [ ] **Name** is descriptive and unique
- [ ] **Description** includes:
  - [ ] When to use (3+ use cases)
  - [ ] Workflow summary (phase names)
  - [ ] Expected output
- [ ] **Tools** are minimal (only what's needed)
- [ ] **Model** is appropriate for task complexity
- [ ] **Philosophy** is clear and memorable (one-liner)
- [ ] **Core Principles** are actionable (3-5 items)
- [ ] **Phases** are well-defined:
  - [ ] Clear goal for each phase
  - [ ] Concrete steps (not vague)
  - [ ] Success criteria (checklist)
  - [ ] Transition conditions ("Move to Phase X when...")
- [ ] **When to Use** is explicit (3+ scenarios)
- [ ] **When NOT to Use** is documented (2+ anti-patterns)
- [ ] **Success Metrics** are measurable
- [ ] **Example Session** is concrete and realistic

### Validation
- [ ] Tested on **simple task** (< 30 min)
- [ ] Tested on **complex task** (1-2 hours)
- [ ] Tested on **domain-specific task**
- [ ] **Time estimates** are accurate (within 20-30%)
- [ ] **Quality** is consistently high (> 8/10)
- [ ] **Would use again** on all validation tasks

### Documentation
- [ ] README.md updated with agent entry
- [ ] Validation results documented
- [ ] Committed to version control
- [ ] Team notified (if applicable)

---

## Additional Resources

### In This Repository
- **Agent Examples:** `.claude/agents/tdd-code-developer.md`, etc.
- **Quick Start:** `.claude/instructions/QUICK_START.md`
- **Research:** `discovery/research/METHODOLOGY_AGENTS_*.md`

### Anthropic Documentation
- **Claude Code Docs:** https://docs.claude.com/en/docs/claude-code/
- **Sub-Agents Guide:** https://docs.claude.com/en/docs/claude-code/sub-agents
- **Best Practices:** https://www.anthropic.com/engineering/claude-code-best-practices

### Community Resources
- **Anthropic Cookbook:** https://github.com/anthropics/anthropic-cookbook
- **Agent Patterns:** `patterns/agents/` in cookbook
- **Community Agents:** https://github.com/topics/claude-code-agents

---

## Frequently Asked Questions

### Which methodology should I start with?
→ **Test-First Agent** (most validated, best for learning)

### Can I mix methodologies?
→ **Yes!** Use different agents for different parts of your codebase. Example: TDD for business logic, phased for UI prototypes.

### What if a methodology doesn't work for my task?
→ **Document it!** This helps refine the "When to use" guidelines. Create a validation report explaining what went wrong.

### Should I create custom agents for my team's workflow?
→ **Absolutely.** The best agents are often domain-specific and encode your team's best practices.

### How do I contribute improvements to existing agents?
→ Edit the agent file, test on 2-3 tasks, commit with validation results, open PR with before/after metrics.

### Can agents call other agents?
→ **Yes.** Use the `Task` tool in the orchestrator agent to spawn worker agents. See [Orchestrator-Workers Pattern](#orchestrator-workers-pattern).

### How do I debug agent failures?
→ Check:
1. Are tools sufficient? (Add missing tools to YAML)
2. Are instructions clear? (Add concrete examples)
3. Is model appropriate? (Try opus for complex tasks)
4. Are success criteria measurable? (Make them specific)

### What's the difference between an agent and a skill?
→ **Agent** = Multi-step workflow, explicit invocation
→ **Skill** = Reusable pattern, automatic invocation
See [Agent vs Skill](#agent-vs-skill-when-to-use-what)

---

## Contributing

To add a new agent or improve existing ones:

1. **Fork** or create a branch
2. **Create/modify** agent in `.claude/agents/`
3. **Validate** on 3+ real tasks
4. **Document** results in commit message
5. **Update** README.md
6. **Submit** PR with validation metrics

**Questions?** Open an issue or ask in team chat.

---

**Remember:** These are guidelines, not rigid rules. Adapt agents to your team's needs and context!
