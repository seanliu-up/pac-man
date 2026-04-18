# Data Model: Pac-Man Web Game

**Branch**: `001-init-web-game` | **Date**: 2026-04-18

All entities in `src/game/` are plain JavaScript objects/classes with zero DOM/Canvas dependencies.

---

## Entity: GameState

Top-level session container. Owns all sub-entities and drives the game loop.

| Field | Type | Description |
|-------|------|-------------|
| `phase` | `GamePhase` | Current game phase (see state machine below) |
| `score` | `number` | Current score (non-negative integer) |
| `lives` | `number` | Remaining lives (0–3); starts at 3 |
| `level` | `number` | Current level (1-indexed) |
| `bonusLifeAwarded` | `boolean` | Whether the 10,000-point bonus life has been awarded this session |
| `pacman` | `PacMan` | Player-controlled entity |
| `ghosts` | `Ghost[4]` | [Blinky, Pinky, Inky, Clyde] |
| `maze` | `Maze` | The maze tile grid and collectibles |
| `scatterChaseClock` | `number` | Seconds elapsed in current scatter/chase phase |
| `frightTimer` | `number` | Seconds remaining in frightened mode (0 if inactive) |

### GamePhase State Machine

```
START → PLAYING → PAUSED → PLAYING
PLAYING → LIFE_LOST → (lives > 0) → PLAYING
                     → (lives = 0) → GAME_OVER
PLAYING → LEVEL_COMPLETE → PLAYING (next level)
GAME_OVER → START (new game)
```

**Valid phases**: `START` | `PLAYING` | `PAUSED` | `LIFE_LOST` | `LEVEL_COMPLETE` | `GAME_OVER`

---

## Entity: PacMan

| Field | Type | Description |
|-------|------|-------------|
| `tileX` | `number` | Current tile column (0-based) |
| `tileY` | `number` | Current tile row (0-based) |
| `pixelX` | `number` | Sub-tile pixel offset for smooth animation (0–TILE_SIZE) |
| `pixelY` | `number` | Sub-tile pixel offset |
| `direction` | `Direction` | Current movement direction |
| `pendingDirection` | `Direction \| null` | Buffered input (resolved each tick) |
| `speed` | `number` | Tiles per second (level-dependent) |
| `mouthAngle` | `number` | Animation state for chomp (degrees, 0–45) |

**Direction values**: `UP` | `DOWN` | `LEFT` | `RIGHT` | `NONE`

---

## Entity: Ghost

Four instances: Blinky, Pinky, Inky, Clyde. Differentiated by `id` and AI strategy.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `GhostId` | `BLINKY` \| `PINKY` \| `INKY` \| `CLYDE` |
| `tileX` | `number` | Current tile column |
| `tileY` | `number` | Current tile row |
| `pixelX` | `number` | Sub-tile pixel offset |
| `pixelY` | `number` | Sub-tile pixel offset |
| `direction` | `Direction` | Current movement direction |
| `mode` | `GhostMode` | Current behavioral mode |
| `speed` | `number` | Tiles per second (mode and level-dependent) |
| `scatterCorner` | `{ x: number, y: number }` | Home corner tile for scatter mode |
| `frightenedFlashing` | `boolean` | True when frightened timer ≤ 2s (warning flash) |

### GhostMode State Machine

```
HOUSE → LEAVING_HOUSE → SCATTER ⇌ CHASE
                                 ↓ (power pellet)
                            FRIGHTENED
                                 ↓ (eaten)
                               EATEN → HOUSE → LEAVING_HOUSE
```

**Valid modes**: `HOUSE` | `LEAVING_HOUSE` | `SCATTER` | `CHASE` | `FRIGHTENED` | `EATEN`

**Mode transition rules**:
- `SCATTER → CHASE` and `CHASE → SCATTER`: driven by `scatterChaseClock` in `GameState`
- When mode switches between `SCATTER` and `CHASE`: ghost reverses direction immediately (one-time reversal exception)
- Power pellet consumed: all non-EATEN, non-HOUSE ghosts switch to `FRIGHTENED`; timer set to level-dependent duration
- `FRIGHTENED` timer expires: return to whichever of `SCATTER`/`CHASE` is current per the clock
- Pac-Man eats a ghost: switch to `EATEN`; navigate to ghost house; on arrival, return to `HOUSE` then `LEAVING_HOUSE`

---

## Entity: Dot

244 instances per maze, pre-allocated at game init.

| Field | Type | Description |
|-------|------|-------------|
| `tileX` | `number` | Fixed tile column |
| `tileY` | `number` | Fixed tile row |
| `collected` | `boolean` | Toggled to `true` when eaten; never deallocated |

**Point value**: 10

---

## Entity: PowerPellet

4 instances per maze, pre-allocated at game init.

| Field | Type | Description |
|-------|------|-------------|
| `tileX` | `number` | Fixed tile column (corners of maze) |
| `tileY` | `number` | Fixed tile row |
| `collected` | `boolean` | Toggled to `true` when eaten |
| `visible` | `boolean` | Blinks at ~2Hz during play (rendering-only, not game-logic state) |

**Point value**: 50

---

## Entity: Maze

Single instance per game. Immutable tile grid; collectible state is managed by Dot/PowerPellet entities.

| Field | Type | Description |
|-------|------|-------------|
| `tiles` | `TileType[][]` | 28×31 grid of tile types |
| `dots` | `Dot[]` | All 244 dot instances |
| `powerPellets` | `PowerPellet[]` | All 4 power pellet instances |
| `totalDots` | `number` | 248 (244 dots + 4 pellets); used for level-complete check |

**TileType values**: `WALL` | `PATH` | `GHOST_HOUSE` | `GHOST_DOOR` | `TUNNEL`

**Validation rules**:
- Level complete when `dots.filter(d => !d.collected).length + powerPellets.filter(p => !p.collected).length === 0`
- Pac-Man and ghosts can only occupy `PATH`, `TUNNEL`, or `GHOST_HOUSE`/`GHOST_DOOR` (ghosts only)

---

## Entity: HighScoreEntry

Persisted to `localStorage`. Up to 10 entries stored.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Player name (1–3 characters, uppercase, classic arcade style) |
| `score` | `number` | Final score (non-negative integer) |
| `date` | `string` | ISO 8601 date string (`YYYY-MM-DD`) |

**Validation rules**:
- `name`: required, 1–3 characters, trimmed, uppercase-normalized on save
- `score`: non-negative integer
- List is sorted descending by `score`; only top 10 entries retained

---

## Difficulty Scaling (Level → Ghost Speed + Frightened Duration)

| Level | Ghost Speed (% of max) | Frightened Duration |
|-------|----------------------|---------------------|
| 1 | 75% | 6s |
| 2 | 85% | 5s |
| 3–4 | 90% | 4s |
| 5+ | 95% | 3s |

Pac-Man base speed: 80% of max on level 1; scales up to 90% by level 5.

---

## Scoring Reference

| Event | Points |
|-------|--------|
| Dot | 10 |
| Power pellet | 50 |
| 1st ghost in power session | 200 |
| 2nd ghost | 400 |
| 3rd ghost | 800 |
| 4th ghost | 1,600 |
| Bonus life | Awarded at 10,000 pts (once per session) |
