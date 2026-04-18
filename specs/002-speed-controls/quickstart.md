# Quickstart: Implementing Game Speed Controls

**Feature**: 002-speed-controls  
**Date**: 2026-04-18  
**Prerequisite**: Read `plan.md`, `research.md`, and `data-model.md` first.

All steps follow strict TDD: write failing tests first, then implement the minimum code to pass.

---

## Step 1 — StorageAdapter: settings merge + speed methods

**File**: `src/storage/storage.js`  
**Test file**: `tests/unit/storage.test.js` (extend existing)

### What to add

1. **`_getSettings()`** — private helper. Reads `pacman.settings` from the store, parses JSON, returns
   `{}` on any error. Used by all save methods.

2. **`getSpeedSetting()`** — reads `_getSettings().speedMultiplier`. Returns the value if it is an
   integer in `[1, 5]`, otherwise returns `5`.

3. **`saveSpeedSetting(multiplier)`** — calls `_getSettings()`, spreads the result, adds
   `{ speedMultiplier: multiplier }`, writes back via `setItem`.

4. **Fix `saveMuteSetting(muted)`** — replace the current overwrite with a merge:
   `JSON.stringify({ ...this._getSettings(), muted: !!muted })`.

### Key tests to write first

```js
// getSpeedSetting returns 5 when no preference stored
// getSpeedSetting returns stored value (1–5)
// getSpeedSetting returns 5 for value outside range (0, 6, 'fast')
// getSpeedSetting returns 5 for corrupt JSON
// saveSpeedSetting persists value readable by getSpeedSetting
// saveSpeedSetting(3) does not overwrite existing muted:true
// saveMuteSetting(true) does not overwrite existing speedMultiplier:3
```

---

## Step 2 — GameState: add speedMultiplier field

**File**: `src/game/state/game-state.js`  
**Test impact**: existing tests unaffected (new optional param with default)

### What to change

Change `createGameState()` signature to `createGameState(speedMultiplier = 5)` and add
`speedMultiplier` to the returned object:

```js
export function createGameState(speedMultiplier = 5) {
  return {
    // ... existing fields ...
    speedMultiplier,
  };
}
```

No test changes needed for this step — existing tests construct state without argument and should
still pass with `speedMultiplier: 5` present as an extra field. Add a focused unit test confirming
default = 5 and param override.

---

## Step 3 — MovementSystem: apply multiplier

**File**: `src/game/systems/movement.js`  
**Test file**: `tests/unit/movement.test.js` (extend existing)

### What to change

In both `tickEntity` and `tickPacMan`, apply the multiplier when computing distance:

```js
// tickEntity (line 23 area):
const distance = entity.speed * (state.speedMultiplier ?? 1) * dt;

// tickPacMan (line 52 area):
const distance = pacman.speed * (state.speedMultiplier ?? 1) * dt;
```

No other changes needed. The sub-tile accumulator and tile-crossing logic are multiplier-agnostic.

### Key tests to write first

```js
// at multiplier=1, distance per tick matches entity.speed * dt (baseline)
// at multiplier=5, distance per tick is exactly 5× the multiplier=1 distance
// at multiplier=3, ghost speed (0.75) scales to 2.25 tiles/sec
// pacman and ghost speeds preserve their relative ratio at any multiplier
// level-stack: level 2 ghost (0.85) × multiplier 2 = 1.70 tiles/sec
// state without speedMultiplier field (undefined) defaults to ×1 (nullish fallback)
```

---

## Step 4 — InputManager: number-key 1–5 for speed

**File**: `src/input/input-manager.js`  
**Test approach**: unit tests via direct `_onKeyDown` calls

### What to add

```js
// In constructor:
this._speedSelection = null;

// New constant:
const SPEED_KEYS = new Set(['1','2','3','4','5']);

// In _onKeyDown, before direction check:
if (SPEED_KEYS.has(e.key)) {
  this._speedSelection = parseInt(e.key, 10);
  return;
}

// New public methods:
getSpeedSelection() { return this._speedSelection; }
clearSpeedSelection() { this._speedSelection = null; }
```

### Key tests to write first

```js
// pressing '3' sets getSpeedSelection() to 3
// pressing '1' and '5' set correct values
// pressing 'a' (direction key) does not affect _speedSelection
// clearSpeedSelection sets getSpeedSelection() to null
// speed keys do not set _pendingDirection
```

---

## Step 5 — tick.js: consume speed input in START + PAUSED phases

**File**: `src/game/state/tick.js`  
**Test file**: `tests/integration/speed-controls.test.js` (new)

### What to add

Add a private helper at the bottom of the file:

```js
function _handleSpeedInput(state, input, storage) {
  const sel = input.getSpeedSelection?.();
  if (!sel) return;
  state.speedMultiplier = sel;
  storage?.saveSpeedSetting?.(sel);
  input.clearSpeedSelection?.();
}
```

Call it at the start of the `START` and `PAUSED` case blocks (before checking start/pause presses).

Do **not** call it during `PLAYING` — speed changes mid-action are explicitly excluded (FR-003/FR-004,
US2-AC3).

### Key integration tests to write first

```js
// US1-AC1: START phase — speed input updates state.speedMultiplier
// US1-AC2: selecting 1× → speedMultiplier becomes 1
// US1-AC3: selecting 5× → speedMultiplier becomes 5
// US1-AC4: no stored preference → default speedMultiplier is 5
// US2-AC1: PAUSED phase — speed input updates state.speedMultiplier
// US2-AC2: change during pause → movement uses new multiplier on resume
// US2-AC3: PLAYING phase — speed key ignored (multiplier unchanged)
// US3-AC1: speed change saved to storage
// US3-AC3: corrupt storage → getSpeedSetting returns 5
// edge: rapid key presses — last selection wins
```

---

## Step 6 — UIRenderer: HUD label + speed selector overlays

**File**: `src/rendering/ui-renderer.js`  
**Test approach**: jest-canvas-mock; verify `fillText` calls with correct content/color

### What to add

#### 6a — `_drawSpeedRow(ctx, speedMultiplier, y)`

New helper. Renders 5 labels (`1×`–`5×`) evenly spaced across the horizontal center of the canvas.
Selected label uses `'#ffff00'` (yellow) and `'bold 14px monospace'`; others use `'#888'` and
`'14px monospace'`.

#### 6b — Update `_drawHUD`

Change signature to destructure `speedMultiplier` from state:

```js
_drawHUD(ctx, { score, lives, level, speedMultiplier }) {
  // ... existing SCORE/LEVEL/LIVES rendering ...
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`SPD:${speedMultiplier}×`, CANVAS_W - 8, HUD_Y + 24);
}
```

#### 6c — Update `_drawStart` and `_drawPaused`

Change signatures to accept `speedMultiplier`. Add speed instruction text to the overlay lines, then
call `_drawSpeedRow` after the overlay:

```js
_drawStart(ctx, speedMultiplier) {
  this._drawOverlay(ctx, [
    { text: 'PAC-MAN', color: '#ffff00', font: 'bold 22px monospace' },
    { text: 'Arrow keys / WASD to move' },
    { text: 'Eat all the dots! Avoid the ghosts.' },
    { text: 'SPEED (press 1–5):', color: '#aaa', font: '13px monospace' },
    { text: '' }, // spacer for speed row
    { text: 'Press ENTER or any arrow key to start', color: '#aaa', font: '13px monospace' },
  ]);
  // Draw speed row over the spacer line position
  const rowY = /* calculated offset for the spacer line */;
  this._drawSpeedRow(ctx, speedMultiplier, rowY);
}
```

Adjust `_drawPaused` similarly with "PAUSED", speed row, and "Press P to Resume".

#### 6d — Update `draw` method

Pass `state.speedMultiplier` to the affected methods:

```js
draw(ctx, state) {
  this._drawHUD(ctx, state);
  switch (state.phase) {
    case GamePhase.START:  this._drawStart(ctx, state.speedMultiplier); break;
    case GamePhase.PAUSED: this._drawPaused(ctx, state.speedMultiplier); break;
    // ... existing cases unchanged ...
  }
}
```

### Key tests to write first

```js
// _drawHUD renders 'SPD:5×' when speedMultiplier=5
// _drawHUD renders 'SPD:1×' when speedMultiplier=1
// _drawStart calls fillText with '5×' in yellow when speedMultiplier=5
// _drawStart calls fillText with '1×' in grey when speedMultiplier=5
// _drawPaused shows highlighted selected preset
```

---

## Step 7 — main.js: wire up storage → state

**File**: `src/main.js`  
**Test approach**: manual browser smoke test (no Jest for main.js)

### What to change

```js
const initialSpeedMultiplier = storage.getSpeedSetting();
const gameState = createGameState(initialSpeedMultiplier);
```

Also pass `onSpeedChange` callback to InputManager if mute-toggle pattern is followed (optional —
the current design handles speed in tick.js so no callback is needed here).

---

## Step 8 — Manual browser verification

Per Constitution IV (game-logic changes require manual playthrough):

1. `npm run dev` → open browser at `http://localhost:5173`
2. Start screen: verify speed selector shows `[5×]` highlighted by default
3. Press `2`: verify `2×` is now highlighted
4. Press ENTER: verify game starts at noticeably slower speed than 5×
5. Pause: verify speed selector shows in pause menu with `2×` highlighted
6. Press `5`: verify `5×` highlighted; resume → game is visibly faster
7. Verify HUD shows `SPD:5×` during gameplay
8. Close and reopen tab: verify game starts at `5×` (last saved setting)
9. Verify `1×` and `5×` at level boundary transitions — speed scaling carries through

---

## Files Modified Summary

| File | Change |
|------|--------|
| `src/storage/storage.js` | `_getSettings()`, `getSpeedSetting()`, `saveSpeedSetting()`, fix `saveMuteSetting()` |
| `src/game/state/game-state.js` | `speedMultiplier` parameter + field |
| `src/game/systems/movement.js` | `× state.speedMultiplier` in both tick methods |
| `src/input/input-manager.js` | `_speedSelection`, keys 1–5, two new methods |
| `src/game/state/tick.js` | `_handleSpeedInput()`, call from START + PAUSED |
| `src/rendering/ui-renderer.js` | `_drawSpeedRow()`, HUD label, updated overlays |
| `src/main.js` | `getSpeedSetting()`, pass to `createGameState` |

| Test File | Type |
|-----------|------|
| `tests/unit/storage.test.js` | Extended |
| `tests/unit/movement.test.js` | Extended |
| `tests/integration/speed-controls.test.js` | New |
