---
title: "Notes"
---

# Notes — handover

## Found while working, deferred

**`agent-ks issue new-subtask --group` corrupts the group path.** Passing
`--group 040_execution` produced `subtasks/040-execution/` — the underscore
sanitised to a dash — creating a *second* sibling folder rather than nesting into
the existing `040_execution/`. Same defect in `new-agent-log --group`.

Worked around by scaffolding then `mv`. `_` is the framework's canonical
ordering-prefix separator, so stripping it from a path segment is wrong on its
face. Routed to [Code the plans section](../../subtasks/040_execution/010_code-the-plans-section.md) because it
shares the path-sanitising helper with the section work.

**The marketplace plugin description has already drifted** from `plugin.json` —
it advertises 28 CLI commands where the manifest says 29 and `agent-ks help`
lists 33. A live instance of this issue's own thesis: a fact with two homes
drifts and nobody notices. Routed to [Version bump to 0.7.0](../../subtasks/050_version-bump.md).

**The demo fixture's `agent-memory/` is the older flat shape**
(`memory.md` / `decisions.md` / `gotchas.md`) rather than the
plans / knowledge / history split in current field use. It is the designated test
bed for the plans section, so it needs updating either way — noted in
[Code the plans section](../../subtasks/040_execution/010_code-the-plans-section.md) so it is not discovered
late.

## Caveats on the numbers

Stated in full under "Caveats" in [Audit the efficiency losses](../../subtasks/010_initial-research/010_audit-efficiency-losses.md). The
short version: one project, one window, read-back is proxied rather than
observed, and the comment-share figure is biased *low* by the classifier — so the
real ratio is at least as bad as reported.

## For whoever picks this up next

The two brainstorms are the whole risk. The measurement was easy and is done; the
hard part is a rule that cuts restatement **without** cutting verification, and
without becoming a word budget. Read the "Two constraints" section of
[Brainstorm: cutting the recording overhead](../../subtasks/010_initial-research/020_brainstorm-efficiency-remedies.md) before proposing anything.
