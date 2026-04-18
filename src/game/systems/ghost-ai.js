import { Direction, GhostId, GhostMode, MAZE_COLS } from '../constants.js';
import { isWalkable } from '../entities/maze.js';

// ─── Chase target calculations ───────────────────────────────────────────────

export function getBlinkyTarget(pacman) {
  return { x: pacman.tileX, y: pacman.tileY };
}

export function getPinkyTarget(pacman) {
  const ahead = 4;
  switch (pacman.direction) {
    case Direction.UP:    return { x: pacman.tileX - ahead, y: pacman.tileY - ahead }; // classic UP overflow bug
    case Direction.DOWN:  return { x: pacman.tileX,         y: pacman.tileY + ahead };
    case Direction.LEFT:  return { x: pacman.tileX - ahead, y: pacman.tileY };
    default:              return { x: pacman.tileX + ahead, y: pacman.tileY };
  }
}

export function getInkyTarget(pacman, blinky) {
  let pivotX = pacman.tileX;
  let pivotY = pacman.tileY;
  const ahead = 2;
  switch (pacman.direction) {
    case Direction.UP:    pivotX -= ahead; pivotY -= ahead; break; // UP overflow preserved
    case Direction.DOWN:  pivotY += ahead; break;
    case Direction.LEFT:  pivotX -= ahead; break;
    default:              pivotX += ahead; break;
  }
  return {
    x: blinky.tileX + 2 * (pivotX - blinky.tileX),
    y: blinky.tileY + 2 * (pivotY - blinky.tileY),
  };
}

export function getClydeTarget(pacman, clyde) {
  const dx = pacman.tileX - clyde.tileX;
  const dy = pacman.tileY - clyde.tileY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 8) return { x: pacman.tileX, y: pacman.tileY };
  return { x: clyde.scatterCorner.x, y: clyde.scatterCorner.y };
}

// ─── Direction selection ──────────────────────────────────────────────────────

const OPPOSITE = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};

const ALL_DIRS = [Direction.UP, Direction.LEFT, Direction.DOWN, Direction.RIGHT];

export function selectDirection(tiles, tileX, tileY, currentDir, target) {
  const reverse = OPPOSITE[currentDir];
  let bestDir = null;
  let bestDist = Infinity;

  for (const dir of ALL_DIRS) {
    if (dir === reverse) continue;
    const { dx, dy } = dirDeltaObj(dir);
    const nx = ((tileX + dx) % MAZE_COLS + MAZE_COLS) % MAZE_COLS;
    const ny = tileY + dy;
    if (!isWalkable(tiles, nx, ny)) continue;
    const dist = Math.abs(nx - target.x) + Math.abs(ny - target.y);
    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }
  }

  return bestDir ?? currentDir;
}

function dirDeltaObj(dir) {
  switch (dir) {
    case Direction.UP:    return { dx: 0,  dy: -1 };
    case Direction.DOWN:  return { dx: 0,  dy:  1 };
    case Direction.LEFT:  return { dx: -1, dy:  0 };
    default:              return { dx:  1, dy:  0 };
  }
}

// ─── Scatter/chase timing (level 1 defaults) ─────────────────────────────────

const SCATTER_CHASE_TIMES_L1 = [
  { mode: GhostMode.SCATTER, duration: 7 },
  { mode: GhostMode.CHASE,   duration: 20 },
  { mode: GhostMode.SCATTER, duration: 7 },
  { mode: GhostMode.CHASE,   duration: 20 },
  { mode: GhostMode.SCATTER, duration: 5 },
  { mode: GhostMode.CHASE,   duration: 20 },
  { mode: GhostMode.SCATTER, duration: 5 },
  { mode: GhostMode.CHASE,   duration: Infinity },
];

const SCATTER_CHASE_TIMES_L5 = [
  { mode: GhostMode.SCATTER, duration: 5 },
  { mode: GhostMode.CHASE,   duration: 20 },
  { mode: GhostMode.SCATTER, duration: 5 },
  { mode: GhostMode.CHASE,   duration: 20 },
  { mode: GhostMode.SCATTER, duration: 5 },
  { mode: GhostMode.CHASE,   duration: Infinity },
];

export function getScatterChaseTiming(level) {
  return level >= 5 ? SCATTER_CHASE_TIMES_L5 : SCATTER_CHASE_TIMES_L1;
}

export function getCurrentScatterChaseMode(clock, level) {
  const timing = getScatterChaseTiming(level);
  let elapsed = 0;
  for (const phase of timing) {
    elapsed += phase.duration;
    if (clock < elapsed) return phase.mode;
  }
  return GhostMode.CHASE;
}

// ─── Ghost house dot release thresholds ──────────────────────────────────────

const RELEASE_THRESHOLDS = {
  [GhostId.BLINKY]: 0,
  [GhostId.PINKY]:  0,
  [GhostId.INKY]:   30,
  [GhostId.CLYDE]:  60,
};

// ─── Ghost AI tick ────────────────────────────────────────────────────────────

const GHOST_HOUSE_EXIT_TILE = { x: 14, y: 11 };
const GHOST_HOUSE_ENTRY_TILE = { x: 14, y: 14 };

export function tickGhostAI(state, ghost, dt) {
  const { tiles } = state.maze;
  const dotsEaten = state.maze.dots.filter(d => d.collected).length;

  switch (ghost.mode) {
    case GhostMode.HOUSE: {
      const threshold = RELEASE_THRESHOLDS[ghost.id];
      if (dotsEaten >= threshold) {
        ghost.mode = GhostMode.LEAVING_HOUSE;
      }
      return;
    }

    case GhostMode.LEAVING_HOUSE: {
      // Move toward exit tile
      const target = GHOST_HOUSE_EXIT_TILE;
      if (ghost.tileX === target.x && ghost.tileY === target.y) {
        ghost.mode = getCurrentScatterChaseMode(state.scatterChaseClock, state.level);
        ghost.direction = Direction.LEFT;
      } else {
        const dir = selectDirection(tiles, ghost.tileX, ghost.tileY, ghost.direction, target);
        ghost.direction = dir;
      }
      break;
    }

    case GhostMode.SCATTER: {
      const target = ghost.scatterCorner;
      ghost.direction = selectDirection(tiles, ghost.tileX, ghost.tileY, ghost.direction, target);
      break;
    }

    case GhostMode.CHASE: {
      const blinky = state.ghosts.find(g => g.id === GhostId.BLINKY);
      let target;
      switch (ghost.id) {
        case GhostId.BLINKY: target = getBlinkyTarget(state.pacman); break;
        case GhostId.PINKY:  target = getPinkyTarget(state.pacman); break;
        case GhostId.INKY:   target = getInkyTarget(state.pacman, blinky); break;
        case GhostId.CLYDE:  target = getClydeTarget(state.pacman, ghost); break;
      }
      ghost.direction = selectDirection(tiles, ghost.tileX, ghost.tileY, ghost.direction, target);
      break;
    }

    case GhostMode.FRIGHTENED: {
      // Random non-reversing direction
      const reverse = OPPOSITE[ghost.direction];
      const valid = ALL_DIRS.filter(d => {
        if (d === reverse) return false;
        const { dx, dy } = dirDeltaObj(d);
        return isWalkable(tiles, ghost.tileX + dx, ghost.tileY + dy);
      });
      if (valid.length > 0) {
        ghost.direction = valid[Math.floor(Math.random() * valid.length)];
      }
      break;
    }

    case GhostMode.EATEN: {
      const target = GHOST_HOUSE_ENTRY_TILE;
      if (ghost.tileX === target.x && ghost.tileY === target.y) {
        ghost.mode = GhostMode.HOUSE;
        ghost.frightenedFlashing = false;
      } else {
        ghost.direction = selectDirection(tiles, ghost.tileX, ghost.tileY, ghost.direction, target);
      }
      break;
    }
  }
}

export function tickFrightenedTimer(state, dt) {
  if (state.frightTimer <= 0) return;
  state.frightTimer -= dt;
  const currentMode = getCurrentScatterChaseMode(state.scatterChaseClock, state.level);

  for (const ghost of state.ghosts) {
    if (ghost.mode !== GhostMode.FRIGHTENED) continue;
    ghost.frightenedFlashing = state.frightTimer <= 2;
    if (state.frightTimer <= 0) {
      ghost.mode = currentMode;
      ghost.frightenedFlashing = false;
    }
  }

  if (state.frightTimer <= 0) {
    state.frightTimer = 0;
    state.ghostEatCombo = 0;
  }
}
