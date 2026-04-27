const HS_KEY  = 'pacman.highscores';
const SET_KEY = 'pacman.settings';

export class StorageAdapter {
  constructor(backend = null) {
    this._store = backend || (typeof localStorage !== 'undefined' ? localStorage : new InMemoryStore());
  }

  getHighScores() {
    try {
      const raw = this._store.getItem(HS_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.filter(e => _valid(e)).sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  saveHighScore(entry) {
    const name  = String(entry.name || '').trim().toUpperCase().slice(0, 3);
    const score = Number(entry.score);
    const date  = String(entry.date || '');
    if (!name || isNaN(score) || score < 0 || !_validDate(date)) {
      console.warn('StorageAdapter.saveHighScore: invalid entry', entry);
      return;
    }
    try {
      const list = this.getHighScores();
      list.push({ name, score, date });
      list.sort((a, b) => b.score - a.score);
      this._store.setItem(HS_KEY, JSON.stringify(list.slice(0, 10)));
    } catch {} // storage unavailable
  }

  qualifiesForHighScore(score) {
    const list = this.getHighScores();
    return list.length < 10 || score > (list[9]?.score ?? 0);
  }

  _getSettings() {
    try {
      const raw = this._store.getItem(SET_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch {
      return {};
    }
  }

  getMuteSetting() {
    return !!this._getSettings().muted;
  }

  saveMuteSetting(muted) {
    try {
      const settings = this._getSettings();
      this._store.setItem(SET_KEY, JSON.stringify({ ...settings, muted: !!muted }));
    } catch {} // storage unavailable
  }

  getSpeedSetting() {
    const val = this._getSettings().speedMultiplier;
    const n = parseInt(val, 10);
    return (Number.isInteger(n) && n >= 1 && n <= 5) ? n : 1;
  }

  saveSpeedSetting(multiplier) {
    try {
      const settings = this._getSettings();
      this._store.setItem(SET_KEY, JSON.stringify({ ...settings, speedMultiplier: multiplier }));
    } catch {} // storage unavailable
  }
}

function _valid(e) {
  return e && typeof e.name === 'string' && typeof e.score === 'number'
    && e.score >= 0 && _validDate(e.date);
}

function _validDate(d) {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

class InMemoryStore {
  constructor() { this._data = {}; }
  getItem(k)      { return this._data[k] ?? null; }
  setItem(k, v)   { this._data[k] = v; }
  removeItem(k)   { delete this._data[k]; }
}
