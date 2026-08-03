---
title: "Ordering labels — keep the number, keep it honest"
status: done
---

# Overview

[Reference by link, never by number](../../notes/70_reference-by-link-never-by-number.md)
solved one problem and created another: it took the numbers out of link text, and
**the numbers were useful**. Sid, on why:

> *"Numbering makes it easy for me to navigate on the side panel if the numbering
> is there. And some text is also important, but numbering is also important."*

The sidebar lists entries **by number**. A link whose text is only a name cannot
be matched against what is already on screen; a link whose text is only a number
is unreadable. So: both.

**The ordering label** — link text that opens with the target's ordering path,
then the name:

```markdown
[040/100 the migration script](../../subtasks/040_execution/100_migration-script.md)
[70 reference by link](../notes/70_reference-by-link-never-by-number.md)
```

**Done when** the convention is documented everywhere the link rule is,
`agent-ks move` recomputes labels alongside targets, and a drifted label is
reported rather than left to rot.

# References

- The rule this completes:
  [reference by link, never by number](../../notes/70_reference-by-link-never-by-number.md)
- The round that built it:
  [ordering labels](../../agent-log/020_wf_ship-the-split/02_working/110_ordering-labels.md)
- Where the shared primitives live:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`

# Todo list

- [x] `orderingPathFor` / `parseOrderingLabel` / `relabelOrdering` in `_links.mjs`,
      shared by every tool that walks links
- [x] `agent-ks move` recomputes the label whenever it rewrites the target
- [x] `agent-ks check issues` **warns** on a label that disagrees with its target
- [x] Both skills' *Universal conventions*, the writing reference, the user-guide
      and the in-app guide
- [x] Control-tested: correct label silent, stale group warns, stale leaf warns,
      unlabelled silent, fenced example silent
- [x] **Backfilling existing links — decided against, by Sid, 2026-08-03.** See
      *No backfill, and why that costs nothing* below
- [ ] Consider a `--relabel` pass that adds or repairs labels in bulk — **only if
      a real need appears.** With no backfill there is nothing to bulk-process
      today, so this stays unscheduled rather than pending

# Outcomes and Next Steps

Shipped and gated. Nothing is owed on existing content.

## No backfill, and why that costs nothing

**Sid, 2026-08-03:** *"you have noted the convention in skill right and also the
move command hold it true right? so it fine no need to move existing ones."*

Both premises hold — the convention is in both skills, the writing reference, the
user-guide and the in-app guide, and `agent-ks move` recomputes labels
(control-tested by renumbering a group).

The reason the conclusion follows, stated because it is the non-obvious half:

- **`move` never ADDS a label.** `relabelOrdering` returns text unchanged when
  there is no label to rewrite. An unlabelled link survives any number of moves
  as an unlabelled link.
- **The validator only checks labels that EXIST.** No label, nothing to compare,
  no warning.

So the two mechanisms act exclusively on links someone chose to label. There is
no half-migrated state to manage and no pressure to finish a sweep — labels
appear where a writer wants navigation, and the guards keep those honest. A
convention that only costs something when used is one that can be adopted at
whatever pace it earns.

**What this gives up, and it is small:** the label check has still never fired on
real content, only on the control fixture. It is proven correct, not proven
useful. That will only change as labels get written.

## The design call, and the part that was added to the proposal

Sid's proposal was the label plus `move` rewriting it. **That is not enough on
its own**, and the missing half is the reason this issue exists at all:

> A label is the target's path, restated. That is the same fact in two places.

Every defect this issue has spent itself removing has that exact shape — the
Guide's hand-written palette drifting from the real one on two of seven statuses;
`iteration:` in frontmatter disagreeing with the filename prefix; a CSS rule
keyed to a status value that had been migrated away. Each was invisible until
someone looked.

**A stale ordering label is worse than all three, because it still resolves.**
The link works. It simply tells the reader the target sits somewhere it does not.
Nothing renders red.

So the convention ships with **two** guards, not one:

| Guard | Catches |
|---|---|
| `agent-ks move` recomputes the label | Every move or renumber it performs — the common case |
| `agent-ks check issues` warns on a mismatch | Everything else: a hand `git mv`, an editor rename, a typo, a label written from memory |

The second is what makes the first safe to rely on. Without it the convention
would be a documented invariant, which decays; with it the invariant is checked,
which does not.

## Why a warning and not an error

The label grammar is `NN`, `NN/MM`… followed by whitespace and a name. Link text
that legitimately opens with a bare number and a space — *"2026 retrospective"* —
matches it. **The control run proved this is real, not theoretical:** the fixture
line `[70 retrospective](../70_refs.md)` was reported, exactly as predicted.

An error would block the gate over wording. A warning says what is wrong and
offers the escape ("reword the link text if the number was never an ordering
label"), and the fix is one word. That reasoning also matches the call made
earlier in this issue about a fixture that tripped a permanent warning: **a gate
whose clean state is not zero stops being read** — but a warning a person can
clear in one edit does not have that problem.

## How the path is computed

Walk up from the file collecting numeric prefixes; stop at the first segment
without one. The rule is unchanged; what its last two rows produce is not — see
below.

| Target | Label |
|---|---|
| `subtasks/040_execution/100_migration-script.md` | `040/100` |
| `notes/70_reference-by-link-never-by-number.md` | `70` |
| `agent-log/020_wf_ship-the-split/02_working/090_x.md` | `020/02/090` |
| `agent-log/020_wf_ship-the-split/01_summary.md` | `020/01` |

## What the 2026-08-03 renumbering did to the last two rows

**The two agent-log rows used to read `090` and *(none)*, and the reason was the
unprefixed folder names.** `working/` had no prefix, so the walk stopped there
and the label lost the agent log it belonged to; `summary.md` had no prefix at
all, so it had no ordering identity to label with. Both slots are now numbered —
`02_working/` and `01_summary.md`
([the numbering spec](../../notes/80_agent-log-numbering-spec.md)) — so the walk no
longer stops early, and the labels above are what the rule as documented here now
produces. **Derived from the rule, not re-measured against `_links.mjs`.**

**The under-report this section used to record as a deliberate cost is gone, and
was never worth arguing about.** It said a human might want `020/090` and could
not have it without the tool knowing which folders are pass-through containers.
Numbering the containers removed the question instead of answering it: there are
no pass-through folders left inside an agent log, so the purely local walk-up
rule is now correct there as well as everywhere else. That is the same move the
numbering makes for the loader — a fact the filesystem carries rather than a
name list only the code knows.

**Nothing is owed as a consequence.** No link carries a label yet — Sid's
no-backfill decision, above — so the validator reports zero ordering-label
warnings, and the two guards act only on labels somebody chooses to write. The
one thing to watch when they start being written: the label is now three segments
(`020/02/090`) where a reader may have wanted two, and the middle one is a slot
index rather than something the sidebar shows as a row to match against. If that
reads badly in practice it is a one-line change to the walk, and `agent-ks move`
plus the drift warning make it cheap to make later. Recorded by
[number the agent log's own slots](./030_agent-log-slot-numbering.md).

## A second defect this turned up

Control-testing the `move` change showed it rewriting a link **inside a fenced
code block** — editing someone's worked example to point somewhere else. That is
the same defect fixed hours earlier in `check-skill-links.mjs`, in a second tool,
and worse here because `move` writes.

Fixed by extracting one `makeFenceTracker()` into `_links.mjs` and giving it
three callers — `move`, the skill link-checker, and the issue validator —
instead of three independent answers. It was found only because the control
fixture happened to include a fenced example; a reading review would not have
caught it.
