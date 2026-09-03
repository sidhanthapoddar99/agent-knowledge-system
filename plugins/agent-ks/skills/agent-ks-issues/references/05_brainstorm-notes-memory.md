# Brainstorm, notes and agent memory

Three sections hold thinking. Brainstorm holds what we are working out. Notes hold what is settled. Agent memory holds what the agent must not rediscover. Duties: the section table in [SKILL.md](../SKILL.md).

## Brainstorm

| Holds | Does not hold |
|---|---|
| the argument, the options, and the ones rejected | the conclusion as ground truth. That goes to `notes/` |
| reversals, dead ends, changes of mind | anything downstream work cites directly |
| deliberation about what to do | the work itself, or its order |

Brainstorm has no volume rule. Frontmatter is `title` only. The body is free.

### Naming

`brainstorm/NN_[<kind>_]<slug>.md` for one thought. `brainstorm/NN_<slug>/` for a multi-file thread. The kind is a full word from an open vocabulary. It is optional.

| Kind | Use for |
|---|---|
| `research` | facts: prior art, external docs, comparisons |
| `explore` | the option space, or the codebase for feasibility |
| `idea` | a concrete proposal, argued for |
| `discuss` | trade-offs, open questions, a recorded exchange |

- Deliberation stays inside one issue. Deliberation across issues stays as separate issues linked with `Related:` lines.
- An issue that is pure deliberation converging elsewhere folds into the winner's `brainstorm/`. Add a `**Resolved →**` overview with the source slug. Delete the source issue. Git keeps it.
- An `.html` artifact or a diagram file placed here renders as a first-class sub-doc, the same as in `notes/`.
- Working dialogue from a session is saved only when the user asks, as a `discuss` entry. When the dialogue becomes decision-bearing, offer once.

### Graduation

When a brainstorm resolves, do not delete it and do not move it. Add one line at the top:

```markdown
> **Resolved →** notes/01_issue-anatomy/
```

The target may be a note, a subtask, a closing comment, or the word *dropped*. Graduate when something downstream needs to cite the conclusion. A "do nothing" resolution points at the closing comment.

## Notes

| Holds | Does not hold |
|---|---|
| the conclusion, and one clause of why | the deliberation. That stays in `brainstorm/` |
| decisions that outlive one run | the steps that act on it. Those are subtasks |
| research, evidence and measurements a decision rests on | a detailed account of what to do |
| contracts downstream work executes against: API shapes, schemas, ownership splits | the narration of the run. That is the agent log's |

Test: a future reader needs it to answer "why did we do it this way", or to execute against it. Then it is a note. A note that reads like a work order is a subtask. A note that keeps changing is a brainstorm. Demote it.

Content arrives three ways: a resolved brainstorm graduates, a spec or how-to arrives complete, or a run produces it. Write it when it is produced, never at wrap-up.

Shape: sections `03 References`, `04 Decisions` and `05 Notes & Analysis` of the [template](03_writing.md). Frontmatter is `title` and optional `color`.

| Placement | Path |
|---|---|
| a single design doc | `notes/<slug>.md` |
| part of a themed set | `notes/<group>/<slug>.md` |
| a sub-phase of a set | `notes/<group>/<subgroup>/<slug>.md`. Past three levels, split into a sibling group or a new issue |
| reading order matters | `010_context.md`, `020_design.md`. Leave the rest unprefixed |

### Artifacts and diagrams

A note need not be markdown. A self-contained `.html` artifact in `notes/` or `brainstorm/` renders embedded in the issue view. The embed is an iframe on the `/artifacts/<path>` route. It has an open-full-page link and an expand control. The site theme applies inside it. A diagram file (`.excalidraw`, `.drawio`, `.mmd`, `.dot`) renders the same way.

| Rule | Detail |
|---|---|
| title | from a same-name `<name>.meta.json` or `.meta.jsonc` sidecar, else from the filename. Nothing is injected into the `.html` |
| scope | `notes/` and `brainstorm/` only. Not the issue root, not `assets/`, not `agent-memory/` |
| prefix | optional. The file joins `updated` derivation and caching like a `.md` sibling |
| safety | inline CSS and JS, `data:` images. It runs unsandboxed. Never paste untrusted HTML |

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
| `memory.md` | where is everything | a wrong map is a broken map |
| `knowledge/<topic>.md` | what is true here | only when not corrected |
| `history/<subject>.md` | how we got here | never. Write once |

`memory.md` holds one line per topic file: `- [Gotchas](knowledge/gotchas.md) — <one-line hook>`. Load the index. Then read only what the task needs. When `knowledge/` and `history/` disagree, `knowledge/` wins. Correct the loser. There is no live bucket. What is left, and in what order, is the plan's. Name topic files by topic. Do not prefix them.

### Rules

- You decide what to write, rewrite or delete. Ask only when the user directs otherwise.
- Correct in place. Delete a wrong or superseded entry. Never annotate it as stale.
- A bucket beyond `knowledge/` and `history/` declares its staleness rule on its index line.
- Memory is issue-scoped. It complements global memory. It stays when the issue closes.
- Write a fact when you find it. Then add or refresh its index line.
- `agent-ks check issues` warns when `memory.md` is missing.
