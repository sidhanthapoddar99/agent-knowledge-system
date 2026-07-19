---
title: Naming & the Sidebar
description: How files and folders are named across every content type, and exactly what the navigation sidebar renders for each — the shared ordering-prefix grammar, the required-vs-optional matrix, and the display contrast between docs, blogs, and issues
sidebar_position: 1
---

# Naming & the Sidebar

The navigation sidebar is **generated from the file tree** — there is no hand-maintained menu. A file's or folder's **name** does two jobs: it sets the **order** an entry appears in, and (after processing) it seeds **what is displayed**. But "what's displayed" is *not the same everywhere* — docs throw the prefix away entirely, issues keep it as a badge, blogs sort by a date. This section is the one place that spells out the full contract.

This overview is the **shared reference**: the prefix grammar, the required-vs-optional matrix, and the display rules. The visual detail — a real file tree beside the exact sidebar it produces, with every edge case — lives in the four companion artifacts:

| Artifact | Covers |
|---|---|
| [Suffix Icons](./suffix-icons) | The trailing marker a row gets when the page is **not markdown** — the artifact and diagram/chart glyphs — the one glyph vocabulary shared by the docs sidebar and the issue sub-doc tree. Markdown is unmarked. |
| [Docs — File Tree → Sidebar](./docs) | How a docs section's files and folders map to sidebar sections and entries, with the mandatory-prefix rule and its failure modes |
| [Blogs — File Tree → Sidebar](./blogs) | The date-prefix scheme, flat ordering, and what the index and sidebar render |
| [Issues — File Tree → Sidebar](./issues) | The richest case: every issue sub-folder (comments, notes, brainstorm, subtasks, agent-log, agent-memory) and what each renders — plus the **leading-mark legend**: the `NN` / `#iteration` badges and their status tints, agent-log kind symbols, subtask status icons, and the folder chevron / count |

## The ordering prefix — one grammar

Most content is ordered with a leading numeric **`NN_` prefix**. The grammar is defined once, in `astro-doc-code/src/parsers/core/order-prefix.ts`, and every loader, parser, and validator defers to it:

| Rule | Detail |
|------|--------|
| **Form** | `NN_` … `NNNNN_` — 2 to 5 digits, then a separator, then the name (`05_intro.md`, `010_setup/`). |
| **Size limits** | **2–5 digits.** A single leading digit (`1_foo`) is **not** a prefix — it's part of the name. Six+ digits (`123456_`) is not a prefix either. |
| **Sort** | By **numeric value**, never lexically — so mixed widths coexist in one folder: `05_` (5) < `010_` (10) < `110_` (110). |
| **Separator** | `_` is canonical. The issue tracker *also* tolerates a legacy `-` (`00-foo`) so historical folders keep parsing; docs accept `_` only. |
| **Gap-spacing** | Leave gaps (`10_`, `20_`, `30_`) so new work slots in between without renumbering. The leading digit can also annotate a group inside a flat folder (`110_`, `120_` = group 1; `210_` = group 2). |
| **Nesting depth** | One shared **max of 5** levels (`MAX_SUBFOLDER_DEPTH`), applied two ways. **Issues:** a hard cap on folder *structure* — a grouping folder beyond 5 is warned and ignored. **Docs:** files nest freely (all pages build + route); the *sidebar* draws folder rows down to the same max of 5. There is **no separate depth setting** — "up to 3 levels" is a recommended convention, not a configured default. **Blogs:** flat. |

What *changes* between content types is (1) whether the prefix is **required, optional, or replaced by a date**, and (2) **what the sidebar does with it**. Those two axes are the rest of this page.

## Required, optional, or a date — the matrix

| Content | Prefix scheme | Required? | Enforced by |
|---|---|---|---|
| **Docs** (files) | `NN_<slug>.md` | **Mandatory** | The docs loader **throws at build** — a docs file with no `NN_` prefix is a hard `ParserError`, the site won't start. |
| **Docs** (folders) | `NN_<slug>/` | Required by convention | Ordering only; an unprefixed folder sorts last rather than erroring. |
| **Blogs** | `YYYY-MM-DD-<slug>.md` | Date required | Posts sort by date; a missing/invalid date falls back but breaks intended ordering. The `NN_` grammar does **not** apply. |
| **Issue — subtasks** | `NN_` / `NNN_` | Conventional (for order) | Never throws; unprefixed sorts last. Both 2- and 3-digit are idiomatic. |
| **Issue — comments** | `NNN_<slug>.md` | Conventional | The 3-digit sequence *is* the comment id (`#001`). Append-only, never renumbered. |
| **Issue — notes / brainstorm / agent-memory** | optional `NN_` | **Optional** | Loose parse, never throws. Add a prefix only when you want a fixed reading order. |
| **Issue — agent-log** | `NNN_<code>_<name>/` folders; `0NN_` meta files; `MNN_` milestones | Conventional | Loose parse. The prefix drives ordering *and* the badge (see below). |

The single hard rule to remember: **only docs make the prefix mandatory** (the loader refuses to build without it). Everywhere in the issue tracker the prefix is optional — present for order, absent when order doesn't matter.

## What the sidebar does with the prefix — the display contrast

This is the part most easily gotten wrong. The three content types treat the prefix **differently at render time**:

### Docs — prefix fully stripped

The docs sidebar (`layouts/docs/default/Sidebar.astro`) shows the frontmatter **`title`** and nothing of the prefix. `05_getting-started/02_installation.md` renders as **"Installation"** under **"Getting Started"**; the URL is `/…/getting-started/installation`. **No number is ever shown** — the only thing that can trail a docs row is a **type glyph** for a non-markdown page (see [Suffix Icons](./suffix-icons)).

Docs *files* nest freely — every page builds and is reachable by URL, however deep. What's bounded is how deep the **sidebar draws**: the single system-wide `MAX_SUBFOLDER_DEPTH` (**5**) — the very same value the issue tracker caps folders at. There is **no per-section depth setting**; "up to 3 levels" is a recommended authoring convention, not a configured default. Folders deeper than 5 still route; they just aren't drawn as rows. So it's one shared max — a *display* limit on the docs sidebar, a *structural* cap on issue folders.

### Issues — prefix kept as a badge (not stripped)

The issue sidebar (`SubdocTree.astro`) **relocates** the prefix into a dedicated badge rendered *before* a de-prefixed label — it does **not** throw the number away:

- A normal sub-doc or grouping folder shows its padded **`NN`** as a neutral badge, then the clean label, then (if non-markdown) a type glyph. A group folder also shows a **descendant count** on the right.
- **Agent-log is the special case.** Inside an activity folder (`NNN_<code>_<name>/`):
  - **`0NN_` meta / slot files** (`00_goal`, `01_summary`, `02_task_list`, `03_working`, `04_benchmark`, `05_notes`) carry no `iteration` — they show their **neutral `NN`** badge, exactly like a folder.
  - **`MNN_` milestones** (leading digit ≥ 1, with an `iteration:` frontmatter field) show a **`#<iteration>`** badge instead, **status-tinted** (grey / blue / green / red for not-started / in-progress / success / failed).
  - So within one activity: meta files display `NN`, milestones display `#N`. **The number is always visible** — the agent-log label is de-prefixed for readability, but the ordering number is surfaced as a badge, never dropped.

### Blogs — date sorted, date stripped from the URL

Blog posts are flat and sort by **date, newest first**. There is **no blog sidebar** — the `/blog` index renders a **card grid**, each card showing the post **`title`** and its date. The date is stripped from the URL (`/blog/launch`). The **filename date is a fallback**: a frontmatter `date` overrides it, and neither is validated — an invalid date renders literally and sorts unpredictably. The `NN_` grammar does **not** apply.

## What raises a flag

- A **docs file with no `NN_` prefix** → the docs loader throws; the build fails. (Docs *diagram* / *artifact* pages are still prefixed, and are enabled **by default** — opt *out* per folder with `allow_diagram_pages` / `allow_artifact_pages: false`.)
- An **issue** grouping folder **beyond 5 levels** deep → warned and ignored by the issues loader. (Docs files nest freely and still route; the docs *sidebar* just draws folder rows down to the same shared max of 5 — no separate setting.)
- More than one `component` on an issue, a subtask folder with no `settings.json`, an agent-log milestone missing `iteration:` — all surfaced by `agent-ks check issues` (warnings vs errors documented there).

## See also

- [Docs → Structure](/user-guide/docs/structure) · [Blogs → Structure](/user-guide/blogs/structure)
- Issue folders: [Comments](/user-guide/issues/sub-docs/comments) · [Notes](/user-guide/issues/sub-docs/notes) · [Brainstorm](/user-guide/issues/sub-docs/brainstorm) · [Subtasks](/user-guide/issues/sub-docs/subtasks) · [Agent Log](/user-guide/issues/sub-docs/agent-log) · [Agent Memory](/user-guide/issues/sub-docs/agent-memory)
- [Detail View](/user-guide/issues/ui/detail-view) — the live issue sidebar these rules render into
