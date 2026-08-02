---
title: "Plans section"
status: done
agent: claude
---

# Goal

Subtask 010 — build the plans section end to end: loader read path, routes, the
single plan page, the sidebar pin, the CLI scaffolders, and the validator.

# Inputs

- `notes/50_plans-section-spec.md`
- `subtasks/040_execution/010_code-the-plans-section.md`

# Expected Outcome

The change, and what it touched.

# Outcome

Shipped and verified on a real fixture. Detail is in
[the subtask](../../../subtasks/040_execution/010_code-the-plans-section.md) —
what follows is only what the subtask does not already say.

**Verified, not assumed.** Page count went 902 → 907 on the same tracker: one
plan page plus four stage pages. The plan table resolves live subtask status
(`0/0/0/2` · `0/1/0/0` · `0/0/0/0` · `0/0/1/0` across the four stages), stage
anchors are titles (`#loader-and-routes`), and stage-body heading ids are
prefixed (`loader-and-routes-todo`) so four stages each carrying `## Todo` do not
collide.

**The validator's new error was proved able to fire**, not just observed silent:
renaming one `subtasks:` target produced exactly one error and exit code 1;
restoring it returned to exit 0. A clean first result here would have been
worthless — the whole check is one string comparison, and a check that never
matches anything reports clean forever.

**Three decisions taken inside the round**, each recorded where it binds rather
than only here:

1. A reference that resolves to nothing is an **error**, and the plan page names
   it in red. It was the one silent failure the design left open.
2. `new-agent-log` creates **two files, not four** — `working/` and `debrief/`
   appear when something goes in them. Git does not track an empty directory, so
   scaffolding one produces a shape that exists for its author and nobody else.
3. The new agent-log lint **skips folders written in the old six-slot shape,
   silently.** First run produced 289 warnings against history that was
   deliberately not migrated; that is how a validator stops being read.

**Discovered, and it changes how everything below gets verified:** `agent-ks` on
PATH is the *installed plugin* (0.6.7), not this repo's source. The first
validator run passed because it was running the old code. Every CLI check from
here runs `bun plugins/agent-ks/skills/agent-ks-docs/scripts/…` directly. Now in
[gotchas](../../../agent-memory/knowledge/gotchas.md).
