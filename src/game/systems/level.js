import { GhostId } from '../constants.js';
import { createMaze } from '../entities/maze.js';
import { createPacMan } from '../entities/pacman.js';
import { createGhost } from '../entities/ghost.js';

const DIFFICULTY = [
  null,                                      // index 0 unused
  { ghostSpeed: 0.75, frightenedDuration: 6, pacmanSpeed: 0.80 }, // level 1
  { ghostSpeed: 0.85, frightenedDuration: 5, pacmanSpeed: 0.85 }, // level 2
  { ghostSpeed: 0.90, frightenedDuration: 4, pacmanSpeed: 0.88 }, // level 3
  { ghostSpeed: 0.90, frightenedDuration: 4, pacmanSpeed: 0.88 }, // level 4
];

const DEFAULT_DIFFICULTY = { ghostSpeed: 0.95, frightenedDuration: 3, pacmanSpeed: 0.90 };

export function getDifficulty(level) {
  return DIFFICULTY[level] || DEFAULT_DIFFICULTY;
}

export function getGhostSpeedFactor(level) { return getDifficulty(level).ghostSpeed; }
export function getFrightenedDuration(level) { return getDifficulty(level).frightenedDuration; }
export function getPacManSpeedFactor(level) { return getDifficulty(level).pacmanSpeed; }

export function getScatterChaseTiming(level) {
  // Re-exported from ghost-ai for convenience; imported there separately
  return level >= 5
    ? [7, 20, 7, 20, 5, 20, 5, Infinity]
    : [5, 20, 5, 20, 5, Infinity];
}

export function checkLevelComplete(state) {
  const { maze } = state;
  const remainingDots    = maze.dots.filter(d => !d.collected).length;
  const remainingPellets = maze.powerPellets.filter(p => !p.collected).length;
  return remainingDots + remainingPellets === 0;
}

export function resetLevel(state) {
  state.maze = createMaze();
  state.pacman = createPacMan();
  state.ghosts = [GhostId.BLINKY, GhostId.PINKY, GhostId.INKY, GhostId.CLYDE].map(createGhost);
  state.scatterChaseClock = 0;
  state.frightTimer = 0;
  state.ghostEatCombo = 0;
  state.levelTransitionTimer = 0;

  const diff = getDifficulty(state.level);
  state.pacman.speed = diff.pacmanSpeed;
  state.ghosts.forEach(g => { g.speed = diff.ghostSpeed; });
}
