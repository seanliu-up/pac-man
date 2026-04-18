import { DOT_POINTS } from '../entities/dot.js';
import { PELLET_POINTS } from '../entities/power-pellet.js';

export function awardDot(state) {
  state.score += DOT_POINTS;
}

export function awardPellet(state) {
  state.score += PELLET_POINTS;
}

export function awardGhostEat(state) {
  const points = 200 * Math.pow(2, state.ghostEatCombo);
  state.score += points;
  state.ghostEatCombo += 1;
}

export function checkBonusLife(state) {
  if (!state.bonusLifeAwarded && state.score >= 10000) {
    state.lives += 1;
    state.bonusLifeAwarded = true;
  }
}
