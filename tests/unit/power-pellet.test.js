import { tickGame } from '../../src/game/state/tick.js';
import { createGameState } from '../../src/game/state/game-state.js';
import { GamePhase, GhostMode } from '../../src/game/constants.js';

function stubInput() {
  return { getPendingDirection: () => null, clearPendingDirection: () => {}, isPausePressed: () => false, clearPause: () => {} };
}
function stubAudio() { return { play: () => {} }; }
function stubStorage() { return { qualifiesForHighScore: () => false }; }

function playingState() {
  const s = createGameState();
  s.phase = GamePhase.PLAYING;
  s.ghosts.forEach(g => { g.mode = GhostMode.SCATTER; });
  return s;
}

describe('T034 — power pellet activation', () => {
  test('pacman eating pellet awards 50 pts', () => {
    const state = playingState();
    const pellet = state.maze.powerPellets[0];
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.score).toBe(50);
    expect(pellet.collected).toBe(true);
  });

  test('all non-house/eaten ghosts switch to FRIGHTENED', () => {
    const state = playingState();
    const pellet = state.maze.powerPellets[0];
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    const eligible = state.ghosts.filter(g => g.mode !== GhostMode.HOUSE && g.mode !== GhostMode.EATEN);
    expect(eligible.every(g => g.mode === GhostMode.FRIGHTENED)).toBe(true);
  });

  test('frightTimer set to level-dependent duration', () => {
    const state = playingState();
    const pellet = state.maze.powerPellets[0];
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.frightTimer).toBeGreaterThan(0);
    expect(state.frightTimer).toBeLessThanOrEqual(6); // level 1 = 6s
  });

  test('ghostEatCombo reset to 0 on pellet consumption', () => {
    const state = playingState();
    state.ghostEatCombo = 2;
    const pellet = state.maze.powerPellets[0];
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;
    state.ghosts.forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.ghostEatCombo).toBe(0);
  });
});

describe('T035 — frightened ghost behavior', () => {
  test('pacman eating frightened ghost switches it to EATEN', () => {
    const state = playingState();
    const ghost = state.ghosts[0];
    ghost.mode = GhostMode.FRIGHTENED;
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    state.frightTimer = 5;
    state.ghosts.slice(1).forEach(g => { g.tileX = 0; g.tileY = 0; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(ghost.mode).toBe(GhostMode.EATEN);
  });

  test('frightened timer expiry sets frightenedFlashing at <=2s', () => {
    const state = playingState();
    state.ghosts.forEach(g => { g.mode = GhostMode.FRIGHTENED; g.tileX = 0; g.tileY = 0; });
    state.frightTimer = 1.5; // <= 2s threshold
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    const frightened = state.ghosts.filter(g => g.mode === GhostMode.FRIGHTENED);
    expect(frightened.every(g => g.frightenedFlashing === true)).toBe(true);
  });

  test('frightened timer expiry returns ghosts to SCATTER/CHASE', () => {
    const state = playingState();
    state.ghosts.forEach(g => { g.mode = GhostMode.FRIGHTENED; g.tileX = 0; g.tileY = 0; });
    state.frightTimer = 0.01;
    tickGame(state, 1 / 30, stubInput(), stubAudio(), stubStorage()); // dt > frightTimer
    state.ghosts.forEach(g => {
      if (g.mode !== GhostMode.HOUSE) {
        expect([GhostMode.SCATTER, GhostMode.CHASE]).toContain(g.mode);
      }
    });
  });
});

describe('T036 — ghost eat combo scoring', () => {
  test('combo awards 200, 400, 800, 1600 for successive eats', () => {
    const state = playingState();
    state.frightTimer = 10;
    // Pre-collect the dot at Pac-Man's starting tile so dot scoring doesn't skew ghost-eat scores
    const startDot = state.maze.dots.find(d => d.tileX === state.pacman.tileX && d.tileY === state.pacman.tileY);
    if (startDot) startDot.collected = true;

    const scores = [];
    for (let i = 0; i < 4; i++) {
      const ghost = state.ghosts[i];
      ghost.mode = GhostMode.FRIGHTENED;
      ghost.tileX = state.pacman.tileX;
      ghost.tileY = state.pacman.tileY;
      const before = state.score;
      state.ghosts.filter((_, idx) => idx !== i).forEach(g => { g.tileX = 99; g.tileY = 99; });
      tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
      scores.push(state.score - before);
      ghost.mode = GhostMode.EATEN;
    }
    expect(scores[0]).toBe(200);
    expect(scores[1]).toBe(400);
    expect(scores[2]).toBe(800);
    expect(scores[3]).toBe(1600);
  });
});
