---
title: "Brainstorm: the plans section"
status: done
---

# Overview

The plan — *what is left, in what order, who is blocked* — is the most-read file
in an active issue and currently the hardest to find. It lives in
`agent-memory/plans/`, a bucket named after the agent rather than the work,
with no index, no first-class route, and no shape the framework knows about.

**This subtask decides what `plans/` becomes.** It is the open design question of
the whole issue and it gates everything under `040_execution/`. Nothing gets
coded before the shape is settled.

# References

- Why this is half of an efficiency issue: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
  — finding 3, the log grew to fill the plan's absence
- Current convention in the field: `agent-memory/plans/` with the `0NN_` /
  `1NN_` band split and the *highest-numbered plan is active* rule, as practised
  on the audited consumer project
- Current CLI: `agent-ks issue new-memory-plan`
- Test bed: `2026-07-01-demo-issue-anatomy-showcase`
- Implemented by: [Code the plans section](../040_execution/010_code-the-plans-section.md)

# Todo list

- [x] Settle **the question below** — new top-level section, or restructure
      inside `agent-memory/`? → **top-level `plans/`**
- [x] Define the **lifecycle contract** — active is derived (highest not closed),
      the agent may close, superseded is `dropped` + a pointer, and the closing
      record is `overview.md` → `## Closed`
- [x] Define the **file shape** — folder per plan, one file per stage,
      `10 20 30` gap-spaced, the table is the index
- [x] Decide **coexistence vs migration** → **none**; one consumer, by hand
- [x] Decide what the **sidebar and route** look like, and whether the active
      plan is pinned → one page per plan; **pinned at the top of a collapsible
      sidebar group, nothing rendered above the issue body**
- [x] Decide whether `plans/` is **agent-owned, human-owned, or shared** →
      **shared**, with the split written down
- [x] Write the shape into `notes/` before any code is written →
      [The plans section (decided)](../../notes/50_plans-section-spec.md)

# Outcomes and Next Steps

**The spec:** [The plans section (decided)](../../notes/50_plans-section-spec.md).
Built by [`010`](../040_execution/010_code-the-plans-section.md), which now points
at the spec rather than at this subtask.

**What was rejected, and why** — the part worth keeping:

| Rejected | Reason |
|---|---|
| Hash-named stage files + `order.json` | Unreadable in a tree, a diff or a link — against the stated goal of observability — and `order.json` is a second file that can disagree with the folder |
| One file per plan | No per-stage status or `who` that anything can render; *"which stages wait on Sid"* becomes prose |
| A `blocked-by:` graph | Nothing would maintain it. A graph nobody maintains is worse than a sentence somebody reads |
| A `1NN_` standing band inside `plans/` | Cross-plan questions belong to the issue's `notes/`. Keeps `plans/` holding plan folders and nothing else |
| Building the section registry in the same change | Sequenced as [`090`](../040_execution/090_section-registry.md) — two structural changes in one diff and you cannot tell which broke the render |

**One reversal, recorded because the reasoning matters more than the outcome:**
the design first said *"the prefix is order, the name is identity"*. Sid
overturned it — there is no indirection layer here, so a reference is a literal
path containing the prefix. **Gap-spacing solves insertion without any
abstraction**, so the prefix is safely both. *"Stage 20"* is correct.

**Closed 2026-08-02, signed off by Sid.** The two questions that were open — the
iteration-file status vocabulary, and whether the active-plan pin is a sidebar
link or the table rendered inline — were both answered: `status` means *did the
agent finish*, and the pin is a sidebar link with nothing above the issue body.

# Details

## The question

`agent-memory/` is organised by **lifecycle** — `plans/` (live, rewritten every
session), `knowledge/` (mutable in place), `history/` (write-once). That split is
sound and is not what is broken. What is broken is that a *live plan* — the
thing a human opens first to ask "where is this?" — is filed under a heading
that reads as agent scratch space.

Two candidate shapes:

**A — `plans/` becomes a top-level issue section**, a sibling of `notes/`,
`brainstorm/`, `subtasks/`, `agent-log/`, `agent-memory/`. Gets its own sidebar
group, route, and index. `agent-memory/` keeps `knowledge/` and `history/`.

**B — `agent-memory/` gains real structure** and the plan is promoted *within*
it: a pinned active-plan entry, the way `memory.md` is already pinned as the
section index.

A is more work and is the better structure — a plan is not agent working state,
it is the issue's own forward view, and burying it under an agent-named folder
is what caused the problem. B is cheaper and keeps the lifecycle split intact.
**Argue both properly; do not take A because it is written first here.**

## What A actually costs — counted, so the decision is informed

Section names are **hard-coded across the framework**, not data-driven. A new
top-level section touches at least:

| File | What it holds |
|---|---|
| `src/loaders/issues.ts` | the section enumeration (`['comments','subtasks','notes','brainstorm','agent-memory','agent-log']`) and the per-section reader |
| `src/pages/lib/route-match.ts` | the kind → route mapping |
| `src/pages/lib/static-paths.ts` | slug generation per section |
| `src/layouts/issues/default/parts/detail/DetailSidebar.astro` | the sidebar group |
| `src/layouts/issues/default/parts/detail/SubdocTree.astro` | the `pathPrefix` map |
| `src/layouts/issues/default/parts/detail/NotePage.astro` | the `prefix` union type |
| `src/layouts/issues/default/SubDocLayout.astro` | standalone rendering |
| `src/layouts/issues/default/server/helpers.ts` | panel keys + URL building |
| `src/layouts/issues/default/scripts/detail/panels.ts` | client-side panel routing |
| `src/layouts/issues/default/guide.ts` | the bundled anatomy guide |

Plus, outside the framework: the `agent-ks` CLI (`new-memory-plan` and
`check issues`), the `agent-ks-issues` skill, and the user-guide prose.

**This is worth knowing before choosing.** It is not an argument against A — it
is the price of A, and if A is the right structure the price is worth paying. It
*is* an argument against discovering the price halfway through coding.

## The lifecycle questions, which matter more than the folder

- **What makes a plan active?** The current convention is *highest number wins*,
  which is unambiguous and needs no field. Keep it, or make it explicit?
- **Who may close a plan?** If plans are agent-owned, an agent closing its own
  plan is the same self-certification problem that `done` being human-only
  exists to prevent.
- **What spans plans?** Open questions and decisions outlive any one plan.
  Currently a `1NN_` band. Does that stay, or do decisions belong in `notes/`?
- **Does a closed plan stay?** Yes — the whole point of numbering rather than
  editing one file forever is answering *"what did we think was in scope then?"*

## Non-negotiable, whichever shape wins

- **The active plan must be reachable in one click from the issue page.** If it
  is not, nothing else here matters.
- **No new scheduling or release-bucket fields.** Project rule: they rot under
  continuous AI-driven shipping.
- **Existing consumer repos must not break on upgrade.** See the migration
  ruling in [Code the plans section](../040_execution/010_code-the-plans-section.md).
