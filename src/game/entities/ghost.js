import { Direction, GhostId, GhostMode } from '../constants.js';

const GHOST_STARTS = {
  [GhostId.BLINKY]: { tileX: 14, tileY: 11, scatterCorner: { x: 25, y: 0 } },
  [GhostId.PINKY]:  { tileX: 14, tileY: 14, scatterCorner: { x: 2,  y: 0 } },
  [GhostId.INKY]:   { tileX: 12, tileY: 14, scatterCorner: { x: 27, y: 30 } },
  [GhostId.CLYDE]:  { tileX: 16, tileY: 14, scatterCorner: { x: 0,  y: 30 } },
};

export function createGhost(id) {
  const start = GHOST_STARTS[id];
  return {
    id,
    tileX: start.tileX,
    tileY: start.tileY,
    pixelX: 0,
    pixelY: 0,
    direction: Direction.LEFT,
    mode: id === GhostId.BLINKY ? GhostMode.SCATTER : GhostMode.HOUSE,
    speed: 0.75,
    scatterCorner: start.scatterCorner,
    frightenedFlashing: false,
  };
}
