---
title: "The using-with-AI page describes a world that no longer exists"
status: review
---

# Overview

`user-guide/19_issues/09_using-with-ai.md` is the page a reader opens to learn
how to point an agent at this tracker. It is wrong in four independent ways, and
the first one is the worst:

| Line | Says | Actually |
|---|---|---|
| 13 | *"⏸ **Not implemented yet.** … the content below is the *expected* workflow"* | The skill shipped as `agent-ks-issues`, is installed, and auto-triggers |
| 122, 147–165 | Invokes helpers as `node scripts/issues/show.mjs …` | The entrypoint is `agent-ks issue show …`. **And `node` does not work** — `gray-matter` is unresolvable from `plugins/`, so a reader following this page gets a module-not-found error |
| 135 | A second *"⏸ Not implemented yet"* | Same |
| 81 | *"Write an agent-log entry every iteration. Goal / Approach / Result / Next"* | That four-section body is retired. A round file's head is Goal / Inputs / Expected Outcome / Outcome, in `02_working/` |

Found while updating this page's folder tree for
[the slot numbering](./100_agent-log-slot-numbering.md) — that change fixed the
tree and nothing else, deliberately, because the rest is a different problem.

**Done when** a reader can follow the page end to end and every command they type
works.

# References

- The change that surfaced it: [slot numbering](./100_agent-log-slot-numbering.md)
- The truth for commands: `agent-ks help`, and
  `plugins/agent-ks/skills/agent-ks-docs/references/cli-toolkit.md` (outside the
  site root, so a path rather than a link)
- The truth for the agent-log shape: [agent-log structure](../notes/20_agent-log-structure.md)

# Todo list

- [x] Delete both *"Not implemented yet"* callouts — the skill shipped
- [x] Replace every `node scripts/issues/*.mjs` invocation with `agent-ks …`.
      **Verify each command actually runs** rather than transcribing it; a
      user-guide command that errors is worse than no command
- [x] Fix the round-file recipe to the current head and location
- [x] Read the whole page for anything else predating the skill — it was written
      as a forecast, so the staleness is unlikely to stop at four spots

# Outcomes and Next Steps

**Done 2026-08-03**, shipped in `cf437fd` (+112 / −68) —
[the round](../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md).

> [!NOTE]
> **This record was written a commit late, and the gap is worth naming.** The
> page was rewritten, gated and pushed while this subtask still read `open` with
> every box unticked — Sid asked *"is this complete?"* and the honest answer was
> *the work is, the record isn't.*
>
> The cause is structural, not carelessness: the work was **delegated**, and an
> agent correctly does not write tracker records. Its report goes to the
> orchestrator, who owns the record. Two subtasks done inline the same day were
> written up immediately; the one that went to an agent was not. **A delegated
> subtask needs its record closed by hand, and that is exactly the step easiest
> to drop** — the agent reports success, the gates pass, and nothing anywhere
> says the tracker is out of date.

## The four defects, verified gone rather than reported gone

| Check | Count |
|---|---|
| `Not implemented yet` callouts | **0** |
| `node scripts/…` invocations | **0** — the one remaining mention is a callout saying that form *does not exist* |
| Retired `Goal / Approach / Result / Next` | **0** |
| Working `agent-ks issue …` commands | **20** |

## The agent verified by running, not by transcribing

That was the instruction and it held. Every command on the page was executed
first — read-only ones against the real tracker, and **write** commands against a
throwaway tracker at `~/.cache/agent-ks-verify/` via `--tracker`, deleted
afterwards, with nothing in the repo touched.

Three things it tried did **not** work and so are not on the page:

- `node …/scripts/issues/show.mjs <id>` → `ERR_MODULE_NOT_FOUND: gray-matter`.
  Reproduced, which is what turned defect 2 from "old entrypoint" into "broken
  entrypoint".
- `agent-ks issue set-state subtasks/02_….md review` — the old page's bare
  relative path. `File not found`, exit 1. The page now shows
  `set-state <id> review --subtask 02`.
- `agent-ks issue list --paths-only` with no `--search` — prints nothing, exits
  1. It lists *match* paths, so it needs a search. Kept off the page entirely.

The worked example deliberately uses the same issue id the agent actually ran
against, so what a reader copies is verbatim what was executed.

## Stale beyond the four listed, and one of them mattered more than any of them

The last todo predicted the staleness would not stop at four spots. It did not —
**eight more**, and the first is the serious one:

- **`done`/`dropped` were stated as flatly human-only.** True for issues and
  subtasks, **wrong** for agent logs, child logs, iteration files, plans and
  stages, which an agent closes itself. Replaced with the three-row authority
  table and a line forbidding self-certification — the same rule
  [`070/020`](./070_audit-followups/020_who-closes-an-agent-log.md) gave a single
  home, which this page was quietly contradicting.
- The folder tree had no `plans/` and no `agent-memory/` — both post-date the
  page, and the orientation order does not work without them.
- The orientation order predated `01_summary.md` and the active-plan rule; now
  seven steps ending at notes.
- Four more forecast-era fragments: a placeholder skill path, a capability list
  describing the retired four-section body, a `description` naming "helper
  scripts", and two "while the skill is being built" asides.

# Follow-up this produced

[`140`](./140_user-guide-relative-links-404.md) — the agent hit one broken
relative link and flagged the pattern as *"~10 pages"*. Measured against the
built site it is **65 of 100 links across 18 files**. Filed separately because
it is a section-wide defect with a mechanical fix, not a rewrite of this page.

## Why it is its own subtask and not a line in another one

The page is stale because it was written **before** the thing it documents
existed, and never revisited after it shipped. That is a different failure from
a doc that drifted: drift is fixed by correcting sentences, a forecast is fixed
by rewriting against reality and checking every claim.

Doing it inside the slot-numbering change would have hidden a four-way
correctness problem inside a naming change, and made that change impossible to
review.
