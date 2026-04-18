# Pac-Man Web Game — Project Knowledge

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `.specify/memory/plan.md`

## Active Technologies

- **Language**: JavaScript ES2022 (vanilla, no framework)
- **Rendering**: HTML5 Canvas 2D API
- **Build Tool**: Vite 5.x (dev server + production bundling)
- **Testing**: Jest 29.x + jest-canvas-mock (unit/integration) + Playwright 1.x (E2E)
- **Storage**: localStorage (high scores, settings)
- **Target Platform**: Modern web browsers (ES2022 support, Canvas API)

## Project Structure

```
src/
├── game/          # Pure JS game logic (no DOM/Canvas imports)
│   ├── entities/  # PacMan, Ghost, Dot, PowerPellet, Maze
│   ├── systems/   # Movement, Collision, Scoring, GhostAI, Level
│   └── state/     # GameState, GameLoop, Tick
├── rendering/     # Canvas output layer (tested with jest-canvas-mock)
├── input/         # Keyboard + touch/swipe control handling
├── audio/         # Sound effect playback (Web Audio API)
└── storage/       # localStorage adapter

tests/
├── unit/          # Game logic tests (Jest)
├── integration/   # Player-game interactions (Jest)
└── performance/   # Frame-rate, input latency (Playwright)
```

## Commands

```bash
npm run dev           # Vite dev server (http://localhost:5173)
npm run build         # Production build to dist/
npm run preview       # Preview production build
npm test              # Run all tests (Jest unit + integration)
npm test:coverage     # Coverage report (80%+ threshold on src/game/**)
npm run test:e2e      # Playwright E2E performance tests
npm run lint          # ESLint check
```

## Recent Changes

- **001-init-web-game** (2026-04-18): Core gameplay, ghost AI, scoring, high scores, level progression. 105 tests passing; 80%+ coverage.

## Known Issues & Gotchas

### ⚠️ Ghost AI Complexity (Inky's Target Calculation)
**Issue**: Inky's targeting algorithm has cyclomatic complexity ~6 (medium risk)
**Root Cause**: Exact replication of Pac-Man Dossier algorithm (vector doubling from Blinky to predicted Pac-Man position)
**Prevention Rule**: When modifying ghost-ai.js, extract vector-doubling into a helper function; keep main targeting function simple; enforce cyclomatic ≤10 in code review

**Location**: `src/game/systems/ghost-ai.js:getInkyTarget()`

### ⚠️ Canvas Mocking Limitations
**Issue**: jest-canvas-mock stubs the Canvas 2D context; real rendering bugs may not be caught in unit tests
**Root Cause**: Jest runs in Node.js; actual Canvas rendering requires browser paint cycles
**Prevention Rule**: Any changes to entity/maze/UI rendering MUST include manual playthrough in browser. Playwright E2E tests validate frame-rate, but visual correctness requires manual testing.

**Location**: `src/rendering/**` (rendered via Playwright, not Jest)

### ⚠️ localStorage Persistence Edge Case
**Issue**: High scores may be lost if player clears browser data or exceeds localStorage quota (~5-10MB per domain)
**Root Cause**: localStorage is browser-managed and user-deletable; no server-side backup
**Prevention Rule**: Inform players that data persists locally. Consider export/backup mechanism in future versions if needed.

**Location**: `src/storage/storage.js`

### ⚠️ Input Buffering Edge Case
**Issue**: If a player presses two directional keys very quickly in sequence, only one direction is buffered per frame
**Root Cause**: Input buffer stores a single direction; buffer is consumed on the next movement resolution
**Prevention Rule**: This is intentional per Constitution IV (1-frame buffer for corner turning). If you see players missing turns, verify the buffer logic in `src/game/entities/pacman.js`.

**Location**: `src/game/entities/pacman.js`, `src/input/input-manager.js`

## Constitution Compliance

✅ All 5 principles verified and enforced:

- **I. Code Quality**: Cyclomatic ≤10, single responsibility, no dead code
- **II. TDD**: Tests before code, Red-Green-Refactor; no feature without test
- **III. Testing**: 80%+ coverage on `src/game/**`; integration + performance tests
- **IV. UX Consistency**: 1-frame input buffer, ghost AI per Dossier, classic Pac-Man feel
- **V. Performance**: 60fps target, ≤16ms frame time, ≤33ms input latency, object pooling

Read `.specify/memory/constitution.md` for the complete governance model.
