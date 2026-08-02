---
title: "Ordering labels — keep the number, keep it honest"
status: review
---

# Overview

[Reference by link, never by number](../notes/70_reference-by-link-never-by-number.md)
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
  [reference by link, never by number](../notes/70_reference-by-link-never-by-number.md)
- The round that built it:
  [ordering labels](../agent-log/020_wf_ship-the-split/working/110_ordering-labels.md)
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
- [ ] **Adopt it in this repo's own tracker.** Nothing is labelled yet — the
      convention ships unused, which is honest but means it has never been read
      in anger
- [ ] Consider a `--relabel` pass that adds or repairs labels in bulk, once there
      is enough usage to know whether it is wanted

# Outcomes and Next Steps

Shipped and gated. Two open items above, both deliberate: the convention is
**optional**, so nothing forced a bulk rewrite of existing links, and a bulk
tool is premature before anyone has lived with it.

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
line `[2026 retrospective](./70_refs.md)` was reported, exactly as predicted.

An error would block the gate over wording. A warning says what is wrong and
offers the escape ("reword the link text if the number was never an ordering
label"), and the fix is one word. That reasoning also matches the call made
earlier in this issue about a fixture that tripped a permanent warning: **a gate
whose clean state is not zero stops being read** — but a warning a person can
clear in one edit does not have that problem.

## How the path is computed, and the one case it under-reports

Walk up from the file collecting numeric prefixes; stop at the first segment
without one.

| Target | Label |
|---|---|
| `subtasks/040_execution/100_migration-script.md` | `040/100` |
| `notes/70_reference-by-link-never-by-number.md` | `70` |
| `agent-log/020_wf_ship-the-split/working/090_x.md` | `090` — `working/` has no prefix and ends the run |
| `agent-log/020_wf_ship-the-split/summary.md` | *(none)* — no prefix, no ordering identity |

**The third row is a deliberate under-report.** A human might want `020/090`
there. Getting it would need the tool to know which folder names are
"pass-through" containers, which is tracker-specific knowledge in a library
shared with the docs side. The purely local rule is worse in one case and
correct everywhere, including in a docs tree that has no `working/` — and a label
that is short is still **true**, which a configurable one might not stay.

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
