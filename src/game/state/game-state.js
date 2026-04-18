import { GamePhase, GhostId } from '../constants.js';
import { createPacMan } from '../entities/pacman.js';
import { createGhost } from '../entities/ghost.js';
import { createMaze } from '../entities/maze.js';

export function createGameState(speedMultiplier = 5) {
  return {
    speedMultiplier,
    phase: GamePhase.START,
    score: 0,
    lives: 3,
    level: 1,
    bonusLifeAwarded: false,
    pacman: createPacMan(),
    ghosts: [
      createGhost(GhostId.BLINKY),
      createGhost(GhostId.PINKY),
      createGhost(GhostId.INKY),
      createGhost(GhostId.CLYDE),
    ],
    maze: createMaze(),
    scatterChaseClock: 0,
    frightTimer: 0,
    ghostEatCombo: 0,
    nameEntryPending: false,
    levelTransitionTimer: 0,
  };
}
