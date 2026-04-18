import { awardDot, awardPellet, awardGhostEat, checkBonusLife } from '../../src/game/systems/scoring.js';
import { DOT_POINTS } from '../../src/game/entities/dot.js';
import { PELLET_POINTS } from '../../src/game/entities/power-pellet.js';

function makeState(overrides = {}) {
  return { score: 0, lives: 3, bonusLifeAwarded: false, ghostEatCombo: 0, ...overrides };
}

describe('awardDot', () => {
  test('adds 10 points', () => {
    const state = makeState();
    awardDot(state);
    expect(state.score).toBe(DOT_POINTS);
  });

  test('accumulates multiple dot scores', () => {
    const state = makeState();
    awardDot(state);
    awardDot(state);
    awardDot(state);
    expect(state.score).toBe(30);
  });
});

describe('awardPellet', () => {
  test('adds 50 points', () => {
    const state = makeState();
    awardPellet(state);
    expect(state.score).toBe(PELLET_POINTS);
  });
});

describe('checkBonusLife', () => {
  test('awards bonus life when score crosses 10000', () => {
    const state = makeState({ score: 9990 });
    awardDot(state);   // 10000
    checkBonusLife(state);
    expect(state.lives).toBe(4);
    expect(state.bonusLifeAwarded).toBe(true);
  });

  test('does not award bonus life twice', () => {
    const state = makeState({ score: 9990, bonusLifeAwarded: false });
    awardDot(state);
    checkBonusLife(state);
    expect(state.lives).toBe(4);
    checkBonusLife(state);
    expect(state.lives).toBe(4); // still 4, not 5
  });

  test('does not award bonus life below 10000', () => {
    const state = makeState({ score: 9000 });
    checkBonusLife(state);
    expect(state.lives).toBe(3);
    expect(state.bonusLifeAwarded).toBe(false);
  });
});

describe('awardGhostEat', () => {
  test('first ghost = 200pts', () => {
    const state = makeState({ ghostEatCombo: 0 });
    awardGhostEat(state);
    expect(state.score).toBe(200);
    expect(state.ghostEatCombo).toBe(1);
  });

  test('second ghost = 400pts', () => {
    const state = makeState({ ghostEatCombo: 1 });
    awardGhostEat(state);
    expect(state.score).toBe(400);
  });

  test('third ghost = 800pts', () => {
    const state = makeState({ ghostEatCombo: 2 });
    awardGhostEat(state);
    expect(state.score).toBe(800);
  });

  test('fourth ghost = 1600pts', () => {
    const state = makeState({ ghostEatCombo: 3 });
    awardGhostEat(state);
    expect(state.score).toBe(1600);
  });
});
