---
title: "Summary"
---

# State

> [!WARNING]
> **Closed, then reopened twice — and one item is now waiting only on Sid.**
> Twelve of the fourteen subtasks under
> [Execution](../../subtasks/040_execution/00_overview.md) are at `review`,
> including the audit that ends the run. Eight rounds sit in `working/`; the
> three verdicts are stored verbatim beside the round that commissioned them,
> and **nothing in the skill was changed in response to them** — the condition
> [the audit](../../subtasks/040_execution/130_independent-skill-audit.md) sets.
>
> **What is not finished, all deliberately:**
> [the migration script](../../subtasks/040_execution/100_migration-script.md)
> went back to `in-progress` on 2026-08-03 when the `iteration:` question
> surfaced a check only it can run; and
> [the version bump](../../subtasks/050_version-bump.md) sits outside this
> folder, held on Sid's word.
>
> **Waiting on Sid:** the seven
> [audit follow-ups](../../subtasks/070_audit-followups/00_overview.md) are all
> at `open` pending his decision on which to take.

# Goal

Execute every subtask under
[Execution](../../subtasks/040_execution/00_overview.md): the plans section,
per-agent-log settings, the section registry, the skill and docs rewrites, the
superseded-wording sweep, the status migration, the demo fixture, and the
three-reader audit that closes it.

**Triggered by Sid on 2026-08-02** — *"complete all of them under execution
subtask folder"* — after the two brainstorms closed and the responsibility split
was decided. Extended by him through 2026-08-03 with the status-colour thread
and the summary-shape revision, both of which came out of reading what this run
had produced.

# Todo

Executes against
[what each section is for](../../notes/60_section-responsibilities.md),
[the plans section spec](../../notes/50_plans-section-spec.md),
[the agent-log structure](../../notes/20_agent-log-structure.md),
[the settings.json spec](../../notes/40_agent-log-settings-framework-spec.md) and
[reference by link, never by number](../../notes/70_reference-by-link-never-by-number.md).

- [x] [The plans section](../../subtasks/040_execution/010_code-the-plans-section.md)
      — a new top-level tracker section: loader, routes, two page layouts, the
      validator, and four new CLI scaffolders (`new-plan`, `new-stage`,
      `new-iteration`, `new-agent-log`), all smoke-tested end to end
- [x] [Per-agent-log `settings.json`](../../subtasks/040_execution/015_code-agent-log-settings.md)
      — status per folder, colouring the kind symbol; retires the 14-value
      `MILESTONE_STATUSES` set
- [x] [The section registry](../../subtasks/040_execution/090_section-registry.md)
      — one declaration replacing eleven files that agreed by hand; adding a
      free-form section is now one entry, not eleven edits
- [x] The skill —
      [the plans section](../../subtasks/040_execution/030_skill-plans-section.md),
      [the proportionality rules](../../subtasks/040_execution/040_skill-efficiency-rules.md),
      [subtasks by category](../../subtasks/040_execution/080_skill-subtasks-by-category.md),
      [the superseded-wording sweep](../../subtasks/040_execution/110_superseded-wording-sweep.md)
      — the six slots, milestone files and the word *activity* all gone; prose
      down, tables up
- [x] [The in-app guide and the user-guide](../../subtasks/040_execution/050_docs-update-plans-section.md)
      and [agent memory after plans leaves it](../../subtasks/040_execution/120_agent-memory-after-plans.md)
      — the same content for humans, and `agent-memory/` reduced to
      `knowledge/` + `history/` now that order lives in `plans/`
- [x] [Sidebar icons for Subtasks and Overview](../../subtasks/040_execution/070_ui-subtasks-overview-icons.md)
      — the two sections that had none
- [~] [The status-vocabulary migration](../../subtasks/040_execution/100_migration-script.md)
      — 181 rewrites across 110 files, idempotent, verified on a copy first.
      **Shipped and verified, then reopened 2026-08-03:** dropping `iteration:`
      left the filename as the only carrier of the number, and this migration is
      the one pass that sees both values before one is destroyed, so the
      disagreement check belongs here or nowhere
- [x] [The demo showcase fixture](../../subtasks/040_execution/140_rework-demo-showcase.md)
      — rebuilt onto the new structure, then reduced on a second pass; see the
      fixture round below
- [x] [The four `~/.claude/CLAUDE.md` edits](../../subtasks/040_execution/020_update-global-claude-md.md)
      — proposed 2026-08-02, **applied 2026-08-03** on Sid's word; 332 → 352
      lines, diffed against a pre-edit copy
- [x] [The three-reader audit](../../subtasks/040_execution/130_independent-skill-audit.md)
      — three neutral readers, old skill against new, none of them shown this
      issue. Verdicts stored verbatim; seven findings filed and **none acted on**
- [x] [Status colours out of settings and into theme CSS](./080_status-colours.md)
      — added 2026-08-03 from Sid's questions about the palette. Seven
      `--status-*` tokens, a hard error on the old override route, migration
      `0.1.3`, and the last surface still keyed to the retired vocabulary fixed
- [x] [The summary shape and the link rule](./090_summary-shape-and-links.md)
      — added 2026-08-03 after Sid read this file: `# Todo` items must be links
      carrying detail, `# State` is a callout, `# Outcome` is a detail area
- [x] [The demo fixture, ten agent logs down to three](./100_demo-showcase-agent-logs.md)
      — 50 files to 28, no stubs, and the tracker-wide validator warning count
      from 2 down to 1

# Out of Scope

- **[The version bump](../../subtasks/050_version-bump.md)** — outside
  `040_execution/`, and held for Sid's word.
- **Migrating existing agent-log FOLDERS.** History stays as written; the new
  shape governs what is recorded next. Only the status *values* were migrated.
- **[The NeuraSutra consumer repo](../../subtasks/060_sidequest-neurasutra.md)**
  — it links upstream rather than copying, so it moves after the skill ships.

# Outcome

The responsibility split shipped — `plans/` as its own section, order out of
`agent-memory/`, subtasks filed by category, the six agent-log slots gone — and
[three neutral readers](./070_independent-audit.md) confirmed the design while
finding seven execution defects in it, now sitting unactioned at
[the audit follow-ups](../../subtasks/070_audit-followups/00_overview.md).

**Gates.** `./start build` clean at **936 pages**; the repo's own issue validator
over 51 issue folders at **1 warning**, which belongs to a different issue; the
four new scaffolders smoke-tested end to end, including `--after` taking the
midpoint of a gap; and the demo fixture's Playwright pass re-run after the
consolidation — 24 assertions, all PASS.

The warning count was 2 for most of this run. The second one belonged to a
fixture that existed to trigger it, and went when
[the demo was reduced](./100_demo-showcase-agent-logs.md).

**One gate that used to need a caveat now passes at zero.**
`check-skill-links.mjs` reported 4 errors against the issues skill for most of
this run — all inside one fenced example, none of them real links. Writing the
new worked examples took that to 8, so
[the extractor was fixed to skip fenced blocks](./090_summary-shape-and-links.md)
and control-tested against a fixture carrying both kinds. **All three skills now
pass at zero**, which means the result can be read as a tick rather than as
"8 errors, all false".

**Two tooling facts a later session will otherwise rediscover.** `agent-ks` on
`PATH` is the *installed plugin*, which predates this work: it warns about the
retired `iteration:` field on every migrated file and has none of the four new
commands. And the repo's own `check.mjs` **will not run under `node`** —
`gray-matter` is not resolvable from `plugins/` and there is no root
`package.json`. Gate with `bun plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs`
until the version bump ships.

**The one number worth keeping.** The skill grew 2,412 → 2,718 lines, which reads
like a failure for a run whose purpose was cutting recording overhead. It is the
wrong measurement: 174 of those lines are `28_plans.md`, a section that had no
documentation at all before. Inside the file that was actually rewritten,
`24_agent-logs.md`, **prose fell 205 → 160 lines while tables grew 15 → 67** —
the same ground, reached by scanning instead of reading. All three readers
independently named those tables as why the new version reads better, and two of
them said so despite the file being 150 lines longer.

**What the audit cost and bought.** It found the thing a run cannot find about
itself: `40_operations/` and `60_examples/` were never migrated, so the skill's
own worked examples still teach the model this run deleted. One reader flipped
its overall verdict to the *old* skill on that ground alone. Nine CLI examples do
not run. A stage's `status` has no stated meaning. **None of it was fixed** —
fixing an audit inside the run that commissioned it is how the previous several
rounds of this kind went wrong.

**What reading this file changed.** Sid read the run's own output twice and both
times found a defect the run could not see in itself: a status colour keyed to a
retired value, and this summary identifying every subtask by a bare number. The
second produced a rule that now binds the whole repo —
[reference by link, never by number](../../notes/70_reference-by-link-never-by-number.md)
— and the Todo list above is the first thing written to it.
