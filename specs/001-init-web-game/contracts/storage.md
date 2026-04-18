# Storage Contract

**Module**: `src/storage/storage.js`

## Overview

StorageAdapter persists high scores and player settings to `localStorage`. It is the only module that reads or writes `localStorage` — all other modules interact through this interface.

## Interface

```javascript
class StorageAdapter {
  // Returns up to 10 HighScoreEntry objects, sorted descending by score
  getHighScores(): HighScoreEntry[]

  // Saves a new entry; trims list to top 10 after insertion
  saveHighScore(entry: HighScoreEntry): void

  // Returns true if the given score qualifies for the top-10 list
  qualifiesForHighScore(score: number): boolean

  // Returns saved mute preference (default: false = sound on)
  getMuteSetting(): boolean

  // Persists mute preference
  saveMuteSetting(muted: boolean): void
}
```

## localStorage Schema

### Key: `pacman.highscores`

```json
[
  { "name": "AAA", "score": 15200, "date": "2026-04-18" },
  { "name": "BBB", "score": 9400,  "date": "2026-04-17" }
]
```

- Array of `HighScoreEntry` objects
- Maximum 10 entries; sorted descending by `score`
- Entries with equal scores are ordered by `date` descending (most recent first)

### Key: `pacman.settings`

```json
{ "muted": false }
```

## HighScoreEntry Schema

```typescript
interface HighScoreEntry {
  name: string   // 1–3 uppercase chars; required
  score: number  // non-negative integer; required
  date: string   // "YYYY-MM-DD" ISO date; required
}
```

## Validation Rules

- On read: if `JSON.parse` fails or schema is malformed, return `[]` (empty list) and log a warning. Never throw.
- On write: validate `entry.name` (trim, uppercase, clamp to 3 chars), `entry.score` (must be ≥ 0), `entry.date` (must match `YYYY-MM-DD`). Reject invalid entries silently (log warning).
- `qualifiesForHighScore(score)`: returns `true` if the list has fewer than 10 entries OR `score > list[9].score`.

## Constraints

- StorageAdapter MUST NOT import from `src/game/` or `src/rendering/`.
- All reads and writes MUST be wrapped in try/catch (localStorage may be unavailable in private browsing or if storage quota is exceeded).
- In test environments, StorageAdapter MUST accept a dependency-injected storage backend (e.g., an in-memory Map) to avoid touching real `localStorage` in unit tests.
