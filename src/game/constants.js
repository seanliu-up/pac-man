export const Direction = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
});

export const GamePhase = Object.freeze({
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LIFE_LOST: 'LIFE_LOST',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  HIGH_SCORE: 'HIGH_SCORE',
});

export const GhostMode = Object.freeze({
  HOUSE: 'HOUSE',
  LEAVING_HOUSE: 'LEAVING_HOUSE',
  SCATTER: 'SCATTER',
  CHASE: 'CHASE',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN',
});

export const GhostId = Object.freeze({
  BLINKY: 'BLINKY',
  PINKY: 'PINKY',
  INKY: 'INKY',
  CLYDE: 'CLYDE',
});

export const TileType = Object.freeze({
  WALL: 0,
  PATH: 1,
  GHOST_HOUSE: 2,
  GHOST_DOOR: 3,
  TUNNEL: 4,
});

export const TILE_SIZE = 16;
export const MAZE_COLS = 28;
export const MAZE_ROWS = 31;
export const SPEED_SCALE = 5;
