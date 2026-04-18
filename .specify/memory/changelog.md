# Merged Features Log

## 002-speed-controls — 2026-04-18

**Branch**: `002-speed-controls`
**Spec**: `specs/002-speed-controls`
**Status**: Verified | **Tasks**: 23/24 completed (T023 manual browser verification pending)

### What was added

- **Speed preset selector**: 5 discrete presets (1×–5×, default 5×) selectable via number keys 1–5 on start screen and pause menu
- **HUD speed label**: Passive `SPD:N×` indicator displayed in the score/status area during gameplay
- **GameState `speedMultiplier`**: Added to top-level state; applied at movement-compute time in `movement.js` so all entities (including frightened ghosts) scale uniformly
- **Speed persistence**: Player's chosen speed preset persisted in `localStorage` under `pacman.settings.speedMultiplier`; restored on session load; falls back to 5× silently on read failure
- **StorageAdapter merge fix**: Introduced `_getSettings()` read-modify-write helper; fixed `saveMuteSetting()` to no longer overwrite other settings fields

### Modified Files

- `src/storage/storage.js` — `_getSettings()`, `getSpeedSetting()`, `saveSpeedSetting()`, `saveMuteSetting()` merge fix
- `src/game/state/game-state.js` — `speedMultiplier` parameter (default 5)
- `src/game/systems/movement.js` — `distance *= state.speedMultiplier` in `tickPacMan` + `tickEntity`
- `src/game/state/tick.js` — `_handleSpeedInput()` invoked from START + PAUSED phases
- `src/rendering/ui-renderer.js` — `_drawSpeedRow()`, HUD speed label, `_drawStart` + `_drawPaused` extensions
- `src/input/input-manager.js` — `_speedSelection` field, keys 1–5, `getSpeedSelection()`, `clearSpeedSelection()`
- `src/main.js` — loads initial speed from storage, passes to `createGameState`

### New Tests

- `tests/integration/speed-controls.test.js` — US1/US2/US3 scenarios
- Extended: `tests/unit/storage.test.js`, `tests/unit/movement.test.js`, `tests/unit/input-manager.test.js`, `tests/unit/game-state.test.js`

### Tasks Completed: 23/24

---

## 001-init-web-game — 2026-04-18

**Branch**: `001-init-web-game`  
**Spec**: `specs/001-init-web-game`  
**Status**: Verified | **Tasks**: 66/66 completed

### What was added

- **Core gameplay loop**: Players can start a game, navigate Pac-Man through a classic maze, eat dots, avoid ghosts, and reach game over or level completion
- **Ghost AI**: Four ghosts (Blinky, Pinky, Inky, Clyde) with distinct targeting strategies following Pac-Man Dossier specification; scatter/chase cycle per level
- **Collision detection**: Pac-Man ↔ ghost, dot, and power pellet collision handling
- **Scoring system**: Points for dots (10 pts), power pellets (50 pts), ghosts (200/400/800/1600 pts); bonus life at 10,000 points
- **Level progression**: Difficulty scaling (ghost speed, frightened duration) per level
- **High score persistence**: localStorage-based high score list (up to 10 entries)
- **Input handling**: Keyboard (arrow keys + WASD) and touch/swipe controls; input buffer for corner turning
- **Audio management**: Sound effects for eating, collisions, level transitions; mute/unmute toggle
- **UI rendering**: Start screen, gameplay HUD (score/lives/level), pause screen, game over screen with score display
- **Responsive layout**: Playable from 375px (mobile) to 1920px (desktop)

### New Components

**Core Modules**:
- `src/game/entities/` — PacMan, Ghost, Dot, PowerPellet, Maze entities
- `src/game/systems/` — Movement, Collision, Scoring, GhostAI, Level progression
- `src/game/state/` — GameState, GameLoop, Tick dispatcher

**Rendering Modules**:
- `src/rendering/` — Canvas renderer, maze rendering, entity sprites, UI screens

**Input & Audio**:
- `src/input/input-manager.js` — Keyboard + touch control handling
- `src/audio/audio-manager.js` — Sound effect playback and mute control

**Storage**:
- `src/storage/storage.js` — localStorage adapter for high scores and settings

**Tooling & Config**:
- `vite.config.js` — Dev server + production build
- `jest.config.js` — Unit and integration testing configuration
- `playwright.config.js` — E2E and performance testing configuration

### Test Suite

- **Unit tests**: 7 test suites covering game entities, systems, and logic (collision, movement, scoring, ghost AI, level, storage)
- **Integration tests**: 4 test suites for player-game interactions (game session, high scores, power pellets, level progression)
- **Performance tests**: 3 test suites for FPS, input latency, and load time validation
- **Total**: 105 tests passing; 80%+ coverage on `src/game/**`

### Constitutional Compliance

✅ All 5 principles verified at Phase 1:
- **I. Code Quality**: Cyclomatic complexity ≤10; single responsibility enforced
- **II. TDD**: All modules tested before/after implementation; Red-Green-Refactor applied
- **III. Testing**: 80%+ coverage on game logic; integration + performance test coverage
- **IV. UX Consistency**: 1-frame input buffer; ghost AI per Pac-Man Dossier specification
- **V. Performance**: 60fps target; object pooling for dots/pellets; <33ms input latency

### Dependencies Added

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "jest": "^29.0.0",
    "jest-canvas-mock": "^2.5.0",
    "@playwright/test": "^1.44.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Known Issues & Gotchas

#### ⚠️ Ghost AI Complexity
**Issue**: Inky's target calculation involves vector doubling, creating cyclomatic complexity ~6
**Root Cause**: Exact replication of Pac-Man Dossier algorithm
**Prevention Rule**: Extract vector-doubling helper; keep main function simple; enforce cyclomatic ≤10 in code review

#### ⚠️ Canvas Mocking Limitations
**Issue**: jest-canvas-mock stubs the Canvas 2D context; real rendering bugs may not be caught in Jest
**Root Cause**: Jest runs in Node.js; actual Canvas rendering requires browser
**Prevention Rule**: Require manual playthrough of visual changes; use Playwright for frame-rate validation

#### ⚠️ localStorage Persistence Edge Case
**Issue**: High scores may be lost if browser data is cleared or if localStorage quota is exceeded
**Root Cause**: localStorage is browser-managed and user-deletable
**Prevention Rule**: Inform players that data persists locally; consider export/backup mechanism in future versions

---

## Archive Metadata

| Artifact | Path | Size |
|----------|------|------|
| Specification | `specs/001-init-web-game/spec.md` | 140 lines |
| Plan | `specs/001-init-web-game/plan.md` | 121 lines |
| Research | `specs/001-init-web-game/research.md` | 122 lines |
| Data Model | `specs/001-init-web-game/data-model.md` | 183 lines |
| Tasks | `specs/001-init-web-game/tasks.md` | 267 lines |
| Quickstart | `specs/001-init-web-game/quickstart.md` | 83 lines |
| Contracts | `specs/001-init-web-game/contracts/` | 2 files (137 lines total) |
| Checklists | `specs/001-init-web-game/checklists/` | 1 file (36 lines) |

**Total Code**: 58 files | 10,233 insertions | 40 commits merged to master
