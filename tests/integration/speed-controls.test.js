import { createGameState } from '../../src/game/state/game-state.js';
import { tickGame } from '../../src/game/state/tick.js';
import { StorageAdapter } from '../../src/storage/storage.js';
import { GamePhase } from '../../src/game/constants.js';

function makeStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => data[k] ?? null,
    setItem: (k, v) => { data[k] = v; },
    removeItem: k => { delete data[k]; },
    _data: data,
  };
}

function stubSpeedInput(speedSelection = null, pause = false) {
  return {
    getPendingDirection: () => null,
    clearPendingDirection: () => {},
    isPausePressed: () => pause,
    clearPause: () => {},
    getSpeedSelection: () => speedSelection,
    clearSpeedSelection: () => {},
  };
}

function stubAudio() { return { play: () => {} }; }

describe('US1 — speed selection on start screen (T008)', () => {
  test('START phase: pressing 1 sets speedMultiplier to 1', () => {
    const state = createGameState();
    tickGame(state, 1 / 60, stubSpeedInput(1), stubAudio(), null);
    expect(state.speedMultiplier).toBe(1);
  });

  test('START phase: pressing 5 keeps speedMultiplier at 5', () => {
    const state = createGameState();
    tickGame(state, 1 / 60, stubSpeedInput(5), stubAudio(), null);
    expect(state.speedMultiplier).toBe(5);
  });

  test('PLAYING phase: speed keys are ignored', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.speedMultiplier = 3;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubSpeedInput(1), stubAudio(), null);
    expect(state.speedMultiplier).toBe(3);
  });

  test('default speedMultiplier is 5', () => {
    const state = createGameState();
    expect(state.speedMultiplier).toBe(5);
  });
});

describe('US2 — change speed while paused (T015)', () => {
  test('PAUSED phase: pressing 3 sets speedMultiplier to 3', () => {
    const state = createGameState();
    state.phase = GamePhase.PAUSED;
    tickGame(state, 1 / 60, stubSpeedInput(3), stubAudio(), null);
    expect(state.speedMultiplier).toBe(3);
  });

  test('PAUSED phase: pressing 1 sets speedMultiplier to 1', () => {
    const state = createGameState();
    state.phase = GamePhase.PAUSED;
    tickGame(state, 1 / 60, stubSpeedInput(1), stubAudio(), null);
    expect(state.speedMultiplier).toBe(1);
  });

  test('PLAYING phase does not process speed keys (US2-AC3 guard)', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.speedMultiplier = 4;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubSpeedInput(2), stubAudio(), null);
    expect(state.speedMultiplier).toBe(4);
  });
});

describe('US3 — speed preference persists across sessions (T019)', () => {
  test('saved preference 3× is restored on load', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ speedMultiplier: 3 }) });
    const storage = new StorageAdapter(store);
    const state = createGameState(storage.getSpeedSetting());
    expect(state.speedMultiplier).toBe(3);
  });

  test('fresh-install default is 5×', () => {
    const storage = new StorageAdapter(makeStore());
    const state = createGameState(storage.getSpeedSetting());
    expect(state.speedMultiplier).toBe(5);
  });

  test('corrupt storage falls back to 5×', () => {
    const store = makeStore({ 'pacman.settings': 'bad-json{' });
    const storage = new StorageAdapter(store);
    const state = createGameState(storage.getSpeedSetting());
    expect(state.speedMultiplier).toBe(5);
  });
});
