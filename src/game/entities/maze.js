import { TileType } from '../constants.js';
import { createDot } from './dot.js';
import { createPowerPellet } from './power-pellet.js';

const W = TileType.WALL;
const P = TileType.PATH;
const G = TileType.GHOST_HOUSE;
const D = TileType.GHOST_DOOR;
const T = TileType.TUNNEL;

// Classic 28×31 Pac-Man maze layout
// Columns: 0-27  Rows: 0-30
const LAYOUT = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 0
  [W,P,P,P,P,P,P,P,P,P,P,P,P,W,W,P,P,P,P,P,P,P,P,P,P,P,P,W], // 1
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W], // 2
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W], // 3  <- power pellets @ (1,3),(26,3)
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W], // 4
  [W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W], // 5
  [W,P,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,P,W], // 6
  [W,P,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,P,W], // 7
  [W,P,P,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,P,P,W], // 8
  [W,W,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,W,W], // 9
  [W,W,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,W,W], // 10
  [W,W,W,W,W,W,P,W,W,P,P,P,P,P,P,P,P,P,P,W,W,P,W,W,W,W,W,W], // 11
  [W,W,W,W,W,W,P,W,W,P,W,W,W,D,D,W,W,W,P,W,W,P,W,W,W,W,W,W], // 12  ghost door
  [T,T,T,T,T,T,P,P,P,P,W,G,G,G,G,G,G,W,P,P,P,P,T,T,T,T,T,T], // 13  tunnel row left
  [W,W,W,W,W,W,P,W,W,P,W,G,G,G,G,G,G,W,P,W,W,P,W,W,W,W,W,W], // 14  ghost house interior
  [W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W], // 15
  [W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W], // 16
  [W,W,W,W,W,W,P,W,W,P,P,P,P,P,P,P,P,P,P,W,W,P,W,W,W,W,W,W], // 17
  [W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W], // 18
  [W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W], // 19
  [W,P,P,P,P,P,P,P,P,P,P,P,P,W,W,P,P,P,P,P,P,P,P,P,P,P,P,W], // 20
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W], // 21
  [W,P,W,W,W,W,P,W,W,W,W,W,P,W,W,P,W,W,W,W,W,P,W,W,W,W,P,W], // 22
  [W,P,P,P,W,W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W,W,P,W], // 23  <- power pellets @ (1,23),(26,23)
  [W,W,W,P,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,P,W,W,W], // 24
  [W,W,W,P,W,W,P,W,W,P,W,W,W,W,W,W,W,W,P,W,W,P,W,W,P,W,W,W], // 25
  [W,P,P,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,W,W,P,P,P,P,P,P,W], // 26
  [W,P,W,W,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,W,W,P,W], // 27
  [W,P,W,W,W,W,W,W,W,W,W,W,P,W,W,P,W,W,W,W,W,W,W,W,W,W,P,W], // 28
  [W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W], // 29
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W], // 30
];

const POWER_PELLET_TILES = [
  { x: 1,  y: 3  },
  { x: 26, y: 3  },
  { x: 1,  y: 23 },
  { x: 26, y: 23 },
];

const PELLET_KEYS = new Set(POWER_PELLET_TILES.map(p => `${p.x},${p.y}`));

export function createMaze() {
  const tiles = LAYOUT.map(row => [...row]);
  const dots = [];
  const powerPellets = [];

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (tiles[y][x] === TileType.PATH) {
        const key = `${x},${y}`;
        if (PELLET_KEYS.has(key)) {
          powerPellets.push(createPowerPellet(x, y));
        } else {
          dots.push(createDot(x, y));
        }
      }
    }
  }

  return {
    tiles,
    dots,
    powerPellets,
    totalDots: dots.length + powerPellets.length,
  };
}

export function isWalkable(tiles, tileX, tileY) {
  if (tileY < 0 || tileY >= tiles.length) return false;
  const wrappedX = ((tileX % tiles[0].length) + tiles[0].length) % tiles[0].length;
  const t = tiles[tileY][wrappedX];
  return t === TileType.PATH || t === TileType.TUNNEL || t === TileType.GHOST_HOUSE || t === TileType.GHOST_DOOR;
}

export function isWalkableForPacman(tiles, tileX, tileY) {
  if (tileY < 0 || tileY >= tiles.length) return false;
  const wrappedX = ((tileX % tiles[0].length) + tiles[0].length) % tiles[0].length;
  const t = tiles[tileY][wrappedX];
  return t === TileType.PATH || t === TileType.TUNNEL;
}
