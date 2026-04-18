# Implementation Plan: Game Speed Controls

**Branch**: `002-speed-controls` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-speed-controls/spec.md`

## Summary

Add 5 discrete speed presets (1×–5×, default 5×). The multiplier is stored as `speedMultiplier` in
`GameState` and applied at movement-compute time in `movement.js` — stacking multiplicatively on top
of the existing per-level base speeds. Speed is selectable via number keys 1–5 from the START and
PAUSED screens, shown as a passive label in the HUD, and persisted in localStorage alongside the
existing mute setting.

## Technical Context

**Language/Version**: JavaScript ES2022 (vanilla, no framework)
**Primary Dependencies**: Vite 5.x (build), Jest 29.x + jest-canvas-mock (unit/integration), Playwright 1.x (E2E)
**Storage**: localStorage via `StorageAdapter` — key `pacman.settings`, JSON object `{ muted, speedMultiplier }`
**Testing**: Jest unit + integration; Playwright performance
**Target Platform**: Modern web browsers (ES2022, Canvas API)
**Project Type**: Canvas-rendered web game, keyboard-controlled
**Performance Goals**: 60 fps at all 5 speed presets; ≤16 ms frame time (one additional multiply per entity per tick — negligible)
**Constraints**: Multiplier applies to all entity speeds uniformly; level-based progression preserved underneath; frightened ghost speed scales by same multiplier
**Scale/Scope**: 7 files modified; ~180 lines added/changed; no new source files

## Constitution Check

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality | Cyclomatic ≤10 per function | ✅ PASS | All new paths add ≤2 branches |
| II. TDD | Tests before implementation code | ✅ REQUIRED | Red-Green-Refactor enforced throughout |
| III. Testing | 80%+ coverage on `src/game/**` | ✅ REQUIRED | 3 new test files; extend 2 existing |
| IV. UX Consistency | Speed takes effect within 1 frame on resume (SC-003) | ✅ PASS | Multiplier read from state each tick |
| V. Performance | 60 fps at all 5 presets | ✅ PASS | One multiply per entity per tick |

No gate violations. No complexity-tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-speed-controls/
├── plan.md              ← this file
├── research.md          ← Phase 0 output (design decisions)
├── data-model.md        ← Phase 1 output (entities + state)
├── quickstart.md        ← Phase 1 output (implementation guide)
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (affected files only)

```text
src/
├── storage/
│   └── storage.js              # _getSettings() merge helper; getSpeedSetting(); saveSpeedSetting(); fix saveMuteSetting
├── game/
│   ├── state/
│   │   └── game-state.js       # add speedMultiplier parameter (default 5)
│   ├── systems/
│   │   └── movement.js         # distance *= state.speedMultiplier in tickPacMan + tickEntity
│   └── state/
│       └── tick.js             # _handleSpeedInput() helper; call from START + PAUSED phases
├── rendering/
│   └── ui-renderer.js          # _drawSpeedRow(); HUD speed label; extend _drawStart + _drawPaused
├── input/
│   └── input-manager.js        # _speedSelection field; number keys 1–5; getSpeedSelection(); clearSpeedSelection()
└── main.js                     # load initial speed from storage; pass to createGameState

tests/
├── unit/
│   ├── storage.test.js         # extend: getSpeedSetting (default, valid, corrupt); saveSpeedSetting; mute-merge safety
│   └── movement.test.js        # extend: multiplier=1 baseline; multiplier=5 distance; level-stack
└── integration/
    └── speed-controls.test.js  # new: US1 (select before game), US2 (change while paused), US3 (persist)
```

**Structure Decision**: Single project, modified files only. No new source modules.

## Complexity Tracking

> No violations — all additions are arithmetic or minor branches.
