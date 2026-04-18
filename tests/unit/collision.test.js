import { checkDotCollision, checkGhostCollision, checkPelletCollision } from '../../src/game/systems/collision.js';
import { createDot, DOT_POINTS } from '../../src/game/entities/dot.js';
import { createPowerPellet, PELLET_POINTS } from '../../src/game/entities/power-pellet.js';
import { createGhost } from '../../src/game/entities/ghost.js';
import { createPacMan } from '../../src/game/entities/pacman.js';
import { GhostId, GhostMode } from '../../src/game/constants.js';

function makeState(overrides = {}) {
  return {
    score: 0,
    lives: 3,
    bonusLifeAwarded: false,
    ghostEatCombo: 0,
    frightTimer: 0,
    maze: { dots: [], powerPellets: [] },
    pacman: createPacMan(),
    ghosts: [GhostId.BLINKY, GhostId.PINKY, GhostId.INKY, GhostId.CLYDE].map(createGhost),
    ...overrides,
  };
}

describe('dot collision', () => {
  test('marks dot collected and increments score when pacman on same tile', () => {
    const dot = createDot(14, 23);
    const state = makeState({ maze: { dots: [dot], powerPellets: [] } });
    state.pacman.tileX = 14;
    state.pacman.tileY = 23;
    const result = checkDotCollision(state);
    expect(dot.collected).toBe(true);
    expect(result.scoreGained).toBe(DOT_POINTS);
  });

  test('does not collect already-collected dot', () => {
    const dot = createDot(14, 23);
    dot.collected = true;
    const state = makeState({ maze: { dots: [dot], powerPellets: [] } });
    state.pacman.tileX = 14;
    state.pacman.tileY = 23;
    const result = checkDotCollision(state);
    expect(result.scoreGained).toBe(0);
  });

  test('returns false levelComplete when dots remain', () => {
    const dots = [createDot(1, 1), createDot(2, 2)];
    const state = makeState({ maze: { dots, powerPellets: [] } });
    state.pacman.tileX = 1;
    state.pacman.tileY = 1;
    const result = checkDotCollision(state);
    expect(result.levelComplete).toBe(false);
  });

  test('returns true levelComplete when last dot collected', () => {
    const dot = createDot(14, 23);
    const state = makeState({ maze: { dots: [dot], powerPellets: [] } });
    state.pacman.tileX = 14;
    state.pacman.tileY = 23;
    const result = checkDotCollision(state);
    expect(result.levelComplete).toBe(true);
  });
});

describe('power pellet collision', () => {
  test('marks pellet collected, awards 50pts, triggers frightened', () => {
    const pellet = createPowerPellet(1, 3);
    const state = makeState({ maze: { dots: [], powerPellets: [pellet] } });
    state.ghosts.forEach(g => { g.mode = GhostMode.SCATTER; });
    state.pacman.tileX = 1;
    state.pacman.tileY = 3;
    const result = checkPelletCollision(state);
    expect(pellet.collected).toBe(true);
    expect(result.scoreGained).toBe(PELLET_POINTS);
    expect(result.frightenedTriggered).toBe(true);
  });

  test('does not re-trigger collected pellet', () => {
    const pellet = createPowerPellet(1, 3);
    pellet.collected = true;
    const state = makeState({ maze: { dots: [], powerPellets: [pellet] } });
    state.pacman.tileX = 1;
    state.pacman.tileY = 3;
    const result = checkPelletCollision(state);
    expect(result.scoreGained).toBe(0);
  });
});

describe('ghost collision', () => {
  test('returns lifeLost when pacman touches normal ghost', () => {
    const state = makeState();
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.SCATTER;
    const result = checkGhostCollision(state);
    expect(result.lifeLost).toBe(true);
    expect(result.ghostEaten).toBe(false);
  });

  test('returns ghostEaten when pacman touches frightened ghost', () => {
    const state = makeState();
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.FRIGHTENED;
    const result = checkGhostCollision(state);
    expect(result.ghostEaten).toBe(true);
    expect(result.lifeLost).toBe(false);
  });

  test('ignores EATEN ghost', () => {
    const state = makeState();
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.EATEN;
    const result = checkGhostCollision(state);
    expect(result.lifeLost).toBe(false);
    expect(result.ghostEaten).toBe(false);
  });

  test('ghost eat combo awards 200, 400, 800, 1600', () => {
    const state = makeState();
    const ghost = state.ghosts[0];
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    ghost.mode = GhostMode.FRIGHTENED;
    const r1 = checkGhostCollision(state);
    expect(r1.scoreGained).toBe(200);
    state.ghostEatCombo = r1.newGhostEatCombo;

    const r2 = checkGhostCollision(state);
    expect(r2.scoreGained).toBe(400);
    state.ghostEatCombo = r2.newGhostEatCombo;

    const r3 = checkGhostCollision(state);
    expect(r3.scoreGained).toBe(800);
    state.ghostEatCombo = r3.newGhostEatCombo;

    const r4 = checkGhostCollision(state);
    expect(r4.scoreGained).toBe(1600);
  });
});
