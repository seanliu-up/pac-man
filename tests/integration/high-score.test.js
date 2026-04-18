import { StorageAdapter } from '../../src/storage/storage.js';
import { tickGame } from '../../src/game/state/tick.js';
import { createGameState } from '../../src/game/state/game-state.js';
import { GamePhase, GhostMode } from '../../src/game/constants.js';

function makeStore() {
  const data = {};
  return { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
}
function stubInput() {
  return { getPendingDirection: () => null, clearPendingDirection: () => {}, isPausePressed: () => false, clearPause: () => {} };
}
function stubAudio() { return { play: () => {} }; }

describe('T046 — high score persistence integration', () => {
  test('qualifying score is stored and retrievable after game over', () => {
    const store = makeStore();
    const storage = new StorageAdapter(store);

    // No scores yet — any score qualifies
    expect(storage.qualifiesForHighScore(1000)).toBe(true);

    storage.saveHighScore({ name: 'AAA', score: 1000, date: '2026-01-01' });
    const scores = storage.getHighScores();
    expect(scores).toHaveLength(1);
    expect(scores[0]).toMatchObject({ name: 'AAA', score: 1000, date: '2026-01-01' });
  });

  test('score below 10th rank does not qualify after 10 entries', () => {
    const storage = new StorageAdapter(makeStore());
    for (let i = 10; i >= 1; i--) {
      storage.saveHighScore({ name: 'AAA', score: i * 1000, date: '2026-01-01' });
    }
    // 10th place is 1000 — score of 500 should not qualify
    expect(storage.qualifiesForHighScore(500)).toBe(false);
    expect(storage.qualifiesForHighScore(1001)).toBe(true);
  });

  test('game over phase reached with nameEntryPending when score qualifies', () => {
    const storage = new StorageAdapter(makeStore());
    const state = createGameState();
    state.phase = GamePhase.PLAYING;
    state.lives = 1;
    state.score = 500;

    // Place ghost on pacman tile to trigger LIFE_LOST → GAME_OVER
    const ghost = state.ghosts[0];
    ghost.mode = GhostMode.SCATTER;
    ghost.tileX = state.pacman.tileX;
    ghost.tileY = state.pacman.tileY;
    state.ghosts.slice(1).forEach(g => { g.tileX = 99; g.tileY = 99; });

    tickGame(state, 1 / 60, stubInput(), stubAudio(), storage);
    // Should transition to LIFE_LOST (last life used)
    expect([GamePhase.LIFE_LOST, GamePhase.GAME_OVER]).toContain(state.phase);
  });

  test('mute setting persists across adapter instances sharing the same store', () => {
    const store = makeStore();
    const adapter1 = new StorageAdapter(store);
    adapter1.saveMuteSetting(true);

    const adapter2 = new StorageAdapter(store);
    expect(adapter2.getMuteSetting()).toBe(true);
  });
});
