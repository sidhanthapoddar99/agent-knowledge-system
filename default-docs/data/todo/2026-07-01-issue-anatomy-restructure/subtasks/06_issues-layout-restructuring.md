---
title: Issues layout restructuring
state: open
---

Running log of structural / UI tweaks to the issues layout. One or two lines appended
per change as it's completed.

- [x] **MetaPanel — 5 lines → 3.** Merged Labels onto the Status/Priority line, and
      Created/Updated onto the Author/Assignees line; dropped the orphaned
      `--wide` cell rule.
- [x] **Description scoped to overview only.** Shown on the overview page + index
      cards; removed from subdoc pages (notes / subtasks / agent-log).
- [x] **Comments → own panel + single nav entry.** Overview renders only `issue.md`;
      comments live on a `#comments` panel as the old GitHub-style thread (issue body =
      opening post + comments), with the right-rail per-comment index. Sidebar gets a
      single **Comments** entry in the "This issue" group, right after Overview
      (Overview · Comments · Comprehensive), always visible. Panel-based, hash-addressable
      (`#comments` / `#comment-N`), no new routing. Also dropped the subtask summary
      from the overview per "only issue.md".
- [x] **Sizing: centred trio via shared variables.** `.issue-layout` columns use
      `--sidebar-width` / `--outline-width`; capped at
      `calc(--sidebar-width + --max-width-secondary + --outline-width)` so the centre
      content can't stretch past `--max-width-secondary` — sidebar + outline stay
      attached to the content and extra viewport space falls outside the centred trio.
      (Fixes the full-width theme's `--max-width-primary: none` letting `1fr` stretch
      edge-to-edge.) Padding on spacing vars; grid kept.
- [x] **Brainstorm section added (full stack).** New `brainstorm/` collection, same
      free-form 2-level shape as notes: loader (`readFreeformDocs`), routing
      (`resolveSubDoc` + static-paths), sidebar section (ordered before Notes, lightbulb
      icon), subdoc pages at `/<issue>/brainstorm/<name>` (rendered via `NotePage` with
      a `prefix` so the path label/panel-key are namespaced correctly). Name decided:
      **Brainstorm** (naming deliberation since folded into
      `brainstorm/01_overall-structure/04_brainstorm.md`).
- [x] **Agent Memory section added (full stack).** Same mirror as Brainstorm
      (`agent-memory/`, `memory-` panel-key prefix, sidebar section after Agent log,
      database icon, subdoc pages at `/<issue>/agent-memory/<name>`).
- [x] **Guide panel.** Framework-bundled `guide.ts` (static issue-anatomy legend,
      rendered via `@parsers/renderers` `renderMarkdown`) shown on a **Guide** panel
      with a single entry in the "This issue" group. CLAUDE.md references it as the
      skill-guide twin.
- [x] **Dropped the strict lifecycle ordering** from the rendered guide + design note —
      sections are organized by *what they hold*, used as the work needs, no required
      order.
- [x] **Subdoc labels formatted like subtasks.** notes / brainstorm / agent-memory /
      agent-log now render a `__num` badge (padded `NN` prefix) + a clean label
      (prefix stripped, separators → spaces, no `.md`) for both files **and** folders,
      instead of the raw filename. One shared parser (`prefixNum` + `cleanLabel`) with
      agent-log's `#<iteration>` as a precedence override. Unprefixed files (e.g.
      `gotchas.md`) show just the label.
- [x] **Kind icon moved to the section heading.** The file/lightbulb/clock/database
      icon now sits once on each section header (Notes / Brainstorm / Agent log / Agent
      memory) instead of on every row — more text width per item. The optional per-item
      `color` frontmatter now tints the label instead of the (removed) icon.
- [x] **Sidebar tooltips unified onto one mechanism — cursor-anchored singleton.** Rows
      (notes/brainstorm/memory/agent-log via `SubdocTree`, subtasks via `SubtaskTree`,
      review-dot) previously used the native `title` (~500ms, unstylable) while the kind
      symbol had a custom CSS tip — two different effects. Now everything carries `data-tip`
      and a single JS-managed tooltip (`scripts/detail/tooltip.ts`, wired in `client.ts`)
      shows at the **top-right of the cursor**, following it: `position: fixed` + z-index
      1000 so it can never be clipped by the sidebar scroll container or hidden under other
      elements; 60ms delay, 80ms rise-in, viewport-clamped (flips below at the top edge),
      hides on scroll; delegation picks the innermost tip so only one ever shows.
      **Promoted site-wide + made conditional:** moved to `src/scripts/tooltip.ts`
      (self-init via BaseLayout, so docs/blogs/issues/custom all get it) with `.ui-tooltip`
      in the default theme's `element.css` (uses `--z-index-tooltip`). Display rule lives in
      the script: `data-tip-always` elements (kind symbols, review dot) always show; plain
      text tips show **only when the text is actually cropped** (scrollWidth check on self +
      descendants). Wired `data-tip` into docs Sidebar (links + headers), docs Outline, and
      the issues MetaSidebar right-rail (comment index + subtask index).
- [x] **Agent-memory shape settled: index + topic files (skills-style).** `memory.md` is
      the section's entry point — a one-line-per-topic index; topic files hold the facts
      and are edited in place. Sidebar pins `memory.md` first (sort precedence 0 for
      agent-memory). Both the demo and this issue now carry a `memory.md` index. Design in
      brainstorm §7 (fully settled — agent-autonomous, always-on, no mirroring of what the
      repo/issue already records).
- [x] **Subdoc ordering fixed to numeric-by-value + milestone status colours.** Sidebar
      sort precedence is now bucket → iteration → **numeric prefix value** → lexicographic
      (fixes mixed-width mis-ordering, e.g. `70` before `200`; unprefixed last). The
      `#<iteration>` badge is tinted by milestone `status` (not-started grey / in-progress
      blue / success green / failed red — status tokens blended 55/45 toward muted via
      `color-mix` so the tint reads as a hint, not a highlight). Demo gains `200_it_stress/`
      exercising both. Meta-file set confirmed standard-but-open (user *or agent* may add
      more `0NN`).
- [x] **Agent-log kind badge implemented (full stack).** Loader reads `agentLogKinds`
      (issue `settings.json`) merged over framework defaults → `Issue.agentLogKinds`; kinds
      are now `{ name, icon }`. Folder rows render `NN  <symbol>  <name>  …  <count>`: numeric
      prefix, kind **symbol up front**, code-stripped name, file count on the right (SVG from a
      curated palette, `server/agent-log-icons.ts`, ~15–20 icons; **fast CSS tooltip** = name,
      replacing the slow native `title`). settings.json accepts
      `{ "ex": { "name": "experiment", "icon": "flask" } }` or shorthand string. Unknown code
      → no symbol, name keeps the code, count shown. Meta files (`0NN`) badge-less; milestones
      keep `#<iteration>`. Flat one-off dropped (folders-only norm; flat = backward-compat).
      Codes finalized: `rf`=refactor, `it`=iteration. *(Still todo: the **Guide** should list
      the symbol → meaning legend.)*
- [x] **Demo fixture migrated to the new agent-log nomenclature.**
      `NNN_<code>_<name>/` activity folders (`lp`/`au`/`rf`/`fi`/`wf` + a custom `ex`),
      `settings.json{kind}` dropped, pinned meta files (`00_goal`/`01_summary`/
      `02_task_list`) + `MNN_` milestones. In-folder order verified: meta first, then
      `#iteration` milestones. `issue.md` + `glossary.md` updated (glossary now has an
      "Agent-log kinds" section defining the custom `ex` code). Note: the folder-label
      still shows the raw `<code>_` until `cleanLabel` is extended to strip it (subtask 03).
- [x] **Glossary panel (per-issue, optional).** Reads an optional root-level
      `glossary.md` (`issue.glossaryHtml`, null when absent; excluded from the stray-md
      warning + added to the cache signature). Renders as a **Glossary** panel in the
      "This issue" group right after Guide — populated when the file exists, else a
      themed empty state prompting the author to add one. No new routing (panel, like
      Guide/Comments); hash-addressable via `knownPanel`. Home for per-issue semantics
      incl. what any sidebar `color:` tints mean. Demo fixture ships a populated one.
- [x] **Agent-log two-bucket ordering.** At each tree level, agent-log entries split
      into (1) no-`iteration` files/folders — first, sorted by filename — then
      (2) `iteration` files, sorted by iteration number (filename tie-break). The
      `#<iteration>` badge takes precedence over the filename prefix for *both* display
      and order, so a `101_`-prefixed file with `iteration: 1` shows `#1` and sorts as 1.
      Non-log sections keep pure filename sort. (Fixture:
      `2026-07-01-demo-issue-anatomy-showcase`.)
