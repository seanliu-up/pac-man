# Input Contract

**Module**: `src/input/input-manager.js`

## Overview

InputManager translates raw browser events (keyboard + touch) into a set of discrete game commands. Game logic never reads DOM events directly — it queries InputManager for the current state each tick.

## Interface

```javascript
// InputManager public API
class InputManager {
  // Returns the pending direction set by the most recent input event
  getPendingDirection(): Direction  // 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null

  // Returns true if pause was toggled since last clearPause() call
  isPausePressed(): boolean

  // Clears the pause flag after it has been consumed by game logic
  clearPause(): void

  // Must be called once to attach event listeners to the document
  init(): void

  // Removes event listeners (for cleanup / testing)
  destroy(): void
}
```

## Keyboard Mapping

| Key(s) | Game Command |
|--------|-------------|
| `ArrowUp`, `W`, `w` | `UP` |
| `ArrowDown`, `S`, `s` | `DOWN` |
| `ArrowLeft`, `A`, `a` | `LEFT` |
| `ArrowRight`, `D`, `d` | `RIGHT` |
| `P`, `p`, `Escape` | Toggle pause |
| `M`, `m` | Toggle mute (forwarded to AudioManager) |

## Touch / Swipe Mapping

Swipe detection on `touchstart` + `touchend` events:

| Condition | Game Command |
|-----------|-------------|
| `|dx| > |dy|` and `dx > 20px` | `RIGHT` |
| `|dx| > |dy|` and `dx < -20px` | `LEFT` |
| `|dy| > |dx|` and `dy > 20px` | `DOWN` |
| `|dy| > |dx|` and `dy < -20px` | `UP` |
| Delta < 20px in both axes | No command (tap ignored) |

## Buffering Semantics

- `getPendingDirection()` returns the **most recent** directional command received since the last time the movement system resolved it.
- The movement system calls `getPendingDirection()` each tick; if the pending direction is passable, it is applied and `pendingDirection` is cleared internally.
- If two directional inputs arrive in the same tick, the last one wins (last-write-wins on a single field).
- This provides the 1-frame input buffer required by Constitution Principle IV.

## Constraints

- InputManager MUST NOT import from `src/game/` (no circular dependency).
- InputManager MUST NOT call Canvas APIs.
- Event listeners MUST be attached to `document` (not a specific element) to capture input regardless of focus.
- Default browser scroll behavior for arrow keys MUST be suppressed (`event.preventDefault()`) while the game is in `PLAYING` or `PAUSED` phase.
