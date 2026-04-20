# Pac-Man Web Game

> **Source**: [`specs/001-init-web-game/`](../../specs/001-init-web-game/) · [← Wiki Index](../index.md)

---

## Overview

Browser-based Pac-Man game built in vanilla JavaScript + HTML5 Canvas with no server dependency. Game logic is pure JS (DOM-free) enabling full TDD coverage; a thin Canvas renderer layer handles display. Vite provides dev/build tooling, Jest covers unit and integration tests, and Playwright validates E2E performance. Targets modern desktop and mobile browsers with 60fps gameplay, ≤33ms input latency, and ≤3s initial load.

## Specification

1. **Play a Game Session (P1)**: Player opens the game, presses start, controls Pac-Man with directional inputs, eats dots to score, loses a life on ghost contact, and reaches game over when lives run out or all dots are cleared.
2. **Power Pellet & Ghost Chase (P2)**: Eating a power pellet causes ghosts to enter frightened mode — Pac-Man can eat them for bonus points; frightened mode expires after a level-based duration.
3. **Score Tracking & High Score (P3)**: Running score is displayed in-game; high scores up to 10 entries are persisted in localStorage and shown on game over.
4. **Level Progression (P4)**: Clearing all dots advances the player to the next level with increased ghost speed and decreased frightened duration per the Pac-Man Dossier.

→ [View full spec](../../specs/001-init-web-game/spec.md)

## Implementation Plan

Pure JS game logic (no DOM/Canvas imports) with a thin rendering layer, using tile-based ghost AI per the Pac-Man Dossier (Jamey Pittman) for authentic behaviour. Object pooling keeps frame times under 16ms; a fixed-timestep game loop decouples logic from render rate. No framework dependencies — single-page static delivery, offline-capable.

→ [View full plan](../../specs/001-init-web-game/plan.md)

## Additional Docs

- [data-model.md](../../specs/001-init-web-game/data-model.md)
- [quickstart.md](../../specs/001-init-web-game/quickstart.md)
- [research.md](../../specs/001-init-web-game/research.md)
- [tasks.md](../../specs/001-init-web-game/tasks.md)
- [checklists/requirements.md](../../specs/001-init-web-game/checklists/requirements.md)
- [contracts/storage.md](../../specs/001-init-web-game/contracts/storage.md)
- [contracts/input.md](../../specs/001-init-web-game/contracts/input.md)
