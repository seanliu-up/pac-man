---
name: spec-wiki-builder
description: Builds and maintains a browsable wiki from feature spec/plan folders. Use this skill whenever the user asks to generate, update, or rebuild a spec wiki, feature documentation index, or wants to browse their specs as a wiki. Also trigger when the user says things like "build wiki from specs", "index my specs", "create spec documentation", "update the feature wiki", or wants to explore/navigate specs as organized docs. Use proactively when the user has a specs/ directory with feature folders containing spec.md and plan.md files and asks anything about documentation, overview, or navigating their features.
---

# Spec Wiki Builder

Build and maintain a browsable wiki from feature spec/plan folders. Runs incrementally — only processes features that have changed since the last run, using a per-folder `.wiki-processed.json` status file to track what's been handled.

## Quick Reference

```
Default source dir:  specs/
Default output dir:  wiki/
Status tracker:      <source-dir>/<folder>/.wiki-processed.json
```

---

## Reading Arguments

The skill may be invoked with an `$ARGUMENTS` string. Parse it before doing anything else:

| Argument keyword | Effect |
|-----------------|--------|
| `rebuild` / `force` / `--rebuild` / `--force` | Ignore all `.wiki-processed.json` files — treat every feature as needing processing (full rebuild). |
| Anything else (free text) | Treat as additional user instructions to follow during this run (e.g. "also add a status badge", "use a different template"). Apply them on top of the normal workflow. |

If `$ARGUMENTS` is empty, run in normal incremental mode.

---

## Step 1: Discover Features

Run the bundled scan script — it classifies every folder and returns what needs processing:

```bash
python3 <skill-dir>/scripts/scan_features.py <source-dir>
```

Output:
```json
{
  "needs_processing": [
    {"folder": "001-feature", "type": "regular"},
    {"folder": "tiny", "type": "simple", "files": ["speed-5x-1x-default.md"]}
  ],
  "up_to_date": [
    {"folder": "002-feature", "type": "regular"},
    {"folder": "tiny", "type": "simple"}
  ],
  "total": 3
}
```

Each entry has `folder` (name), `type` (`"regular"` or `"simple"`), and for simple folders a `files` list of the specific `.md` files that need processing.

**In normal mode:** process only the entries in `needs_processing`. The `type` field tells you which path to follow in Step 2. For simple folders, only process the files listed in `files` — unchanged files in the same folder are already up to date.

**In rebuild mode** (triggered by a rebuild/force argument): ignore the `up_to_date` list — treat all folders as needing processing (all files for simple folders). Status files will be overwritten in Step 6.

**The script flags work as needed when:**
- Regular folder: `.wiki-processed.json` missing, or `spec.md`/`plan.md` mtime changed
- Simple folder: `.wiki-processed.json` missing, or any individual `.md` file is new or changed

All mtimes are UTC epoch seconds — timezone-safe by definition.

**If `needs_processing` is empty (normal mode only):** Tell the user nothing new was found, then ask: *"No new or changed features detected. Would you like a full rebuild? Run this skill again with the argument `rebuild`."*

---

## Step 2: Read Feature Data

The scan script already classified each folder — use the `type` field from its output to determine how to process it. No manual classification is needed.

- `"type": "regular"` → one wiki page for the whole folder (spec + plan summary)
- `"type": "simple"` → one wiki page per `.md` file, treating each as a self-contained feature. Only process the files listed in the entry's `"files"` array — other files in the folder are already up to date.

### Regular feature folders

Read the following files:

1. **`spec.md`** — feature requirements, user stories, acceptance criteria (required for this type)
2. **`plan.md`** — implementation approach, technical details (optional — use if present)
3. **Other `.md` files** — note their presence (tasks.md, research.md, etc.)

**Conflict resolution:** When title, summary, or status differ between spec.md and plan.md, prefer the file with the later modification time — it's more likely to reflect current state.

**Template detection:** If spec.md or plan.md contains unfilled markers (`[FEATURE]`, `[DATE]`, `ACTION REQUIRED`, `[###-feature-name]`), treat that file as a placeholder and skip its content — use the other file instead, or note it as unwritten.

### Simple feature folders

Read each `.md` file independently. Each file is its own spec+plan — extract the title (H1 heading), summary, and key content from it as you would from any spec. The folder name is not the title; the file's H1 heading is. Produce a full wiki page from whatever content each file contains — do not stub or skip files.

---

## Step 3: Extract Key Info

| Field | Source |
|-------|--------|
| Title | H1 heading from spec.md (or plan.md, or most-recently-modified if both present and not templates) |
| Summary | First paragraph or `## Summary` / `## Overview` / `## What` section from spec.md or plan.md (prefer more recently modified) |
| Spec highlights | First 2-3 user stories or acceptance scenarios from spec.md |
| Plan highlights | `## Summary` or `## Technical Context` opening lines from plan.md |
| Extra docs | Names of additional .md files present |

---

## Step 3b: Assign Categories

Before writing pages, group all features into **4–8 meaningful categories** based on their titles and summaries. Read across all features (not just the ones being processed) so the grouping is consistent across the full wiki.

**How to assign categories:**
- Scan the feature title and summary for the main subject (what area of the product does this touch?)
- Aim for labels that match how a developer would naturally look for things
- Don't over-split: if two categories would each have ≤2 features, merge them
- Don't under-split: a catch-all "Misc" or "Other" category that holds 30% of features is a sign you need another split

**Simple folder files:** Categorize each file-based feature by its own content. If the files in a simple folder all share a common theme, group them under a shared category (e.g., "Quick Fixes" or "Small Enhancements"). If they span different topics, assign each to whichever existing category fits — don't force a shared category just because files live in the same folder.

**Example categories for a VSCode extension project:**
- Spec Viewer, Spec Management, AI Providers, Sidebar & Tree View, Settings & Configuration, Bug Fixes & Polish, Developer Experience

Store the assignment in memory as a map `{ wiki-page-filename → category }`. For simple folders this is keyed by the individual `<folder-name>--<file-stem>` page names. You'll use this when writing the index.

---

## Step 4: Write Feature Wiki Pages

### Regular feature folders → one page per folder

Create `wiki/features/<folder-name>.md`:

```markdown
# [Title]

> **Source**: [`specs/<folder-name>/`](../../specs/<folder-name>/) · [← Wiki Index](../index.md)

---

## Overview

[Summary paragraph — 2-4 sentences describing what this feature does and why]

## Specification

[2-3 key user stories or acceptance criteria, lightly paraphrased if long]

→ [View full spec](../../specs/<folder-name>/spec.md)

## Implementation Plan

[Brief description of the technical approach — 2-3 sentences]

→ [View full plan](../../specs/<folder-name>/plan.md)

## Additional Docs

[Bulleted list of other .md files, if any — omit this section if none]
- [tasks.md](../../specs/<folder-name>/tasks.md)
- [research.md](../../specs/<folder-name>/research.md)
```

**Template placeholder:** Replace that section's content with: *Not yet written (template placeholder)*

**plan.md absent:** Omit the Implementation Plan section and its link.

### Simple feature folders → one page per file

For each `.md` file in the folder, create a separate wiki page:

```
wiki/features/<folder-name>--<file-stem>.md
```

For example, `specs/tiny/pacman-facing-direction.md` → `wiki/features/tiny--pacman-facing-direction.md`.

```markdown
# [Title from H1]

> **Source**: [`specs/<folder-name>/<filename>.md`](../../specs/<folder-name>/<filename>.md) · [← Wiki Index](../index.md)

---

## Overview

[Summary — 2-4 sentences]

## Specification

[2-3 key requirements or acceptance criteria]

## Implementation Plan

[Technical approach — 2-3 sentences]
```

Omit any section the source file doesn't cover. The folder itself gets no wiki page — only the per-file pages.

---

## Step 5: Rebuild `wiki/index.md`

After processing, always regenerate the master index to reflect the current state of all features (not just newly processed ones — read existing wiki pages or stored status to build the full picture).

**Organize by category** (one level). No status column — just a flat list of feature links per category, sorted alphabetically within each category.

```markdown
# Spec Wiki

> Last updated: [YYYY-MM-DD] · [N] features across [K] categories

---

## [Category Name] ([N])

- [Title](features/folder-name.md)
- [Title](features/folder-name.md)

## [Category Name] ([N])

- [Title](features/folder-name.md)
```

**Category order in the index:**
- Put the most actively-developed categories first
- Alphabetical is fine when unsure

---

## Step 6: Write Status Files

After writing each feature's wiki page(s), write `.wiki-processed.json` into the feature folder to mark it as processed.

**Regular feature folder** — records only `spec.md` and `plan.md` (other `.md` files are not tracked):
```json
{
  "type": "regular",
  "processedAt": "<ISO-8601 timestamp in UTC, e.g. 2026-04-19T14:00:00Z>",
  "fileMtimes": {
    "spec.md": 1713531600,
    "plan.md": 1713531600
  },
  "wikiFile": "wiki/features/<folder-name>.md"
}
```

**Simple feature folder** — records every `.md` file; `wikiFiles` lists each page produced:
```json
{
  "type": "simple",
  "processedAt": "2026-04-27T00:00:00Z",
  "fileMtimes": {
    "pacman-facing-direction.md": 1776519615,
    "speed-5x-1x-default.md": 1777256117
  },
  "wikiFiles": [
    "wiki/features/tiny--pacman-facing-direction.md",
    "wiki/features/tiny--speed-5x-1x-default.md"
  ]
}
```

When updating a simple folder's status after processing only some files (incremental run), merge the new `fileMtimes` into the existing ones — don't overwrite entries for files that weren't processed this run. The `wikiFiles` list should always reflect the full set of pages produced across all runs for this folder.

`fileMtimes` is what the scan script reads on the next run to detect changes efficiently.

---

## Output Summary

After finishing, report:

- **Processed**: N features (new or updated)
- **Skipped**: N features (unchanged)
- **Issues**: Any features with template placeholders, missing files, or errors
- **Wiki**: `wiki/index.md`

---

## Wiki Directory Layout

```
wiki/
├── index.md           ← master navigation, organized by category
└── features/
    ├── 001-init-web-game.md         ← regular folder (has spec.md)
    ├── 002-speed-controls.md        ← regular folder (has spec.md)
    ├── tiny--pacman-facing-direction.md  ← simple folder file
    └── tiny--speed-5x-1x-default.md     ← simple folder file
```

Simple folders (e.g. `tiny/`) produce **no** `tiny.md` — only the per-file pages.

---

## Edge Cases

| Situation | Handling |
|-----------|----------|
| Folder has `spec.md` | Regular folder: one wiki page per folder |
| Folder has no `spec.md` (any number of .md files) | Simple folder: one wiki page per `.md` file (`<folder>--<stem>.md`) |
| Simple folder with no `.md` files at all | Create a minimal stub wiki page noting no documentation found |
| Regular folder: `spec.md` is an unfilled template | Note it as unwritten; use `plan.md` if present |
| Regular folder: only `spec.md` present (no plan.md) | Omit Implementation Plan section |
| Duplicate folder numbers (e.g. `022-fix-x` and `022-add-y`) | Treat as independent — both appear in wiki |
| A simple folder gains a `spec.md` (becomes regular) | Re-process: delete per-file pages, create single folder page, update index |
