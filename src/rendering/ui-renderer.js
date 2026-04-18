import { GamePhase, TILE_SIZE, MAZE_COLS } from '../game/constants.js';

const CANVAS_W = MAZE_COLS * TILE_SIZE;
const HUD_Y = 8;

export class UIRenderer {
  constructor(storage) {
    this._storage = storage;
  }

  draw(ctx, state) {
    this._drawHUD(ctx, state);

    switch (state.phase) {
      case GamePhase.START:       this._drawStart(ctx); break;
      case GamePhase.PAUSED:      this._drawPaused(ctx); break;
      case GamePhase.LIFE_LOST:   this._drawLifeLost(ctx, state); break;
      case GamePhase.LEVEL_COMPLETE: this._drawLevelComplete(ctx, state); break;
      case GamePhase.GAME_OVER:   this._drawGameOver(ctx, state); break;
      case GamePhase.HIGH_SCORE:  this._drawHighScores(ctx); break;
    }
  }

  _drawHUD(ctx, { score, lives, level }) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_W, TILE_SIZE * 2);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 8, HUD_Y + 12);
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL: ${level}`, CANVAS_W / 2, HUD_Y + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${lives}`, CANVAS_W - 8, HUD_Y + 12);
  }

  _drawOverlay(ctx, lines) {
    const cx = CANVAS_W / 2;
    const cy = (31 / 2 + 2) * TILE_SIZE;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, cy - 40, CANVAS_W, lines.length * 24 + 20);
    ctx.textAlign = 'center';
    lines.forEach((line, i) => {
      ctx.fillStyle = line.color || '#fff';
      ctx.font = line.font || '16px monospace';
      ctx.fillText(line.text, cx, cy - 20 + i * 24);
    });
  }

  _drawStart(ctx) {
    this._drawOverlay(ctx, [
      { text: 'PAC-MAN', color: '#ffff00', font: 'bold 22px monospace' },
      { text: 'Arrow keys / WASD to move' },
      { text: 'Eat all the dots! Avoid the ghosts.' },
      { text: 'Press ENTER or any arrow key to start', color: '#aaa', font: '13px monospace' },
    ]);
  }

  _drawPaused(ctx) {
    this._drawOverlay(ctx, [
      { text: 'PAUSED', color: '#ffff00', font: 'bold 20px monospace' },
      { text: 'Press P to Resume' },
    ]);
  }

  _drawLifeLost(ctx, { lives }) {
    this._drawOverlay(ctx, [
      { text: 'OUCH!', color: '#ff4444', font: 'bold 20px monospace' },
      { text: `Lives remaining: ${lives}` },
    ]);
  }

  _drawLevelComplete(ctx, { level }) {
    this._drawOverlay(ctx, [
      { text: `LEVEL ${level - 1} COMPLETE!`, color: '#00ff00', font: 'bold 18px monospace' },
      { text: 'Get ready...' },
    ]);
  }

  _drawGameOver(ctx, state) {
    if (state.nameEntryPending) {
      this._drawNameEntry(ctx, state);
    } else {
      this._drawOverlay(ctx, [
        { text: 'GAME OVER', color: '#ff0000', font: 'bold 22px monospace' },
        { text: `Final Score: ${state.score}` },
        { text: 'Press ENTER to play again' },
        { text: 'Press H for high scores', color: '#aaa', font: '13px monospace' },
      ]);
    }
  }

  _drawNameEntry(ctx, state) {
    const name = state.nameEntry || '___';
    this._drawOverlay(ctx, [
      { text: 'HIGH SCORE!', color: '#ffff00', font: 'bold 20px monospace' },
      { text: `Score: ${state.score}` },
      { text: 'Enter your name (3 chars):' },
      { text: name, color: '#00ff00', font: 'bold 24px monospace' },
      { text: 'Type A-Z, BACKSPACE, ENTER to confirm', color: '#aaa', font: '12px monospace' },
    ]);
  }

  _drawHighScores(ctx) {
    const scores = this._storage ? this._storage.getHighScores() : [];
    const lines = [
      { text: '─── HIGH SCORES ───', color: '#ffff00', font: 'bold 16px monospace' },
    ];
    if (scores.length === 0) {
      lines.push({ text: 'No scores yet — be the first!', color: '#aaa' });
    } else {
      scores.slice(0, 10).forEach((s, i) => {
        lines.push({ text: `${i + 1}. ${s.name}  ${s.score}` });
      });
    }
    lines.push({ text: 'Press ENTER to play again', color: '#aaa', font: '13px monospace' });
    this._drawOverlay(ctx, lines);
  }
}
