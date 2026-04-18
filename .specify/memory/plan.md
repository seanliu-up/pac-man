# Main Implementation Plan

**Last Updated**: 2026-04-18 | **Version**: 1.0.0

## Project Overview

Build a browser-based Pac-Man game in vanilla JavaScript + HTML5 Canvas with no server dependency. Game logic is pure JS (DOM-free) enabling full TDD coverage; thin Canvas renderer layer handles display. Vite provides dev/build tooling; Jest covers unit and integration tests; Playwright covers E2E input-latency and performance validation.

**Branch**: `001-init-web-game` [Source: specs/001-init-web-game]

---

## Technical Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | JavaScript ES2022 | Vanilla, no framework |
| Build Tool | Vite | 5.x |
| Unit/Integration Testing | Jest | 29.x |
| Canvas Mocking | jest-canvas-mock | Latest |
| E2E Testing | Playwright | 1.x |
| Storage | localStorage | Browser native |
| Rendering | HTML5 Canvas 2D API | Native |

---

## Primary Dependencies

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "jest": "^29.0.0",
    "jest-canvas-mock": "^2.5.0",
    "@playwright/test": "^1.44.0",
    "eslint": "^8.0.0"
  }
}
```

---

## Project Structure

### Source Code

```
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
│   ├── state/
│   │   ├── game-state.js    # Top-level session state (lives, score, level, phase)
│   │   ├── game-loop.js     # Fixed-timestep game loop, delta accumulator
│   │   └── tick.js          # Main game tick dispatcher
│   └── constants.js         # Game constants (tile size, maze dimensions, etc.)
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
├── integration/             # Player-game-state interactions
└── performance/             # Frame-budget assertions, input latency

index.html                   # Single canvas element, one module script tag
vite.config.js
jest.config.js
playwright.config.js
package.json
```

---

## Architecture Decision: Separation of Concerns

**Game logic** (`src/game/`) is strictly DOM-agnostic and tested via Jest. Canvas rendering (`src/rendering/`) is a pure output layer tested with jest-canvas-mock. This separation enforces Constitution Principles II (TDD) and III (>80% unit coverage).

---

## Performance Targets

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Frame rate | 60 fps steady state | Performance test suite + visual validation |
| Frame time | ≤16 ms per tick | Profiler gate in CI |
| Input latency | ≤33 ms end-to-end | Playwright integration test |
| Initial load time | ≤3 s on baseline device | Playwright load test |
| Peak memory | ≤256 MB | Runtime assertion |

---

## Testing Strategy

### Unit Tests (Jest)
- All game entities and systems: pure functions, no DOM/Canvas
- Coverage gate: `coverageThreshold: { global: { lines: 80, branches: 80 } }` on `src/game/**`
- Test modules: collision detection, movement, scoring, ghost AI, level progression

### Integration Tests (Jest)
- Player-game-state interactions: movement → state → score
- Collision sequences (dot eating, ghost contact, power pellet trigger)
- High score persistence to localStorage
- Test modules: game session flow, scoring flow, level flow

### Performance Tests (Playwright)
- Input latency: keypress to visual response ≤33ms
- Initial load time: page load to first playable state ≤3s
- Frame rate validation under normal gameplay conditions

---

## Configuration Files

### vite.config.js
- Dev server with HMR
- Production build to `dist/`
- Static file delivery from `index.html`

### jest.config.js
- `testEnvironment: 'jsdom'`
- Canvas mock for `src/rendering/**` tests
- Coverage threshold: 80% for game logic
- Exclude: `src/rendering/**` from coverage gate (tested by integration snapshots)

### playwright.config.js
- Chrome (Chromium) browser
- E2E timeout: 30s per test
- Performance test assertions on frame timing and input latency

---

## Constitution Compliance

✅ **Principle I**: Code quality — single responsibility, cyclomatic ≤10
✅ **Principle II**: TDD — tests before code, Red-Green-Refactor enforced
✅ **Principle III**: Testing — >80% coverage on game logic, integration + perf tests
✅ **Principle IV**: UX Consistency — 1-frame input buffer, Pac-Man Dossier ghost AI
✅ **Principle V**: Performance — 60fps target, object pooling for dots/pellets

---

## Build & Deployment

### Development
```bash
npm run dev          # Vite dev server + HMR
npm run test         # Jest unit + integration tests
npm test:coverage    # Jest with coverage report
npm run lint         # ESLint check
```

### Production
```bash
npm run build        # Vite production build to dist/
npm run preview      # Preview production build locally
```

Output: Single `dist/index.html` + bundled `dist/assets/*.js` and `dist/assets/*.css` (if applicable), ready for static file hosting.

---

## Known Issues & Gotchas

### Ghost AI (Inky's Target Calculation)
- Cyclomatic complexity: ~6 (medium risk)
- Mitigation: Extract vector-doubling helper function; keep within Constitution limit
- Source: Pac-Man Dossier v1.0.27 (Jamey Pittman)

### Game State Tick Dispatcher
- Cyclomatic complexity: ~8 (medium risk)
- Mitigation: Delegate game-logic operations to system functions; tick only dispatches
- Pattern: Single responsibility — tick coordinates, systems execute

### Canvas Rendering in Jest
- jest-canvas-mock stubs 2D context; cannot catch actual rendering bugs
- Mitigation: Manual playthrough of affected gameplay paths required for visual changes
- Pattern: Unit tests verify logic; integration tests verify state transitions; manual testing validates UX

---

## Next Steps & Future Phases

- **Phase 1 ✅**: Project setup, entities, US1 gameplay (completed)
- **Phase 2**: Additional features (US2-US4: power pellets, scoring, level progression)
- **Phase 3**: Polish & optimization (visual feedback, audio, mobile input)
- **Phase 4**: Performance validation & deployment
- **Phase 5+**: Potential future enhancements (out of v1 scope: fruit bonuses, custom mazes, online leaderboards)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-18 | 1.0.0 | Initial implementation plan merged to master |
