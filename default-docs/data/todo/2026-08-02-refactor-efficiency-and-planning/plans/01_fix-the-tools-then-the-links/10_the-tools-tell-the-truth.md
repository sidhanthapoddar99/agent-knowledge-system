---
title: "The tools tell the truth"
outcome: "`agent-ks` always means installed, `agent-ks-dev` always means this tree, and every gate names which it read"
who: claude
status: done
subtasks:
  - "[Two commands, not one guess](../../subtasks/090_silent-failure-defects/040_two-commands-not-one-guess.md)"
---

## Todo

- [x] Land the subtask in full — revert the walk-up, add the shim and `mise.toml`,
      sweep the sibling scripts, correct `releases/0.2.1.md`
- [x] **Gate:** the anchor no longer moves with the CWD — proven by running the
      new script from `/tmp` against a copy with no `.git` and getting
      `[installed plugin]`. **`agent-ks` on `PATH` still runs the old script until
      Sid reinstalls the plugin**, so that half is verified against the code
      rather than against the dispatcher
- [x] **Gate:** `agent-ks-dev check skill-links` — 44 files, clean; 45 files and
      one error with a probe planted. Every green quoted from here on is this one

**Why this is stage one and not an afterthought.** Everything after this quotes a
gate, and the gate that covers skill files is currently reading the wrong tree.
Stage 30 edits both skills heavily; a clean report from the installed copy would
be exactly the failure this issue has already recorded three times.

**It is also the only stage with no dependency on the link work**, so it can be
finished and verified before anything with a blast radius starts.
