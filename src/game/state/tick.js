import { GamePhase, GhostMode, Direction } from '../constants.js';
import { createMovementSystem } from '../systems/movement.js';
import { checkDotCollision, checkPelletCollision, checkGhostCollision } from '../systems/collision.js';
import { checkBonusLife } from '../systems/scoring.js';
import { tickGhostAI, tickFrightenedTimer } from '../systems/ghost-ai.js';
import { checkLevelComplete, resetLevel, getFrightenedDuration } from '../systems/level.js';

const movement = createMovementSystem();

const LIFE_LOST_DELAY      = 2;
const LEVEL_COMPLETE_DELAY = 3;

export function tickGame(state, dt, input, audio, storage, opts = {}) {
  switch (state.phase) {
    case GamePhase.START:
      _handleSpeedInput(state, input, storage);
      if (opts.startPressed || _hasPendingDirection(input)) {
        state.phase = GamePhase.PLAYING;
        audio?.play('game-start');
      }
      return;

    case GamePhase.PAUSED:
      _handleSpeedInput(state, input, storage);
      if (input.isPausePressed()) {
        input.clearPause();
        state.phase = GamePhase.PLAYING;
      }
      return;

    case GamePhase.LIFE_LOST:
      state.levelTransitionTimer -= dt;
      if (state.levelTransitionTimer <= 0) {
        _respawnPositions(state);
        state.phase = state.lives > 0 ? GamePhase.PLAYING : GamePhase.GAME_OVER;
        if (state.phase === GamePhase.GAME_OVER) _handleGameOver(state, storage);
      }
      return;

    case GamePhase.LEVEL_COMPLETE:
      state.levelTransitionTimer -= dt;
      if (state.levelTransitionTimer <= 0) {
        state.level += 1;
        resetLevel(state);
        state.phase = GamePhase.PLAYING;
        audio?.play('level-complete');
      }
      return;

    case GamePhase.GAME_OVER:
    case GamePhase.HIGH_SCORE:
      return;
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────

  if (input.isPausePressed()) {
    input.clearPause();
    state.phase = GamePhase.PAUSED;
    return;
  }

  const pendingDir = input.getPendingDirection?.();
  if (pendingDir) {
    state.pacman.pendingDirection = pendingDir;
    input.clearPendingDirection?.();
  }

  movement.tickPacMan(state, dt);

  state.scatterChaseClock += dt;
  for (const ghost of state.ghosts) {
    tickGhostAI(state, ghost, dt);
    if (ghost.mode !== GhostMode.HOUSE) {
      movement.tickEntity(state, ghost, dt);
    }
  }

  tickFrightenedTimer(state, dt);

  // Dot collision
  const dotResult = checkDotCollision(state);
  if (dotResult.scoreGained > 0) {
    state.score += dotResult.scoreGained;
    checkBonusLife(state);
    audio?.play('dot-eat');
  }

  // Pellet collision
  const pelletResult = checkPelletCollision(state);
  if (pelletResult.scoreGained > 0) {
    state.score += pelletResult.scoreGained;
    checkBonusLife(state);
    if (pelletResult.frightenedTriggered) {
      state.frightTimer = getFrightenedDuration(state.level);
      state.ghostEatCombo = 0;
      for (const ghost of state.ghosts) {
        if (ghost.mode === GhostMode.SCATTER || ghost.mode === GhostMode.CHASE) {
          ghost.mode = GhostMode.FRIGHTENED;
          ghost.frightenedFlashing = false;
        }
      }
      audio?.play('power-pellet');
    }
  }

  // Ghost collision
  const ghostResult = checkGhostCollision(state);
  if (ghostResult.lifeLost) {
    state.lives -= 1;
    state.levelTransitionTimer = LIFE_LOST_DELAY;
    state.phase = GamePhase.LIFE_LOST;
    audio?.play('life-lost');
    return;
  }
  if (ghostResult.ghostEaten) {
    state.score += ghostResult.scoreGained;
    state.ghostEatCombo = ghostResult.newGhostEatCombo;
    ghostResult.ghost.mode = GhostMode.EATEN;
    audio?.play('ghost-eat');
    checkBonusLife(state);
  }

  if (dotResult.levelComplete || checkLevelComplete(state)) {
    state.levelTransitionTimer = LEVEL_COMPLETE_DELAY;
    state.phase = GamePhase.LEVEL_COMPLETE;
  }
}

// Alias used in integration tests
export { tickGame as tick };

function _handleSpeedInput(state, input, storage) {
  const sel = input.getSpeedSelection?.();
  if (sel == null) return;
  state.speedMultiplier = sel;
  storage?.saveSpeedSetting?.(sel);
  input.clearSpeedSelection?.();
}

function _hasPendingDirection(input) {
  return !!input.getPendingDirection?.();
}

function _respawnPositions(state) {
  state.pacman.tileX = 14;
  state.pacman.tileY = 23;
  state.pacman.pixelX = 0;
  state.pacman.pixelY = 0;
  state.pacman.direction = Direction.NONE;
  state.pacman.pendingDirection = null;
}

function _handleGameOver(state, storage) {
  if (storage?.qualifiesForHighScore?.(state.score)) {
    state.nameEntryPending = true;
    state.nameEntry = '';
  }
}
