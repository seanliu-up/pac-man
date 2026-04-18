import { Direction } from '../constants.js';

export function createPacMan() {
  return {
    tileX: 14,
    tileY: 23,
    pixelX: 0,
    pixelY: 0,
    direction: Direction.NONE,
    pendingDirection: null,
    speed: 0.8,
    mouthAngle: 0,
  };
}
