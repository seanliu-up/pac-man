import { createGameState } from '../../src/game/state/game-state.js';
import { tickGame } from '../../src/game/state/tick.js';
import { GamePhase, Direction, GhostMode } from '../../src/game/constants.js';

function stubInput(direction = null, pause = false) {
  return {
    getPendingDirection: () => direction,
    clearPendingDirection: () => {},
    isPausePressed: () => pause,
    clearPause: () => {},
  };
}

function stubAudio() { return { play: () => {} }; }
function stubStorage() {
  return { qualifiesForHighScore: () => false, saveHighScore: () => {} };
}

describe('game session integration', () => {
  test('game starts in START phase', () => {
    const state = createGameState();
    expect(state.phase).toBe(GamePhase.START);
  });

  test('transitions to PLAYING when start action triggered', () => {
    const state = createGameState();
    tickGame(state, 1 / 60, stubInput(Direction.RIGHT), stubAudio(), stubStorage(), { startPressed: true });
    expect(state.phase).toBe(GamePhase.PLAYING);
  });

  test('score increases when pacman eats a dot', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    const dot = state.maze.dots[0];
    state.pacman.tileX = dot.tileX;
    state.pacman.tileY = dot.tileY;
    state.pacman.direction = Direction.RIGHT;
    // Clear ghosts so no collision
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    const before = state.score;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.score).toBeGreaterThan(before);
  });

  test('LIFE_LOST phase when pacman touches normal ghost', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.SCATTER;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect([GamePhase.LIFE_LOST, GamePhase.GAME_OVER]).toContain(state.phase);
  });

  test('GAME_OVER when lives reach 0 after ghost collision', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.lives = 1;
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.SCATTER;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    // After LIFE_LOST, advance timer past delay
    if (state.phase === GamePhase.LIFE_LOST) {
      tickGame(state, 3, stubInput(), stubAudio(), stubStorage());
    }
    expect(state.phase).toBe(GamePhase.GAME_OVER);
    expect(state.lives).toBe(0);
  });
});
