# Pac-Man Facing Direction

> **Source**: [`specs/tiny/`](../../specs/tiny/) · [← Wiki Index](../index.md)

---

## Overview

Rotates the Pac-Man sprite to face its current movement direction. Previously the mouth always faced right regardless of movement. Now UP/DOWN/LEFT/RIGHT directions each correspond to a canvas rotation so the mouth gap visually tracks where Pac-Man is heading. The mouth open/close animation continues unaffected.

## Specification

*(Sourced from [pacman-facing-direction.md](../../specs/tiny/pacman-facing-direction.md) — combined spec + plan)*

**Requirements:**
1. Moving RIGHT → mouth gap faces right (no visual change from before).
2. Moving LEFT → mouth gap faces left.
3. Moving UP → mouth gap faces up.
4. Moving DOWN → mouth gap faces down.
5. Direction NONE (before first move) → mouth faces right by default.
6. Mouth animation (open/close oscillation) is unaffected by direction.

## Implementation Plan

1. Add a `DIRECTION_ANGLE` map in `entity-renderer.js`: `RIGHT → 0`, `LEFT → π`, `UP → -π/2`, `DOWN → π/2`, `NONE → 0`.
2. Before drawing Pac-Man: `ctx.save()` → `ctx.translate(px, py)` → `ctx.rotate(angle)`.
3. Draw the Pac-Man arc centered at `(0, 0)` (coordinates relative to translated origin).
4. `ctx.restore()` to unset the transform.
