# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
with enhanced attribution to track which AI model/CLI made each change.

## [Unreleased]

### Added

### Fixed

### Changed

### Deprecated

### Removed

### Security

---

## [0.5.0] - 2026-01-16

### Added

- **4 New Skills** (Claude Sonnet 4.5, 2026-01-16)
  - `production-readiness` - Generate pre-launch validation checklists with user stories, acceptance criteria, smoke tests, and rollback plans
  - `user-story-generator` - Generate standalone user stories without full PRD for quick backlog grooming
  - `user-journey-mapper` - Map user flows and UX journeys with Mermaid diagrams, alternate paths, and UX insights
  - `runbook-generator` - Create operational runbooks documenting system requirements and deployment procedures
  - **Context:** PR #10, PR #14

- **Cross-IDE Skill Discoverability System** (Claude Sonnet 4.5, 2026-01-16)
  - `.ai-skills/README.md` - Universal discovery protocol for all AI assistants
  - `SKILLS_INDEX.md` - Comprehensive skill catalog with decision tree (15+ skills documented)
  - `.cursor/rules/agentbootup-skills.mdc` - Cursor IDE-specific rules
  - **Problem Solved:** AIs now check existing skills before creating one-off solutions
  - **Context:** PR #14

- **Auto-Generation System** (Claude Sonnet 4.5, 2026-01-16)
  - Extended `sync-templates.mjs` to auto-generate supporting files from SKILL.md
  - Commands (`.claude/commands/`), workflows (`.windsurf/workflows/`), and AI dev tasks (`ai-dev-tasks/`)
  - Generated 30 supporting files automatically
  - SKILL.md is now single source of truth
  - **Context:** PR #14

- **DOCUMENT_MAP.md** - Standardized folder structure for AI-generated artifacts (Claude Sonnet 4.5, 2026-01-16)
  - New folders: `docs/stories/`, `docs/journeys/`, `docs/prds/`, `docs/tasks/`, `docs/testplans/`
  - File naming conventions and migration guide
  - Skills reference table
  - **Context:** PR #14

- Test plan generator, PR review loop, and changelog manager skills (Claude Code, 2026-01-16)
  - **Context:** PR #9

- Operational runbook documenting local and production requirements (Claude Code, 2026-01-16)
  - **Context:** PR #11

### Changed

- Removed arbitrary timeframes from PRD and task skills (Claude Code, 2026-01-16)
  - Use complexity indicators (trivial/small/medium/large) instead of time estimates
  - **Context:** PR #12

- Updated `CODEX_SKILLS_ALLOWLIST` to include 4 new skills (Claude Sonnet 4.5, 2026-01-16)
  - Added: production-readiness, user-story-generator, user-journey-mapper, runbook-generator
  - **Context:** PR #10, PR #14

---

## Format Notes

Each entry includes:
- **Description** - What was changed
- **Attribution** - Which AI model/CLI made the change
- **Date** - When the change was made (YYYY-MM-DD)
- **Context** (optional) - Links to PRD, task reference, or PR number

Example:
```
### Added
- User profile editing with avatar upload (Claude Code, 2025-01-16)
  - **Context:** [PRD](tasks/0001-prd-user-profile.md) | Task 1.2 | PR #42
```

---

*Changelog initialized 2026-01-16*
