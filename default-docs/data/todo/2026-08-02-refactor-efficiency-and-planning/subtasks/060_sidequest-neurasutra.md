---
title: "Sidequest — bring NeuraSutra into line (rules, plans, and comment volume)"
status: done
---

# Overview

The project that surfaced this problem is also where the fix has to land. Two
separate pieces of work, both pointed at `neurasutra-*` and both **last**:

1. **Its rule files** — several of the local causes are NeuraSutra's own, not
   inherited. Bring them into line once the upstream rules ship.
2. **Its source comments** — 53.4 % of every `.ts` line added is comment prose.
   Same disease, different surface.

**Held deliberately.** Nothing here starts until the upstream work lands, and
**how much of part 2 to do is decided at the end**, when we can see whether the
rule changes moved the number on their own.

**Done when** `neurasutra-docs/memory/*` and its `CLAUDE.md` contain no rule that
duplicates an upstream one, its plans have moved to the new section, a run there
produces log proportional to its change, and the comment-to-code ratio has been
re-measured.

# References

- What is wrong and by how much: [the recording-overhead audit](../notes/10_efficiency-audit-2026-08-02.md)
- The split the rules must match: [What each section is for](../notes/60_section-responsibilities.md)
- Upstream gates — **all three must land first**:
  [Skill: the plans section](./040_execution/030_skill-plans-section.md),
  [Skill: the proportionality rules](./040_execution/040_skill-efficiency-rules.md),
  [Update ~/.claude/CLAUDE.md](./040_execution/020_update-global-claude-md.md)
- Target repos: `neurasutra-docs` (`CLAUDE.md`, `memory/orchestration.md`,
  `memory/standing-rules.md`, `memory/codex-sol.md`, `memory/testing-rules.md`)
  and `neurasutra-canvas` (source comments)

# Todo list

## Part 1 — the rule files

- [ ] Re-read all five always-on files against the new upstream rules
- [ ] Remove the *"keep all six present even when blank"* mandate — or restate
      it as the upstream conditional form
- [ ] Revise the audit-record schema (`<activity>/audit/<scope>.md`) per the
      new report policy
- [ ] Revise the sol-brief convention so briefs are summarised, not committed
      verbatim
- [ ] Delete the never-delete rule at `CLAUDE.md:115` — superseded wording is not
      kept ([`110`](./040_execution/110_superseded-wording-sweep.md))
- [ ] Migrate `agent-memory/plans/` → the new section (migration script from
      [`010`](./040_execution/010_code-the-plans-section.md))
- [ ] Verify: nothing in `memory/` restates an upstream rule — links only
- [ ] Re-measure one run afterwards and compare against the audit's numbers
- [ ] **Added 2026-08-03 — the three slots are now numbered.** Every path those
      files name (`<activity>/audit/<scope>.md`, the sol-brief `03_working/`, the
      six-slot floor) has to land on `01_summary.md` / `02_working/` /
      `03_debrief/`, and a child agent log is now *prefix `≥ 100`*
      ([the numbering spec](../notes/80_agent-log-numbering-spec.md)). Note the
      trap: NeuraSutra's `codex-sol.md` says `03_working/` meaning the **retired
      six-slot** folder, and `03_` is now the debrief — a find-and-replace on the
      number alone routes every sol brief into the wrong slot

## Part 2 — comment volume in `neurasutra-canvas`

**Decide the size of this at the end**, once part 1 has been measured.

- [ ] Census the comment-to-code ratio per package, so the cut is aimed rather
      than uniform
- [ ] Delete comments that **restate the tracker** — a call census, a rejected
      alternative, a list of open holes
- [ ] Delete comments that **narrate the code** — what the next line does
- [ ] Replace a deleted rationale with a **one-line pointer** to the tracker
      issue that owns it, never with silence
- [ ] Report the before/after ratio. **The number is a result, not a target**
- [ ] `bun run typecheck` and the suite clean afterwards

# Outcomes and Next Steps

**Closed `done` on Sid's instruction, 2026-08-04, along with the issue.**

> [!IMPORTANT]
> **The todo boxes above are unticked and are left that way.** The work is in
> `neurasutra-docs` and `neurasutra-canvas` — other repositories, whose history
> this tracker does not see. Ticking them here would assert something no file in
> this repo can support.
>
> **What this subtask has no record of:** the re-measurement it asked for. Its
> own *"Done when"* required the comment-to-code ratio measured again and put
> beside the audit's baseline (8.8 % code · 1,928 log lines for a five-line
> change · 53.4 % comment density). That comparison is not here.

**So read this as closed, not as evidenced.** If the numbers were taken, they
live in NeuraSutra's own tracker and this page should point at them; if they were
not, the baseline above is still the last measurement anyone has.

**What does survive here, and is worth keeping**, is the Details below: which
rules are genuinely NeuraSutra's own rather than inherited, the keep/delete table
for comments, and the `03_working/` numbering trap — `codex-sol.md` uses that
name for the **retired** six-slot folder while `03_` now means the debrief, so a
find-and-replace on the number alone routes every sol brief into the wrong slot.

# Details

## Why this is last, not first

NeuraSutra's `memory/` files are required to **link** upstream rather than copy —
its own precedence note says so: *"a copy cannot know it was replaced, so it goes
stale silently."* Fixing the consumer before the upstream would put a divergent
copy in the field, which is the exact failure that rule exists to prevent.

## The locally-owned rules — the ones that are genuinely NeuraSutra's

Not everything there is inherited. These are its own, and are the ones to change
here rather than upstream:

| Rule | Effect measured |
|---|---|
| *"Keep all six present even when blank — a stub plus a fill-me callout beats a missing slot"* (`standing-rules.md`) | The six-file agent log floor; 15.4% of all writing |
| *"One file per scope… per finding: severity, `file:line`, the failure scenario, whether it was REPRODUCED… also name the areas checked and found clean"* (`orchestration.md`) | Audit reports at 46.7% of all writing |
| The sol-brief convention — *"write the detail as a file in the agent log's `03_working/`"* (`codex-sol.md`) | 160 committed brief files |

## The comment measurement

Across every `.ts` line added in the audited 24-hour window: **53.4 % comment,
42.6 % code, 3.9 % blank.**

The sharpest case, three production files in one run:

| File | Comment lines added | Code lines added |
|---|---:|---:|
| `core/container/format.ts` | 58 | **1** |
| `editor/engine.ts` | 65 | **2** |
| `editor/createCanvas.ts` | 24 | **2** |
| **Total** | **147** | **5** |

One of those was a **65-line block restating a call census, a rejected
alternative and two open holes** — all three already written in the tracker, in
three separate places.

### Where to cut, and where not to

**Delete what a reader could get from the tracker or from the code itself. Keep
what neither can tell them.**

| Keep | Delete |
|---|---|
| An invariant the type system cannot express | A restatement of what the next line does |
| A unit, offset, byte order, or endianness rule | A call census — the tracker owns it |
| Why an obvious-looking simpler form is wrong | A rejected alternative — the tracker owns it |
| A pointer to the tracker issue that owns the decision | The decision's full reasoning, re-typed |

Every `@frozen` / format-contract marker on the `.nsd` byte path stays untouched.

**A pointer is the replacement, not silence.** A comment reading *"contract and
rationale: issue `<slug>`"* is one line and cannot go stale the way a copied
paragraph does.

## Measurement is part of the deliverable

The audit gave a baseline: 8.8 % code, 1,928 log lines for a five-line change,
73 % of writing in `agent-log/`, 53.4 % comment density. **Re-measure a
comparable run after the change with the same commands** and put both numbers
side by side. Without that, this subtask is an assertion that things improved.

## Scope

Rule files, plan migration, comment volume, and the measurement. **Not** a
retro-edit of existing agent-log folders — history stays as written. This changes
what gets recorded next.
