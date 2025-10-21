# Code Development Methodology Agents

**Location:** `.claude/agents/` (project-level subagents)
**Created:** October 18, 2025

---

## 📚 Documentation

- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Comprehensive guide to creating agents based on Anthropic's official best practices
  - Core principles (single responsibility, context isolation, research → plan → act)
  - Agent vs Skill decision framework
  - Orchestrator-workers pattern
  - Agent anatomy and templates
  - Ideation & planning agent patterns
  - Implementation guide with validation checklist

**👉 Creating a new agent? Start with [BEST_PRACTICES.md](./BEST_PRACTICES.md)**

---

## Overview

This directory contains **specialized agents** organized into two categories:

### **Pre-Implementation Agents** (NEW!)
Agents that handle ideation → specification → planning → task breakdown

### **Implementation Agents**
Agents that handle code generation with specific methodologies (TDD, Contract-First, etc.)

All agents are **proper Claude Code subagents** with YAML frontmatter configuration.

Claude Code will **automatically invoke** the appropriate agent based on your task description.

---

## Pre-Implementation Agents (Category A-D)

### Category B: Specification Agents

#### 1. `specification/spec-writer.md` ✅ CORE AGENT
**Methodology:** Research-Driven Specification

**When to use:**
- New feature specifications
- API design documents
- Refactoring specifications
- Technical enhancement proposals

**Workflow:** Research → Analyze → Specify → Validate

**Expected results:**
- Comprehensive spec (spec-validated.md)
- Research notes with context
- Analysis with requirements
- Quality validation passed

---

#### 2. `specification/clarification-agent.md` ✅ CORE AGENT
**Methodology:** Question-Driven Refinement

**When to use:**
- Vague requirements in spec
- Ambiguous user stories
- Missing critical details
- Before technical planning

**Workflow:** Identify gaps → Ask 5 questions → Encode answers → Validate

**Expected results:**
- Refined spec (spec-refined.md)
- All ambiguities resolved

**Corresponds to:** `/speckit.clarify`

---

### Category E: Documentation Agents

#### 5. `documentation/openapi-doc-writer.md` ✅ CORE AGENT
**Methodology:** Research-Driven OpenAPI Documentation

**When to use:**
- Adding OpenAPI documentation to existing service
- Migrating from manual OpenAPI to swagger-jsdoc
- Implementing `/api/openapi.json` endpoint
- Ensuring operationId compliance with Mech platform standard
- Preparing service for SDK generation

**Workflow:** Research routes → Configure swagger → Document endpoints → Validate → Generate

**Expected results:**
- Working `/api/openapi.json` endpoint
- JSDoc comments with operationIds on all routes
- Validation report showing 100% compliance
- `src/config/swagger.ts` configuration
- Clean SDK method names in generated clients

**Standards enforced:**
- Endpoint path: `/api/openapi.json`
- operationId pattern: `{servicePrefix}{Action}{Resource}`
- All operations have unique operationIds
- OpenAPI 3.0.3 valid format

---

#### 6. `documentation/skill-writer.md` ✅ CORE AGENT
**Methodology:** Pattern-Driven Skill Creation

**When to use:**
- Creating reusable capabilities for recurring tasks
- Documenting domain-specific workflows
- Building portable knowledge modules for Claude Code
- Standardizing application-specific patterns
- Creating skills that work across projects/teams

**Workflow:** Identify pattern → Research context → Design structure → Write skill → Create references → Add scripts → Test → Deploy

**Expected results:**
- Claude Skill file (.claude/skills/SKILL.md)
- YAML frontmatter with metadata (name, description, license)
- 3-level progressive disclosure architecture
- Reference materials and examples
- Optional executable scripts for automation

**Decision framework:**
- Recurring: Done repeatedly?
- Standardized: Standard way exists?
- Documentable: Can be clearly written?
- Valuable: Saves time/improves quality?
- Portable: Useful across contexts?
- Create skill if 4/5 criteria are true

**Standards enforced:**
- Official Claude Skills format
- Progressive disclosure: Metadata (50-100 tokens) → Core (500-2000 tokens) → Reference (1000-10000 tokens)
- YAML frontmatter structure
- Clear examples and success criteria

---

### Category C: Planning Agents

#### 3. `planning/technical-planner.md` ✅ CORE AGENT
**Methodology:** Research-Driven Technical Planning

**When to use:**
- Architecture design needed
- Technology selection required
- Integration planning
- After specification complete

**Workflow:** Research unknowns → Design → Validate → Plan

**Expected results:**
- Implementation plan (plan.md)
- Data model (data-model.md)
- API contracts (/contracts/*.yaml)
- Architecture diagram
- Constitution check passed

**Corresponds to:** `/speckit.plan`

---

### Category D: Task Decomposition Agents

#### 4. `decomposition/task-generator.md` ✅ CORE AGENT
**Methodology:** User-Story-Driven Task Breakdown

**When to use:**
- Sprint planning needed
- Implementation roadmap required
- Work estimation needed
- After technical planning

**Workflow:** Analyze artifacts → Generate structure → Format → Estimate

**Expected results:**
- Actionable task list (tasks.md)
- Dependency-ordered tasks
- Parallel opportunities identified
- All tasks < 4 hours
- File paths specified

**Corresponds to:** `/speckit.tasks` and `ai-dev-tasks/generate-tasks.md`

---

## Implementation Agents (Code Development)

### Available Agents

### 1. `tdd-code-developer.md` ✅ VALIDATED
**Methodology:** Test-Driven Development (TDD)

```yaml
name: tdd-code-developer
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
```

**Auto-invoked when:**
- "Implement authentication logic with comprehensive tests"
- "Build payment processing with TDD"
- "Create data validation library with edge case handling"

**Expected results:**
- Coverage: 94.81% (validated)
- Quality: 9.5/10 (merge-ready)

---

### 2. `contract-driven-api-developer.md`
**Methodology:** Contract-First Development (OpenAPI → Test → Code)

```yaml
name: contract-driven-api-developer
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
```

**Auto-invoked when:**
- "Create REST API for user management with OpenAPI spec"
- "Build task management API consumed by mobile and web"
- "Implement microservice with contract-first approach"

**Expected results:**
- Coverage: ~88%
- Auto-generated: SDK, types, documentation

---

### 3. `pattern-driven-api-developer.md`
**Methodology:** Pattern-First Development (Skill → OpenAPI → Test → Code)

```yaml
name: pattern-driven-api-developer
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
```

**Auto-invoked when:**
- "Build session management API following reusable patterns"
- "Create auth endpoints with skill documentation"
- "Implement API family with consistent patterns"

**Expected results:**
- Coverage: ~90%
- Reusable: Skills documented in `.claude/skills/`

---

### 4. `phased-code-developer.md`
**Methodology:** Iterative Phased Development

```yaml
name: phased-code-developer
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
```

**Auto-invoked when:**
- "Build MVP for user dashboard quickly"
- "Create prototype for demo tomorrow"
- "Implement feature with evolving requirements"

**Expected results:**
- Coverage: ~85%
- Speed: Fastest to first working version

---

### 5. `concurrent-artifact-developer.md`
**Methodology:** Parallel Artifact Generation

```yaml
name: concurrent-artifact-developer
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
```

**Auto-invoked when:**
- "Build SDK with comprehensive documentation"
- "Create library with code, tests, docs, and examples"
- "Implement feature with full artifact consistency"

**Expected results:**
- Coverage: ~87%
- Consistency: All artifacts aligned (code, tests, docs, examples)

---

## How Claude Code Uses These Agents

### Automatic Invocation

Claude Code automatically selects the right agent based on keywords in your request:

```
You: "Implement JWT authentication with comprehensive tests"
→ Invokes: tdd-code-developer
   (keywords: "comprehensive tests" → TDD)

You: "Create REST API with OpenAPI spec for mobile app"
→ Invokes: contract-driven-api-developer
   (keywords: "REST API", "OpenAPI spec", "mobile app" → Contract-First)

You: "Build quick prototype for tomorrow's demo"
→ Invokes: phased-code-developer
   (keywords: "quick", "prototype" → Iterative/Phased)
```

### Manual Invocation

You can also explicitly request an agent:

```
You: "Use the TDD code developer to implement user validation"
→ Explicitly invokes: tdd-code-developer

You: "Use contract-driven approach to build notification API"
→ Explicitly invokes: contract-driven-api-developer
```

---

## Quick Reference

### Pre-Implementation Agents

| Agent | Best For | Key Output |
|-------|----------|-----------|
| **Spec Writer** | New features, refactoring specs | spec-validated.md |
| **Clarification** | Resolve ambiguities | spec-refined.md |
| **Technical Planner** | Architecture, tech decisions | plan.md + contracts |
| **Task Generator** | Sprint planning | tasks.md |
| **OpenAPI Doc Writer** | API documentation | /api/openapi.json |
| **Skill Writer** | Reusable patterns, workflows | .claude/skills/*.md |

### Implementation Agents

| Agent | Best For | Coverage |
|-------|----------|----------|
| **TDD Code Developer** | Complex logic, critical features | >90% ✅ |
| **Contract-Driven API** | Multi-client APIs, parallel dev | ~88% |
| **Pattern-Driven API** | API families, reusable patterns | ~90% |
| **Phased Code Developer** | Prototypes, MVPs, speed-critical | ~85% |
| **Concurrent Artifact** | Libraries, SDKs, doc-heavy | ~87% |

---

## Decision Tree

```
Is this an API?
├─ Yes →
│   ├─ Need reusable patterns across endpoints?
│   │  └─ Yes → pattern-driven-api-developer
│   ├─ Multiple teams/clients consuming?
│   │  └─ Yes → contract-driven-api-developer
│   └─ Simple internal API?
│      └─ tdd-code-developer
└─ No →
    ├─ Safety-critical? (auth, payments, data)
    │  └─ Yes → tdd-code-developer
    ├─ Need comprehensive docs? (SDK, library)
    │  └─ Yes → concurrent-artifact-developer
    ├─ Prototype or MVP?
    │  └─ Yes → phased-code-developer
    └─ Default → tdd-code-developer
```

---

## Configuration

Each agent is configured with:

```yaml
---
name: [agent-name]                  # Unique identifier
description: |                      # When to use this agent
  [Multi-line description]

  Workflow: [High-level steps]
  Expected output: [What you'll get]
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet                       # Can be: sonnet, opus, haiku
---

[Full methodology instructions]
```

### Customization

You can customize agents by:
1. **Editing the file** - Change workflow, add/remove steps
2. **Changing tools** - Restrict/expand tool access
3. **Changing model** - Use `opus` for complex tasks, `haiku` for speed
4. **Adding user-level agents** - Create in `~/.claude/agents/` for personal use

---

## Validation Status

| Agent | Status | Evidence |
|-------|--------|----------|
| `tdd-code-developer.md` | ✅ **VALIDATED** | `frontend/hooks/useWebSocket.ts` - 94.81% coverage, 32/32 tests passing |
| `contract-driven-api-developer.md` | 📋 Design validated | Awaiting implementation validation |
| `pattern-driven-api-developer.md` | 📋 Design validated | Awaiting implementation validation |
| `phased-code-developer.md` | 📋 Design validated | Awaiting implementation validation |
| `concurrent-artifact-developer.md` | 📋 Design validated | Awaiting implementation validation |
| `documentation/openapi-doc-writer.md` | ✅ **CREATED** | Ready to use - aligns with Mech platform standards |
| `documentation/skill-writer.md` | ✅ **CREATED** | Ready to use - follows official Claude Skills format |

---

## Examples

### Using TDD Code Developer

```bash
# Claude Code automatically invokes based on context
$ claude "Implement email validation with edge case handling"

# Agent: tdd-code-developer
# Output:
# - validators/__tests__/email.test.ts (comprehensive tests)
# - validators/email.ts (implementation)
# - Coverage: >90%
```

### Using Contract-Driven API Developer

```bash
$ claude "Create user management API with mobile and web clients"

# Agent: contract-driven-api-developer
# Output:
# - specs/user-api.yaml (OpenAPI spec)
# - src/__tests__/user-api.contract.test.ts (contract tests)
# - src/api/users.ts (implementation)
# - clients/user-api/ (auto-generated TypeScript client)
# - docs/api.html (auto-generated documentation)
```

### Using Pattern-Driven API Developer

```bash
$ claude "Build auth API following our session management patterns"

# Agent: pattern-driven-api-developer
# Output:
# - .claude/skills/session-management.md (reusable pattern)
# - specs/auth-api.yaml (OpenAPI spec)
# - src/__tests__/auth-api.contract.test.ts (contract tests)
# - src/api/auth.ts (implementation)
```

### Using Skill Writer

```bash
$ claude "Create a Claude Skill for our deployment workflow"

# Agent: skill-writer
# Output:
# - .claude/skills/deployment-workflow.md (main skill file)
# - .claude/skills/deployment-workflow/examples/ (usage examples)
# - .claude/skills/deployment-workflow/scripts/ (optional automation)
# - Progressive disclosure architecture (metadata → core → reference)
```

---

## Troubleshooting

### Agent Not Auto-Invoked?

Be more explicit in your request:

```
❌ "Build an API"
   → Too vague, may use wrong agent

✅ "Build REST API with OpenAPI spec for mobile/web clients"
   → Clear keywords, correct agent selected
```

### Wrong Agent Invoked?

Explicitly name the agent:

```
"Use the TDD code developer to [your task]"
"Use contract-driven approach to [your task]"
```

### Want to See Which Agent Was Used?

Ask Claude:

```
"Which agent did you use for this task?"
```

---

## Next Steps

1. **Try an agent** - Pick a task and let Claude auto-select
2. **Compare results** - Try same task with different agents
3. **Validate more methodologies** - Help us validate the other 4 agents
4. **Customize** - Edit agents to fit your team's workflow
5. **Create new agents** - Build your own methodology agents

---

## Complete Workflow Example

### Idea → Implementation (Full Flow)

```
User: "I want to build a user authentication feature"
  ↓
1. Spec Writer Agent
   Output: spec.md (comprehensive specification)
  ↓
2. Clarification Agent
   Output: spec-refined.md (resolved ambiguities)
  ↓
3. Technical Planner Agent
   Output: plan.md, data-model.md, /contracts/*.yaml
  ↓
4. Task Generator Agent
   Output: tasks.md (actionable task list)
  ↓
5. Implementation Agent (TDD/Phased/Contract/etc.)
   Output: Working code with tests
   Time: Variable (based on task list)
  ↓
6. OpenAPI Doc Writer (if API feature)
   Output: /api/openapi.json with operationIds
```

**Result:** Ready-to-implement tasks with full technical design and documentation

### Quick Spec (When Requirements Clear)

```
User: "Write a spec for [clear feature description]"
  ↓
1. Spec Writer → 2. Technical Planner → 3. Task Generator
  ↓
Ready for Implementation
```

### API Documentation (When Needed)

```
User: "Add OpenAPI documentation to our service"
  ↓
OpenAPI Doc Writer Agent
  ↓
Output: /api/openapi.json + JSDoc comments + validation report
```

### Skills Creation (When Needed)

```
User: "Create a Claude Skill for our deployment workflow"
  ↓
Skill Writer Agent
  ↓
Output: .claude/skills/deployment-workflow.md + examples + scripts
```

---

## Learn More

- **Best Practices:** [BEST_PRACTICES.md](./BEST_PRACTICES.md) - How to create agents
- **Pre-Implementation Outline:** [../discovery/PRE_IMPLEMENTATION_AGENTS_OUTLINE.md](../discovery/PRE_IMPLEMENTATION_AGENTS_OUTLINE.md) - Complete agent system design
- **Quick Start:** `.claude/instructions/QUICK_START.md`
- **Full Guide:** `.claude/instructions/README.md`
- **Orchestration:** `discovery/research/METHODOLOGY_AGENTS_ORCHESTRATION.md`
- **Research:** `discovery/research/EXPERIMENT_RESULTS_TEST_FIRST.md`

---

**Remember:** These agents are **subagents** - Claude Code orchestrates them automatically based on your task. Just describe what you need naturally, and the right agent will be invoked!
