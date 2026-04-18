# Main Project Specification

**Last Updated**: 2026-04-18 | **Version**: 1.2.0

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

### US-008: Pac-Man Faces Movement Direction (Priority: P3)
**Branch**: `003-pacman-facing-direction` [Source: specs/tiny/pacman-facing-direction.md]

Pac-Man's mouth gap always faces the direction it is currently moving, giving players clear visual feedback about the character's orientation.

**Acceptance Criteria**:
1. Pac-Man moves RIGHT → mouth gap faces right
2. Pac-Man moves LEFT → mouth gap faces left
3. Pac-Man moves UP → mouth gap faces up
4. Pac-Man moves DOWN → mouth gap faces down
5. Pac-Man has no direction (stationary, before first input) → mouth gap faces right by default
6. Mouth open/close animation continues unchanged regardless of direction

---

### US-005: Select Game Speed Before Playing (Priority: P1)
**Branch**: `002-speed-controls` [Source: specs/002-speed-controls]

A player wants to choose how fast the game runs before starting. They open the settings panel (accessible from the main menu), see the speed options, and select their preferred multiplier. The game then starts at the chosen speed.

**Acceptance Criteria**:
1. On the main menu, player sees a speed control with at least 5 options (1×, 2×, 3×, 4×, 5×) and the current selection is highlighted
2. Player selects 1× → selection saved; next game runs at original speed
3. Player selects 5× → selection saved; next game runs at 5× the original speed
4. No prior preference saved → game runs at 5× the original speed by default

---

### US-006: Change Speed While Paused (Priority: P2)
**Branch**: `002-speed-controls` [Source: specs/002-speed-controls]

A player discovers mid-game that the current speed is too fast or too slow. They pause the game, adjust the speed setting, and resume. The new speed takes effect immediately upon resuming.

**Acceptance Criteria**:
1. Game is running → player pauses → speed control is accessible in the pause menu
2. Pause menu is open → player changes speed → on resume all entities move at the newly selected speed
3. Game is not paused → speed control is not accessible (prevents accidental mid-action changes)

---

### US-007: Speed Preference Persists Across Sessions (Priority: P3)
**Branch**: `002-speed-controls` [Source: specs/002-speed-controls]

A player who previously set their preferred speed returns to the game another day. Their speed preference is automatically restored so they don't need to reconfigure it.

**Acceptance Criteria**:
1. Player sets speed to 3× and closes browser → on return the game runs at 3× automatically
2. No prior preference stored (first visit) → game starts at 5×
3. Stored preference data unavailable or corrupted → game falls back to 5× without error

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
- **FR-014**: The game MUST offer exactly 5 speed presets: 1× (original), 2×, 3×, 4×, and 5× the original base speed [Source: specs/002-speed-controls]
- **FR-015**: The default speed preset MUST be 5×, applied automatically when no player preference has been saved [Source: specs/002-speed-controls]
- **FR-016**: Players MUST be able to access and change the speed control from the main menu settings panel [Source: specs/002-speed-controls]
- **FR-017**: Players MUST be able to access and change the speed control from the in-game pause menu [Source: specs/002-speed-controls]
- **FR-018**: The speed multiplier MUST apply uniformly to all moving entities and all movement states (Pac-Man, normal ghosts, and frightened ghosts), preserving their relative speed ratios across all states [Source: specs/002-speed-controls]
- **FR-019**: Speed changes made in the pause menu MUST take effect immediately when the game resumes [Source: specs/002-speed-controls]
- **FR-020**: The currently active speed setting MUST be visually highlighted in the settings panel and pause menu so players can identify their selection at a glance [Source: specs/002-speed-controls]
- **FR-021**: The active speed multiplier MUST be displayed as a passive label in the in-game HUD (score/status area) during gameplay — display only, no interaction [Source: specs/002-speed-controls]
- **FR-022**: The player's chosen speed preference MUST be persisted and automatically restored in subsequent sessions [Source: specs/002-speed-controls]
- **FR-023**: If the stored speed preference cannot be read, the game MUST silently fall back to the 5× default without displaying an error [Source: specs/002-speed-controls]
- **FR-024**: The speed multiplier MUST scale proportionally with the per-level speed progression (the level system's relative increases are preserved on top of the global multiplier) [Source: specs/002-speed-controls]
- **FR-025**: Pac-Man's sprite MUST visually face the direction it is currently moving — the mouth gap rotates to match UP, DOWN, LEFT, and RIGHT [Source: specs/tiny/pacman-facing-direction.md]
- **FR-026**: When Pac-Man has no current direction (NONE, before the player's first input), the mouth gap MUST face right by default [Source: specs/tiny/pacman-facing-direction.md]
- **FR-027**: The mouth open/close animation MUST continue unaffected by the active movement direction [Source: specs/tiny/pacman-facing-direction.md]

---

## Key Entities

- **Player**: Session state with score, remaining lives (starts with 3), and current level
- **Pac-Man**: Player-controlled character with position, direction, and speed; sprite faces the current direction of movement (rotated at draw time)
- **Ghost**: AI-controlled adversary with position, direction, behavior mode (scatter/chase/frightened/eaten), speed, scatter-chase cycle timer; each ghost has distinct chase targeting strategy
- **Dot**: Collectible item in maze worth 10 points; has position and collected/uncollected state
- **Power Pellet**: Special collectible that temporarily makes ghosts vulnerable; has position and collected state
- **Maze**: Game board defining walls, paths, dot positions, and ghost movement zones (28×31 tiles)
- **High Score Entry**: Saved game record with player name, score, and date
- **SpeedPreset**: A selectable speed option with a display label (e.g., "1×", "5×") and a numeric multiplier value (1–5) [Source: specs/002-speed-controls]
- **SpeedSetting**: The player's persisted preference, stored alongside existing game settings (mute, etc.) and restored on load [Source: specs/002-speed-controls]

---

## Success Criteria (002-speed-controls additions)

- **SC-007**: The game launches at 5× the original speed by default, without any player configuration, 100% of the time on a fresh install [Source: specs/002-speed-controls]
- **SC-008**: Players can locate and change the speed setting in under 10 seconds from the main menu [Source: specs/002-speed-controls]
- **SC-009**: Speed changes take effect within the same frame the game resumes — no perceptible delay after unpausing [Source: specs/002-speed-controls]
- **SC-010**: A player's speed preference survives 100% of browser/tab close-and-reopen cycles on the same device [Source: specs/002-speed-controls]
- **SC-011**: All moving entities respond proportionally to speed changes — at any preset, no entity moves faster or slower relative to others than it would at 1× [Source: specs/002-speed-controls]
- **SC-012**: The game maintains its target frame rate at all 5 speed presets with no observable stuttering [Source: specs/002-speed-controls]
- **SC-013**: Pac-Man's sprite orientation matches its movement direction for all 4 directions with no perceptible delay — the rotation is applied within the same frame as the direction change [Source: specs/tiny/pacman-facing-direction.md]

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
- Player rapidly clicks through speed options → last selected value wins; intermediate values do not cause instability [Source: specs/002-speed-controls]
- Level transition occurs while game is running at 5× → speed scaling carries through level transitions correctly, adjusting per-level base values proportionally [Source: specs/002-speed-controls]
- Speed setting changed after high scores already exist → existing high scores are unaffected; speed setting does not alter the scoring system [Source: specs/002-speed-controls]
- Frightened ghost speed at high multipliers → frightened ghost speed scales by the same multiplier as all other entities; uniform scaling applies to all movement states including frightened mode [Source: specs/002-speed-controls]
- Pac-Man direction is NONE at game start → sprite faces right (default orientation) until first directional input [Source: specs/tiny/pacman-facing-direction.md]

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
