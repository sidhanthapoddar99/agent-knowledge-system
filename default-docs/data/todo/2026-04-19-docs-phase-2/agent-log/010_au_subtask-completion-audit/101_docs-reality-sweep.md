---
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-08
---

# Docs-reality sweep — verdicts for subtasks 01–08

## Goal

Read each subtask's ask, then check the actual state of the targeted pages
under `user-guide/` and `dev-docs/` to judge done / partial / not done — with
file-path evidence, not memory.

## Approach

- One read-only Explore agent, given all 8 subtask files and instructed to
  cite the doc files that prove or disprove each ask.
- Verdicts cross-checked against the subtasks' own checklists (01 already
  self-marked its user-guide half `[x]`, matching the finding).

## Result

| # | Subtask | Verdict | Evidence |
|---|---|---|---|
| 01 | Issues layout docs | **partial** | `user-guide/19_issues/` fully shipped (overview → 09_using-with-ai); no `dev-docs` issues-layout section exists at all |
| 02 | Theme system docs | **partial** | Token contract covered in `user-guide/25_themes/04_tokens/` + `10_rules-for-layout-authors.md`; `dev-docs` theme-system section absent |
| 03 | Editor V2 (deferred; placeholder only) | **done** | `dev-docs/20_development/06_live-editor.md` is a full page — exceeds the phase's placeholder bar |
| 04 | Config path-system docs | **done** | `user-guide/10_configuration/03_site/03_paths.md` + `05_getting-started/03_aliases.md` cover the whole checklist |
| 05 | Theme creation docs | **done** | `user-guide/25_themes/06_creating-themes/01–03` — scaffold, extends, worked example, toolbar testing |
| 06 | Claude skills catalogue | **done** | `05_getting-started/05_claude-skills.md` rewritten to the 2-skill plugin + `agent-ks` CLI reality |
| 07 | issues-styles selector accuracy | **not done** | `25_themes/05_component-styles/07_issues-styles.md` still lists every fictional BEM class flagged in the subtask |
| 08 | using-with-ai present tense | **not done** | `19_issues/09_using-with-ai.md` still says "planned" / "not implemented" about shipped tooling |

- Set 03/04/05/06 → `review` via `agent-ks issue set-state` (handed off for
  human sign-off). 01/02/07/08 stay `open`.
- Notable pattern: both partials fail on the same axis — user-guide side done,
  dev-docs twin never written.

## Next

Human review of the four `review` subtasks; the remaining work is the dev-docs
halves of 01/02 and the two straight rewrites 07/08. Subtask 09 (added this
session) tracks the separate agent-log-structure skill review.
