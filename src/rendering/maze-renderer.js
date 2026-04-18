import { TileType, TILE_SIZE } from '../game/constants.js';

const HUD_ROWS = 2; // rows above maze for score/lives

export class MazeRenderer {
  draw(ctx, { maze }) {
    const { tiles } = maze;
    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        const x = col * TILE_SIZE;
        const y = (row + HUD_ROWS) * TILE_SIZE;
        const tile = tiles[row][col];
        switch (tile) {
          case TileType.WALL:
            ctx.fillStyle = '#1a1aff';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
          case TileType.GHOST_HOUSE:
            ctx.fillStyle = '#111133';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
          case TileType.GHOST_DOOR:
            ctx.fillStyle = '#ffb8ae';
            ctx.fillRect(x, y, TILE_SIZE, 2);
            break;
          default:
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Draw uncollected dots
    ctx.fillStyle = '#ffb8ae';
    for (const dot of maze.dots) {
      if (dot.collected) continue;
      const cx = dot.tileX * TILE_SIZE + TILE_SIZE / 2;
      const cy = (dot.tileY + HUD_ROWS) * TILE_SIZE + TILE_SIZE / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
