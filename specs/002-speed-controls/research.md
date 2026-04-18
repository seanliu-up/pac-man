# Research: Game Speed Controls

**Feature**: 002-speed-controls  
**Date**: 2026-04-18

## Decision 1: Where to Apply the Speed Multiplier

**Decision**: Apply `state.speedMultiplier` at movement-compute time in `movement.js`, not at entity-spawn time.

**Rationale**: Entity speed values (`pacman.speed`, `ghost.speed`) are set by the level system from
`DIFFICULTY` constants in `level.js` (e.g. `pacmanSpeed: 0.80` for level 1). Applying the multiplier
at entity creation would require re-spawning or patching entities whenever the setting changes (e.g.
after a pause-menu change). Computing `distance = entity.speed * state.speedMultiplier * dt` at tick
time is a single arithmetic change that:

- Automatically covers all entity types (Pac-Man, all four ghosts in all modes)
- Covers frightened ghosts without any extra logic (`ghost.speed` is used for frightened movement
  too — there is no separate `frightenedSpeed` field)
- Preserves per-level difficulty progression: at level 2, ghost base speed is 0.85; at multiplier 5×
  it becomes 4.25 tiles/sec — the relative ratios across levels are unchanged (FR-010)
- Applies immediately on resume (SC-003) because each tick reads `state.speedMultiplier` live

**Alternatives considered**:
- Multiply entity speed on `resetLevel` / entity creation → discarded: requires re-patching on
  mid-game change; brittle when level resets
- Store effective speed on entity (`entity.effectiveSpeed`) → discarded: adds a derived field that
  can drift out of sync with `state.speedMultiplier`

---

## Decision 2: Settings Persistence Strategy

**Decision**: Use a read-modify-write pattern in `StorageAdapter`. A private `_getSettings()` helper
reads and parses the existing `pacman.settings` JSON; `saveMuteSetting` and the new `saveSpeedSetting`
both merge into that object before writing.

**Rationale**: The existing `saveMuteSetting` writes `{ muted: !!muted }` — it overwrites the entire
settings key, silently destroying any fields added by other callers. If we add `speedMultiplier` to
the same key without fixing this, saving the mute toggle will erase the speed preference and vice
versa. The merge pattern prevents this class of bug for all future settings additions as well.

**Alternatives considered**:
- Separate localStorage key (`pacman.speed`) → discarded: proliferates keys unnecessarily; spec
  explicitly states "stored alongside existing mute setting"
- Pass full settings object to `saveMuteSetting` → discarded: changes the external API in a
  backward-incompatible way; callers (main.js) would need updating

---

## Decision 3: GameState Initialization

**Decision**: `createGameState(speedMultiplier = 5)` — accepts an optional parameter with a default
of 5. `main.js` reads the stored preference and passes it in. The field persists across tick calls
because the game loop reuses the same state object for its lifetime.

**Rationale**: The game loop in `game-loop.js` calls `onTick(gameState, dt)` every frame using the
same `gameState` reference. No code reconstructs `gameState` during a session. `speedMultiplier`
therefore persists automatically throughout a play session once set. Future work (game-restart flow)
should preserve `speedMultiplier` by reading from storage when creating a new state.

**Alternatives considered**:
- Hard-code `speedMultiplier: 5` in `createGameState` and patch it in main.js after creation →
  discarded: two-step initialization is more error-prone than a clean constructor parameter

---

## Decision 4: Input — Number Keys 1–5

**Decision**: Add `_speedSelection: null` to `InputManager`. Keys `'1'`–`'5'` set it. Provide
`getSpeedSelection()` and `clearSpeedSelection()`. Consume in `tick.js` during `START` and `PAUSED`
phases only (not during `PLAYING` — FR-003/FR-004 restriction: speed not accessible mid-play).

**Rationale**: Number keys 1–5 are unambiguous, map naturally to the 5 presets, and match the
existing keyboard-native UX (M=mute, P=pause, WASD/arrows=movement). Discarding key presses during
`PLAYING` phase satisfies FR-003/FR-004/US2-AC3 without extra logic — the input is simply never
consumed in that phase.

**Alternatives considered**:
- Arrow-key navigation within the speed selector → discarded: conflicts with movement input during
  the START phase (arrow keys also start the game)
- Click/tap targets on canvas → out of scope per spec assumptions; keyboard-native approach matches
  existing controls model

---

## Decision 5: UI — Speed Selector in Canvas Overlays

**Decision**: Add `_drawSpeedRow(ctx, speedMultiplier, y)` helper to `UIRenderer`. The method renders
5 labels (`1×`–`5×`) horizontally at `y`, with the selected preset highlighted in yellow and the
others in grey. Extend `_drawStart` and `_drawPaused` to accept `speedMultiplier`, add a speed row to
their overlay, and instruct players to press 1–5. Add a compact `SPD:N×` label in the HUD (second
line, right-aligned, 10 px font).

**Rationale**: All existing UI is canvas-rendered; adding HTML elements would break visual
consistency. The `_drawOverlay` helper already handles multi-line overlays; adding a speed row as an
extra rendering call after the text overlay is the minimal change that satisfies FR-007 (visual
highlighting) without restructuring the overlay system.

**Alternatives considered**:
- Single line `SPEED: 5×` with no per-option highlighting → discarded: violates FR-007 (active
  selection must be visually highlighted)
- HTML `<input type="range">` or radio buttons → discarded: inconsistent with canvas-first design;
  requires CSS and DOM event plumbing not present in the project
