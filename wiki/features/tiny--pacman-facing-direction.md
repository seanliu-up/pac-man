# TinySpec: Pac-Man Facing Direction

> **Source**: [`specs/tiny/pacman-facing-direction.md`](../../specs/tiny/pacman-facing-direction.md) · [← Wiki Index](../index.md)

---

## Overview

Rotates the Pac-Man sprite to face its current movement direction. Previously the mouth always faced right regardless of movement — now UP/DOWN/LEFT/RIGHT directions each correspond to a canvas rotation so the mouth gap visually tracks where Pac-Man is heading. The mouth open/close animation continues unaffected.

## Specification

1. Moving RIGHT → mouth gap faces right (no visual change from before).
2. Moving LEFT → mouth gap faces left.
3. Moving UP → mouth gap faces up.
4. Moving DOWN → mouth gap faces down.
5. Direction NONE (before first move) → mouth faces right by default.
6. Mouth animation (open/close oscillation) is unaffected by direction.

## Implementation Plan

Add a `DIRECTION_ANGLE` map in `entity-renderer.js` (`RIGHT → 0`, `LEFT → π`, `UP → -π/2`, `DOWN → π/2`, `NONE → 0`). Wrap the Pac-Man draw call in `ctx.save()` / `ctx.translate(px, py)` / `ctx.rotate(angle)` / `ctx.restore()`, drawing the arc centered at `(0, 0)` relative to the translated origin.
