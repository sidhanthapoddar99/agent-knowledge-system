---
title: "Summary"
---

# State

**Closed, with one subtask reopened after the fact.** Twelve of the fourteen
under `040_execution/` are at `review`, including the audit that ends the run.
Seven rounds sit in `working/`, the three verdicts are stored verbatim beside the
round that commissioned them, and **nothing in the skill was changed in response
to them** — which is the condition `130` sets.

Three things are NOT done, all deliberately: `020` sits at `input-needed` with a
proposed diff to Sid's personal global file, which only he may apply;
`050_version-bump` is outside this folder and held on his word; and `100` went
back to `in-progress` on 2026-08-03 when the `iteration:` question surfaced three
items it is the only place able to run.

This log is itself the first thing written in the shape it ships — the six slots
are gone, `working/` carries one file per round, and nothing here restates what
the subtasks already say.

# Goal and Trigger

Execute every subtask under
[`040_execution/`](../../subtasks/040_execution/00_overview.md): the plans
section, per-agent-log settings, the section registry, the skill and docs
rewrites, the superseded-wording sweep, the status migration, the demo fixture,
and the three-reader audit that closes it.

Triggered by Sid on 2026-08-02 — *"complete all of them under execution subtask
folder"*, after the two brainstorms closed and the responsibility split was
decided.

# Task List

Executes against
[what each section is for](../../notes/60_section-responsibilities.md),
[the plans section spec](../../notes/50_plans-section-spec.md),
[the agent-log structure](../../notes/20_agent-log-structure.md) and
[the settings.json spec](../../notes/40_agent-log-settings-framework-spec.md).

- [x] `010` — the plans section (framework + CLI + validator)
- [x] `015` — per-agent-log `settings.json`
- [x] `090` — the section registry
- [x] `030` / `040` / `080` / `110` — the skill
- [x] `050` / `120` — `guide.ts` and the user-guide
- [x] `070` — sidebar icons
- [~] `100` — the status-vocabulary migration. **Shipped and verified, then
      reopened 2026-08-03**: dropping `iteration:` left the filename as the only
      carrier of the number, and the migration is the one pass that sees both
      values before one is destroyed, so the disagreement check belongs there
- [x] `140` — the demo fixture
- [~] `020` — the proposed `~/.claude/CLAUDE.md` diff
- [x] `130` — the three-reader audit

# Out of Scope

- **`subtasks/050_version-bump.md`** — outside `040_execution/`, and held for
  Sid's word.
- **Migrating existing agent-log folders.** History stays as written; the new
  shape governs what is recorded next.
- **The NeuraSutra consumer repo**
  ([`060`](../../subtasks/060_sidequest-neurasutra.md)) — it links upstream
  rather than copying, so it moves after the skill ships.

# Outcome Summary

The responsibility split shipped — `plans/` as its own section, order out of
`agent-memory/`, subtasks by category, the six agent-log slots gone — and
[three neutral readers](./070_independent-audit.md) confirmed the design and
found seven execution defects in it, now sitting unactioned at
[`070_audit-followups/`](../../subtasks/070_audit-followups/00_overview.md).

**Gates:** `./start build` clean at **948 pages**; the repo's own issue validator
clean over 51 issue folders (2 long-standing warnings, one of them the deliberate
unknown-kind fixture); the four new scaffolders smoke-tested end to end, including
`--after` taking the midpoint of a gap.

**One gate result needs stating precisely rather than as a tick.**
`check-skill-links.mjs` reports **4 errors** against the issues skill. All four
are inside a single `yaml` fence in `28_plans.md:64-84` — illustrative paths in
an example stage file, pointing at an issue that does not exist by design. They
are not links and do not render as links; the checker does not skip fenced
regions. **No link in the skill is actually broken**, and the checker's defect is
recorded at
[`050`](../../subtasks/070_audit-followups/050_cli-examples-do-not-run.md).
Reported this way because "0 broken links" and "4 errors, all false" are
different facts, and only one of them is true.

Note also that `agent-ks` **on PATH is the installed plugin 0.6.5**, which
predates this work: it still warns about missing `iteration:` frontmatter, a
field this issue retired, and it has none of the four new commands. Gate with the
repo's own scripts under `plugins/agent-ks/skills/agent-ks-docs/scripts/` until
the version bump ships.

**The one number worth keeping.** The skill grew 2,412 → 2,718 lines, which reads
like a failure for a run whose purpose was cutting recording overhead. It is not
the right measurement: 174 of those lines are `28_plans.md`, a section that had no
documentation at all before. Inside the file that was actually rewritten,
`24_agent-logs.md`, **prose fell 205 → 160 lines while tables grew 15 → 67** —
the same ground, reached by scanning instead of reading. All three readers
independently named those tables as why the new version reads better, and two of
them called it out despite the file being 150 lines longer.

**What the audit cost and bought.** It found the thing a run cannot find about
itself: `40_operations/` and `60_examples/` were never migrated, so the skill's
own demonstrations still teach the model this run deleted. One reader flipped its
overall verdict to the *old* skill on that ground alone. Nine CLI examples do not
run. A stage's `status` has no stated meaning. **None of it was fixed** — fixing
an audit inside the run that commissioned it is how the previous several rounds
of this kind went wrong.
