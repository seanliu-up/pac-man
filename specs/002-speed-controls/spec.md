# Feature Specification: Game Speed Controls

**Feature Branch**: `002-speed-controls`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "add control options for speed and make default speed to 5 times that it is now."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Game Speed Before Playing (Priority: P1)

A player wants to choose how fast the game runs before starting. They open the settings panel (accessible from the main menu), see the speed options, and select their preferred multiplier. The game then starts at the chosen speed.

**Why this priority**: The primary use case — players need a way to set their preferred speed before committing to a full game. Without this, the 5× default cannot be changed at all.

**Independent Test**: Can be fully tested by opening the main menu, navigating to settings, changing the speed option, starting a game, and verifying all entities move at the selected speed.

**Acceptance Scenarios**:

1. **Given** the player is on the main menu, **When** they open settings, **Then** they see a speed control with at least 5 options (1×, 2×, 3×, 4×, 5×) and the current selection is highlighted.
2. **Given** the settings panel is open, **When** the player selects 1×, **Then** the selection is saved and the next game runs at original speed.
3. **Given** the settings panel is open, **When** the player selects 5×, **Then** the selection is saved and the next game runs at 5× the original speed.
4. **Given** no prior preference is saved, **When** the player starts a game, **Then** the game runs at 5× the original speed by default.

---

### User Story 2 - Change Speed While Paused (Priority: P2)

A player discovers mid-game that the current speed is too fast or too slow. They pause the game, adjust the speed setting, and resume. The new speed takes effect immediately upon resuming.

**Why this priority**: Enhances accessibility and replayability — players can fine-tune without abandoning a session.

**Independent Test**: Can be fully tested by starting a game, pausing it, changing the speed setting, resuming, and confirming entities move at the new speed.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** the player pauses, **Then** the speed control is accessible in the pause menu.
2. **Given** the pause menu is open, **When** the player changes the speed, **Then** on resume all entities move at the newly selected speed.
3. **Given** the game is not paused, **When** the player is playing, **Then** the speed control is not accessible (prevents accidental mid-action changes).

---

### User Story 3 - Speed Preference Persists Across Sessions (Priority: P3)

A player who previously set their preferred speed returns to the game another day. Their speed preference is automatically restored so they don't need to reconfigure it.

**Why this priority**: Quality-of-life improvement — players should not need to reconfigure each session, but the game remains fully functional even if storage fails.

**Independent Test**: Can be fully tested by setting a non-default speed, closing and reopening the browser, starting a game, and confirming it runs at the previously selected speed.

**Acceptance Scenarios**:

1. **Given** a player sets speed to 3× and closes the browser, **When** they return and start a game, **Then** the game runs at 3× automatically.
2. **Given** no prior preference is stored (first visit), **When** a game starts, **Then** the game runs at 5× (the new default).
3. **Given** stored preference data is unavailable or corrupted, **When** a game starts, **Then** the game falls back to 5× without error.

---

### Edge Cases

- What happens when a player rapidly clicks through speed options? The last selected value wins; intermediate values do not cause instability.
- What happens if the game is running at 5× and a level transition occurs? Speed scaling carries through level transitions correctly, adjusting per-level base values proportionally.
- What happens if the speed setting is changed and high scores already exist? Existing high scores are unaffected; speed setting does not alter the scoring system.
- How does the system handle a speed of 1× after being set to 5×? Entities slow to 1× immediately on resume with no visual glitches.
- What happens to frightened (blue) ghost speed at high multipliers? Frightened ghost speed scales by the same multiplier as all other entities — uniform scaling applies to all movement states, including frightened mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST offer exactly 5 speed presets: 1× (original), 2×, 3×, 4×, and 5× the original base speed.
- **FR-002**: The default speed preset MUST be 5×, applied automatically when no player preference has been saved.
- **FR-003**: Players MUST be able to access and change the speed control from the main menu settings panel.
- **FR-004**: Players MUST be able to access and change the speed control from the in-game pause menu.
- **FR-005**: The speed multiplier MUST apply uniformly to all moving entities and all movement states (Pac-Man, normal ghosts, and frightened ghosts), preserving their relative speed ratios across all states.
- **FR-006**: Speed changes made in the pause menu MUST take effect immediately when the game resumes.
- **FR-007**: The currently active speed setting MUST be visually highlighted in the settings panel and pause menu so players can identify their selection at a glance.
- **FR-011**: The active speed multiplier MUST be displayed as a passive label in the in-game HUD (score/status area) during gameplay — display only, no interaction.
- **FR-008**: The player's chosen speed preference MUST be persisted and automatically restored in subsequent sessions.
- **FR-009**: If the stored speed preference cannot be read, the game MUST silently fall back to the 5× default without displaying an error.
- **FR-010**: The speed multiplier MUST scale proportionally with the per-level speed progression (the level system's relative increases are preserved on top of the global multiplier).

### Key Entities

- **SpeedPreset**: A selectable speed option with a display label (e.g., "1×", "5×") and a numeric multiplier value (1–5).
- **SpeedSetting**: The player's persisted preference, stored alongside existing game settings (mute, etc.) and restored on load.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The game launches at 5× the original speed by default, without any player configuration, 100% of the time on a fresh install.
- **SC-002**: Players can locate and change the speed setting in under 10 seconds from the main menu.
- **SC-003**: Speed changes take effect within the same frame the game resumes — no perceptible delay after unpausing.
- **SC-004**: A player's speed preference survives 100% of browser/tab close-and-reopen cycles on the same device.
- **SC-005**: All moving entities respond proportionally to speed changes — at any preset, no entity moves faster or slower relative to others than it would at 1×.
- **SC-006**: The game maintains its target frame rate at all 5 speed presets with no observable stuttering.

## Clarifications

### Session 2026-04-18

- Q: Does the speed multiplier apply to frightened (blue) ghost speed, or should it be capped to keep ghosts catchable? → A: Uniform scaling — frightened ghost speed scales by the same multiplier as all other entities.
- Q: Should the active speed setting be visible during gameplay in the HUD? → A: Passive HUD label — the current speed multiplier is displayed in the score/status area during gameplay (display only, no interaction).

## Assumptions

- The speed control exposes exactly 5 discrete presets (1×–5×); a continuous slider is out of scope for this version.
- Speed scaling applies to all moving entities uniformly; independent Pac-Man vs. ghost speed adjustment is out of scope.
- The speed control surfaces in two places: the main menu settings panel and the pause menu. An in-HUD interactive control (changing speed without pausing) is out of scope; a passive HUD label showing the active multiplier during gameplay is in scope.
- Existing high score records are not tagged by speed; score values are not adjusted based on speed multiplier.
- The settings persistence mechanism already in use (browser-local storage, same domain) is extended to store the speed preference alongside the existing mute setting.
- The per-level difficulty progression (where each level slightly increases entity speeds) remains intact and stacks multiplicatively with the global speed multiplier.
