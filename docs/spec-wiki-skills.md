# Spec Wiki Skills

Two Claude Code skills that turn a `specs/` folder into a browsable, consolidated wiki.

---

## spec-wiki-builder

Reads every feature folder under `specs/` and generates a wiki page for each one, plus a master index at `wiki/index.md`.

**How it classifies folders:**

| Folder type | Detection rule | Output |
|-------------|---------------|--------|
| Regular | Contains `spec.md` | One page per folder (`wiki/features/<folder>.md`) |
| Simple | No `spec.md` — any number of `.md` files | One page per file (`wiki/features/<folder>--<stem>.md`) |

Each wiki page extracts title, summary, spec highlights, and plan highlights from the source files. The index groups pages into 4–8 meaningful categories.

**Incremental by default** — a `.wiki-processed.json` status file in each folder records the last-processed mtimes. Only changed or new features are rebuilt on subsequent runs.

**Invoke with:**

```
/spec-wiki-builder          # incremental (new/changed only)
/spec-wiki-builder rebuild  # full rebuild, ignores status files
```

---

## spec-wiki-optimizer

Reads the wiki produced by spec-wiki-builder, identifies specs that are logically related (a fix, improvement, or update of an earlier feature), and merges them into a single canonical page.

**What it does:**
- Groups features by subsystem and naming patterns (`fix-X`, `update-X`, `improve-X`)
- Writes a unified `wiki/features/merged/<primary>.md` per group — full content from each spec, not a summary
- Deletes the now-redundant individual source pages
- Updates `wiki/index.md` so the merged page replaces the individual entries in the right category
- Stamps `mergedInto` into each spec's `.wiki-processed.json` so future runs stay incremental

**Invoke with:**

```
/spec-wiki-optimizer                     # incremental (new groups + update existing)
/spec-wiki-optimizer rebuild             # reprocess all groups
/spec-wiki-optimizer 006-my-feature      # process only the group containing that folder
```

---

## Typical workflow

```
specs/
├── 001-init-web-game/    spec.md + plan.md
├── 002-speed-controls/   spec.md + plan.md
└── tiny/                 pacman-facing-direction.md, speed-5x-1x-default.md
```

1. Run `/spec-wiki-builder` → produces `wiki/features/*.md` + `wiki/index.md`
2. Run `/spec-wiki-optimizer` → finds related specs, writes `wiki/features/merged/*.md`, updates index

The result is a wiki where each topic area has one consolidated page rather than scattered fix specs.

---

## This project's wiki

Browse the generated output: **[wiki/index.md](../wiki/index.md)**
