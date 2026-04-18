import { createGameState } from './game/state/game-state.js';
import { createGameLoop } from './game/state/game-loop.js';
import { Renderer } from './rendering/renderer.js';
import { MazeRenderer } from './rendering/maze-renderer.js';
import { EntityRenderer } from './rendering/entity-renderer.js';
import { UIRenderer } from './rendering/ui-renderer.js';
import { InputManager } from './input/input-manager.js';
import { AudioManager } from './audio/audio-manager.js';
import { StorageAdapter } from './storage/storage.js';
import { tick } from './game/state/tick.js';
import { TILE_SIZE, MAZE_COLS, MAZE_ROWS } from './game/constants.js';

const CANVAS_W = MAZE_COLS * TILE_SIZE;        // 448
const CANVAS_H = (MAZE_ROWS + 4) * TILE_SIZE;  // 560 (includes HUD rows)

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  scaleCanvas(canvas);
  window.addEventListener('resize', () => scaleCanvas(canvas));

  const storage    = new StorageAdapter();
  const initialMuted = storage.getMuteSetting();
  const audio      = new AudioManager({ initialMuted, onMuteToggle: (m) => storage.saveMuteSetting(m) });
  const input      = new InputManager();
  input.init();

  const gameState  = createGameState();
  const renderer   = new Renderer(canvas);
  renderer.init(
    new MazeRenderer(),
    new EntityRenderer(),
    new UIRenderer(storage),
  );

  const loop = createGameLoop(
    gameState,
    (state, dt) => tick(state, dt, input, audio, storage),
    (state)     => renderer.renderFrame(state),
  );

  loop.start();
});

function scaleCanvas(canvas) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / canvas.width, vh / canvas.height, 3);
  canvas.style.width  = `${canvas.width  * scale}px`;
  canvas.style.height = `${canvas.height * scale}px`;
}
