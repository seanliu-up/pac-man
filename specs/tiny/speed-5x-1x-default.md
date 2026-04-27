# TinySpec: Speed Presets 5× Faster, Default 1×

**Branch**: `004-speed-1x-default`
**Date**: 2026-04-20
**Status**: done
**Complexity**: small

## What

All five speed presets run 5× faster than their current values by applying a ×5 factor in the movement system. The default preset changes from 5 (fastest) to 1 (slowest). Preset labels in the UI (1–5) remain unchanged.

## Context

| File | Role |
|------|------|
| `src/game/systems/movement.js` | Will be modified — apply `× 5` factor to `speedMultiplier` |
| `src/game/state/game-state.js` | Will be modified — change default `speedMultiplier` from `5` to `1` |
| `src/storage/storage.js` | Will be modified — change fallback/default from `5` to `1` |
| `tests/unit/movement.test.js` | Will be modified — update speed expectation values |
| `tests/unit/storage.test.js` | Will be modified — update default speed assertions |
| `tests/integration/speed-controls.test.js` | Will be modified — update default speed assertions |

## Requirements

1. At preset 1, entities move at 5× the original base speed (previously 1× base).
2. At preset 5, entities move at 25× the original base speed (previously 5× base).
3. A new game with no saved preference starts at preset 1 (not preset 5).
4. Stored preferences from previous sessions remain valid; a saved value of `3` still means preset 3 (now 15× base).
5. The HUD and speed selector UI continue to show labels 1–5 with no visual changes.

## Plan

1. In `movement.js` lines 24 and 53, change `state.speedMultiplier ?? 1` → `(state.speedMultiplier ?? 1) * 5`.
2. In `game-state.js` line 6, change `createGameState(speedMultiplier = 5)` → `createGameState(speedMultiplier = 1)`.
3. In `storage.js` `getSpeedSetting()`, change the fallback return value from `5` to `1`.

## Tasks

- [x] Update `movement.js`: multiply `speedMultiplier` by 5 in both `tickPacMan` and `tickGhosts`
- [x] Update `game-state.js`: change default parameter from `5` to `1`
- [x] Update `storage.js`: change `getSpeedSetting` fallback from `5` to `1`
- [x] Update `movement.test.js`: adjust expected distance values to account for ×5 factor
- [x] Update `storage.test.js`: assert default speed is `1`
- [x] Update `speed-controls.test.js`: assert new-game default is preset `1`
- [x] Run `npm test` — all tests pass

## Done When

- [x] All tasks checked off
- [x] `npm test` passes with no failures
- [ ] Manual check: new game launches at preset 1 and is noticeably faster than before
