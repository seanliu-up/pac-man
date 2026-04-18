import {
  getBlinkyTarget,
  getPinkyTarget,
  getInkyTarget,
  getClydeTarget,
  selectDirection,
} from '../../src/game/systems/ghost-ai.js';
import { Direction, GhostId } from '../../src/game/constants.js';
import { createPacMan } from '../../src/game/entities/pacman.js';
import { createGhost } from '../../src/game/entities/ghost.js';
import { createMaze } from '../../src/game/entities/maze.js';

function makePacMan(tileX, tileY, direction = Direction.RIGHT) {
  const p = createPacMan();
  p.tileX = tileX;
  p.tileY = tileY;
  p.direction = direction;
  return p;
}

describe('Blinky target', () => {
  test('target is pacman current tile', () => {
    const pacman = makePacMan(10, 8);
    expect(getBlinkyTarget(pacman)).toEqual({ x: 10, y: 8 });
  });
});

describe('Pinky target', () => {
  test('target is 4 tiles ahead of pacman facing RIGHT', () => {
    const pacman = makePacMan(10, 8, Direction.RIGHT);
    expect(getPinkyTarget(pacman)).toEqual({ x: 14, y: 8 });
  });

  test('target is 4 tiles ahead facing DOWN', () => {
    const pacman = makePacMan(10, 8, Direction.DOWN);
    expect(getPinkyTarget(pacman)).toEqual({ x: 10, y: 12 });
  });

  test('replicates UP-direction overflow bug: 4 up + 4 left', () => {
    const pacman = makePacMan(10, 8, Direction.UP);
    // Classic bug: UP moves 4 up AND 4 left
    expect(getPinkyTarget(pacman)).toEqual({ x: 6, y: 4 });
  });
});

describe('Inky target', () => {
  test('target is double vector from blinky to 2 tiles ahead of pacman', () => {
    const pacman = makePacMan(10, 8, Direction.RIGHT);
    const blinky = createGhost(GhostId.BLINKY);
    blinky.tileX = 6;
    blinky.tileY = 8;
    // 2 tiles ahead of pacman (RIGHT) = (12, 8)
    // vector from blinky(6,8) to pivot(12,8) = (6,0)
    // doubled = blinky + 2*(6,0) = (18, 8)
    expect(getInkyTarget(pacman, blinky)).toEqual({ x: 18, y: 8 });
  });
});

describe('Clyde target', () => {
  test('targets pacman when distance > 8 tiles', () => {
    const pacman = makePacMan(10, 8);
    const clyde = createGhost(GhostId.CLYDE);
    clyde.tileX = 1;
    clyde.tileY = 1; // far from pacman
    expect(getClydeTarget(pacman, clyde)).toEqual({ x: 10, y: 8 });
  });

  test('targets scatter corner when distance <= 8 tiles', () => {
    const pacman = makePacMan(10, 8);
    const clyde = createGhost(GhostId.CLYDE);
    clyde.tileX = 8;
    clyde.tileY = 8; // distance = 2, within 8
    expect(getClydeTarget(pacman, clyde)).toEqual(clyde.scatterCorner);
  });
});

describe('selectDirection', () => {
  test('picks direction with lowest Manhattan distance to target', () => {
    const maze = createMaze();
    // At tile (6,1) facing RIGHT (reverse=LEFT), target is far RIGHT at (27,1)
    // RIGHT leads to (7,1) dist=20; DOWN leads to (6,2) dist=22 → RIGHT wins
    const dir = selectDirection(maze.tiles, 6, 1, Direction.RIGHT, { x: 27, y: 1 });
    expect(dir).toBe(Direction.RIGHT);
  });

  test('never reverses current direction', () => {
    const maze = createMaze();
    // At (6,1) moving RIGHT, reverse is LEFT — LEFT must never be chosen
    const dir = selectDirection(maze.tiles, 6, 1, Direction.RIGHT, { x: 1, y: 1 });
    expect(dir).not.toBe(Direction.LEFT);
  });
});
