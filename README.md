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

The repo also includes two wiki-generation skills: **[spec-wiki-builder and spec-wiki-optimizer](docs/spec-wiki-skills.md)** — Claude Code skills that turn the `specs/` folder into a browsable, consolidated wiki.

---

## Tech stack

- **Vanilla JS ES2022** — no framework
- **HTML5 Canvas 2D** — all rendering
- **Vite 5** — dev server + production build
- **Jest 29** — unit + integration tests (105 passing, 80%+ coverage)
- **Playwright** — E2E performance tests (60fps, ≤33ms input latency)

---

## Speckit extensions

This project uses several Speckit extensions installed via `specify extension add`. The file `.specify/extension-catalogs.yml` **must be present** for that command to resolve extensions — it points to the community catalog:

```yaml
catalogs:
  - name: community-catalog
    url: https://raw.githubusercontent.com/github/spec-kit/c118c1c30f961921e41891df3318a2ccd2ceea54/extensions/catalog.community.json
```

Without it, `specify extension add <name>` cannot discover community extensions.

### Installed extensions

| Extension | What it does |
|-----------|-------------|
| `git` | Feature branch creation, sequential numbering, validation, remote detection |
| `tinyspec` | Lightweight single-file workflow — skips full SDD for small changes |
| `superb` | Bridges superpowers quality-control skills (TDD gate, verify, review) into Speckit |
| `brownfield` | Bootstraps Speckit for existing codebases — auto-discovers tech stack and conventions |

### Superpowers Bridge (superb) — skill symlink hack

The `superb` extension resolves superpowers skills from `.agents/skills/` in the project root (or `~/.agents/skills/` globally). However, Claude Code's superpowers plugin caches its skills at:

```
~/.claude/plugins/cache/claude-plugins-official/superpowers/<version>/skills/
```

These two locations don't match, so `superb` can't find the skills unless you bridge them with symbolic links. Give Claude this prompt to set them up:

> Find the installed superpowers plugin version under `~/.claude/plugins/cache/claude-plugins-official/superpowers/`, then create `.agents/skills/` in the project root and symlink all skills from that cache into it.

The version path will change when superpowers updates — re-run the prompt when that happens.

`.agents/` is gitignored (symlinks point to a machine-local cache path that differs per developer).

### Manually added hooks in `extensions.yml`

Three hook entries were added by hand — they are not provided by any installable extension:

**`after_specify` → `speckit.clarify`**  
Runs the built-in `/clarify` skill immediately after a spec is written. Catches ambiguities and missing acceptance criteria before planning begins.

**`after_plan` → `speckit.checklist`**  
Runs `/checklist` after the implementation plan is produced. Generates a pre-implementation review checklist so edge cases are spotted before any code is written.

**`after_implement` → `simplify` (extension: `claude`)**  
Invokes the `/simplify` skill after each implementation step. Reviews the changed code for unnecessary complexity, redundancy, and clarity, then fixes what it finds.

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
