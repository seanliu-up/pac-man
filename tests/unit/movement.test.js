import { createMovementSystem } from '../../src/game/systems/movement.js';
import { createMaze } from '../../src/game/entities/maze.js';
import { createPacMan } from '../../src/game/entities/pacman.js';
import { Direction, TileType } from '../../src/game/constants.js';

function makeState(overrides = {}) {
  const maze = createMaze();
  const pacman = createPacMan();
  return { maze, pacman, ...overrides };
}

describe('movement system', () => {
  const move = createMovementSystem();

  test('advances pacman tile in current direction', () => {
    const state = makeState();
    state.pacman.tileX = 14;
    state.pacman.tileY = 23;
    state.pacman.direction = Direction.LEFT;
    move.tickPacMan(state, 1 / 60);
    // After enough ticks to cross one tile (speed 0.8 tiles/s × 1/0.8s = 1 tile)
    // Drive it to tile boundary with a big dt
    move.tickPacMan(state, 1.5);
    expect(state.pacman.tileX).toBeLessThan(14);
  });

  test('blocks pacman from entering wall tile', () => {
    const state = makeState();
    state.pacman.tileX = 1;
    state.pacman.tileY = 1;
    state.pacman.direction = Direction.UP; // row 0 is all wall
    const before = state.pacman.tileY;
    move.tickPacMan(state, 2); // force large delta
    expect(state.pacman.tileY).toBe(before);
  });

  test('applies pendingDirection when target tile is passable', () => {
    const state = makeState();
    state.pacman.tileX = 1;
    state.pacman.tileY = 5;
    state.pacman.direction = Direction.RIGHT;
    state.pacman.pendingDirection = Direction.UP;
    // Row 4 col 1 is PATH — pending UP should be applied at tile center
    move.tickPacMan(state, 2);
    expect(state.pacman.direction).toBe(Direction.UP);
    expect(state.pacman.pendingDirection).toBeNull();
  });

  test('does not apply pendingDirection when target tile is wall', () => {
    const state = makeState();
    state.pacman.tileX = 1;
    state.pacman.tileY = 1;
    state.pacman.direction = Direction.RIGHT;
    state.pacman.pendingDirection = Direction.UP; // row 0 is wall
    move.tickPacMan(state, 0.1);
    expect(state.pacman.pendingDirection).toBe(Direction.UP);
  });

  test('wraps through tunnel: left edge leads to right edge', () => {
    const state = makeState();
    // Row 13 is the tunnel row — col 0 is TUNNEL
    state.pacman.tileX = 0;
    state.pacman.tileY = 13;
    state.pacman.direction = Direction.LEFT;
    move.tickPacMan(state, 2);
    expect(state.pacman.tileX).toBe(27);
  });
});

describe('ghost movement', () => {
  const move = createMovementSystem();

  test('ghost advances one tile in its direction per tile-cycle', () => {
    const state = makeState();
    const ghost = state.pacman; // reuse shape for simplicity
    ghost.tileX = 6;
    ghost.tileY = 1;
    ghost.direction = Direction.RIGHT;
    ghost.speed = 0.75;
    move.tickEntity(state, ghost, 2);
    expect(ghost.tileX).toBeGreaterThan(6);
  });
});

describe('movement system — speed multiplier (T006)', () => {
  const move = createMovementSystem();

  test('tickEntity multiplier=1 baseline: distance equals speed*dt', () => {
    const state = { maze: createMaze(), speedMultiplier: 1 };
    const ghost = { tileX: 6, tileY: 1, direction: Direction.RIGHT, speed: 0.75, pixelX: 0, pixelY: 0 };
    move.tickEntity(state, ghost, 0.1);
    // 0.75 * 0.1 * 1 = 0.075 — no tile crossing, stays in pixelX
    expect(ghost.pixelX).toBeCloseTo(0.075);
  });

  test('tickEntity multiplier=5: pixelX is 5× the baseline', () => {
    const state = { maze: createMaze(), speedMultiplier: 5 };
    const ghost = { tileX: 6, tileY: 1, direction: Direction.RIGHT, speed: 0.75, pixelX: 0, pixelY: 0 };
    move.tickEntity(state, ghost, 0.1);
    // 0.75 * 0.1 * 5 = 0.375 — no tile crossing
    expect(ghost.pixelX).toBeCloseTo(0.375);
  });

  test('tickPacMan multiplier=2 stacks with per-level entity speed (level-stack)', () => {
    const maze = createMaze();
    const pacman = createPacMan();
    pacman.speed = 1.0; // simulate level-adjusted speed
    pacman.direction = Direction.RIGHT;
    const state = { maze, pacman, speedMultiplier: 2 };
    move.tickPacMan(state, 0.1);
    // 1.0 * 0.1 * 2 = 0.2 — no tile crossing
    expect(pacman.pixelX).toBeCloseTo(0.2);
  });

  test('tickEntity with undefined speedMultiplier falls back to ×1', () => {
    const state = { maze: createMaze() }; // no speedMultiplier field
    const ghost = { tileX: 6, tileY: 1, direction: Direction.RIGHT, speed: 0.75, pixelX: 0, pixelY: 0 };
    move.tickEntity(state, ghost, 0.1);
    // fallback to 1: 0.75 * 0.1 * 1 = 0.075
    expect(ghost.pixelX).toBeCloseTo(0.075);
  });
});
