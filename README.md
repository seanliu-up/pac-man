# Pac-Man — Speckit Demo

A browser-based Pac-Man clone built entirely through **spec-driven development** using [Speckit](https://github.com/github/spec-kit). This repo demonstrates how Speckit structures a real project from constitution through implementation.

**[Play it live →](https://seanliu-up.github.io/pac-man/)**

---

## What this demos

| Speckit artifact | Location | Purpose |
|-----------------|----------|---------|
| Constitution | `.specify/memory/constitution.md` | Non-negotiable principles (TDD, 60fps, cyclomatic ≤10) |
| Full spec | `specs/001-init-web-game/spec.md` | Core gameplay — maze, ghosts, scoring, high scores |
| Full spec | `specs/002-speed-controls/spec.md` | Speed preset selector (keys 1–5, localStorage) |
| TinySpec | `specs/tiny/speed-5x-1x-default.md` | Small targeted change — rebalance speed presets |
| TinySpec | `specs/tiny/pacman-facing-direction.md` | Pac-Man sprite rotation by movement direction |

Speckit guided every step: constitution → spec → plan → tasks → implementation → archive.

---

## Tech stack

- **Vanilla JS ES2022** — no framework
- **HTML5 Canvas 2D** — all rendering
- **Vite 5** — dev server + production build
- **Jest 29** — unit + integration tests (105 passing, 80%+ coverage)
- **Playwright** — E2E performance tests (60fps, ≤33ms input latency)

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + integration
npm run test:e2e   # Playwright performance
```

---

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move Pac-Man |
| `1`–`5` | Speed preset |
| `M` | Toggle mute |
| `P` | Pause |
