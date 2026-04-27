import { Direction, MAZE_COLS, SPEED_SCALE } from '../constants.js';
import { isWalkableForPacman, isWalkable } from '../entities/maze.js';

function dirDelta(dir) {
  switch (dir) {
    case Direction.UP:    return { dx: 0,  dy: -1 };
    case Direction.DOWN:  return { dx: 0,  dy:  1 };
    case Direction.LEFT:  return { dx: -1, dy:  0 };
    case Direction.RIGHT: return { dx:  1, dy:  0 };
    default:              return { dx: 0,  dy:  0 };
  }
}

function wrapX(x) {
  return ((x % MAZE_COLS) + MAZE_COLS) % MAZE_COLS;
}

export function createMovementSystem() {
  return {
    tickEntity(state, entity, dt) {
      if (entity.direction === Direction.NONE) return;
      const { tiles } = state.maze;
      const speed = entity.speed; // tiles per second
      const distance = speed * dt * (state.speedMultiplier ?? 1) * SPEED_SCALE;
      const { dx, dy } = dirDelta(entity.direction);

      entity.pixelX += dx * distance;
      entity.pixelY += dy * distance;

      // Resolve full tile crossings
      while (Math.abs(entity.pixelX) >= 1 || Math.abs(entity.pixelY) >= 1) {
        const stepX = dx !== 0 ? Math.sign(entity.pixelX) : 0;
        const stepY = dy !== 0 ? Math.sign(entity.pixelY) : 0;
        const nextX = wrapX(entity.tileX + stepX);
        const nextY = entity.tileY + stepY;

        if (!isWalkable(tiles, nextX, nextY)) {
          entity.pixelX = 0;
          entity.pixelY = 0;
          break;
        }

        entity.tileX = nextX;
        entity.tileY = nextY;
        entity.pixelX -= stepX;
        entity.pixelY -= stepY;
      }
    },

    tickPacMan(state, dt) {
      const { pacman, maze: { tiles } } = state;
      const speed = pacman.speed;
      const distance = speed * dt * (state.speedMultiplier ?? 1) * SPEED_SCALE;

      // Try to apply pendingDirection at tile center (pixelX≈0, pixelY≈0)
      if (pacman.pendingDirection && pacman.pendingDirection !== pacman.direction) {
        if (Math.abs(pacman.pixelX) < 0.5 && Math.abs(pacman.pixelY) < 0.5) {
          const { dx, dy } = dirDelta(pacman.pendingDirection);
          const nextX = wrapX(pacman.tileX + dx);
          const nextY = pacman.tileY + dy;
          if (isWalkableForPacman(tiles, nextX, nextY)) {
            pacman.direction = pacman.pendingDirection;
            pacman.pendingDirection = null;
            pacman.pixelX = 0;
            pacman.pixelY = 0;
          }
        }
      }

      if (pacman.direction === Direction.NONE) return;

      const { dx, dy } = dirDelta(pacman.direction);
      pacman.pixelX += dx * distance;
      pacman.pixelY += dy * distance;

      while (Math.abs(pacman.pixelX) >= 1 || Math.abs(pacman.pixelY) >= 1) {
        const stepX = dx !== 0 ? Math.sign(pacman.pixelX) : 0;
        const stepY = dy !== 0 ? Math.sign(pacman.pixelY) : 0;
        const rawNextX = pacman.tileX + stepX;
        const nextX = wrapX(rawNextX);
        const nextY = pacman.tileY + stepY;

        if (!isWalkableForPacman(tiles, nextX, nextY)) {
          pacman.pixelX = 0;
          pacman.pixelY = 0;
          break;
        }

        // Handle tunnel wrap
        if (rawNextX < 0 || rawNextX >= MAZE_COLS) {
          pacman.tileX = nextX;
        } else {
          pacman.tileX = nextX;
        }
        pacman.tileY = nextY;
        pacman.pixelX -= stepX;
        pacman.pixelY -= stepY;
      }
    },
  };
}
