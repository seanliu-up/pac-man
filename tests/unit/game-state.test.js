import { createGameState } from '../../src/game/state/game-state.js';

describe('T004 — createGameState speedMultiplier', () => {
  test('default speedMultiplier is 5', () => {
    const state = createGameState();
    expect(state.speedMultiplier).toBe(5);
  });

  test('passed speedMultiplier overrides the default', () => {
    const state = createGameState(2);
    expect(state.speedMultiplier).toBe(2);
  });

  test('createGameState(1) sets speedMultiplier to 1', () => {
    const state = createGameState(1);
    expect(state.speedMultiplier).toBe(1);
  });
});
