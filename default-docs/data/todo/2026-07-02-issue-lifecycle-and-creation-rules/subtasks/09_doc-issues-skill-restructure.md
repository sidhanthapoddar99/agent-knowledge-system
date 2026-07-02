---
title: "doc-issues skill restructure: foldered references, documentation-guide prerequisite, scripts home"
state: open
---

Folded in from the standalone issue `2026-07-02-doc-issues-skill-structure`
(2026-07-02, at sidhantha's direction — one coherent plugin-structure unit, kept as
the **last** subtask of this issue; the standalone folder was deleted before ever
being committed, so THIS subtask is the sole surviving copy — its full content was
absorbed here, nothing summarized away). Three structural rough edges left by the
skill split, all about the plugin's *structure* rather than its content. Every
change lands twice — repo source (`plugins/documentation-guide/`) and the installed
cache — and ends with ONE plugin version bump for the whole subtask.

**Sequencing:** run AFTER subtasks 06 and 08 have finished editing the reference
*content* — this subtask renames/moves those same files, and doing it last avoids
rebasing content edits over renames.

## 1 — Subdivide the flat `doc-issues/references/` into directories

20 flat files navigable only by a numeric-band convention you have to already know
(`0x` anatomy meta · `10` writing · `2x` per-section · `4x` operations · `6x`
worked examples). Directories make the bands visible — the folder listing itself
should read as a table of contents.

- [ ] Decide the folder scheme — natural candidate mirroring the bands: `anatomy/`
      (00–03) · `writing/` (10) · `sections/` (20–27) · `operations/` (41–43) ·
      `examples/` (61–64). Decide whether files keep `NN_` prefixes inside folders
      (recommended — preserves ordering and stable names) and whether folders take
      prefixes.
- [ ] Move (`git mv`) + rewrite every cross-link: inter-reference links, the
      SKILL.md triage table, pointers from the `documentation-guide` sibling.
- [ ] Sweep external pointers — repo `CLAUDE.md`, user-guide pages, open
      issues/subtasks citing `doc-issues/references/<file>` paths.
- [ ] Sanity-load the skill once and confirm the triage table resolves every
      reference at its new path.

## 2 — Declare the documentation-guide prerequisite up front

`doc-issues` presents itself as self-contained, but some tracker work genuinely
needs the sibling's domain references — image handling is the known case. Nothing
currently tells an agent doing tracker work to pull the sibling in.

- [ ] Inventory which `documentation-guide` references tracker work actually
      reaches for (`images.md` confirmed; check `writing.md`, `settings-layout.md`,
      asset conventions, others).
- [ ] Write the prerequisite note at the *start* of `doc-issues/SKILL.md` (not
      buried in the sibling-skill aside): when a tracker task touches one of the
      inventoried domains, also load `documentation-guide` and read the matching
      reference — name the trigger cases concretely.
- [ ] Keep the mutual references symmetric — `documentation-guide`'s pointer at
      `doc-issues` stays accurate; the sync notes between the two writing guides
      still hold.

## 3 — Decide the home for in-skill scripts (`scripts/` + `migration/`)

The `documentation-guide` skill folder carries loose executables next to its
references; the plugin's real executable surface is `bin/docs-guide`. Two homes, no
stated rule. **Note:** subtask 07 of this issue creates the next migration script —
if this rule can land first, that script is born in the right place; if not, the
script follows the existing `migration/` precedent and gets relocated here.

- [ ] Inventory every script under both skills' folders (`scripts/`, `migration/`),
      what each does, where it's referenced from.
- [ ] Decide the placement rule — (a) everything into `bin/`; (b) in-skill under a
      declared convention (README + path invocation); (c) split: durable tools →
      `bin/` / `docs-guide` subcommands, one-shot dated migrations stay in-skill.
      Write the rule down so the next script has an obvious home.
- [ ] Execute the move/reformat — relocate per the rule, update every reference to
      old paths, adjust invocation instructions (PATH vs explicit path).

## Wrap-up

- [ ] Repo source ↔ installed cache in sync (`diff -r` verified identical).
- [ ] Plugin version bumped once for the whole restructure.
- [ ] `docs-guide` self-test / help still green; skills trigger and resolve.
