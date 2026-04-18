# Data Model: Game Speed Controls

**Feature**: 002-speed-controls  
**Date**: 2026-04-18

## Entities

### SpeedPreset (value object — not persisted)

Represents one selectable speed option. There are exactly 5 instances, fixed at startup.

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `multiplier` | `number` (integer) | 1, 2, 3, 4, 5 | Scale factor applied to all entity base speeds |
| `label` | `string` | `'1×'`…`'5×'` | Display label shown in speed selector UI |

**Note**: SpeedPreset instances are derived constants — they are not stored in state or
localStorage. The selector renders them inline from `[1,2,3,4,5].map(n => ({ multiplier: n, label: `${n}×` }))`.

---

### SpeedSetting (persisted preference)

The player's chosen speed multiplier, persisted in `localStorage`.

| Field | Type | Default | Constraints |
|-------|------|---------|-------------|
| `speedMultiplier` | `number` (integer) | `5` | Must be 1–5 inclusive; values outside range fall back to `5` |

**Storage key**: `pacman.settings` (shared with mute setting)  
**Storage format**: JSON object `{ muted: boolean, speedMultiplier: number }`

**Example**:
```json
{ "muted": false, "speedMultiplier": 3 }
```

**Fallback behaviour**: If `speedMultiplier` is absent, not an integer, or outside 1–5, `getSpeedSetting()` returns `5` without throwing.

---

### GameState additions

`speedMultiplier` is added as a top-level field on the game state object returned by `createGameState`.

| Field | Type | Default | Source |
|-------|------|---------|--------|
| `speedMultiplier` | `number` (integer) | `5` | Parameter to `createGameState`; loaded from `StorageAdapter.getSpeedSetting()` in `main.js` |

**Lifecycle**:
- Initialised once in `main.js` from storage before the game loop starts.
- Updated in `tick.js` when the player presses a speed key (1–5) while on START or PAUSED screens.
- Persisted to storage on every update.
- **Not reset** by `resetLevel()` in `level.js` — the multiplier survives level transitions and (future) game restarts.

---

## State Transitions

```
SpeedSetting (localStorage)
        │ read once at startup
        ▼
GameState.speedMultiplier ──── updated by speed key input ────► localStorage (saved immediately)
        │
        │ read every tick
        ▼
movement.js: distance = entity.speed * speedMultiplier * dt
```

---

## StorageAdapter API additions

| Method | Signature | Behaviour |
|--------|-----------|-----------|
| `_getSettings()` | `() → object` | Private. Reads `pacman.settings`, parses JSON, returns `{}` on error |
| `getSpeedSetting()` | `() → number` | Returns stored `speedMultiplier` (1–5); falls back to `5` |
| `saveSpeedSetting()` | `(multiplier: number) → void` | Merges `{ speedMultiplier }` into existing settings |
| `saveMuteSetting()` | `(muted: boolean) → void` | **Fixed**: merges `{ muted }` instead of overwriting |

---

## InputManager API additions

| Field/Method | Type | Description |
|--------------|------|-------------|
| `_speedSelection` | `number \| null` | Set by keys `'1'`–`'5'`; consumed and cleared by `tick.js` |
| `getSpeedSelection()` | `() → number \| null` | Returns pending speed selection |
| `clearSpeedSelection()` | `() → void` | Clears the pending selection after consumption |
