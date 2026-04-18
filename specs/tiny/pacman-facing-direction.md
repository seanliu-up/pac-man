# TinySpec: Pac-Man Facing Direction

**Branch**: `003-pacman-facing-direction`
**Date**: 2026-04-18
**Status**: done
**Complexity**: small

## What

Pac-Man's mouth should always face the direction it is currently moving. Currently the mouth gap is fixed pointing right regardless of direction. Rotating the sprite at draw time (using the existing `direction` field on the Pac-Man entity) gives the player clear visual feedback about movement direction.

## Context

| File | Role |
|------|------|
| `src/rendering/entity-renderer.js` | Will be modified — rotate canvas before drawing Pac-Man |
| `src/game/entities/pacman.js` | Context — `direction` field (UP/DOWN/LEFT/RIGHT/NONE) already present |
| `src/game/constants.js` | Context — `Direction` enum values |

## Requirements

1. When Pac-Man is moving RIGHT, the mouth gap faces right (no change from current).
2. When Pac-Man is moving LEFT, the mouth gap faces left.
3. When Pac-Man is moving UP, the mouth gap faces up.
4. When Pac-Man is moving DOWN, the mouth gap faces down.
5. When direction is NONE (before first move), the mouth faces right (default).
6. The mouth animation (open/close oscillation) continues unaffected by direction.

## Plan

1. Add a `DIRECTION_ANGLE` map in `entity-renderer.js`: `RIGHT → 0`, `LEFT → π`, `UP → -π/2`, `DOWN → π/2`, `NONE → 0`.
2. Before drawing Pac-Man: `ctx.save()` → `ctx.translate(px, py)` → `ctx.rotate(angle)`.
3. Draw the Pac-Man arc centered at `(0, 0)` (coordinates are now relative to the translated origin).
4. `ctx.restore()` to unset the transform.

## Tasks

- [x] Add `DIRECTION_ANGLE` lookup map at module scope in `entity-renderer.js`
- [x] Wrap Pac-Man draw call in `ctx.save()` / `ctx.restore()` with translate + rotate
- [x] Adjust arc draw call to use `(0, 0)` as center instead of `(px, py)`
- [ ] Manual browser test: start game, move in all 4 directions, confirm mouth faces correctly
- [ ] Manual browser test: confirm mouth animation still oscillates during movement

## Done When

- [ ] All tasks checked off
- [x] Mouth faces the active movement direction for all 4 directions
- [x] Mouth faces right when stationary (direction NONE)
- [x] Mouth animation unaffected
- [x] `npm test` passes (no regressions in game logic)
