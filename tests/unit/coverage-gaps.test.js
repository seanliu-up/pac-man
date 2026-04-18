import { tickGame } from '../../src/game/state/tick.js';
import { createGameState } from '../../src/game/state/game-state.js';
import { GamePhase, GhostMode, GhostId, Direction } from '../../src/game/constants.js';
import { getPinkyTarget, getInkyTarget, tickGhostAI } from '../../src/game/systems/ghost-ai.js';
import { createPacMan } from '../../src/game/entities/pacman.js';
import { createGhost } from '../../src/game/entities/ghost.js';
import { createMaze } from '../../src/game/entities/maze.js';

function stubInput(opts = {}) {
  return {
    getPendingDirection: opts.dir ? () => opts.dir : () => null,
    clearPendingDirection: () => {},
    isPausePressed: opts.pause ? () => true : () => false,
    clearPause: () => {},
  };
}
function stubAudio() { return { play: () => {} }; }
function stubStorage(qualifies = false) { return { qualifiesForHighScore: () => qualifies }; }

function playingState() {
  const s = createGameState();
  s.phase = GamePhase.PLAYING;
  s.ghosts.forEach(g => { g.mode = GhostMode.SCATTER; g.tileX = 0; g.tileY = 0; });
  return s;
}

// ─── tick.js branches ────────────────────────────────────────────────────────

describe('tick.js — PAUSED phase', () => {
  test('pressing pause while PAUSED resumes to PLAYING', () => {
    const state = createGameState();
    state.phase = GamePhase.PAUSED;
    tickGame(state, 1 / 60, stubInput({ pause: true }), stubAudio(), stubStorage());
    expect(state.phase).toBe(GamePhase.PLAYING);
  });

  test('not pressing pause while PAUSED stays PAUSED', () => {
    const state = createGameState();
    state.phase = GamePhase.PAUSED;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.phase).toBe(GamePhase.PAUSED);
  });
});

describe('tick.js — HIGH_SCORE phase', () => {
  test('ticking HIGH_SCORE phase is a no-op', () => {
    const state = createGameState();
    state.phase = GamePhase.HIGH_SCORE;
    state.score = 999;
    tickGame(state, 1 / 60, stubInput(), stubAudio(), stubStorage());
    expect(state.phase).toBe(GamePhase.HIGH_SCORE);
    expect(state.score).toBe(999);
  });
});

describe('tick.js — PLAYING pause toggle', () => {
  test('pressing pause during PLAYING transitions to PAUSED', () => {
    const state = playingState();
    tickGame(state, 1 / 60, stubInput({ pause: true }), stubAudio(), stubStorage());
    expect(state.phase).toBe(GamePhase.PAUSED);
  });
});

describe('tick.js — pending direction input', () => {
  test('pending direction is applied to pacman.pendingDirection', () => {
    const state = playingState();
    tickGame(state, 1 / 60, stubInput({ dir: Direction.UP }), stubAudio(), stubStorage());
    // pendingDirection gets set and may be immediately applied; just check it was processed
    expect(state.pacman.pendingDirection === Direction.UP || state.pacman.direction === Direction.UP).toBe(true);
  });
});

describe('tick.js — game over with qualifying high score', () => {
  test('nameEntryPending set when score qualifies', () => {
    const state = createGameState();
    state.phase = GamePhase.LIFE_LOST;
    state.lives = 0;
    state.score = 5000;
    state.levelTransitionTimer = 0.001;
    tickGame(state, 1 / 30, stubInput(), stubAudio(), stubStorage(true));
    expect(state.phase).toBe(GamePhase.GAME_OVER);
    expect(state.nameEntryPending).toBe(true);
  });
});

// ─── ghost-ai.js branches ────────────────────────────────────────────────────

describe('ghost-ai.js — getPinkyTarget LEFT direction', () => {
  test('target is 4 tiles left of pacman facing LEFT', () => {
    const pacman = createPacMan();
    pacman.tileX = 10; pacman.tileY = 8; pacman.direction = Direction.LEFT;
    expect(getPinkyTarget(pacman)).toEqual({ x: 6, y: 8 });
  });
});

describe('ghost-ai.js — getInkyTarget directions', () => {
  test('UP direction with UP overflow (4 up, 4 left)', () => {
    const pacman = createPacMan();
    pacman.tileX = 10; pacman.tileY = 8; pacman.direction = Direction.UP;
    const blinky = createGhost(GhostId.BLINKY);
    blinky.tileX = 10; blinky.tileY = 10;
    const target = getInkyTarget(pacman, blinky);
    // pivot = (8, 6), vector from blinky(10,10) to pivot(8,6) = (-2,-4), doubled → blinky + 2*(-2,-4) = (6, 2)
    expect(target).toEqual({ x: 6, y: 2 });
  });

  test('DOWN direction pivot 2 tiles ahead', () => {
    const pacman = createPacMan();
    pacman.tileX = 10; pacman.tileY = 8; pacman.direction = Direction.DOWN;
    const blinky = createGhost(GhostId.BLINKY);
    blinky.tileX = 10; blinky.tileY = 4;
    const target = getInkyTarget(pacman, blinky);
    // pivot = (10,10), vector from (10,4) to (10,10) = (0,6), doubled → (10, 4+12) = (10, 16)
    expect(target).toEqual({ x: 10, y: 16 });
  });

  test('LEFT direction pivot 2 tiles left', () => {
    const pacman = createPacMan();
    pacman.tileX = 10; pacman.tileY = 8; pacman.direction = Direction.LEFT;
    const blinky = createGhost(GhostId.BLINKY);
    blinky.tileX = 12; blinky.tileY = 8;
    const target = getInkyTarget(pacman, blinky);
    // pivot = (8,8), vector from (12,8) to (8,8) = (-4,0), doubled → (12-8, 8+0) = (4, 8)
    expect(target).toEqual({ x: 4, y: 8 });
  });
});

describe('ghost-ai.js — LEAVING_HOUSE mode', () => {
  test('ghost at exit tile switches to SCATTER/CHASE mode', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.scatterChaseClock = 0;
    const ghost = state.ghosts[0];
    ghost.mode = GhostMode.LEAVING_HOUSE;
    ghost.tileX = 14; ghost.tileY = 11; // GHOST_HOUSE_EXIT_TILE
    tickGhostAI(state, ghost, 1 / 60);
    expect([GhostMode.SCATTER, GhostMode.CHASE]).toContain(ghost.mode);
  });

  test('ghost not at exit tile stays LEAVING_HOUSE and moves', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    const ghost = state.ghosts[0];
    ghost.mode = GhostMode.LEAVING_HOUSE;
    ghost.tileX = 14; ghost.tileY = 14; // inside ghost house
    tickGhostAI(state, ghost, 1 / 60);
    expect(ghost.mode).toBe(GhostMode.LEAVING_HOUSE);
  });
});

describe('ghost-ai.js — CHASE mode for all ghost IDs', () => {
  function makeChaseState(ghostId) {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.scatterChaseClock = 100; // in chase phase
    const ghost = state.ghosts.find(g => g.id === ghostId);
    ghost.mode = GhostMode.CHASE;
    ghost.tileX = 6; ghost.tileY = 1;
    return { state, ghost };
  }

  test('BLINKY in CHASE mode selects a direction', () => {
    const { state, ghost } = makeChaseState(GhostId.BLINKY);
    tickGhostAI(state, ghost, 1 / 60);
    expect(ghost.direction).toBeDefined();
  });

  test('PINKY in CHASE mode selects a direction', () => {
    const { state, ghost } = makeChaseState(GhostId.PINKY);
    tickGhostAI(state, ghost, 1 / 60);
    expect(ghost.direction).toBeDefined();
  });

  test('CLYDE in CHASE mode selects a direction', () => {
    const { state, ghost } = makeChaseState(GhostId.CLYDE);
    tickGhostAI(state, ghost, 1 / 60);
    expect(ghost.direction).toBeDefined();
  });
});

describe('ghost-ai.js — EATEN ghost arriving at ghost house', () => {
  test('EATEN ghost at house entry reverts to HOUSE mode', () => {
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    const ghost = state.ghosts[0];
    ghost.mode = GhostMode.EATEN;
    ghost.frightenedFlashing = true;
    ghost.tileX = 14; ghost.tileY = 14; // GHOST_HOUSE_ENTRY_TILE
    tickGhostAI(state, ghost, 1 / 60);
    expect(ghost.mode).toBe(GhostMode.HOUSE);
    expect(ghost.frightenedFlashing).toBe(false);
  });
});
