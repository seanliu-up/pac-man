# Tasks: Game Speed Controls

**Feature**: 002-speed-controls  
**Input**: Design documents from `/specs/002-speed-controls/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. TDD is mandatory per Constitution II — write failing tests before each implementation step.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Which user story (US1, US2, US3) — omitted for setup/foundational/polish phases
- Include exact file paths in all descriptions

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before any changes

- [ ] T001 Run `npm test` and confirm all existing tests pass as the pre-feature baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: StorageAdapter merge fix and GameState `speedMultiplier` field — both are prerequisites for every user story

**⚠️ CRITICAL**: No user story implementation begins until this phase is complete

- [ ] T002 Write failing unit tests for `_getSettings()` parse/error return value and `saveMuteSetting()` merge-not-overwrite behavior in `tests/unit/storage.test.js`
- [ ] T003 Add `_getSettings()` private helper to `src/storage/storage.js` and fix `saveMuteSetting()` to merge `{ muted }` into existing settings rather than overwrite (makes T002 pass)
- [ ] T004 Write failing unit test confirming `createGameState()` default `speedMultiplier` is `5` and that a passed value overrides the default in `tests/unit/game-state.test.js`
- [ ] T005 Add `speedMultiplier = 5` optional parameter to `createGameState()` and include `speedMultiplier` in the returned state object in `src/game/state/game-state.js` (makes T004 pass)

**Checkpoint**: StorageAdapter merge is safe; `GameState` carries `speedMultiplier`. User story work can begin.

---

## Phase 3: User Story 1 — Select Game Speed Before Playing (Priority: P1) 🎯 MVP

**Goal**: Player selects a speed preset (1×–5×) on the start screen using number keys 1–5; all entities move at the selected multiplier; HUD shows `SPD:N×` during gameplay.

**Independent Test**: Open the game (no saved pref), confirm default is 5×. Press `2`, press ENTER, confirm entities move at 2× speed and HUD displays `SPD:2×`.

### Tests for User Story 1 (TDD — write and confirm FAIL before implementing)

- [ ] T006 [P] [US1] Write failing unit tests for `tickEntity`/`tickPacMan` multiplier scaling (multiplier=1 baseline, multiplier=5 distance, level-stack at multiplier=2, undefined state fallback to ×1) in `tests/unit/movement.test.js`
- [ ] T007 [P] [US1] Write failing unit tests for InputManager speed keys `1`–`5` setting `getSpeedSelection()`, direction keys not affecting `_speedSelection`, and `clearSpeedSelection()` resetting to null in `tests/unit/input-manager.test.js`
- [ ] T008 [P] [US1] Create `tests/integration/speed-controls.test.js` with failing US1 scenarios: START phase selects 1×/5×, PLAYING phase ignores speed keys, default `speedMultiplier` is 5

### Implementation for User Story 1

- [ ] T009 [P] [US1] Apply `* (state.speedMultiplier ?? 1)` in both `tickEntity` and `tickPacMan` distance calculations in `src/game/systems/movement.js` (makes T006 pass)
- [ ] T010 [P] [US1] Add `_speedSelection = null` field, keys `1`–`5` handler (`parseInt(e.key, 10)` sets it), `getSpeedSelection()`, and `clearSpeedSelection()` to `src/input/input-manager.js` (makes T007 pass)
- [ ] T011 [P] [US1] Add `_drawSpeedRow(ctx, speedMultiplier, y)` helper that renders labels `1×`–`5×` horizontally with selected preset in yellow `#ffff00` `bold 14px monospace` and others in grey `#888` `14px monospace` in `src/rendering/ui-renderer.js`
- [ ] T012 [US1] Add `_handleSpeedInput(state, input, storage)` private function (reads `getSpeedSelection`, updates `state.speedMultiplier`, calls `storage?.saveSpeedSetting?.(sel)`, calls `clearSpeedSelection`) and invoke it at the top of the `START` phase case block in `src/game/state/tick.js`
- [ ] T013 [US1] Update `_drawHUD()` to destructure `speedMultiplier` from state and render `SPD:N×` (right-aligned, 10px monospace, `#aaa`) and update `_drawStart(ctx, speedMultiplier)` to add a speed instruction line and call `_drawSpeedRow` in `src/rendering/ui-renderer.js`
- [ ] T014 [US1] Update `draw(ctx, state)` to pass `state.speedMultiplier` to `_drawStart` and verify `_drawHUD` receives the full state object in `src/rendering/ui-renderer.js`

**Checkpoint**: US1 fully functional — start screen shows 5-preset speed selector, keys 1–5 change multiplier, all entities obey multiplier, HUD shows active speed.

---

## Phase 4: User Story 2 — Change Speed While Paused (Priority: P2)

**Goal**: Player pauses mid-game, changes speed preset, resumes, and entities immediately move at the new speed. Speed keys are ignored during active play.

**Independent Test**: Start game, press P to pause, press `3`, press P to resume, confirm entities move at 3× and HUD shows `SPD:3×`.

### Tests for User Story 2

- [ ] T015 [US2] Add failing integration tests for US2 scenarios to `tests/integration/speed-controls.test.js`: PAUSED phase accepts speed keys and updates `state.speedMultiplier`, PLAYING phase ignores speed keys (US2-AC3 guard)

### Implementation for User Story 2

- [ ] T016 [P] [US2] Call `_handleSpeedInput()` at the top of the `PAUSED` phase case block in `src/game/state/tick.js`
- [ ] T017 [P] [US2] Update `_drawPaused(ctx, speedMultiplier)` to accept `speedMultiplier` and call `_drawSpeedRow`, then update `draw()` to pass `state.speedMultiplier` in the `PAUSED` case in `src/rendering/ui-renderer.js`

**Checkpoint**: US2 fully functional — pause menu shows speed selector, changing speed while paused takes effect immediately on resume; PLAYING phase blocks speed changes.

---

## Phase 5: User Story 3 — Speed Preference Persists Across Sessions (Priority: P3)

**Goal**: Player's chosen speed preset is saved to `localStorage` (merged into `pacman.settings`) and automatically restored on the next session; corrupt or missing data silently falls back to 5×.

**Independent Test**: Set speed to 3×, close and reopen browser tab, start game, confirm it runs at 3× without any user interaction.

### Tests for User Story 3

- [ ] T018 [P] [US3] Write failing unit tests for `getSpeedSetting()` (no pref → 5, valid values 1–5, out-of-range value → 5, corrupt JSON → 5) and `saveSpeedSetting(3)` not overwriting existing `muted:true` in `tests/unit/storage.test.js`
- [ ] T019 [P] [US3] Add failing integration tests for US3 scenarios to `tests/integration/speed-controls.test.js`: saved preference 3× is restored on load, fresh-install default is 5×, corrupt storage falls back to 5×

### Implementation for User Story 3

- [ ] T020 [US3] Add `getSpeedSetting()` (reads `_getSettings().speedMultiplier`, validates integer 1–5, returns 5 on any failure) and `saveSpeedSetting(multiplier)` (merge-writes `{ speedMultiplier }` via `_getSettings()`) to `src/storage/storage.js` (makes T018 pass)
- [ ] T021 [US3] Call `storage.getSpeedSetting()` to obtain `initialSpeedMultiplier` and pass it to `createGameState(initialSpeedMultiplier)` in `src/main.js` (makes T019 pass)

**Checkpoint**: US3 fully functional — speed preference persists across browser sessions; falls back to 5× on first visit or corrupted data.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T022 Run `npm test` and confirm all new and existing tests pass with ≥80% coverage on `src/game/**`
- [ ] T023 Manual browser verification per quickstart.md steps 1–9: `npm run dev`, verify start-screen selector default 5×, test presets 1×/2×/5×, HUD label, pause-menu selector, speed change takes effect on resume, persistence across tab close/reopen, level-transition speed scaling
- [ ] T024 [P] Run `npm run test:e2e` to confirm ≥60fps frame rate is maintained at all 5 speed presets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 3 completion (`_handleSpeedInput` and `_drawSpeedRow` must exist)
- **US3 (Phase 5)**: Depends on Phase 2 completion — can proceed in parallel with US2 if staffed, as `_handleSpeedInput` uses optional chaining (`storage?.saveSpeedSetting?.()`)
- **Polish (Phase 6)**: All desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational only — no story dependencies
- **US2 (P2)**: After US1 — reuses `_handleSpeedInput()` and `_drawSpeedRow()` built in US1
- **US3 (P3)**: After Foundational — independent of US1/US2 implementation order

### Within Each User Story

- Write failing tests **first** — confirm they are red before any implementation code
- Parallel [P] tests can be written simultaneously
- Parallel [P] implementations touch different files and can proceed concurrently
- Sequential (no [P]) tasks within a file must complete in order

### Parallel Opportunities

- **T006, T007, T008**: All write different test files — do in one pass
- **T009, T010, T011**: `movement.js`, `input-manager.js`, `ui-renderer.js` — implement simultaneously
- **T016, T017**: `tick.js` PAUSED case + `ui-renderer.js` PAUSED overlay — different files
- **T018, T019**: `storage.test.js` + `speed-controls.test.js` — different test files
- **T022, T024**: Jest suite + Playwright E2E — run concurrently

---

## Parallel Example: User Story 1

```bash
# Step 1 — Write all US1 failing tests simultaneously:
Task T006: movement multiplier tests  →  tests/unit/movement.test.js
Task T007: InputManager speed key tests  →  tests/unit/input-manager.test.js
Task T008: create integration test file  →  tests/integration/speed-controls.test.js

# Step 2 — Confirm all three test sets are RED, then implement in parallel:
Task T009: apply multiplier  →  src/game/systems/movement.js
Task T010: add speed keys    →  src/input/input-manager.js
Task T011: add _drawSpeedRow →  src/rendering/ui-renderer.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Verify baseline
2. Phase 2: StorageAdapter merge fix + GameState extension
3. Phase 3: US1 complete — speed selection on start screen, entity multiplier, HUD label
4. **STOP AND VALIDATE**: Manual browser test, `npm test`, `npm run test:e2e`
5. Ship MVP if needed

### Incremental Delivery

1. Phase 1+2 → Foundation ready
2. Phase 3 (US1) → Test independently → **Ship MVP**
3. Phase 4 (US2) → Test independently → Ship
4. Phase 5 (US3) → Test independently → Ship
5. Phase 6 → Full coverage + performance validation

---

## Notes

- `[P]` tasks touch different files with no incomplete prerequisites — safe to execute in parallel
- `[USn]` label maps each task to its user story for traceability
- No label = setup, foundational, or polish (no story association)
- Constitution II: every implementation task requires a preceding failing test
- Constitution III: ≥80% coverage on `src/game/**` verified in T022
- `_handleSpeedInput` uses `storage?.saveSpeedSetting?.()` — safe to implement before US3 is done
- No new source files — all changes are modifications to the 7 files listed in plan.md
