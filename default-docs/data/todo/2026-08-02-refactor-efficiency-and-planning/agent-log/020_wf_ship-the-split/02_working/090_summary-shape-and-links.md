---
title: "The summary shape, and reference-by-link"
status: done
agent: claude
---

# Goal

Sid read this run's own `summary.md` — the first file ever written in the shape
this issue ships — and found two things wrong with it. Fix both in the spec, the
skill, the docs, the scaffolder and the fixtures, then rewrite the offending file
onto its own new rule.

# Inputs

- Sid, in session, on the Todo list: *"the task list just mentions number. It
  shouldn't mention number. In fact, nothing should just mention number. It
  should mention a reference `[]()` to the file itself… because when we are
  moving files, these data get lost. These cannot be linked."*
- Sid, on emphasis: *"it's very important and should be mentioned in the main
  skill file — throughout the docs and issues and everything."*
- Sid, on the section shape: `# State` as a callout · `# Goal` (goal and
  trigger) · `# Todo` (a list with detail, or a table) · `# Out of Scope`
  (optional) · `# Outcome` (a detail area).
- Sid, on length: *"the summary page could be a little bit more detailed."*
- [The agent-log structure](../../../notes/20_agent-log-structure.md) — the spec
  being revised

# Expected Outcome

Two decisions recorded as durable rules, propagated to every place that teaches
the shape, and demonstrated in the files a reader will actually open.

# Outcome

## Finding 1 — the Todo list identified ten subtasks by number

```markdown
- [x] `010` — the plans section
- [x] `030` / `040` / `080` / `110` — the skill
```

Three failures in one line, and the third is the one that makes it a rule rather
than a preference:

| Failure | Consequence |
|---|---|
| **Breaks silently on a move** | `agent-ks move` rewrites real markdown links. A backticked `` `010` `` is prose to every tool that exists — the file moves, the text stays, nothing reports it |
| **A number is not a name** | *"`050` blocks `100`"* is unreadable to anyone who has not already opened both. It is the same failure as an internal codename |
| **Renumbering is normal** | Gap-spacing exists so `015` can be inserted later. A number quoted in another file makes the numbering immutable — the exact opposite of why it is spaced |

Recorded as
[reference by link, never by number](../../../notes/70_reference-by-link-never-by-number.md),
a repo-wide rule rather than an agent-log one.

**The sharp edge, stated in every copy of the rule:** a link reading
`[010](./010_thing.md)` is still a number, just clickable. The link text has to
name the thing. Without that sentence the rule gets satisfied mechanically and
buys nothing.

**Not validated, deliberately.** A checker cannot distinguish a backticked
`` `010` `` that means a file from one that means a digit sequence, and a rule
that fired on both would be switched off within a week. Written down as the
guard; if a reliable signal appears it becomes a warning, never an error.

## Finding 2 — the summary was forbidden to say anything

The old spec capped `# Outcome Summary` at *"one sentence and a link, never a
paragraph."* That rule was aimed at **restatement** — a summary re-narrating the
iteration files below it. It landed on the wrong target: the one file a reader
opens first became the one file not allowed to be useful.

**The cap is lifted; the anti-restatement rule survives in its correct form** —
*point at detail rather than copying it*. Length is not the constraint.

## What changed, and where

| Was | Now |
|---|---|
| `# Goal and Trigger` | `# Goal` — the trigger is part of the goal, not a co-equal subject |
| `# Task List` | `# Todo` — the word the rest of the tracker already uses |
| `# Outcome Summary`, capped at one sentence | `# Outcome`, a detail area |
| *Out of Scope* required | optional — a required section with nothing to say gets filled with "nothing" |
| State as prose | **State as a callout**, and the callout *type* carries the news: `> [!WARNING]` for a run that reopened or stalled |

Propagated to nine files, so no copy is left teaching the retired shape:

| Surface | File |
|---|---|
| The spec | `notes/20_agent-log-structure.md` — revised in place, with the previous names kept in a *What changed and why* table |
| The new rule | `notes/70_reference-by-link-never-by-number.md` |
| Skill — the rule, where every session reads it | `agent-ks-issues/SKILL.md` → *Universal conventions* |
| Skill — the docs half | `agent-ks-docs/SKILL.md` → *Universal conventions* |
| Skill — the worked contrast | `agent-ks-issues/references/10_writing/10_writing.md` → *Linking* |
| Skill — the shape | `agent-ks-issues/references/20_sections/24_agent-logs.md` |
| Skill — the loop example | `agent-ks-issues/references/60_examples/63_agent-loops.md` |
| User-guide | `19_issues/05_sub-docs/05_agent-log.md`, `19_issues/03_folder-structure.md` |
| In-app guide | `astro-doc-code/src/layouts/issues/default/guide.ts` |
| Scaffolder | `new-agent-log.mjs` — the seeded template, its docstring and its `--help` |
| Validator + CLI manifest | `check.mjs`'s missing-summary message, `_manifest.mjs`'s `--goal` description |

**The scaffolder is the load-bearing one.** The skill says *"open what
`new-agent-log` made rather than reading a template here"*, so a template that
still emitted `# Task List` would have out-voted every document above it. Its
`# Todo` block now carries the link rule and a correct example inline, which is
where an agent will actually meet it.

## Demonstrated, not only documented

Two fixtures were rewritten so the rule has a reference implementation:

- **This run's own `summary.md`** — every Todo item is now a link carrying a line
  of what it did, `# State` is a `> [!WARNING]` because the run reopened twice,
  and `# Outcome` says what the run cost and what reading it changed.
- **The demo showcase's agent logs** — see
  [the fixture rework](./100_demo-showcase-agent-logs.md).

## A gate this round broke, and then fixed

The new worked examples are markdown links inside ```` ```markdown ```` fences —
which is what they have to be, since the whole point is showing the syntax. But
`check-skill-links.mjs` did not skip fenced regions, so **it went from 4 false
errors to 8.**

Those 4 were a known defect, recorded at
[the CLI-examples follow-up](../../../subtasks/070_audit-followups/050_cli-examples-do-not-run.md)
and left for Sid to schedule. Doubling them is different: the same session that
would have left it alone made it materially worse, and a checker reporting
"8 errors, all false" is one nobody runs.

**So the extractor now tracks fence state.** A fence opens on three or more
backticks or tildes and closes only on the **same character at equal-or-greater
length** — so a four-backtick block wrapping three-backtick lines does not close
on the first inner one.

**Control-tested, because a checker that stops reporting looks exactly like a
checker with nothing to report.** A fixture carrying two genuinely broken links
outside fences, three illustrative ones inside, and a four-backtick block
wrapping a three-backtick block reported **exactly the two real ones**. All three
skills now pass at zero.

The nine CLI examples that error — the actual scope of that follow-up — are
untouched and still Sid's call.

## Gate

`./start build` clean; the repo's own validator over 51 issue folders at its
long-standing warnings; `check-skill-links.mjs` at **zero** across all three
skills — down from 4 before this round, and from 8 partway through it.

Nothing here is measurable in the speed/memory/size sense — the change is to
written shape, so there is no before-and-after number to report, and inventing
one would be worse than saying so.
