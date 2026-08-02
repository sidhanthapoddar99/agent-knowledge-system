---
title: "70 — Reference by link, never by number (decided)"
---

# Reference by link, never by number

**Decided (sidhantha, 2026-08-03).** A repo-wide writing rule, binding on the
skill, the user-guide, every tracker file and everything agents write.

> **Never identify another file by its number. Always write a markdown link.**

```markdown
- [x] `010` — the plans section              ← WRONG
- [x] [The plans section](./010_code-the-plans-section.md) — framework, CLI and
      validator                              ← RIGHT
```

## Why, in Sid's words

> *"Always use reference. Never use numbers or stuff like that — because when we
> are moving files, these data get lost. These cannot be linked."*

Three separate failures, and only the first is obvious:

| Failure | What happens |
|---|---|
| **The reference breaks silently on a move** | `agent-ks move` rewrites real markdown links. A backticked `` `010` `` is prose to every tool that exists — the file moves, the text stays, and nothing reports it |
| **A number is not a name** | *"`050` blocks `100`"* is unreadable to anyone who has not already opened both. It fails the rule that no term may depend on having read one of our files |
| **Renumbering is normal** | Gap-spaced prefixes exist so files can be inserted between others. The moment a number is quoted somewhere else, renumbering stops being free |

The third is the one that catches people. The whole point of `010`/`020`
spacing is that `015` can appear later. A tracker that quotes numbers across
files has quietly made its own numbering immutable.

## What the rule actually requires

**A reference is a link whose text says what the target IS.** Both halves
matter — a link reading `[010](./010_thing.md)` is still a number, just a
clickable one.

| Context | Write |
|---|---|
| Another subtask | `[The plans section](./010_code-the-plans-section.md)` |
| A sibling round file | `[the audit round](./070_independent-audit.md)` |
| A note that scopes the work | `[the agent-log structure](../../notes/20_agent-log-structure.md)` |
| A file in another issue | a relative path link, the same way |
| A repo file that is not a tracker page | a backticked path — `` `src/loaders/issues.ts` `` — because there is nothing to link to |

**Where a number genuinely is the subject, keep it and add the link.** *"The
first two digits are the iteration"* is about numbering itself. And a
disambiguating number alongside a named link — `[the plans section
(`010`)](./010_code-the-plans-section.md)` — is fine; what is banned is the
number **standing alone as the identifier**.

## What this does not change

Ordering prefixes stay exactly as they are. This is a rule about how one file
**refers to** another, not about how files are named. `NNN_` still sorts, still
gap-spaces, and still owns the number — see the prefix rule in the skill's
universal conventions.

## Where it is written down

Because it applies everywhere, it goes in the places every session reads rather
than in one reference file:

- `agent-ks-issues/SKILL.md` → *Universal conventions*
- `agent-ks-docs/SKILL.md` → the writing rules
- `agent-ks-issues/references/10_writing/10_writing.md` → *Linking*, with the
  worked contrast
- The user-guide's issue-writing page, same content for humans

It is deliberately **not** validated yet. A checker cannot tell a backticked
`` `010` `` that means a file from one that means a digit sequence, and a rule
that fires on both would be turned off within a week. If a reliable signal turns
up — a backticked 2–3 digit number in a file that also contains `NNN_`-prefixed
siblings — it becomes a warning, not an error.
