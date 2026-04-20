# Game Speed Controls

> **Source**: [`specs/002-speed-controls/`](../../specs/002-speed-controls/) · [← Wiki Index](../index.md)

---

## Overview

Adds 5 discrete speed presets (1×–5×, default 5×) to the Pac-Man game. The multiplier is stored as `speedMultiplier` in `GameState` and applied at movement-compute time in `movement.js`, stacking multiplicatively on top of existing per-level base speeds. Speed is selectable via number keys 1–5 from the START and PAUSED screens, shown as a passive label in the HUD, and persisted in localStorage alongside the mute setting.

## Specification

1. **Select Speed Before Playing (P1)**: Player opens the main menu, sees a speed selector with 5 options (1×–5×), chooses their preference; the next game starts at that speed. Default when no preference is saved is 5×.
2. **Change Speed While Paused (P2)**: Player pauses mid-game, changes speed, resumes — all entities immediately move at the new speed. Speed control is inaccessible during active play to prevent accidental changes.
3. **Speed Persists Across Sessions (P3)**: Previously saved speed is restored automatically on return; falls back to 5× if storage is unavailable or corrupted.

→ [View full spec](../../specs/002-speed-controls/spec.md)

## Implementation Plan

Touches 7 existing files (~180 lines added/changed, no new source files). `StorageAdapter` gains a `_getSettings()` read-modify-write helper and `getSpeedSetting()`/`saveSpeedSetting()` methods. `GameState` receives a `speedMultiplier` field; `MovementSystem` applies `× state.speedMultiplier` per tick. `InputManager` maps number keys 1–5 to a `_speedSelection` buffer; `tick.js` consumes it in START and PAUSED phases. `UIRenderer` adds a `_drawSpeedRow()` helper used in both the HUD and overlay screens.

→ [View full plan](../../specs/002-speed-controls/plan.md)

## Additional Docs

- [data-model.md](../../specs/002-speed-controls/data-model.md)
- [quickstart.md](../../specs/002-speed-controls/quickstart.md)
- [research.md](../../specs/002-speed-controls/research.md)
- [tasks.md](../../specs/002-speed-controls/tasks.md)
- [checklists/requirements.md](../../specs/002-speed-controls/checklists/requirements.md)
