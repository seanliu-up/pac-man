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

describe('T037 — full power pellet session integration', () => {
  test('eat pellet then eat 2 ghosts awards 50+200+400=650 pts', () => {
    const state = playingState();
    const pellet = state.maze.powerPellets[0];
    // Pre-collect dot at pacman's start tile
    const startDot = state.maze.dots.find(d => d.tileX === state.pacman.tileX && d.tileY === state.pacman.tileY);
    if (startDot) startDot.collected = true;

    // Move pacman to pellet, ghosts away
    state.pacman.tileX = pellet.tileX;
    state.pacman.tileY = pellet.tileY;
    state.ghosts.forEach(g => { g.tileX = 99; g.tileY = 99; });

    // Eat the pellet
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.score).toBe(50);
    expect(pellet.collected).toBe(true);
    expect(state.frightTimer).toBeGreaterThan(0);

    // Eat first frightened ghost → 200 pts
    const g1 = state.ghosts[0];
    g1.mode = GhostMode.FRIGHTENED;
    g1.tileX = state.pacman.tileX;
    g1.tileY = state.pacman.tileY;
    state.ghosts.slice(1).forEach(g => { g.tileX = 99; g.tileY = 99; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.score).toBe(250); // 50 + 200
    expect(g1.mode).toBe(GhostMode.EATEN);

    // Eat second frightened ghost → 400 pts
    const g2 = state.ghosts[1];
    g2.mode = GhostMode.FRIGHTENED;
    g2.tileX = state.pacman.tileX;
    g2.tileY = state.pacman.tileY;
    state.ghosts.filter((_, i) => i !== 1).forEach(g => { g.tileX = 99; g.tileY = 99; });
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.score).toBe(650); // 50 + 200 + 400
    expect(g2.mode).toBe(GhostMode.EATEN);
  });

  test('frightenedFlashing triggers when frightTimer ≤ 2s', () => {
    const state = playingState();
    state.ghosts.forEach(g => { g.mode = GhostMode.FRIGHTENED; g.tileX = 0; g.tileY = 0; });
    state.frightTimer = 1.9;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    const frightened = state.ghosts.filter(g => g.mode === GhostMode.FRIGHTENED);
    expect(frightened.every(g => g.frightenedFlashing === true)).toBe(true);
  });

  test('frightTimer expiry returns ghosts from FRIGHTENED to SCATTER or CHASE', () => {
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
