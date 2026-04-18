import { StorageAdapter } from '../../src/storage/storage.js';

function makeStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => data[k] ?? null,
    setItem: (k, v) => { data[k] = v; },
    removeItem: k => { delete data[k]; },
    _data: data,
  };
}

describe('T045 — StorageAdapter unit tests', () => {
  test('getHighScores returns empty array when nothing stored', () => {
    const adapter = new StorageAdapter(makeStore());
    expect(adapter.getHighScores()).toEqual([]);
  });

  test('getHighScores returns entries sorted descending by score', () => {
    const store = makeStore();
    const adapter = new StorageAdapter(store);
    adapter.saveHighScore({ name: 'AAA', score: 100, date: '2026-01-01' });
    adapter.saveHighScore({ name: 'BBB', score: 500, date: '2026-01-02' });
    adapter.saveHighScore({ name: 'CCC', score: 300, date: '2026-01-03' });
    const scores = adapter.getHighScores();
    expect(scores[0].score).toBe(500);
    expect(scores[1].score).toBe(300);
    expect(scores[2].score).toBe(100);
  });

  test('saveHighScore inserts entry and trims list to 10', () => {
    const adapter = new StorageAdapter(makeStore());
    for (let i = 1; i <= 11; i++) {
      adapter.saveHighScore({ name: 'AAA', score: i * 100, date: '2026-01-01' });
    }
    expect(adapter.getHighScores()).toHaveLength(10);
    // Lowest score (100) should have been trimmed
    expect(adapter.getHighScores().every(e => e.score >= 200)).toBe(true);
  });

  test('qualifiesForHighScore returns true when fewer than 10 entries', () => {
    const adapter = new StorageAdapter(makeStore());
    expect(adapter.qualifiesForHighScore(1)).toBe(true);
  });

  test('qualifiesForHighScore returns true when score beats 10th entry', () => {
    const adapter = new StorageAdapter(makeStore());
    for (let i = 10; i >= 1; i--) {
      adapter.saveHighScore({ name: 'AAA', score: i * 100, date: '2026-01-01' });
    }
    // 10th place is 100; 150 should qualify
    expect(adapter.qualifiesForHighScore(150)).toBe(true);
    expect(adapter.qualifiesForHighScore(50)).toBe(false);
  });

  test('getMuteSetting returns false by default', () => {
    const adapter = new StorageAdapter(makeStore());
    expect(adapter.getMuteSetting()).toBe(false);
  });

  test('saveMuteSetting persists and getMuteSetting reads it back', () => {
    const store = makeStore();
    const adapter = new StorageAdapter(store);
    adapter.saveMuteSetting(true);
    expect(adapter.getMuteSetting()).toBe(true);
    adapter.saveMuteSetting(false);
    expect(adapter.getMuteSetting()).toBe(false);
  });

  test('corrupt JSON in store returns empty array without throwing', () => {
    const store = makeStore({ 'pacman.highscores': 'not-json{{' });
    const adapter = new StorageAdapter(store);
    expect(() => adapter.getHighScores()).not.toThrow();
    expect(adapter.getHighScores()).toEqual([]);
  });

  test('saveHighScore silently rejects invalid name', () => {
    const adapter = new StorageAdapter(makeStore());
    adapter.saveHighScore({ name: '', score: 100, date: '2026-01-01' });
    expect(adapter.getHighScores()).toHaveLength(0);
  });

  test('saveHighScore silently rejects negative score', () => {
    const adapter = new StorageAdapter(makeStore());
    adapter.saveHighScore({ name: 'AAA', score: -1, date: '2026-01-01' });
    expect(adapter.getHighScores()).toHaveLength(0);
  });

  test('saveHighScore silently rejects invalid date format', () => {
    const adapter = new StorageAdapter(makeStore());
    adapter.saveHighScore({ name: 'AAA', score: 100, date: 'Jan 1 2026' });
    expect(adapter.getHighScores()).toHaveLength(0);
  });

  test('saveHighScore normalizes name to uppercase trimmed to 3 chars', () => {
    const adapter = new StorageAdapter(makeStore());
    adapter.saveHighScore({ name: 'abcde', score: 100, date: '2026-01-01' });
    expect(adapter.getHighScores()[0].name).toBe('ABC');
  });
});

describe('T002 — _getSettings helper and saveMuteSetting merge', () => {
  test('_getSettings returns empty object when nothing stored', () => {
    const adapter = new StorageAdapter(makeStore());
    expect(adapter._getSettings()).toEqual({});
  });

  test('_getSettings returns empty object on corrupt JSON', () => {
    const store = makeStore({ 'pacman.settings': 'not-json{{' });
    const adapter = new StorageAdapter(store);
    expect(adapter._getSettings()).toEqual({});
  });

  test('_getSettings returns parsed settings when stored', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ muted: true }) });
    const adapter = new StorageAdapter(store);
    expect(adapter._getSettings()).toEqual({ muted: true });
  });

  test('saveMuteSetting merges without overwriting other settings fields', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ speedMultiplier: 3 }) });
    const adapter = new StorageAdapter(store);
    adapter.saveMuteSetting(true);
    const saved = JSON.parse(store.getItem('pacman.settings'));
    expect(saved.muted).toBe(true);
    expect(saved.speedMultiplier).toBe(3);
  });
});

describe('T018 — getSpeedSetting and saveSpeedSetting', () => {
  test('getSpeedSetting returns 5 when no preference stored', () => {
    const adapter = new StorageAdapter(makeStore());
    expect(adapter.getSpeedSetting()).toBe(5);
  });

  test('getSpeedSetting returns saved value for valid 1–5', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ speedMultiplier: 3 }) });
    const adapter = new StorageAdapter(store);
    expect(adapter.getSpeedSetting()).toBe(3);
  });

  test('getSpeedSetting returns 5 for out-of-range value 6', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ speedMultiplier: 6 }) });
    const adapter = new StorageAdapter(store);
    expect(adapter.getSpeedSetting()).toBe(5);
  });

  test('getSpeedSetting returns 5 for out-of-range value 0', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ speedMultiplier: 0 }) });
    const adapter = new StorageAdapter(store);
    expect(adapter.getSpeedSetting()).toBe(5);
  });

  test('getSpeedSetting returns 5 on corrupt JSON', () => {
    const store = makeStore({ 'pacman.settings': 'corrupt-json' });
    const adapter = new StorageAdapter(store);
    expect(adapter.getSpeedSetting()).toBe(5);
  });

  test('saveSpeedSetting(3) does not overwrite existing muted:true', () => {
    const store = makeStore({ 'pacman.settings': JSON.stringify({ muted: true }) });
    const adapter = new StorageAdapter(store);
    adapter.saveSpeedSetting(3);
    const saved = JSON.parse(store.getItem('pacman.settings'));
    expect(saved.muted).toBe(true);
    expect(saved.speedMultiplier).toBe(3);
  });
});
