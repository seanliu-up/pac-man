# Feature Specification: Pac-Man Web Game

**Feature Branch**: `001-init-web-game`
**Created**: 2026-04-18
**Status**: Tasked
**Input**: User description: "init project for web game"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Game Session (Priority: P1)

A player opens the game in their browser, starts a new game, navigates Pac-Man through a maze eating dots and avoiding ghosts, and plays until all lives are lost or all dots are cleared.

**Why this priority**: Core gameplay loop — without this, nothing else matters. Delivers the primary entertainment value of the game.

**Independent Test**: Can be fully tested by loading the game, pressing start, using directional controls to move Pac-Man, eating dots, encountering ghosts, and reaching a game over screen — delivering a complete, playable game session.

**Acceptance Scenarios**:

1. **Given** the game is loaded in a browser, **When** the player presses the start button, **Then** Pac-Man appears in the maze, ghosts begin moving, and the player can control Pac-Man using directional inputs
2. **Given** Pac-Man is moving through the maze, **When** Pac-Man moves over a dot, **Then** the dot disappears and the score increases
3. **Given** Pac-Man contacts a ghost in normal state, **When** the collision occurs, **Then** Pac-Man loses a life, and if lives remain the round resets; if no lives remain, a game over screen is shown
4. **Given** all dots in the maze are eaten, **When** the last dot is consumed, **Then** the level is completed and the player advances to the next level

---

### User Story 2 - Power Pellet & Ghost Chase Mechanic (Priority: P2)

A player eats a power pellet, causing ghosts to become vulnerable for a limited time, during which Pac-Man can eat them for bonus points.

**Why this priority**: Classic Pac-Man differentiator — power pellets create strategic depth and the most exciting moments in gameplay.

**Independent Test**: Can be fully tested by: loading the game, eating a power pellet, observing ghost state change, moving Pac-Man into a ghost to eat it, and seeing bonus score awarded.

**Acceptance Scenarios**:

1. **Given** Pac-Man eats a power pellet, **When** the pellet is consumed, **Then** all ghosts change to a vulnerable state for a fixed duration and Pac-Man can eat them
2. **Given** ghosts are in vulnerable state, **When** Pac-Man collides with a vulnerable ghost, **Then** the ghost is eaten, a bonus score is awarded, and the ghost returns to its base before resuming normal behavior
3. **Given** the vulnerable timer expires, **When** time runs out, **Then** ghosts flash as a warning and then return to their normal threatening state

---

### User Story 3 - Score Tracking & High Score (Priority: P3)

A player completes or ends a game and can see their final score. If their score is among the top results, it is recorded as a high score for future sessions.

**Why this priority**: Replayability driver — gives players a goal to beat and recognition for skill.

**Independent Test**: Can be fully tested by: playing a game session to completion, viewing the final score on game over screen, and verifying the score persists and appears in the high score list on subsequent sessions.

**Acceptance Scenarios**:

1. **Given** the game ends (all lives lost), **When** the game over screen appears, **Then** the player's final score is prominently displayed
2. **Given** the player's final score qualifies for the high score list, **When** the game over screen appears, **Then** the player is invited to enter their name, and the score is saved to the high score list
3. **Given** the game has been played at least once, **When** the player views the high score screen, **Then** up to 10 top scores are displayed with player names and scores in descending order

---

### User Story 4 - Level Progression (Priority: P4)

A player who clears all dots in the current level advances to the next level with increased difficulty — ghosts move faster and the frightened duration decreases.

**Why this priority**: Progression keeps experienced players engaged beyond the first level.

**Independent Test**: Can be fully tested by clearing all dots on level 1, observing the level transition animation, and confirming ghost speed increases on level 2.

**Acceptance Scenarios**:

1. **Given** all dots are cleared, **When** level transition occurs, **Then** a brief level-complete animation plays, the level counter increments, and the maze resets with all dots restored
2. **Given** the player is on level 2 or higher, **When** ghosts are moving, **Then** ghosts move noticeably faster than on level 1
3. **Given** the player eats a power pellet on level 3 or higher, **When** the frightened timer is active, **Then** the frightened duration is shorter than on level 1

---

### Edge Cases

- What happens when the player closes the browser mid-game? (Session ends; high scores already saved are preserved)
- What happens if the player holds two directional inputs simultaneously? (Last or most recent input wins; Pac-Man moves in one direction at a time)
- What happens on very small screen sizes or mobile browsers? (Game displays with a minimum playable size; layout adapts where possible)
- What happens if no high scores exist yet? (High score screen shows empty/placeholder state with a prompt to play)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST display a classic Pac-Man maze with dots, power pellets, and ghost starting positions
- **FR-002**: Players MUST be able to control Pac-Man using keyboard arrow keys and/or WASD keys
- **FR-003**: The game MUST include four ghosts, each with distinct movement behavior; ghosts alternate between timed scatter mode and chase mode in fixed cycles per level, and switch to frightened mode when Pac-Man eats a power pellet
- **FR-004**: The game MUST track and display the player's current score, number of lives remaining, and current level
- **FR-005**: The game MUST award points for eating dots (10 pts), power pellets (50 pts), and ghosts (200/400/800/1600 pts per ghost in a single power pellet session)
- **FR-006**: The game MUST transition to a game over state when all lives are lost, displaying the final score; the player starts each new game with 3 lives
- **FR-007**: The game MUST advance the player to the next level when all dots and power pellets in the current maze are consumed
- **FR-008**: Ghost speed and frightened duration MUST increase in difficulty with each level
- **FR-009**: The game MUST save up to 10 high scores locally, persisting them between browser sessions
- **FR-010**: The game MUST support touch/swipe controls on mobile browsers as an alternative to keyboard input
- **FR-011**: Players MUST be able to pause and resume the game at any time during play
- **FR-012**: The game MUST play sound effects for eating dots, eating ghosts, losing a life, and level completion; sound is on by default and players can mute/unmute at any time during play
- **FR-013**: The game MUST award one extra life when the player's score first reaches 10,000 points; only one bonus life is awarded per game session regardless of score

### Key Entities

- **Player**: Represents the user in a game session; has a score, remaining lives (starts with 3), and current level
- **Pac-Man**: The player-controlled character; has position, direction, and speed
- **Ghost**: An AI-controlled adversary; has position, direction, behavior mode (scatter/chase/frightened/eaten), speed, and a scatter-chase cycle timer; each of the four ghosts has a distinct chase targeting strategy
- **Dot**: A collectible item in the maze worth points; has position and a collected/uncollected state
- **Power Pellet**: A special collectible that temporarily makes ghosts vulnerable; has position and collected state
- **Maze**: The game board; defines walls, paths, dot positions, and ghost movement zones
- **High Score Entry**: A saved record of a completed game; has player name, score, and date

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can start a playable game session within 3 seconds of loading the page, with no additional installation or setup required
- **SC-002**: Pac-Man responds to directional input within one game frame (no perceivable lag between keypress and movement)
- **SC-003**: The game maintains a minimum of 30 frames per second during normal gameplay on any device with a modern browser (released within the last 3 years)
- **SC-004**: 90% of first-time players can successfully move Pac-Man, eat dots, and understand the objective within 60 seconds without reading instructions
- **SC-005**: High scores are reliably persisted and retrievable across at least 10 consecutive browser sessions without data loss
- **SC-006**: The game is fully playable on screen widths from 375px (mobile) to 1920px (desktop) without requiring horizontal scrolling

## Clarifications

### Session 2026-04-18

- Q: How many lives does the player start with? → A: 3 lives (classic arcade default)
- Q: How do ghosts switch between scatter and chase modes? → A: Classic timed cycles — ghosts alternate scatter/chase on fixed time intervals per level
- Q: What is the minimum frame rate target for SC-003? → A: 30fps minimum on modern browsers
- Q: Are bonus lives awarded during play? → A: One extra life at 10,000 points (classic arcade); one per game session only
- Q: Are fruit bonus items in scope? → A: No — fruit bonuses are out of scope for v1

## Assumptions

- Players have a modern web browser (released within the last 3 years); no plugins or extensions are required
- The game is single-player only; no multiplayer or online leaderboards are in scope for v1
- High scores are stored locally on the player's device; no account system or server-side persistence is required
- The game uses a single fixed maze layout (classic Pac-Man board); custom or randomized mazes are out of scope for v1
- Fruit bonus items (cherry, strawberry, etc.) are out of scope for v1; only dots, power pellets, and ghosts affect scoring
- Sound effects are on by default; a mute/unmute control is always accessible; the game is fully playable without sound (for silent/accessibility contexts)
- The visual style is inspired by classic Pac-Man arcade aesthetics; a pixel/retro look is the baseline, not a modernized redesign
- Keyboard controls are the primary input method; touch controls are a secondary enhancement
