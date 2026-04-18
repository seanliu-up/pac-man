# Implementation Plan: Pac-Man Web Game

**Branch**: `001-init-web-game` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-init-web-game/spec.md`

## Summary

Build a browser-based Pac-Man game in vanilla JavaScript + HTML5 Canvas with no server dependency. Game logic is pure JS (DOM-free) enabling full TDD coverage; a thin Canvas renderer layer handles display. Vite provides dev/build tooling; Jest covers unit and integration tests; Playwright covers E2E input-latency and performance validation.

## Technical Context

**Language/Version**: JavaScript ES2022 (vanilla, no framework)
**Primary Dependencies**: Vite 5.x (dev server + build), Jest 29.x + jest-canvas-mock (unit/integration), Playwright 1.x (E2E performance tests)
**Storage**: `localStorage` — high score list (up to 10 entries), mute preference
**Testing**: Jest (unit + integration), Playwright (E2E input latency, load time)
**Target Platform**: Modern web browsers released within last 3 years — desktop + mobile
**Project Type**: Browser game — single-page, static file delivery, no server required
**Performance Goals**: 60fps steady state; ≤16ms frame time; ≤33ms input-to-visual latency; ≤3s initial load
**Constraints**: ≤256MB peak memory; offline-capable; no installation; responsive from 375px to 1920px
**Scale/Scope**: Single player; single fixed maze; ~10 game-logic modules; ~5 rendering modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, cyclomatic ≤10 | ✅ PASS | Ghost AI targeting functions decomposed per ghost; tile-movement helpers isolated. Ghost Inky's calculation is the most complex function — review at implementation. |
| II. TDD — tests before code, Red-Green-Refactor | ✅ PASS | Game logic layer is pure JS (zero DOM/Canvas deps); all logic modules fully unit-testable without mocks. |
| III. Testing — >80% coverage, integration + perf tests | ✅ PASS | Coverage gate on `src/game/**` via Jest. Integration tests cover movement/collision/scoring/AI transitions. Playwright E2E validates input latency and load time. |
| IV. UX Consistency — classic conventions, input buffering | ✅ PASS | 1-frame input buffer designed into PacMan entity. Scatter/chase/frightened cycle follows Pac-Man Dossier specification. |
| V. Performance — 60fps, ≤16ms frame, object pooling | ✅ PASS | All dots/pellets pre-allocated at game init (no GC pressure). Ghost pathfinding is tile-direction selection (O(4)), no heap allocation per tick. |

**No violations. Proceed to Phase 0.**

*Post-design re-check*: See bottom of document.

## Project Structure

### Documentation (this feature)

```text
specs/001-init-web-game/
├── plan.md          # This file
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
├── contracts/       # Phase 1 output
│   ├── input.md
│   └── storage.md
└── tasks.md         # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code

```text
src/
├── game/
│   ├── entities/
│   │   ├── pacman.js        # PacMan entity (position, direction, buffer, speed)
│   │   ├── ghost.js         # Ghost entity (position, direction, mode, speed, scatter timer)
│   │   ├── dot.js           # Dot entity (position, collected flag)
│   │   ├── power-pellet.js  # PowerPellet entity (position, collected flag)
│   │   └── maze.js          # Maze tile grid (wall/path/zone definitions)
│   ├── systems/
│   │   ├── movement.js      # Tile-based movement, wall collision, input buffer resolution
│   │   ├── collision.js     # Pac-Man ↔ ghost, dot, pellet collision detection
│   │   ├── scoring.js       # Point awards, bonus life trigger
│   │   ├── ghost-ai.js      # Ghost targeting (Blinky/Pinky/Inky/Clyde), scatter/chase/frightened
│   │   └── level.js         # Level progression, difficulty scaling, dot/pellet reset
│   └── state/
│       ├── game-state.js    # Top-level session state (lives, score, level, phase)
│       └── game-loop.js     # Fixed-timestep game loop, delta accumulator
├── rendering/
│   ├── renderer.js          # Canvas rendering coordinator
│   ├── maze-renderer.js     # Tile and maze drawing
│   ├── entity-renderer.js   # Pac-Man, ghost, dot, pellet sprites
│   └── ui-renderer.js       # Score, lives, level HUD; start/pause/game-over screens
├── input/
│   └── input-manager.js     # Keyboard + touch/swipe → directional commands + pause
├── audio/
│   └── audio-manager.js     # Sound effect triggers (Web Audio API), mute toggle
├── storage/
│   └── storage.js           # localStorage adapter for high scores and settings
└── main.js                  # Entry point: init GameState + Renderer + InputManager

tests/
├── unit/                    # Pure game logic — no DOM/Canvas required
├── integration/             # Player-game-state interactions (movement → state → score)
└── performance/             # Frame-budget assertions, input latency (Playwright)

index.html                   # Single canvas element, one module script tag
vite.config.js
jest.config.js
playwright.config.js
package.json
```

**Structure Decision**: Single-project browser game. Game logic (`src/game/`) is strictly DOM-agnostic and tested via Jest. Canvas rendering (`src/rendering/`) is a pure output layer tested with jest-canvas-mock. This separation is the primary architectural constraint enforced by Constitution Principles II and III.

## Complexity Tracking

| Function | Cyclomatic Risk | Mitigation |
|----------|----------------|-----------|
| `ghost-ai.js: getInkyTarget()` | Medium (~6) | Extract vector-doubling helper; keep within limit |
| `game-state.js: tick()` | Medium (~8) | Delegate to system functions; tick only dispatches |
| `renderer.js: renderFrame()` | Low (~4) | Pure dispatch to sub-renderers |

*No constitution violations. Table present for tracking purposes only.*

---

## Post-Phase-1 Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | Data model entities are plain objects with typed fields. No entity exceeds 5 fields. |
| II. TDD | ✅ PASS | All entities and systems are pure functions / classes with no side effects — directly unit-testable. |
| III. Testing | ✅ PASS | Input and storage contracts are narrow and deterministic — straightforward to test at boundary. |
| IV. UX Consistency | ✅ PASS | Ghost state machine covers all mode transitions per Dossier spec. Input buffer modeled in PacMan entity. |
| V. Performance | ✅ PASS | Object pooling confirmed: all Dot and PowerPellet instances created once at maze init, toggled via `collected` flag (no allocation per frame). |
