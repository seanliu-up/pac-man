---
name: spec-wiki-optimizer
description: >
  Analyzes the spec wiki (produced by spec-wiki-builder) to find features that are logically
  connected — where one spec is a fix, improvement, or update of an earlier one — then writes
  merged wiki pages. Use this skill whenever the user
  asks to "optimize", "merge", "consolidate", or "deduplicate" the spec wiki, or says something
  like "group fixes with their original features",
  "update merged specs with new fixes". Also
  invoke it when the user mentions that the wiki has many small fix specs that belong together
  with their parent, or that new fix specs have arrived since the last merge run. Works
  incrementally: creates new merged pages for unseen groups AND updates existing merged pages
  when new secondaries have appeared since the last run.
---

## What this skill does

Many spec wikis accumulate a pattern: a feature spec is written first, then later one or more
"fix-X", "update-X", or "improve-X" specs are written that refine it. The wiki ends up with
fragmented entries that make it hard to understand the full history of a feature.

This skill reads all feature pages from `wiki/features/`, reasons about which specs belong
together, writes unified merged pages to `wiki/features/merged/`, then **deletes the individual
source wiki pages** that were merged. The merged page is the single canonical page for the group.

**Directory layout produced:**
```
wiki/
├── features/
│   ├── *.md           ← standalone wiki pages (untouched — no related fix/update found)
│   └── merged/        ← one page per merge group (replaces the individual source pages)
│       └── 006-plan-step-highlight.md
```

Spec source folders in `specs/` are never touched — only the wiki pages in `wiki/features/` are deleted.

---

## Step 0: Parse arguments

The skill accepts an optional `$ARGUMENT`:

| Argument | Effect |
|----------|--------|
| A folder name (e.g. `006-plan-step-highlight`) | Process only the group containing that folder |
| Comma/space-separated folder names | Process only those specific groups |
| `rebuild` / `--rebuild` | Reprocess all groups, overwriting existing merged pages |
| Empty | Incremental mode — create new merged pages AND update existing ones that have new unprocessed secondaries |

When a specific target is given, identify which group(s) that folder belongs to and process
only those — skip the full scan of all features.

---

## Step 1: Collect feature data

Run the bundled script to get all wiki feature summaries in one pass:

```bash
python3 <skill-dir>/scripts/collect_wiki_features.py <wiki-dir>
```

`<wiki-dir>` defaults to `wiki/` relative to the project root. The script outputs a JSON array
where each entry has: `folder`, `title`, `overview`, `wiki_file`, `source_spec`.

Also check which merged pages already exist:

```bash
ls wiki/features/merged/
```

For each candidate spec folder, read its `.wiki-processed.json` (written by spec-wiki-builder) to
get the `wikiFile` path, and check whether the optimizer has already added a `mergedInto` field:

```bash
cat specs/<folder>/.wiki-processed.json
# { "wikiFile": "wiki/features/<folder>.md", "processedAt": "...", ... }          ← built, not yet merged
# { "wikiFile": "...", ..., "mergedInto": "wiki/features/merged/<primary>.md" }   ← already merged
```

- If `.wiki-processed.json` doesn't exist: spec-wiki-builder hasn't run on this folder yet — skip it entirely (nothing to merge).
- If it exists but has no `mergedInto`: the spec has a wiki page but hasn't been merged — candidate for merging.
- If it exists and has `mergedInto`: already merged (source wiki page was deleted) — skip.

Note: after a merge run, the individual source wiki pages (`wiki/features/<folder>.md`) for merged specs are deleted. The `collect_wiki_features.py` script only sees standalone (unmerged) pages and the merged pages in `wiki/features/merged/`.

If a specific target was given in `$ARGUMENT`, you only need to read the wiki pages for the
targeted folder(s) and their candidate related features — no need to load all features.

---

## Step 2: Identify mergeable groups and classify work

Read through the collected feature data and reason about relationships. You're looking for groups
where the features together form a coherent, evolving story about one area of the product.

**Relationship types to detect:**

| Signal | Example |
|--------|---------|
| Name prefix: `fix-X` pairs with a non-fix feature on the same topic | `029-fix-step-highlight` → `006-plan-step-highlight` |
| Name prefix: `update-X` / `improve-X` pairs with an earlier feature | `050-fix-sdd-auto-mode` → `014-custom-workflow-ux` |
| Two or more fix specs cover the same subsystem with no clear original | `055-fix-bullet-rendering` + `056-fix-list-spacing` — use lower-numbered as primary |
| A spec's overview says "fixes", "updates", or "extends" another feature by description | Read the overview text |
| Fix spec targets the same **subsystem** as another fix, even without name overlap | `1-fix-grayish-step-names` and `049-fix-plan-indent` both fix sidebar tree view bugs |

**Name-matching is a starting point, not the whole story.** Many fix specs don't have names that
directly map to a parent feature. When name-based matching leaves a fix spec unplaced, read its
overview and identify the subsystem it touches (e.g. "sidebar tree", "terminal dispatch", "badge
rendering"). Then look for other specs — fix or non-fix — that touch the same subsystem. Group
by subsystem, not just by name pattern.

**Specs with non-standard numeric prefixes** (e.g. `1-fix-refine-button`, `1-fix-terminal-timing`)
follow the same rules as numbered specs. Treat `1-` as an early or ad-hoc patch prefix and apply
the same subsystem-based matching. Don't skip them because they look different.

**Classifying each group into one of three states:**

1. **New group** — no merged page exists in `wiki/features/merged/` yet → write a new merged page
2. **Update needed** — a merged page exists, but one or more secondaries have no `mergedInto` field
   in their `.wiki-processed.json` → update the merged page to add the new secondaries
3. **Up to date** — a merged page exists and every secondary's `.wiki-processed.json` has `mergedInto` → skip

A secondary is "new" when its `.wiki-processed.json` exists (spec-wiki-builder ran) but lacks `mergedInto`.

**Rules for grouping:**
- Every group needs a **primary** (the original or most foundational spec) and one or more
  **secondaries** (fixes, improvements, updates).
- A feature can only belong to one group. When there's ambiguity, prefer the closest semantic match.
- Features that are genuinely standalone (no related fix/update exists) stay untouched.

**Don't over-split or over-merge.** A group of 5+ features is a yellow flag — double-check they really all belong together. A group of 2 is fine.

---

## Step 3: Write or update merged pages

Create `wiki/features/merged/` if it doesn't exist.

### 3a: New group — write a fresh merged page

**Naming:** `wiki/features/merged/<primary-folder>.md`

**Page template:**

```markdown
# [Primary feature title]

> **Merged view** — consolidates [N] related specs · [← Wiki Index](../../index.md)

---

## What this feature does

[2-4 sentence narrative covering the original intent AND the subsequent fixes/improvements.
Write this as a coherent present-tense description of the feature as it stands today, not a
changelog.]

---

## [Primary title]

[spec source](../../../specs/<primary-folder>/)

[Full overview paragraph from the primary wiki page]

**Specification:**
- **[User Story or requirement 1]**: [full text]
- **[User Story or requirement 2]**: [full text]
- **[User Story or requirement 3]**: [full text]

---

## [Secondary title 1]

[spec source](../../../specs/<secondary-folder>/)

[Full overview paragraph from the secondary wiki page]

**Specification:**
- **[Requirement 1]**: [full text]
- **[Requirement 2]**: [full text]

---

## [Secondary title 2]  ← repeat for each secondary

...

---

## Key user-facing outcomes

[Bullet list: 3-5 concrete things a user can rely on as a result of all these specs together.]
```

Each section embeds the **full** overview and **complete** specification bullets from the individual
wiki page — do not summarize. Both primary and secondary sections use `[spec source]` links pointing
to `../../../specs/<folder>/`.

### 3b: Existing group with new secondaries — update the merged page

When a merged page already exists but new unarchived secondaries have been identified:

1. Read the existing merged page.
2. Add a new `## [New secondary title]` section for each new secondary. Follow the same format as
   existing sections: `[archived spec]` link, full overview paragraph, full `**Specification:**` bullets.
3. Revise `## What this feature does` to incorporate what the new secondary adds — keep it
   as a coherent present-tense summary, not a changelog.
4. Update the `consolidates [N] related specs` count in the subtitle line.
5. Extend `## Key user-facing outcomes` with any new outcomes the new secondary introduces
   (only if genuinely new — don't pad existing bullets).

Existing sections stay unchanged.

**Writing guidance (both paths):**
- "What this feature does" is the synthesis — present-tense, as if everything were always one
  spec. Avoid "then later it was fixed" phrasing.
- Each spec section is a verbatim embed of the individual page's content, not a summary.

---

## Step 3c: Delete the source wiki pages

After writing or updating the merged page, delete the individual source wiki pages for every spec in the group (both primary and secondaries):

```python
import pathlib

for folder in [primary] + secondaries:
    p = pathlib.Path(f"wiki/features/{folder}.md")
    if p.exists():
        p.unlink()
```

This removes the now-redundant individual pages. The merged page in `wiki/features/merged/` is the single canonical page for the group going forward.

For **updates** (Step 3b — adding new secondaries to an existing merged page): delete only the newly added secondaries' source pages. The primary and previously merged secondaries were already deleted in the prior run.

---

## Step 4: Add mergedInto to each spec's .wiki-processed.json

After writing or updating a merged page, update `.wiki-processed.json` in each spec's source
folder — both primary and all secondaries — by adding a `mergedInto` field pointing to the
merged page:

```python
import json, pathlib

path = pathlib.Path("specs/<folder>/.wiki-processed.json")
data = json.loads(path.read_text())
data["mergedInto"] = "wiki/features/merged/<primary-folder>.md"
path.write_text(json.dumps(data, indent=2))
```

This preserves all existing fields written by spec-wiki-builder (`wikiFile`, `processedAt`,
`specMtime`, etc.) and simply adds the optimizer's annotation.

If `mergedInto` is already present (e.g., from a prior run), skip — do not overwrite.

For `--rebuild`, remove `mergedInto` from all spec folders in the group before rewriting the
merged page, then re-add it.

---

## Step 5: Update wiki/index.md

After writing merged pages, update `wiki/index.md` so merged features appear in their correct
categories rather than a separate section.

**For each merged group:**

1. **Find which category the primary feature currently belongs to** in `wiki/index.md`.
2. **Replace the primary's entry** with a link to the merged page (pointing to
   `merged_specs/<primary-folder>.md`). Keep the same title text — do not add "Complete Story"
   or other suffixes that would feel out of place in a normal category listing.
3. **Remove the secondary entries** from wherever they appear in the index (they may be in the
   same category or a different one). Their content is now represented in the merged page.

The result is that each category lists the merged entry where the primary used to be, with
secondaries removed. The index stays lean and each category accurately represents what's in
that area of the product.

**Example transformation:**

Before (Workflows category):
```
- [Custom Workflow UX Improvements](features/014-custom-workflow-ux.md)
- [Custom Workflows](features/001-custom-workflows.md)
- [Fix SDD Auto Mode](features/050-fix-sdd-auto-mode.md)
```

After (Workflows category — secondaries removed, primary links to merged page):
```
- [Custom Workflows](merged_specs/001-custom-workflows.md)
```

**If a "Merged Views" section was added by a previous run of this skill,** remove it — its
entries should be distributed into their proper categories following the same rules above.

When checking whether a merged page already exists, look in `wiki/features/merged/`. Old runs
may have written to `wiki/merged_specs/` — if that directory exists with content, treat its
files as existing merged pages and migrate them to `wiki/features/merged/` (updating internal
link paths: `../index.md` → `../../index.md`, `../features/` → `../`, `../archived_specs/` →
`../../archived_specs/`, `../../specs/` → `../../../specs/`).

Update the "Last updated" line to today's date.

---

## Step 6: Report what you did

Tell the user:

- **New merged pages**: list of new `wiki/features/merged/` files created
- **Updated merged pages**: list of existing pages that received new secondaries, with what was added
- **Recorded**: which wiki files were added to `.wiki-processed.json` this run
- **Up to date** (nothing to do): groups that were already fully recorded
- **Standalone** (not grouped): how many features left untouched
- Any judgment calls where you're not fully certain, so the user can correct you

---

## Edge cases

| Situation | Handling |
|-----------|----------|
| Fix spec's target isn't clear from the name | Read both overviews; if they describe the same subsystem, group them |
| Two possible primaries | Choose the lower-numbered (earlier) one |
| `.wiki-processed.json` absent | spec-wiki-builder hasn't run — skip this spec entirely |
| `.wiki-processed.json` present, no `mergedInto` | Unmerged candidate — include in group |
| `.wiki-processed.json` present, has `mergedInto` | Already merged — skip |
| `--rebuild` | Remove `mergedInto` from all group folders, rewrite merged page from the existing merged page content (source wiki pages were already deleted), then re-add `mergedInto` |
| Targeted run (`$ARGUMENT` is a folder name) | Only process the group(s) containing that folder; leave all others untouched |
| New secondary for an already-merged group | Update the existing merged page (Step 3b); add its wikiFile to `.wiki-processed.json` (Step 4) |
| New secondary whose primary has no merged page yet | Treat as a new group — write a fresh merged page covering primary + all secondaries found so far |
