export const PELLET_POINTS = 50;

export function createPowerPellet(tileX, tileY) {
  return { tileX, tileY, collected: false, visible: true };
}
