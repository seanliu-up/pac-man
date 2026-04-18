# Tasks: Pac-Man Web Game

**Input**: Design documents from `/specs/001-init-web-game/`
**Branch**: `001-init-web-game` | **Date**: 2026-04-18
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/input.md ✓, contracts/storage.md ✓, quickstart.md ✓

**Tests**: Included — TDD is mandatory per Constitution Principle II (confirmed ✅ in plan.md). Write test first, confirm RED, then implement.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — configs, tooling, directory skeleton.

- [ ] T001 Create directory structure: `src/game/entities/`, `src/game/systems/`, `src/game/state/`, `src/rendering/`, `src/input/`, `src/audio/`, `src/storage/`, `tests/unit/`, `tests/integration/`, `tests/performance/`
- [ ] T002 [P] Create `package.json` with scripts (`dev`, `build`, `preview`, `test`, `test:coverage`, `test:e2e`, `lint`) and dependencies: `vite@^5`, `jest@^29`, `jest-canvas-mock`, `jest-environment-jsdom`, `@playwright/test@^1`, `eslint`
- [ ] T003 [P] Create `vite.config.js` (single-page vanilla JS, entry `index.html`, output `dist/`)
- [ ] T004 [P] Create `jest.config.js` with `testEnvironment: jsdom`, `setupFiles: ['jest-canvas-mock']`, `coverageThreshold: { global: { lines: 80, branches: 80 } }` on `src/game/**`, exclude `src/rendering/**` from threshold
- [ ] T005 [P] Create `playwright.config.js` (baseURL `http://localhost:5173`, webkit + chromium, timeout 30s)
- [ ] T006 [P] Create `.eslintrc.js` with import-boundary rule: files in `src/game/**` MUST NOT import from `src/rendering/**`, `src/input/**`, `src/audio/**`, or `src/storage/**`
- [ ] T007 Run `npm install` to install all declared dependencies

**Checkpoint**: Tooling ready — `npm test` should run (no tests yet), `npm run dev` should start.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data structures and constants that all user stories depend on. No game logic yet — pure entity definitions and the game loop scaffold.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 [P] Create `src/game/constants.js` exporting enums: `Direction` (UP/DOWN/LEFT/RIGHT/NONE), `GamePhase` (START/PLAYING/PAUSED/LIFE_LOST/LEVEL_COMPLETE/GAME_OVER), `GhostMode` (HOUSE/LEAVING_HOUSE/SCATTER/CHASE/FRIGHTENED/EATEN), `GhostId` (BLINKY/PINKY/INKY/CLYDE), `TileType` (WALL/PATH/GHOST_HOUSE/GHOST_DOOR/TUNNEL), `TILE_SIZE = 16`, `MAZE_COLS = 28`, `MAZE_ROWS = 31`
- [ ] T009 [P] Create `src/game/entities/pacman.js` exporting `createPacMan()` factory returning `{ tileX, tileY, pixelX, pixelY, direction: Direction.NONE, pendingDirection: null, speed, mouthAngle: 0 }` with default spawn position (tile 14, 23)
- [ ] T010 [P] Create `src/game/entities/ghost.js` exporting `createGhost(id)` factory returning `{ id, tileX, tileY, pixelX, pixelY, direction: Direction.LEFT, mode: GhostMode.HOUSE, speed, scatterCorner, frightenedFlashing: false }` with per-ghost scatter corners per research.md (Blinky: 25,0 — Pinky: 2,0 — Inky: 27,31 — Clyde: 0,31) and start positions per classic layout
- [ ] T011 [P] Create `src/game/entities/dot.js` exporting `createDot(tileX, tileY)` returning `{ tileX, tileY, collected: false }` and `DOT_POINTS = 10`
- [ ] T012 [P] Create `src/game/entities/power-pellet.js` exporting `createPowerPellet(tileX, tileY)` returning `{ tileX, tileY, collected: false, visible: true }` and `PELLET_POINTS = 50`
- [ ] T013 [P] Create `src/game/entities/maze.js` exporting `createMaze()` that builds the 28×31 tile grid (classic Pac-Man layout encoded as a 2D array of `TileType` values), pre-allocates all 244 `Dot` instances and 4 `PowerPellet` instances (corner tiles: 1,3 — 26,3 — 1,23 — 26,23), and returns `{ tiles, dots, powerPellets, totalDots: 248 }`
- [ ] T014 Create `src/game/state/game-state.js` exporting `createGameState()` that initialises all sub-entities (`createPacMan()`, four `createGhost()` instances, `createMaze()`) and returns `{ phase: GamePhase.START, score: 0, lives: 3, level: 1, bonusLifeAwarded: false, pacman, ghosts, maze, scatterChaseClock: 0, frightTimer: 0, ghostEatCombo: 0 }` (depends on T008–T013)
- [ ] T015 Create `src/game/state/game-loop.js` exporting `createGameLoop(gameState, onTick, onRender)` with fixed-timestep loop (16ms tick, `requestAnimationFrame`, delta accumulator); `start()`, `stop()`, `pause()`, `resume()` methods (depends on T014)
- [ ] T016 [P] Create `src/rendering/renderer.js` as coordinator scaffold: `class Renderer { constructor(canvas) {} init() {} renderFrame(gameState) {} }` — stubs for `MazeRenderer`, `EntityRenderer`, `UIRenderer` sub-renderers (no drawing yet)
- [ ] T017 [P] Create `index.html` with single `<canvas id="game-canvas">` element, viewport meta tag, and `<script type="module" src="/src/main.js">` tag
- [ ] T018 Create `src/main.js` entry point: instantiate `GameState`, `GameLoop`, `Renderer`, `InputManager` (stub), `AudioManager` (stub); wire `onTick` and `onRender` callbacks; call `gameLoop.start()` on DOM ready (depends on T014–T017)

**Checkpoint**: Foundation ready — `npm run dev` opens a blank canvas page; no errors in console; all entity factories importable.

---

## Phase 3: User Story 1 — Play a Game Session (Priority: P1) 🎯 MVP

**Goal**: Complete playable game loop — start game, move Pac-Man, eat dots, encounter ghosts, lose lives, reach game over.

**Independent Test**: Load the game, press start, use arrow keys to move Pac-Man, eat dots (score increases), touch a ghost (life lost), reach zero lives (game over screen shown).

### Tests for User Story 1 ⚠️ Write First — Must FAIL Before Implementation

- [ ] T019 [P] [US1] Write unit tests for movement system in `tests/unit/movement.test.js`: tile advancement per direction, wall blocking (can't enter WALL tile), tunnel wrap (left edge ↔ right edge), input buffer resolution (pendingDirection applied when passable), Pac-Man speed interpolation
- [ ] T020 [P] [US1] Write unit tests for dot collision in `tests/unit/collision.test.js`: Pac-Man occupying dot tile marks `dot.collected = true`, score increments by 10, all-dots-collected triggers LEVEL_COMPLETE, Pac-Man touching normal-mode ghost triggers LIFE_LOST
- [ ] T021 [P] [US1] Write unit tests for ghost AI (scatter + chase) in `tests/unit/ghost-ai.test.js`: Blinky target = Pac-Man tile, Pinky target = 4 tiles ahead with UP-overflow bug, Inky target = double vector from Blinky, Clyde target = Pac-Man if >8 tiles else scatter corner, scatter mode → scatter corner, direction reversal on mode switch
- [ ] T022 [P] [US1] Write unit tests for scoring in `tests/unit/scoring.test.js`: dot awards 10 pts, score accumulates, bonus life awarded when score crosses 10,000 (bonusLifeAwarded flag set, lives +1, never awarded twice)
- [ ] T023 [US1] Write integration test for full game session in `tests/integration/game-session.test.js`: start → move → eat all maze dots → LEVEL_COMPLETE transition; separately: ghost collision → LIFE_LOST → respawn → 0 lives → GAME_OVER (depends on T019–T022 failing)

### Implementation for User Story 1

- [ ] T024 [P] [US1] Implement movement system in `src/game/systems/movement.js`: resolve `pendingDirection` against tile alignment each tick, advance `tileX`/`tileY` and `pixelX`/`pixelY` by speed delta, block movement into WALL tiles, wrap through TUNNEL tiles (depends on T008, T009, T013)
- [ ] T025 [P] [US1] Implement InputManager in `src/input/input-manager.js` per `contracts/input.md`: keyboard (ArrowKeys + WASD → Direction, P/Escape → pause, M → mute), touch swipe detection (20px threshold), `getPendingDirection()`, `isPausePressed()`, `clearPause()`, `init()`, `destroy()`; attach to `document`; `preventDefault` for arrow keys during PLAYING/PAUSED (no imports from `src/game/**`)
- [ ] T026 [P] [US1] Implement collision system in `src/game/systems/collision.js`: Pac-Man ↔ dot (same tile → collected=true, return collected count), Pac-Man ↔ normal-mode ghost (same tile → trigger LIFE_LOST or GAME_OVER based on lives), return structured collision result object (depends on T008, T009, T010, T011)
- [ ] T027 [P] [US1] Implement scoring system in `src/game/systems/scoring.js`: `awardDot(state)` adds 10 to score, `checkBonusLife(state)` awards extra life at 10,000 pts (sets `bonusLifeAwarded=true`, `lives++`), return updated state (depends on T014)
- [ ] T028 [US1] Implement ghost AI in `src/game/systems/ghost-ai.js`: per-ghost chase target calculation (Blinky/Pinky/Inky/Clyde per research.md), scatter corner navigation, intersection direction selection (Manhattan distance to target, no 180° reversal), mode transition on scatter↔chase cycle (`scatterChaseClock` tick), HOUSE → LEAVING_HOUSE → SCATTER/CHASE release order per dot count thresholds (depends on T008, T010, T013, T024)
- [ ] T029 [US1] Implement level system in `src/game/systems/level.js`: `checkLevelComplete(state)` returns true when all dots and pellets are collected, `resetLevel(state)` resets all dot/pellet `collected` flags and Pac-Man/ghost positions (depends on T013, T014)
- [ ] T030 [P] [US1] Implement maze renderer in `src/rendering/maze-renderer.js`: draw tile grid (WALL=blue fill, PATH=black, GHOST_HOUSE=dark blue, TUNNEL=black with side openings), draw uncollected dots as small white circles, scale to canvas size (depends on T008, T013, T016)
- [ ] T031 [P] [US1] Implement entity renderer in `src/rendering/entity-renderer.js`: draw Pac-Man (yellow circle with chomp mouth arc from `mouthAngle`), draw ghost body (D-shape with eye dots, color per GhostId), draw uncollected power pellets as larger white circles (depends on T008, T009, T010, T012, T016)
- [ ] T032 [P] [US1] Implement UI renderer in `src/rendering/ui-renderer.js`: draw score/lives/level HUD (top of canvas), START screen ("Press Enter to Start"), PAUSED overlay ("Game Paused — Press P to Resume"), GAME_OVER screen (final score, "Game Over" text), LIFE_LOST brief overlay (depends on T014, T016)
- [ ] T033 [US1] Wire game tick in `src/game/state/game-loop.js` `onTick` callback: call InputManager.getPendingDirection → movement → collision → scoring → ghost-ai → level systems in correct order; handle LIFE_LOST/GAME_OVER/LEVEL_COMPLETE phase transitions; connect InputManager pause toggle; wire Renderer.renderFrame in `onRender` (depends on T024–T032)

**Checkpoint**: User Story 1 fully functional — playable game session from start to game over.

---

## Phase 4: User Story 2 — Power Pellet & Ghost Chase Mechanic (Priority: P2)

**Goal**: Pac-Man eats power pellet, ghosts become frightened, Pac-Man can eat frightened ghosts for bonus points, timer expires, ghosts return to normal.

**Independent Test**: Load game, navigate to a power pellet corner, eat it, observe ghosts turn blue, move Pac-Man into a frightened ghost (ghost eaten, bonus score), wait for timer to expire (ghosts flash then resume normal color and behavior).

### Tests for User Story 2 ⚠️ Write First — Must FAIL Before Implementation

- [ ] T034 [P] [US2] Write unit tests for power pellet activation in `tests/unit/collision.test.js`: Pac-Man on pellet tile → `collected=true`, **score += 50**, all non-HOUSE/EATEN ghosts → FRIGHTENED, `frightTimer` set to level-dependent duration (6s level 1), ghostEatCombo reset to 0
- [ ] T035 [P] [US2] Write unit tests for frightened ghost behavior in `tests/unit/ghost-ai.test.js`: ghost in FRIGHTENED mode picks random non-reversing direction at each tile center (not current reverse), Pac-Man collision with FRIGHTENED ghost → ghost switches to EATEN mode, speed set to high (navigate to ghost house)
- [ ] T036 [P] [US2] Write unit tests for ghost eat combo scoring in `tests/unit/scoring.test.js`: 1st ghost = 200pts, 2nd = 400pts, 3rd = 800pts, 4th = 1600pts; combo resets on new pellet
- [ ] T037 [US2] Write integration test for full power pellet session in `tests/integration/power-pellet.test.js`: eat pellet → eat 2 ghosts (200+400=600pts awarded) → frightTimer expires → frightenedFlashing triggers at ≤2s → ghosts return to SCATTER/CHASE (depends on T034–T036 failing)

### Implementation for User Story 2

- [ ] T038 [P] [US2] Enhance collision system in `src/game/systems/collision.js` for power pellet: Pac-Man on pellet tile → mark collected, **award 50 pts to `gameState.score`**, set `frightTimer` to level-duration, switch all eligible ghosts to FRIGHTENED, reset `ghostEatCombo = 0` (depends on T026)
- [ ] T039 [P] [US2] Enhance collision system in `src/game/systems/collision.js` for frightened ghost eating: Pac-Man on FRIGHTENED ghost tile → award combo points (`200 * 2^ghostEatCombo`), increment `ghostEatCombo`, switch ghost to EATEN mode (depends on T038)
- [ ] T040 [US2] Enhance ghost AI in `src/game/systems/ghost-ai.js` with FRIGHTENED mode: random non-reversing direction at each tile center using `Math.random()`, speed = 50% of base; and EATEN mode: direct path navigation to ghost house entry tile (tile 14,11) at 2× base speed, on arrival → switch to HOUSE then LEAVING_HOUSE (depends on T028)
- [ ] T041 [US2] Enhance ghost AI in `src/game/systems/ghost-ai.js` with frightened timer management: each tick decrement `frightTimer` by delta; when `frightTimer ≤ 2` set `ghost.frightenedFlashing = true`; when `frightTimer ≤ 0` return ghost to current SCATTER/CHASE phase per `scatterChaseClock` (depends on T040)
- [ ] T042 [P] [US2] Enhance entity renderer in `src/rendering/entity-renderer.js` for frightened state: draw FRIGHTENED ghost as dark blue body with white eyes; draw FRIGHTENED+`frightenedFlashing` ghost alternating dark blue/white at ~2Hz using frame counter; draw EATEN ghost as eyes-only sprite navigating maze (depends on T031)
- [ ] T043 [P] [US2] Add power pellet blink animation in `src/rendering/entity-renderer.js`: toggle `pellet.visible` at ~2Hz (every ~30 ticks at 60fps) in entity renderer frame logic; skip draw when `visible = false` (depends on T031)
- [ ] T044 [US2] Implement AudioManager in `src/audio/audio-manager.js`: Web Audio API, `preload(soundId, url)` method loading `AudioBuffer` via `fetch`, `play(soundId)` fires buffer source, `setMuted(muted)` toggle via `audioCtx.suspend()`/`resume()` accepting `initialMuted` constructor parameter (default `false`); sound events: `dot-eat`, `ghost-eat`, `power-pellet`, `life-lost`, `level-complete`, `game-start`, `game-over`; wire play calls in `game-loop.js` onTick for relevant state transitions (no imports from `src/game/**`)

**Checkpoint**: User Stories 1 and 2 both functional — power pellet mechanic works end-to-end.

---

## Phase 5: User Story 3 — Score Tracking & High Score (Priority: P3)

**Goal**: Player sees final score on game over, top scores persist in localStorage across sessions, high score entry form for qualifying scores.

**Independent Test**: Play a game to game over, confirm final score shown, enter name (3 chars), confirm entry appears in high score list, reload browser, confirm score still present.

### Tests for User Story 3 ⚠️ Write First — Must FAIL Before Implementation

- [ ] T045 [P] [US3] Write unit tests for StorageAdapter in `tests/unit/storage.test.js` using injected in-memory `Map` backend: `getHighScores()` returns sorted array, `saveHighScore()` inserts + trims to 10, `qualifiesForHighScore()` logic (< 10 entries OR score > 10th), `getMuteSetting()` default false, `saveMuteSetting()` persists, corrupt JSON returns `[]` without throwing, invalid name/score silently rejected
- [ ] T046 [US3] Write integration test for high score persistence flow in `tests/integration/high-score.test.js`: simulate game over → `qualifiesForHighScore(score)` true → `saveHighScore({ name: 'AAA', score, date })` → `getHighScores()` returns entry; second save below 10th rank → not included (depends on T045 failing)

### Implementation for User Story 3

- [ ] T047 [US3] Implement StorageAdapter in `src/storage/storage.js` per `contracts/storage.md`: `getHighScores()`, `saveHighScore(entry)` with trim to 10 + descending sort, `qualifiesForHighScore(score)`, `getMuteSetting()`, `saveMuteSetting(muted)`; constructor accepts injected storage backend (default `localStorage`); all reads/writes in try/catch; validate `name` (trim, uppercase, ≤3 chars), `score` (≥0 integer), `date` (YYYY-MM-DD); no imports from `src/game/**` or `src/rendering/**`
- [ ] T048 [US3] Enhance UI renderer in `src/rendering/ui-renderer.js` with game-over screen: prominently display final score, if `qualifiesForHighScore()` show 3-character name entry widget (keyboard-driven: letter keys cycle A-Z, Enter confirms), on confirm call `StorageAdapter.saveHighScore()` (depends on T032, T047)
- [ ] T049 [US3] Enhance UI renderer in `src/rendering/ui-renderer.js` with high score list screen: render up to 10 entries (rank, name, score, date) descending; empty state shows "No scores yet — be the first!"; accessible from START screen and GAME_OVER screen (depends on T048)
- [ ] T050 [US3] Enhance GameState GAME_OVER transition in `src/game/state/game-state.js`: on entering GAME_OVER phase, call `StorageAdapter.qualifiesForHighScore(score)`; if true set `phase = GAME_OVER` with `nameEntryPending = true`; after name confirmed set `nameEntryPending = false` and transition to HIGH_SCORE display phase; add `HIGH_SCORE` to `GamePhase` enum in `src/game/constants.js` (depends on T047–T049)

**Checkpoint**: User Stories 1, 2, and 3 functional — complete game with persistent high scores.

---

## Phase 6: User Story 4 — Level Progression (Priority: P4)

**Goal**: Clearing all dots advances to next level with a brief transition animation; ghost speed and frightened duration increase per level; scatter/chase timing adjusts at level 5+.

**Independent Test**: Clear all dots on level 1, observe level-complete animation, confirm level counter shows "2", confirm ghosts move faster on level 2, eat a power pellet and observe shorter frightened duration.

### Tests for User Story 4 ⚠️ Write First — Must FAIL Before Implementation

- [ ] T051 [P] [US4] Write unit tests for difficulty scaling in `tests/unit/level.test.js`: `getGhostSpeedFactor(level)` returns 0.75/0.85/0.90/0.95 per data-model.md table, `getFrightenedDuration(level)` returns 6/5/4/3s, `getPacManSpeedFactor(level)` returns 0.80→0.90 scaling, `getScatterChaseTiming(level)` returns classic timings for level 1–4 and level 5+ variant per research.md
- [ ] T052 [US4] Write integration test for level transition in `tests/integration/level-progression.test.js`: collect all dots → `checkLevelComplete` returns true → `GamePhase` = LEVEL_COMPLETE → after transition delay `level` increments to 2 → ghost speed factor recalculated for level 2 → frightened duration = 5s on level 2 (depends on T051 failing)

### Implementation for User Story 4

- [ ] T053 [US4] Enhance level system in `src/game/systems/level.js` with difficulty scaling: add `getGhostSpeedFactor(level)`, `getFrightenedDuration(level)`, `getPacManSpeedFactor(level)`, `getScatterChaseTiming(level)` functions using lookup tables from data-model.md and research.md; call on LEVEL_COMPLETE to set ghost/pacman speeds and frightTimer duration for new level (depends on T029)
- [ ] T054 [US4] Enhance level system in `src/game/systems/level.js` for level reset: on LEVEL_COMPLETE transition increment `gameState.level`, reset all dot/pellet `collected` flags, reset Pac-Man and ghost positions to starting tiles, reset `scatterChaseClock = 0`, apply new level's speed/duration factors (depends on T053)
- [ ] T055 [US4] Enhance ghost AI in `src/game/systems/ghost-ai.js` for level 5+ scatter/chase timing: use `getScatterChaseTiming(level)` to determine scatter phase durations (5s/5s/5s with permanent final chase vs classic 7s/7s/5s/5s per research.md); update `scatterChaseClock` threshold checks accordingly (depends on T028, T053)
- [ ] T056 [US4] Add level-complete animation in `src/rendering/ui-renderer.js`: during LEVEL_COMPLETE phase, flash maze tiles blue/white 3 times (500ms cycle) before transitioning; display "Level X Complete!" overlay text; wire animation timing to GameLoop delta accumulator (depends on T032)

**Checkpoint**: All 4 user stories fully functional — complete game with progression.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, E2E performance tests, mobile polish, final validation.

- [ ] T057 [P] Add responsive CSS in `index.html`: canvas scales proportionally from 375px to 1920px viewport width; canvas maintains 28:31 tile aspect ratio; no horizontal scroll; centered on desktop; full-width on mobile
- [ ] T058 [P] Add mobile viewport meta tag and touch-action CSS in `index.html` to prevent default scroll/zoom during swipe input
- [ ] T059 [P] Write Playwright E2E test for initial load time in `tests/performance/load-time.spec.js`: navigate to `http://localhost:5173`, measure time to first paint, assert ≤3000ms per SC-001
- [ ] T060 [P] Write Playwright E2E test for input-to-visual latency in `tests/performance/input-latency.spec.js`: start game, dispatch `ArrowRight` keydown, measure frames until Pac-Man pixel position changes, assert ≤33ms per plan.md performance goal
- [ ] T061 Run `npm run test:coverage` and verify ≥80% line/branch coverage on `src/game/**`; fix any coverage gaps
- [ ] T062 Run `npm run lint` and fix all ESLint violations, particularly import boundary violations (no `src/game/**` imports in `src/rendering/**`, `src/input/**`, `src/audio/**`)
- [ ] T063 Run `npm run test:e2e` against `npm run dev` server; verify load ≤3s and input latency ≤33ms assertions pass; fix any failures
- [ ] T064 [P] Write Playwright E2E test for sustained frame rate in `tests/performance/fps.spec.js`: start a game session, inject a 5-second gameplay sequence, capture `requestAnimationFrame` timestamps via page.evaluate, assert average FPS ≥ 30 and no single frame gap > 100ms (SC-003)
- [ ] T065 Enhance `src/main.js` to wire mute preference persistence: on startup load `StorageAdapter.getMuteSetting()` and pass result as `initialMuted` to `AudioManager` constructor; add `onMuteToggle` callback in AudioManager that calls `StorageAdapter.saveMuteSetting(muted)` after each toggle (requires T047 StorageAdapter complete; FR-012)
- [ ] T066 [P] Enhance `src/rendering/ui-renderer.js` START screen with UX affordances: add control legend ("Arrow keys / WASD to move"), objective hint ("Eat all the dots! Avoid the ghosts."), labeled HUD items ("SCORE", "LIVES", "LEVEL") legible at all supported resolutions; ensures SC-004 first-time player discoverability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — BLOCKS all user stories
- **US1 (Phase 3)**: Requires Phase 2 complete — MVP target
- **US2 (Phase 4)**: Requires Phase 2 complete; integrates with Phase 3 (collision.js enhancements)
- **US3 (Phase 5)**: Requires Phase 2 complete; independent of US2; uses GameState from US1
- **US4 (Phase 6)**: Requires Phase 3 complete (level.js exists); enhances existing level system
- **Polish (Phase 7)**: Requires all desired user stories complete (T065 additionally requires T047 StorageAdapter)

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — no cross-story deps
- **US2 (P2)**: Depends on Foundational + collision.js and ghost-ai.js from US1
- **US3 (P3)**: Depends on Foundational + GameState GAME_OVER phase from US1
- **US4 (P4)**: Depends on level.js from US1 + ghost-ai.js enhancements from US2

### Within Each User Story

1. Tests written first (must be RED before implementation starts)
2. Entity/model changes before system changes
3. System implementations before renderer enhancements
4. Core implementation before integration wiring
5. Confirm story GREEN before moving to next priority

### Parallel Opportunities

- Phase 1: T002–T006 all run in parallel (different config files)
- Phase 2: T008–T013 run in parallel (independent entity files); T016–T017 run in parallel
- US1 tests: T019–T022 run in parallel (different test files)
- US1 impl: T024–T027 run in parallel; T030–T032 run in parallel
- US2 tests: T034–T036 run in parallel
- US2 impl: T038–T039 in parallel; T042–T043 in parallel
- Phase 7: T057–T060, T064, T066 run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests in parallel (write first, confirm RED):
Task T019: tests/unit/movement.test.js
Task T020: tests/unit/collision.test.js
Task T021: tests/unit/ghost-ai.test.js
Task T022: tests/unit/scoring.test.js

# Then launch implementation tasks in parallel:
Task T024: src/game/systems/movement.js
Task T025: src/input/input-manager.js
Task T026: src/game/systems/collision.js
Task T027: src/game/systems/scoring.js

# Then rendering in parallel:
Task T030: src/rendering/maze-renderer.js
Task T031: src/rendering/entity-renderer.js
Task T032: src/rendering/ui-renderer.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Write US1 tests (T019–T023) — confirm RED
4. Implement US1 (T024–T033)
5. **STOP and VALIDATE**: playable game session, `npm test` GREEN, `npm run test:coverage` ≥80%

### Incremental Delivery

1. Setup + Foundational → canvas page loads, no errors
2. US1 → MVP: playable Pac-Man game (start, move, eat dots, ghost collision, game over)
3. US2 → Power pellets, frightened ghosts, ghost eating with combo scoring
4. US3 → High score persistence, game over name entry, score screen
5. US4 → Level progression, difficulty scaling, level-complete animation
6. Polish → Responsive layout, E2E performance validation

---

## Notes

- `[P]` tasks touch different files — dispatch to parallel agents or run concurrently
- `[Story]` label maps each task to its user story for traceability
- TDD is mandatory (Constitution Principle II): test file must exist and FAIL before implementation file is written
- Commit after each logical task group; never commit a failing test without the implementation in the same commit
- Run `npm run lint` frequently — import boundary violations between `src/game/**` and other layers are constitution violations
- The `src/game/**` layer must remain DOM/Canvas-free; any violation requires immediate fix before proceeding
- Stop at each checkpoint to independently validate the completed story before starting the next
