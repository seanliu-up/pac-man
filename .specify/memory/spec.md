# Main Project Specification

**Last Updated**: 2026-04-18 | **Version**: 1.0.0

## User Scenarios & Integration Scenarios

### US-001: Play a Game Session (Priority: P1)
**Branch**: `001-init-web-game` [Source: specs/001-init-web-game]

A player opens the game in their browser, starts a new game, navigates Pac-Man through a maze eating dots and avoiding ghosts, and plays until all lives are lost or all dots are cleared.

**Acceptance Criteria**:
1. Game loads and player can press start → Pac-Man appears in maze, ghosts begin moving, directional inputs work
2. Pac-Man moves over dot → dot disappears and score increases
3. Pac-Man contacts ghost in normal state → Pac-Man loses a life; if lives remain round resets; if no lives remain, game over screen shown
4. All dots consumed → level completes and player advances to next level

---

### US-002: Power Pellet & Ghost Chase Mechanic (Priority: P2)
**Branch**: `001-init-web-game` [Source: specs/001-init-web-game]

A player eats a power pellet, causing ghosts to become vulnerable for a limited time, during which Pac-Man can eat them for bonus points.

**Acceptance Criteria**:
1. Pac-Man eats power pellet → all ghosts change to vulnerable state for fixed duration; Pac-Man can eat them
2. Pac-Man collides with vulnerable ghost → ghost is eaten, bonus score awarded, ghost returns to base
3. Vulnerable timer expires → ghosts flash as warning then return to normal state

---

### US-003: Score Tracking & High Score (Priority: P3)
**Branch**: `001-init-web-game` [Source: specs/001-init-web-game]

A player completes or ends a game and can see their final score. If their score is among the top results, it is recorded as a high score for future sessions.

**Acceptance Criteria**:
1. Game ends (all lives lost) → game over screen displays final score prominently
2. Final score qualifies for high score list → player invited to enter name; score saved to list
3. Game has been played at least once → high score screen displays up to 10 top scores with names and scores in descending order

---

### US-004: Level Progression (Priority: P4)
**Branch**: `001-init-web-game` [Source: specs/001-init-web-game]

A player who clears all dots in the current level advances to the next level with increased difficulty — ghosts move faster and the frightened duration decreases.

**Acceptance Criteria**:
1. All dots cleared → level-complete animation plays, level counter increments, maze resets with all dots restored
2. Player on level 2+ → ghosts move noticeably faster than on level 1
3. Power pellet eaten on level 3+ → frightened duration is shorter than on level 1

---

## Functional Requirements

- **FR-001**: Game MUST display classic Pac-Man maze with dots, power pellets, and ghost starting positions
- **FR-002**: Players MUST control Pac-Man using keyboard arrow keys and/or WASD keys
- **FR-003**: Game MUST include four ghosts with distinct movement behavior; ghosts alternate between timed scatter/chase cycles per level; switch to frightened mode on power pellet
- **FR-004**: Game MUST track and display current score, lives remaining, and current level
- **FR-005**: Game MUST award points: dots (10 pts), power pellets (50 pts), ghosts (200/400/800/1600 pts per ghost in single power pellet session)
- **FR-006**: Game MUST transition to game over when all lives lost, display final score; player starts each game with 3 lives
- **FR-007**: Game MUST advance player to next level when all dots and power pellets consumed
- **FR-008**: Ghost speed and frightened duration MUST increase in difficulty with each level
- **FR-009**: Game MUST save up to 10 high scores locally, persisting them between browser sessions
- **FR-010**: Game MUST support touch/swipe controls on mobile browsers as alternative to keyboard input
- **FR-011**: Players MUST be able to pause and resume game at any time during play
- **FR-012**: Game MUST play sound effects for eating dots, eating ghosts, losing a life, and level completion; sound on by default; players can mute/unmute at any time
- **FR-013**: Game MUST award one extra life when player's score first reaches 10,000 points; only one bonus life awarded per game session

---

## Key Entities

- **Player**: Session state with score, remaining lives (starts with 3), and current level
- **Pac-Man**: Player-controlled character with position, direction, and speed
- **Ghost**: AI-controlled adversary with position, direction, behavior mode (scatter/chase/frightened/eaten), speed, scatter-chase cycle timer; each ghost has distinct chase targeting strategy
- **Dot**: Collectible item in maze worth 10 points; has position and collected/uncollected state
- **Power Pellet**: Special collectible that temporarily makes ghosts vulnerable; has position and collected state
- **Maze**: Game board defining walls, paths, dot positions, and ghost movement zones (28×31 tiles)
- **High Score Entry**: Saved game record with player name, score, and date

---

## Success Criteria

- **SC-001**: Players can start playable game session within 3 seconds of loading page
- **SC-002**: Pac-Man responds to directional input within one game frame (no perceivable lag)
- **SC-003**: Game maintains minimum 30 fps during normal gameplay on modern browsers (released within last 3 years)
- **SC-004**: 90% of first-time players can move Pac-Man, eat dots, and understand objective within 60 seconds without reading instructions
- **SC-005**: High scores reliably persisted and retrievable across at least 10 consecutive browser sessions without data loss
- **SC-006**: Game fully playable on screen widths from 375px (mobile) to 1920px (desktop) without requiring horizontal scrolling

---

## Edge Cases & Error Handling

- Player closes browser mid-game → session ends; previously saved high scores preserved
- Player holds two directional inputs simultaneously → last or most recent input wins; Pac-Man moves in one direction at a time
- Very small screen sizes or mobile browsers → game displays with minimum playable size; layout adapts where possible
- No high scores exist yet → high score screen shows empty/placeholder state with prompt to play

---

## Clarifications

**Session 2026-04-18:**
- Starting lives: 3 (classic arcade default)
- Ghost mode switching: Classic timed cycles — ghosts alternate scatter/chase on fixed time intervals per level
- Minimum frame rate: 30fps on modern browsers
- Bonus lives: One extra life at 10,000 points (classic arcade); one per game session only
- Fruit bonuses: Out of scope for v1
- Multiplayer: Out of scope for v1
- Custom/randomized mazes: Out of scope for v1

---

## Assumptions

- Players have modern web browser (released within last 3 years); no plugins/extensions required
- Single-player only; no multiplayer or online leaderboards in scope
- High scores stored locally on player's device; no account system or server-side persistence
- Single fixed maze layout (classic Pac-Man board)
- Fruit bonus items out of scope for v1
- Sound effects on by default; mute/unmute control always accessible; game fully playable without sound
- Visual style inspired by classic Pac-Man arcade aesthetics (pixel/retro baseline)
- Keyboard controls primary input method; touch controls secondary enhancement
