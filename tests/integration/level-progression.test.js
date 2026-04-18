import { tickGame } from '../../src/game/state/tick.js';
import { createGameState } from '../../src/game/state/game-state.js';
import { GamePhase, GhostMode } from '../../src/game/constants.js';
import { getFrightenedDuration, getGhostSpeedFactor } from '../../src/game/systems/level.js';

function stubInput() {
  return { getPendingDirection: () => null, clearPendingDirection: () => {}, isPausePressed: () => false, clearPause: () => {} };
}
function stubAudio() { return { play: () => {} }; }
function stubStorage() { return { qualifiesForHighScore: () => false }; }

describe('T052 — level transition integration', () => {
  test('collecting all dots triggers LEVEL_COMPLETE phase', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.ghosts.forEach(g => { g.mode = GhostMode.SCATTER; g.tileX = 0; g.tileY = 0; });

    // Collect all dots and pellets manually
    state.maze.dots.forEach(d => { d.collected = true; });
    // Leave exactly one pellet uncollected, place pacman on it
    const pellet = state.maze.powerPellets[0];
    state.maze.powerPellets.slice(1).forEach(p => { p.collected = true; });
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;

    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.phase).toBe(GamePhase.LEVEL_COMPLETE);
  });

  test('after LEVEL_COMPLETE transition delay level increments to 2', () => {
    const state = createGameState();
    state.phase = GamePhase.LEVEL_COMPLETE;
    state.level = 1;
    state.levelTransitionTimer = 0;

    // Tick past the transition delay (3s)
    for (let i = 0; i < 200; i++) {
      tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
      if (state.phase === GamePhase.PLAYING) break;
    }
    expect(state.phase).toBe(GamePhase.PLAYING);
    expect(state.level).toBe(2);
  });

  test('ghost speed factor recalculated for level 2', () => {
    const state = createGameState();
    state.phase = GamePhase.LEVEL_COMPLETE;
    state.level = 1;
    state.levelTransitionTimer = 0;

    for (let i = 0; i < 200; i++) {
      tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
      if (state.phase === GamePhase.PLAYING) break;
    }
    expect(state.level).toBe(2);
    const expectedSpeed = getGhostSpeedFactor(2);
    state.ghosts.forEach(g => {
      expect(g.speed).toBeCloseTo(expectedSpeed);
    });
  });

  test('frightened duration is 5s on level 2', () => {
    expect(getFrightenedDuration(2)).toBe(5);
  });
});
