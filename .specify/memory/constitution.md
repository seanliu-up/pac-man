<!--
Sync Impact Report
Version change: N/A (initial) → 1.0.0
Added sections:
  - I. Code Quality & Maintainability
  - II. Test-Driven Development (NON-NEGOTIABLE)
  - III. Testing Standards
  - IV. User Experience Consistency
  - V. Performance Requirements
  - Performance Budgets
  - Development Workflow
  - Governance
Modified principles: none (initial ratification)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible with new principles)
  - .specify/templates/spec-template.md ✅ (no structural changes required)
  - .specify/templates/tasks-template.md ✅ (testing tasks pattern aligned with Principle III)
Follow-up TODOs: none — all placeholders resolved.
-->

# Pac-Man Constitution

## Core Principles

### I. Code Quality & Maintainability

All code MUST be clean, readable, and self-documenting. Functions and modules MUST have a single
responsibility. Cyclomatic complexity per function MUST NOT exceed 10. Dead code MUST be removed
immediately; no commented-out code blocks are permitted in committed files. Dependencies MUST be
minimal and explicitly justified.

**Rationale**: A game codebase that accretes complexity becomes unmaintainable. Enforcing quality
discipline prevents the entropy that makes features expensive and bugs hard to trace.

### II. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written before implementation code. The Red-Green-Refactor cycle MUST be followed
strictly: write a failing test → implement the minimum code to pass → refactor. No feature or bug
fix is complete without a corresponding test. Tests MUST be committed in the same changeset as the
code they cover.

**Rationale**: TDD is the primary mechanism for correctness and for enabling fearless refactoring.
Bypassing it creates hidden regressions that compound over time.

### III. Testing Standards

Unit test coverage MUST remain above 80% for all game-logic modules. Integration tests MUST cover
all player–game-state interactions: movement, collision detection, scoring, power-ups, and ghost AI
transitions. Performance tests MUST validate frame-rate and input-latency budgets (see Performance
Budgets). Tests MUST be deterministic and MUST NOT depend on timing, network, or external state.
Flaky tests MUST be fixed or removed within one sprint.

**Rationale**: Coverage thresholds and mandatory integration coverage make the test suite a reliable
safety net rather than a compliance checkbox.

### IV. User Experience Consistency

All player-facing interactions MUST conform to established Pac-Man conventions: movement feel, ghost
AI behavior, audio cues, and visual feedback patterns. Visual feedback for game events (score pop,
life lost, level transition) MUST be immediate (≤1 frame delay at 60 fps). Directional input MUST
be buffered for one frame to allow corner turning. UI states — start screen, gameplay, pause, and
game-over — MUST transition without flicker or stutter.

**Rationale**: UX inconsistency breaks player trust and makes the game feel unpolished. Adherence to
established conventions ensures the game is immediately recognizable and feels correct.

### V. Performance Requirements

The game loop MUST sustain 60 fps on the target platform under all normal gameplay conditions. Frame
budget per tick MUST NOT exceed 16 ms. Input-to-visual-response latency MUST be ≤33 ms (2 frames).
Asset loading MUST complete within 3 seconds on the target device baseline. Memory MUST NOT grow
unboundedly; object pooling MUST be used for frequently created entities (pellets, ghost pathfinding
nodes).

**Rationale**: Performance is a first-class feature for a game. Frame drops and input lag directly
harm the player experience in ways that no other feature can compensate for.

## Performance Budgets

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Frame rate | 60 fps steady state | Performance test suite |
| Frame time | ≤16 ms per tick | Profiler gate in CI |
| Input latency | ≤33 ms end-to-end | Integration test |
| Initial load time | ≤3 s on baseline device | Load test |
| Peak memory | ≤256 MB | Runtime assertion |

Budgets MUST be validated by automated tests. Any PR that regresses a budget by more than 5% MUST
include a written justification and explicit approval before merging.

## Development Workflow

All feature work MUST occur on a dedicated branch (naming: `###-short-description`). PRs MUST pass
all automated tests and linting before review. A Constitution Check MUST be performed at the start
of every implementation plan and re-checked after Phase 1 design. Complexity violations MUST be
documented in the plan's Complexity Tracking table with justification. Game-logic changes MUST
include a manual playthrough of the affected gameplay path in addition to automated tests.

## Governance

This constitution supersedes all other practices and guidelines. Amendments require:

1. A written proposal describing the change and its rationale.
2. An impact assessment against existing specs, plans, and tasks.
3. A version bump per semantic versioning (MAJOR: removals/redefinitions; MINOR: additions;
   PATCH: clarifications and wording fixes).
4. Updates to all affected templates within the same PR.

All PRs and code reviews MUST verify compliance with the principles above. Use `.specify/memory/`
for runtime development guidance and ongoing spec artifacts.

**Version**: 1.0.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-18
