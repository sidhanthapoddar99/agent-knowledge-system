---
title: "Ordering labels — the number comes back, with a guard"
status: done
agent: claude
---

# Goal

Give link text a sanctioned way to carry the target's number, so the
[link rule](../../../notes/70_reference-by-link-never-by-number.md) does not cost
the navigation it was never meant to remove — and make sure the number cannot
quietly go stale.

# Inputs

- Sid's proposal: *"in the () name part, if the folder and subfolder can be
  mentioned that would be helpful… and if this standard is taken forward maybe in
  move we can add — if we are moving a file, check the first phrase, does it
  match a regex of `(N+/)+`… then update that as well."*
- Sid's reason: *"Numbering makes it easy for me to navigate on the side panel if
  the numbering is there. And some text is also important, but numbering is also
  important."*
- Sid, on scope: *"how does that sound — add a subtask and add it to skills and
  update the script. Required. This can also be generalized."* Then: *"do check
  and you proceed on your own, whatever is the best thing."*
- The tools that walk links: `_links.mjs`, `docs/move.mjs`,
  `issues/check.mjs`, `check-skill-links.mjs`

# Expected Outcome

A convention, its two guards, and the documentation — plus a control run proving
each guard fires on the case it exists for, and does not fire on the cases it
must not.

# Outcome

## The shape

```markdown
[040/100 the migration script](../../subtasks/040_execution/100_migration-script.md)
```

Link text opens with the **ordering path** — the numeric prefixes of the target's
folders and of its own name, joined by `/` — then the name. Optional. Derived
from the target and stating nothing the target does not.

**Sid's shorthand put the numbers in the `()` half.** Taken literally that does
not render — markdown is `[text](target)`, and the target has to be the path or
the link is dead. His arrow, `[../../](NN/MM <text>)` → `[new path](XX/YY/ZZ
<text>)`, shows the two components he wants updated together, and his own regex
(*"the first phrase… `(N+/)+`"*) puts the numbers at the **start of a phrase** —
which is the text. Realised as `[NN/MM <name>](<relative path>)`, both his
requirements hold and it renders.

## What was added to the proposal, and why it was not optional

The proposal was: label, plus `move` rewriting it. That is one guard, and it
leaves the convention as **the same fact stored in two places**.

Every defect this issue has spent itself removing has that shape:

| Duplicate | How it drifted |
|---|---|
| `guide.ts`'s hand-written `STATUS_TINTS` | Disagreed with the real palette on **two of seven** statuses |
| `iteration:` frontmatter beside the filename prefix | Nothing compared them; the badge could read 3 while the sort read 2 |
| `.issue-log__chip--status.is-success` | Keyed to a value the migration had retired; two of three rules dead for days |

**A stale ordering label is worse than any of them, because the link still
resolves.** Nothing renders red. It simply tells the reader the target sits
somewhere it does not.

So `agent-ks check issues` now **warns** when a label disagrees with its target.
`move` covers the moves it performs; the validator covers a hand `git mv`, an
editor rename, and a label typed from memory. The pair is what makes the
convention safe to use, and the decision is recorded at
[the subtask](../../../subtasks/080_presentation-and-numbering/010_ordering-labels.md).

## The control run — five cases, and the false positive I predicted

A scratch tracker, not the real one, because a control that mutates the working
tree is a control you have to remember to undo.

| Fixture line | Expected | Result |
|---|---|---|
| `[040/100 the thing](../subtasks/040_group/100_thing.md)` | silent | silent |
| `[030/100 the thing](…/040_group/100_thing.md)` — stale group | WARN | WARN |
| `[040/110 the thing](…/040_group/100_thing.md)` — stale leaf | WARN | WARN |
| `[the other thing](…/110_other.md)` — no label | silent | silent |
| `[999/999 illustrative](…)` inside a ```markdown fence | silent | silent |
| `[2026 retrospective](./70_refs.md)` | **WARN — the known false positive** | WARN |

The last row is the point of running it. The grammar cannot distinguish a bare
number opening a phrase from an ordering label, and the control proved that class
is real rather than theoretical. That is precisely why the check is a **warning**
with a "reword if it was never a label" escape, and not an error that would block
a gate over wording.

`move` was tested by renumbering a group — `040_group` → `035_group`:

```
[040/100 the thing](../subtasks/040_group/100_thing.md)
  → [035/100 the thing](../subtasks/035_group/100_thing.md)
[the other thing](../subtasks/040_group/110_other.md)
  → [the other thing](../subtasks/035_group/110_other.md)      ← text untouched
```

Labels recomputed, unlabelled text left alone. It also repairs a label that was
already stale, since it rebuilds from the target rather than editing the old
value.

## The second defect, found only because the fixture had a fence

The first `move` dry-run reported **five** edits. One of them was the link inside
the ```markdown fence — `move` was rewriting a worked example to point somewhere
else.

That is the same defect fixed a few hours earlier in `check-skill-links.mjs`, now
showing up in a second tool, and worse here because **`move` writes**. A reading
review would not have found it; the control fixture found it by accident, because
it happened to contain a fenced example.

Fixed structurally rather than twice: one `makeFenceTracker()` in `_links.mjs`
with three callers — `move`, the skill link-checker, and the issue validator.
The dry-run then reported four edits, and both other tools' controls re-ran
unchanged.

## Where it is written down

| Surface | What it says |
|---|---|
| `agent-ks-issues/SKILL.md` → *Universal conventions* | The form, the sidebar reason, and both guards |
| `agent-ks-docs/SKILL.md` → *Universal conventions* | The same, one paragraph, for docs pages |
| `references/10_writing/10_writing.md` → *Linking* | The worked examples, the computation rule, and the stale-label failure mode |
| `19_issues/03_folder-structure.md` | The human version, with a callout on why two guards |
| `guide.ts` | Two bullets in the in-app anatomy guide |
| `_links.mjs`, `move.mjs`, `check.mjs` | Docblocks carrying the reasoning at the point of use |

## Adopted nowhere yet, and that is stated rather than hidden

**No link in this repo carries a label.** The convention ships unused: it is
optional, so nothing forced a bulk rewrite, and a `--relabel` bulk tool is
premature before anyone has lived with it. Both are open items on
[the subtask](../../../subtasks/080_presentation-and-numbering/010_ordering-labels.md).

The consequence to be honest about: the validator's label check has **never
fired on real content**, only on the control fixture. It is proven to work; it is
not proven to be useful.

## One stale doc deleted on the way past

`19_issues/03_folder-structure.md` still showed `agent-memory/plans/` in its tree
and its table — the bucket this issue moved out to the top-level `plans/`
section. Deleted rather than annotated, per the skill's own rule about superseded
wording.

## Gate

| Check | Result |
|---|---|
| `./start build` | clean |
| Issue validator | 51 folders, 1 warning (a different issue) |
| `check-skill-links.mjs` | zero across all three skills |
| Ordering-label control | 6 cases, all as predicted including the false positive |
| `move` control | renumber rewrites labels; fenced example untouched |
| Fence-tracker refactor | both pre-existing controls re-run unchanged |

Nothing measurable in the speed/memory/size sense — this is written convention
plus two guards, so there is no before-and-after number and inventing one would
be worse than saying so.
