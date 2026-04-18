import {
  getGhostSpeedFactor,
  getFrightenedDuration,
  getPacManSpeedFactor,
} from '../../src/game/systems/level.js';
import { getScatterChaseTiming, getCurrentScatterChaseMode } from '../../src/game/systems/ghost-ai.js';
import { GhostMode } from '../../src/game/constants.js';

describe('T051 — difficulty scaling unit tests', () => {
  describe('getGhostSpeedFactor', () => {
    test('level 1 returns 0.75', () => expect(getGhostSpeedFactor(1)).toBe(0.75));
    test('level 2 returns 0.85', () => expect(getGhostSpeedFactor(2)).toBe(0.85));
    test('level 3 returns 0.90', () => expect(getGhostSpeedFactor(3)).toBe(0.90));
    test('level 5+ returns 0.95', () => expect(getGhostSpeedFactor(5)).toBe(0.95));
  });

  describe('getFrightenedDuration', () => {
    test('level 1 returns 6s', () => expect(getFrightenedDuration(1)).toBe(6));
    test('level 2 returns 5s', () => expect(getFrightenedDuration(2)).toBe(5));
    test('level 3 returns 4s', () => expect(getFrightenedDuration(3)).toBe(4));
    test('level 5+ returns 3s', () => expect(getFrightenedDuration(5)).toBe(3));
  });

  describe('getPacManSpeedFactor', () => {
    test('level 1 returns 0.80', () => expect(getPacManSpeedFactor(1)).toBe(0.80));
    test('level 5+ returns 0.90', () => expect(getPacManSpeedFactor(5)).toBe(0.90));
  });

  describe('getScatterChaseTiming (via ghost-ai)', () => {
    test('level 1 classic timing: first phase is SCATTER 7s', () => {
      const timing = getScatterChaseTiming(1);
      expect(timing[0]).toMatchObject({ mode: GhostMode.SCATTER, duration: 7 });
    });

    test('level 1 classic timing: second phase is CHASE 20s', () => {
      const timing = getScatterChaseTiming(1);
      expect(timing[1]).toMatchObject({ mode: GhostMode.CHASE, duration: 20 });
    });

    test('level 5+ timing: first phase is SCATTER 5s', () => {
      const timing = getScatterChaseTiming(5);
      expect(timing[0]).toMatchObject({ mode: GhostMode.SCATTER, duration: 5 });
    });

    test('level 5+ timing ends with infinite CHASE phase', () => {
      const timing = getScatterChaseTiming(5);
      const last = timing[timing.length - 1];
      expect(last.mode).toBe(GhostMode.CHASE);
      expect(last.duration).toBe(Infinity);
    });

    test('level 1 timing ends with infinite CHASE phase', () => {
      const timing = getScatterChaseTiming(1);
      const last = timing[timing.length - 1];
      expect(last.mode).toBe(GhostMode.CHASE);
      expect(last.duration).toBe(Infinity);
    });
  });

  describe('getCurrentScatterChaseMode', () => {
    test('at clock=0 mode is SCATTER', () => {
      expect(getCurrentScatterChaseMode(0, 1)).toBe(GhostMode.SCATTER);
    });

    test('at clock=8 mode is CHASE (after 7s scatter)', () => {
      expect(getCurrentScatterChaseMode(8, 1)).toBe(GhostMode.CHASE);
    });

    test('at very large clock mode is CHASE (permanent)', () => {
      expect(getCurrentScatterChaseMode(99999, 1)).toBe(GhostMode.CHASE);
    });
  });
});
