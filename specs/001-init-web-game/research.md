# Research: Pac-Man Web Game

**Branch**: `001-init-web-game` | **Date**: 2026-04-18

## Decision 1: Game Framework

**Decision**: Vanilla JavaScript + HTML5 Canvas API (no game framework)

**Rationale**: Pac-Man is a deterministic, tile-based game with no physics engine requirement. A framework like Phaser.js (~1MB) would add a large dependency, a steep learning curve, and abstraction barriers that complicate unit testing. Vanilla JS + Canvas allows the game-logic layer to be pure JavaScript (no DOM/Canvas imports), fully satisfying Constitution Principle II (TDD) and III (>80% unit coverage).

**Alternatives considered**:
- **Phaser.js**: Full-featured HTML5 game framework with sprite management, input, and audio. Rejected — adds ~1MB dependency; game logic becomes coupled to framework objects, blocking unit tests without extensive mocking.
- **PixiJS**: Fast 2D WebGL renderer. Rejected — overkill for a tile-based game; same testability concerns.

---

## Decision 2: Build Tooling

**Decision**: Vite 5.x

**Rationale**: Vite provides instant dev-server HMR with ES modules (no build step during development), and bundles to a small static output for production. Zero config needed for a vanilla JS project with a single `index.html` entry point. Supports `import` statements natively in development, enabling module-level unit test isolation.

**Alternatives considered**:
- **No build tool (raw HTML + script tags)**: Rejected — ES module imports without a bundler break when running from `file://` in some browsers; no dev-server HMR.
- **Webpack**: Rejected — significantly more configuration overhead; slower HMR.
- **Parcel**: Viable, but Vite's ecosystem and speed are superior for this project size.

---

## Decision 3: Testing Stack

**Decision**: Jest 29 + jest-canvas-mock (unit/integration) + Playwright 1.x (E2E)

**Rationale**:
- **Jest**: Standard for JS unit and integration testing. `jest-canvas-mock` stubs the Canvas 2D context, enabling renderer tests without a real browser.
- **Coverage gate**: `jest --coverage` with `coverageThreshold: { global: { lines: 80, branches: 80 } }` on `src/game/**` enforces Constitution Principle III. Renderer code (`src/rendering/**`) is excluded from the 80% gate (tested by integration snapshots instead).
- **Playwright**: Used only for E2E — validating input latency (≤33ms) and initial load time (≤3s). These cannot be meaningfully tested in Jest because they require a real browser paint cycle.

**Alternatives considered**:
- **Vitest**: Vite-native test runner; faster cold start. Rejected — jest-canvas-mock is mature and well-maintained; Vitest canvas mocking is less stable as of 2026-Q1.
- **Cypress**: E2E alternative to Playwright. Rejected — Playwright has better performance measurement APIs.

---

## Decision 4: Ghost AI Algorithm

**Decision**: Implement per Pac-Man Dossier (Jamey Pittman) — tile-based targeting with per-ghost chase strategies

**Source**: Pac-Man Dossier v1.0.27 — the authoritative reverse-engineered technical specification.

**Key implementation facts**:

### Chase Mode Targets
| Ghost | Color | Chase Target |
|-------|-------|-------------|
| Blinky | Red | Pac-Man's current tile |
| Pinky | Pink | 4 tiles ahead of Pac-Man (with up-direction overflow bug preserved for authenticity) |
| Inky | Cyan | 2 tiles ahead of Pac-Man, then double the vector from Blinky to that tile |
| Clyde | Orange | Pac-Man's tile if distance > 8 tiles; own scatter corner if ≤8 tiles |

### Scatter Mode Corners (28×31 tile maze)
| Ghost | Scatter Corner |
|-------|---------------|
| Blinky | Top-right (tile 25, 0) |
| Pinky | Top-left (tile 2, 0) |
| Inky | Bottom-right (tile 27, 31) |
| Clyde | Bottom-left (tile 0, 31) |

### Scatter/Chase Cycle (Level 1)
| Phase | Duration |
|-------|---------|
| Scatter 1 | 7s |
| Chase 1 | 20s |
| Scatter 2 | 7s |
| Chase 2 | 20s |
| Scatter 3 | 5s |
| Chase 3 | 20s |
| Scatter 4 | 5s |
| Chase 4 | Indefinite |

Level 5+: scatter phases shorten to 5s/5s/5s; final chase is permanent.

### Frightened Mode
- Ghosts slow to ~50% speed; turn dark blue; flash as warning when ~2s remain
- At each junction, ghost selects a random non-reversing direction
- On collision: ghost switches to "eaten" mode (eyes only), returns to ghost house at high speed

### Movement Rules
- Tile-based: ghosts commit to a direction at tile centers
- No 180° reversal except when switching modes (scatter↔chase)
- At each intersection: evaluate all non-reversing directions, pick closest Manhattan distance to target tile
- Ghost house exit order: Pinky → Inky (after N dots) → Clyde (after M dots); Blinky starts outside

---

## Decision 5: Object Pooling Strategy

**Decision**: Pre-allocate all Dot and PowerPellet instances at maze initialization; use `collected` boolean flag to toggle visibility — no per-frame allocation.

**Rationale**: The maze has a fixed set of dots (244) and power pellets (4). Creating and destroying objects per collection would cause GC pressure, risking frame time spikes. Pre-allocation satisfies Constitution Principle V (no unbounded memory growth, pooling for frequent entities).

**Ghost pathfinding**: Ghost AI is O(4) direction selection at each tile center (evaluate up to 4 neighbors) — no heap allocation required per tick. BFS/A* is not needed for classic Pac-Man ghost behavior.

---

## Decision 6: Input Architecture

**Decision**: Input manager maintains a `pendingDirection` buffer; resolved against current tile alignment each game tick

**Rationale**: Constitution Principle IV requires 1-frame input buffering for corner turning. The input manager captures the most recent directional key/swipe and stores it as `pendingDirection`. Each tick, the movement system checks if Pac-Man can turn to `pendingDirection` from the current tile — if yes, it becomes `currentDirection`. This matches classic arcade feel.

**Touch controls**: Detect swipe direction on `touchend` using start/end coordinate delta (minimum 20px threshold). Map to the same 4 directional commands as keyboard.

---

## Decision 7: Audio

**Decision**: Web Audio API with preloaded AudioBuffer objects; mute toggle via `AudioContext.suspend()`

**Rationale**: Web Audio API is available in all target browsers without a library. Preloading buffers eliminates audio latency on first play. Suspending the context (vs. setting volume to 0) saves CPU and is the standard mute pattern.

**Sound events required**: dot-eat, ghost-eat, power-pellet, life-lost, level-complete, game-start, game-over.
