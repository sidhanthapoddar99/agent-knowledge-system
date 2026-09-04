# Brainstorm, notes and agent memory

Three sections hold thinking. Brainstorm holds what we are working out. Notes hold what is settled. Agent memory holds what the agent must not rediscover. The duties of each section are in the section table in [SKILL.md](../SKILL.md).

## Brainstorm

| Holds | Does not hold |
|---|---|
| the argument, the options, and the ones rejected | the conclusion as ground truth. That goes to `notes/` |
| reversals, dead ends, changes of mind | anything downstream work cites directly |
| deliberation about what to do | the work itself, or its order |

Brainstorm has no volume rule. Frontmatter is `title` and optional `color`, the same as a note. The body is free.

### Naming

Use `brainstorm/NN_[<kind>_]<slug>.md` for one thought. Use `brainstorm/NN_<slug>/` for a thread of several files. The kind is a full word from an open vocabulary, and it is optional.

| Kind | Use for |
|---|---|
| `research` | facts: prior art, external docs, comparisons |
| `explore` | the option space, or the codebase for feasibility |
| `idea` | a concrete proposal, argued for |
| `discuss` | trade-offs, open questions, a recorded exchange |

- Deliberation stays inside one issue. Deliberation across issues stays as separate issues linked with `Related:` lines.
- An issue that is pure deliberation, and whose conclusion lands in another issue, folds into that other issue's `brainstorm/`. Add a `**Resolved →**` overview with the source slug. Delete the source issue. Git keeps it.
- An `.html` artifact or a diagram file placed here renders as a first-class sub-doc, the same as in `notes/`.
- Save working dialogue from a session only when the user asks, as a `discuss` entry. When the dialogue starts to carry decisions, offer to save it once.

### Graduation

When a brainstorm resolves, it graduates. Do not delete it and do not move it. Add one line at the top:

```markdown
> **Resolved →** notes/01_issue-anatomy/
```

The target may be a note, a subtask, a closing comment, or the word *dropped*. Graduate a brainstorm when later work needs to cite its conclusion. A "do nothing" resolution points at the closing comment.

## Notes

| Holds | Does not hold |
|---|---|
| the conclusion, and one clause of why | the deliberation. That stays in `brainstorm/` |
| decisions that outlive one run | the steps that act on it. Those are subtasks |
| research, evidence and measurements a decision rests on | a detailed account of what to do |
| contracts downstream work executes against: API shapes, schemas, ownership splits | the narration of the run. That is the agent log's |

The test: a future reader needs it to answer "why did we do it this way", or to build against it. If so, it is a note. A note that reads like a work order is a subtask. A note that keeps changing is a brainstorm. Move it back there.

Content arrives in three ways. A resolved brainstorm graduates. A spec or a how-to arrives complete. Or a run produces it. Write it when it is produced, never at wrap-up.

The shape is sections `03 References`, `04 Decisions` and `05 Notes & Analysis` of the [template](03_writing.md). The frontmatter is `title` and optional `color`.

| Placement | Path |
|---|---|
| a single design doc | `notes/<slug>.md` |
| part of a themed set | `notes/<group>/<slug>.md` |
| a sub-phase of a set | `notes/<group>/<subgroup>/<slug>.md`. Past three levels, split into a sibling group or a new issue |
| reading order matters | `010_context.md`, `020_design.md`. Leave the rest unprefixed |

### Artifacts and diagrams

A note need not be markdown. A self-contained `.html` artifact in `notes/` or `brainstorm/` renders embedded in the issue view. The embed is an iframe on the `/artifacts/<path>` route. It has an open-full-page link and an expand control. The parent page sets `data-theme` on the embed in both theme modes. The sidecar is the `<name>.meta.json` file beside the artifact. Its `artifact.theme` field decides whether the site theme's CSS applies inside the artifact. See [theme modes](../../agent-ks-artifacts/references/publishing.md#theme-modes). A diagram file (`.excalidraw`, `.drawio`, `.mmd`, `.dot`) renders the same way.

| Rule | Detail |
|---|---|
| title | from a same-name `<name>.meta.json` or `.meta.jsonc` sidecar, else from the filename. Nothing is injected into the `.html` |
| scope | `notes/` and `brainstorm/` only. Not the issue root, not `assets/`, not `agent-memory/` |
| prefix | optional. The file joins `updated` derivation and caching like a `.md` sibling |
| safety | inline CSS and JS, `data:` images. It runs with no sandbox. Never paste untrusted HTML |

Build one with [agent-ks-artifacts](../../agent-ks-artifacts/SKILL.md). When a design settles, promote it to a docs section.

## Agent memory

| Holds | Does not hold |
|---|---|
| what is true and binding for this issue | decisions. Those are `notes/` |
| how we got here: what was tried, what landed, what was parked | the plan. Order is `plans/` |
| gotchas, environment quirks, dead approaches, expensive-to-find pointers | anything the repo, git, `issue.md` or `notes/` already records |
| an index that routes | any content inside the index |

Maintain it during any work on the issue, not only inside a named run. The log records what happened. Memory holds what is still true.

### Shape

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | a small issue with a few facts |
| 1 | plus topic files flat at the root | most issues stop here |
| 2 | plus `knowledge/` and `history/` | the flat files outgrow the root |

| File | Answers | Goes stale |
|---|---|---|
| `memory.md` | where is everything | as soon as one entry is wrong, because a reader trusts the whole map |
| `knowledge/<topic>.md` | what is true here | only when not corrected |
| `history/<subject>.md` | how we got here | never. Write once |

`memory.md` holds one line per topic file: `- [Gotchas](knowledge/gotchas.md) — <one-line hook>`. Load the index. Then read only what the task needs. When `knowledge/` and `history/` disagree, `knowledge/` wins. Correct the file that is wrong. There is no folder for work still to do. What is left, and in what order, belongs to the plan. Name topic files by topic. Do not prefix them.

### Rules

- You decide what to write, rewrite or delete. Ask only when the user directs otherwise.
- Correct in place. Delete a wrong or superseded entry. Never annotate it as stale.
- A folder other than `knowledge/` and `history/` states on its index line when its content goes stale.
- Memory belongs to one issue. It adds to global memory, and does not replace it. It stays when the issue closes.
- Write a fact when you find it. Then add or refresh its index line.
- `agent-ks check issues` warns when an `agent-memory/` folder exists without a `memory.md` index. It never asks an issue to open one.
