# Game Speed Controls

> **Merged view** — consolidates 2 related specs · [← Wiki Index](../../index.md)

---

## What this feature does

The game offers five speed presets (1×–5×) selectable with number keys 1–5 from the start menu or pause screen. All presets run at 5× their original base multiplier values, with preset 5 reaching 25× the original base speed. New sessions default to preset 1 (slowest) so players can start at a manageable pace and dial up from there. The active speed is shown as a passive label in the HUD and persisted in localStorage across sessions.

---

## Game Speed Controls

[spec source](../../../specs/002-speed-controls/)

Adds 5 discrete speed presets (1×–5×, default 5×) to the Pac-Man game. The multiplier is stored as `speedMultiplier` in `GameState` and applied at movement-compute time in `movement.js`, stacking multiplicatively on top of existing per-level base speeds. Speed is selectable via number keys 1–5 from the START and PAUSED screens, shown as a passive label in the HUD, and persisted in localStorage alongside the mute setting.

**Specification:**
- **Select Speed Before Playing (P1)**: Player opens the main menu, sees a speed selector with 5 options (1×–5×), chooses their preference; the next game starts at that speed. Default when no preference is saved is 5×.
- **Change Speed While Paused (P2)**: Player pauses mid-game, changes speed, resumes — all entities immediately move at the new speed. Speed control is inaccessible during active play to prevent accidental changes.
- **Speed Persists Across Sessions (P3)**: Previously saved speed is restored automatically on return; falls back to 5× if storage is unavailable or corrupted.

---

## TinySpec: Speed Presets 5× Faster, Default 1×

[spec source](../../../specs/tiny/speed-5x-1x-default.md)

All five speed presets run 5× faster than their previous values by applying a ×5 factor in the movement system. The default preset changes from 5 (fastest) to 1 (slowest) so new players start at a manageable pace. Preset labels 1–5 in the UI remain unchanged.

**Specification:**
- Preset 1 → entities move at 5× the original base speed (previously 1× base).
- Preset 5 → entities move at 25× the original base speed (previously 5× base).
- A new game with no saved preference starts at preset 1 (not preset 5).
- Stored preferences from previous sessions remain valid — a saved `3` still means preset 3 (now 15× base).
- HUD and speed selector continue to show labels 1–5 with no visual changes.

---

## Key user-facing outcomes

- Five speed presets (1×–5×) are available from both the start menu and the pause screen via number keys 1–5.
- All presets run 5× faster than the original implementation — preset 5 reaches 25× the original base speed.
- New players start at preset 1 (slowest) for a manageable initial experience.
- Previously saved speed preference is restored automatically on the next session.
- Speed is shown continuously in the HUD so players always know the active preset.
