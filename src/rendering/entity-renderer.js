import { GhostId, GhostMode, TILE_SIZE } from '../game/constants.js';

const HUD_ROWS = 2;
const HALF = TILE_SIZE / 2;

const GHOST_COLORS = {
  [GhostId.BLINKY]: '#ff0000',
  [GhostId.PINKY]:  '#ffb8ff',
  [GhostId.INKY]:   '#00ffff',
  [GhostId.CLYDE]:  '#ffb852',
};

export class EntityRenderer {
  constructor() {
    this._frame = 0;
  }

  draw(ctx, { pacman, ghosts, maze }) {
    this._frame++;

    // Power pellets (blink every 30 frames)
    if (this._frame % 60 < 30) {
      ctx.fillStyle = '#ffb8ae';
      for (const p of maze.powerPellets) {
        if (p.collected) continue;
        const cx = p.tileX * TILE_SIZE + HALF;
        const cy = (p.tileY + HUD_ROWS) * TILE_SIZE + HALF;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pac-Man
    const px = pacman.tileX * TILE_SIZE + HALF + pacman.pixelX * TILE_SIZE;
    const py = (pacman.tileY + HUD_ROWS) * TILE_SIZE + HALF + pacman.pixelY * TILE_SIZE;
    const mouth = (Math.sin(this._frame * 0.3) + 1) * 0.25; // 0–0.5 radians
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, HALF - 1, mouth, Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();

    // Ghosts
    for (const ghost of ghosts) {
      const gx = ghost.tileX * TILE_SIZE + HALF + ghost.pixelX * TILE_SIZE;
      const gy = (ghost.tileY + HUD_ROWS) * TILE_SIZE + HALF + ghost.pixelY * TILE_SIZE;

      if (ghost.mode === GhostMode.EATEN) {
        this._drawEyes(ctx, gx, gy);
        continue;
      }

      if (ghost.mode === GhostMode.FRIGHTENED) {
        const flash = ghost.frightenedFlashing && this._frame % 20 < 10;
        ctx.fillStyle = flash ? '#ffffff' : '#2121de';
      } else {
        ctx.fillStyle = GHOST_COLORS[ghost.id] || '#ffffff';
      }

      this._drawGhostBody(ctx, gx, gy);
      this._drawEyes(ctx, gx, gy, ghost.mode !== GhostMode.FRIGHTENED);
    }
  }

  _drawGhostBody(ctx, cx, cy) {
    const r = HALF - 1;
    ctx.beginPath();
    ctx.arc(cx, cy - r / 2, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy + r);
    // Skirt with 3 bumps
    for (let i = 0; i < 3; i++) {
      const segW = (r * 2) / 3;
      const bx = cx + r - (i + 0.5) * segW;
      ctx.arc(bx, cy + r, segW / 2, 0, Math.PI, true);
    }
    ctx.lineTo(cx - r, cy - r / 2);
    ctx.closePath();
    ctx.fill();
  }

  _drawEyes(ctx, cx, cy, colored = false) {
    const eyeOffX = 3;
    const eyeOffY = -3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - eyeOffX, cy + eyeOffY, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffX, cy + eyeOffY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (colored) {
      ctx.fillStyle = '#00f';
      ctx.beginPath();
      ctx.arc(cx - eyeOffX, cy + eyeOffY, 1.2, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffX, cy + eyeOffY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
