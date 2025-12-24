---
name: task-processor-parallel
description: Process tasks using async background subagents for massive parallelization and speedup.
---

# Parallel Task Processor with Async Subagents

## Overview
Leverages Claude Code's async subagents (v2.0.60+) to process multiple tasks in parallel, dramatically reducing implementation time.

## Key Features
- **Parallel Execution**: Spawn multiple subagents to work on independent tasks simultaneously
- **Background Mode**: Subagents run in background, don't block orchestrator
- **Auto-Notification**: Subagents notify orchestrator when complete
- **PR Automation**: Automated gap analysis and PR comments after each phase

## Parallelization Strategy

### Level 1: Phase-Level Parallelization
Launch multiple phases in parallel when no dependencies exist:

```typescript
// Batch 1: Independent phases (run in parallel)
spawn_async_subagent("tdd-developer", "Phase 1: Comparison", phase1_tasks)
spawn_async_subagent("tdd-developer", "Phase 5: Performance", phase5_tasks)
spawn_async_subagent("tdd-developer", "Phase 8: Notifications", phase8_tasks)

// Wait for all to complete
// Batch 2: Dependent phases (run in parallel after Batch 1)
spawn_async_subagent("tdd-developer", "Phase 2: Allocation", phase2_tasks)
// ... etc
```

### Level 2: Sub-Task Parallelization
Within a single phase, parallelize independent sub-tasks:

```typescript
// Phase 1 split into 3 parallel streams
spawn_async_subagent("tdd-developer", "Discovery + Normalization", [task_1.1, task_1.2])
spawn_async_subagent("tdd-developer", "Ranking + Reasoning", [task_1.3, task_1.4])
spawn_async_subagent("tdd-developer", "Types + Tests", [task_1.5, task_1.6])

// When all complete → Final task
spawn_async_subagent("tdd-developer", "Create PR", [task_1.7])
```

## Execution Protocol

### 1. Analyze Dependencies
```markdown
Phase Dependencies:
- Phase 1: None → Start immediately
- Phase 2: Depends on Phase 1
- Phase 3: Depends on Phase 2
- Phase 4: Depends on Phase 3
- Phase 5: None → Start immediately (parallel to 1-3)
- Phase 6: Depends on Phase 5
- Phase 7: Depends on Phase 3 + Phase 5
- Phase 8: None → Start immediately (parallel to all)
- Phase 9: Depends on all phases
```

### 2. Create Execution Batches
```markdown
Batch 1 (Parallel):
- Phase 1 (3-4 days)
- Phase 5 (2-3 days)
- Phase 8 (1-2 days)
→ Total: 3-4 days (not 6-9!)

Batch 2 (Parallel - after Phase 1):
- Phase 2 (3-4 days)
- Phase 6 (1-2 days, after Phase 5)
→ Total: 3-4 days

Batch 3 (Parallel - after Phase 2):
- Phase 3 (3-4 days)
→ Total: 3-4 days

Batch 4 (Parallel - after Phase 3):
- Phase 4 (2-3 days)
- Phase 7 (3-4 days, also needs Phase 5)
→ Total: 3-4 days

Batch 5 (Sequential - after all):
- Phase 9 (2-3 days)
→ Total: 2-3 days

**NEW TIMELINE: 14-21 days (vs 18-27 sequential!)**
```

### 3. Spawn Async Subagents

**Using Task Tool:**
```typescript
// Launch Phase 1 in background
await Task({
  subagent_type: "tdd-developer",
  description: "Implement Phase 1: Comparison",
  prompt: `
    Work through tasks 1.1 through 1.7 from tasks/tasks-autonomous-agent.md

    Tasks:
    - 1.1: Extend discovery engine
    - 1.2: Create score normalization
    - 1.3: Build ranking algorithm
    - 1.4: Add comparison reasoning
    - 1.5: Create TypeScript types
    - 1.6: Integration tests
    - 1.7: Create PR #16

    Follow test-driven development.
    Commit after each task.
    When complete, create PR and run gap analysis.
  `,
  run_in_background: true  // ← KEY: Async execution!
})

// Launch Phase 5 in background (parallel to Phase 1)
await Task({
  subagent_type: "tdd-developer",
  description: "Implement Phase 5: Performance",
  prompt: `...`,
  run_in_background: true
})

// Main orchestrator continues, doesn't wait
// Subagents will notify when complete
```

### 4. Monitor Progress

**Check Subagent Status:**
```bash
# List running subagents
/tasks

# Check specific subagent output
BashOutput(agent_id: "abc123")
```

### 5. Collect Results

When a subagent completes, it notifies the orchestrator:
```typescript
// Subagent 1 completes Phase 1
Result: {
  phase: 1,
  pr_number: 16,
  files_changed: 6,
  tests_added: 50,
  gap_analysis: "docs/PR_16_GAP_ANALYSIS.md",
  status: "ready_for_review"
}

// Orchestrator receives notification
// Triggers next dependent phase (Phase 2)
```

### 6. Automated PR Workflow (Per Subagent)

Each subagent follows this protocol when its phase completes:

1. **Run Tests**: Full test suite for the phase
2. **Create Branch**: `git checkout -b feat/phase-X-name`
3. **Push**: `git push -u origin feat/phase-X-name`
4. **Create PR**: Using `gh pr create`
5. **Wait for CI**: 30-second delay
6. **Check Status**: `gh pr view` + `gh pr checks`
7. **Generate Gap Analysis**: Create `docs/PR_X_GAP_ANALYSIS.md`
8. **Push Gap Analysis**: Commit and push
9. **Add PR Comment**: Detailed changes summary
10. **Notify Orchestrator**: Return results

## Example: Full Autonomous Run

```bash
# User starts the processor
skill: task-processor-parallel

# Orchestrator analyzes dependencies
→ Identifies 5 execution batches
→ Creates parallelization plan

# Batch 1: Launch 3 phases in parallel
→ Spawn Phase 1 subagent (tdd-developer)
→ Spawn Phase 5 subagent (tdd-developer)
→ Spawn Phase 8 subagent (tdd-developer)

# Orchestrator: "3 subagents launched, monitoring progress..."

# [3-4 days later]
# Phase 5 completes first (shortest)
→ Subagent 5 creates PR #20
→ Subagent 5 runs gap analysis
→ Subagent 5 notifies orchestrator: "Phase 5 done, PR #20 ready"

# Phase 1 completes
→ Subagent 1 creates PR #16
→ Subagent 1 runs gap analysis
→ Subagent 1 notifies orchestrator: "Phase 1 done, PR #16 ready"
→ Orchestrator triggers Phase 2 (depends on Phase 1)

# Phase 8 completes
→ Subagent 8 creates PR #23
→ Subagent 8 runs gap analysis
→ Subagent 8 notifies orchestrator: "Phase 8 done, PR #23 ready"

# Batch 2: Launch Phase 2 (depends on Phase 1 - just completed)
→ Spawn Phase 2 subagent (tdd-developer)

# ... Continue through all batches ...

# All phases complete
→ Orchestrator: "All 9 PRs created and reviewed!"
→ User reviews PRs and merges
```

## Benefits

### Time Savings
- **Sequential**: 18-27 days
- **Parallel**: 14-21 days
- **Savings**: ~25% faster

### Efficiency
- No idle time waiting for sequential tasks
- Better resource utilization
- Continuous progress across multiple fronts

### Flexibility
- Can pause/resume individual subagents
- Can prioritize critical phases
- Can adjust parallelization on the fly

## Limitations & Considerations

### Context Cost
- Each subagent has its own context window
- More parallel agents = higher token usage
- Monitor costs with `/stats`

### Merge Conflicts
- Parallel work may touch same files
- Mitigate: Design tasks to minimize overlap
- Use clear file ownership per phase

### CI Load
- Multiple PRs may overload CI
- Mitigate: Stagger PR creation
- Use draft PRs to delay CI

## AI Instructions

1. **Analyze dependencies** before spawning subagents
2. **Create execution batches** based on dependency graph
3. **Spawn subagents** with `run_in_background: true`
4. **Monitor progress** via `/tasks` command
5. **Collect results** as subagents complete
6. **Trigger dependent phases** when prerequisites met
7. **Track PR status** for all parallel phases
8. **Update task list** with real-time progress

## References
- See `reference.md`
- [Claude Code Async Subagents](https://code.claude.com/docs/en/sub-agents)
- [Parallelizing AI Coding Agents](https://ainativedev.io/news/how-to-parallelize-ai-coding-agents)

---

*Skill created for autonomous agent implementation with async subagents*
