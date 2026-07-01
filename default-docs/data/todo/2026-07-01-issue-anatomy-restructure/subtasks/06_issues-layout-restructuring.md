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
      **Brainstorm** (see the issue's `brainstorm/01_section-naming.md`).
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
