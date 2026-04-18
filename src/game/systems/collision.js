import { GhostMode } from '../constants.js';
import { PELLET_POINTS } from '../entities/power-pellet.js';
import { DOT_POINTS } from '../entities/dot.js';

export function checkDotCollision(state) {
  const { pacman, maze } = state;
  let scoreGained = 0;
  let collected = 0;

  for (const dot of maze.dots) {
    if (!dot.collected && dot.tileX === pacman.tileX && dot.tileY === pacman.tileY) {
      dot.collected = true;
      scoreGained += DOT_POINTS;
      collected += 1;
    }
  }

  const remaining = maze.dots.filter(d => !d.collected).length
    + maze.powerPellets.filter(p => !p.collected).length;

  return { scoreGained, levelComplete: remaining === 0, collected };
}

export function checkPelletCollision(state) {
  const { pacman, maze } = state;
  let scoreGained = 0;
  let frightenedTriggered = false;

  for (const pellet of maze.powerPellets) {
    if (!pellet.collected && pellet.tileX === pacman.tileX && pellet.tileY === pacman.tileY) {
      pellet.collected = true;
      scoreGained += PELLET_POINTS;
      frightenedTriggered = true;
    }
  }

  return { scoreGained, frightenedTriggered };
}

export function checkGhostCollision(state) {
  const { pacman, ghosts, ghostEatCombo } = state;

  for (const ghost of ghosts) {
    if (ghost.tileX !== pacman.tileX || ghost.tileY !== pacman.tileY) continue;

    if (ghost.mode === GhostMode.FRIGHTENED) {
      const points = 200 * Math.pow(2, ghostEatCombo);
      return {
        ghostEaten: true,
        lifeLost: false,
        scoreGained: points,
        newGhostEatCombo: ghostEatCombo + 1,
        ghost,
      };
    }

    if (ghost.mode === GhostMode.SCATTER || ghost.mode === GhostMode.CHASE) {
      return { ghostEaten: false, lifeLost: true, scoreGained: 0, ghost };
    }
  }

  return { ghostEaten: false, lifeLost: false, scoreGained: 0, ghost: null };
}
