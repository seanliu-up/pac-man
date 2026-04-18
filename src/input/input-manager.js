import { Direction } from '../game/constants.js';

const KEY_MAP = {
  ArrowUp: Direction.UP,    w: Direction.UP,    W: Direction.UP,
  ArrowDown: Direction.DOWN, s: Direction.DOWN,  S: Direction.DOWN,
  ArrowLeft: Direction.LEFT, a: Direction.LEFT,  A: Direction.LEFT,
  ArrowRight: Direction.RIGHT, d: Direction.RIGHT, D: Direction.RIGHT,
};

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const PAUSE_KEYS = new Set(['p', 'P', 'Escape']);
const MUTE_KEYS  = new Set(['m', 'M']);
const SPEED_KEYS = new Set(['1', '2', '3', '4', '5']);

export class InputManager {
  constructor(onMuteToggle) {
    this._pendingDirection = null;
    this._pausePressed = false;
    this._speedSelection = null;
    this._onMuteToggle = onMuteToggle || null;
    this._touchStart = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  init() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('touchstart', this._onTouchStart, { passive: true });
    document.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchend', this._onTouchEnd);
  }

  getPendingDirection() { return this._pendingDirection; }
  clearPendingDirection() { this._pendingDirection = null; }
  isPausePressed() { return this._pausePressed; }
  clearPause() { this._pausePressed = false; }
  getSpeedSelection() { return this._speedSelection; }
  clearSpeedSelection() { this._speedSelection = null; }

  _onKeyDown(e) {
    if (ARROW_KEYS.has(e.key)) e.preventDefault();

    const dir = KEY_MAP[e.key];
    if (dir) {
      this._pendingDirection = dir;
      return;
    }
    if (SPEED_KEYS.has(e.key)) {
      this._speedSelection = parseInt(e.key, 10);
      return;
    }
    if (PAUSE_KEYS.has(e.key)) {
      this._pausePressed = true;
      return;
    }
    if (MUTE_KEYS.has(e.key) && this._onMuteToggle) {
      this._onMuteToggle();
    }
  }

  _onTouchStart(e) {
    const t = e.changedTouches[0];
    this._touchStart = { x: t.clientX, y: t.clientY };
  }

  _onTouchEnd(e) {
    if (!this._touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    this._touchStart = null;
    const threshold = 20;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      this._pendingDirection = dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      this._pendingDirection = dy > 0 ? Direction.DOWN : Direction.UP;
    }
  }
}
