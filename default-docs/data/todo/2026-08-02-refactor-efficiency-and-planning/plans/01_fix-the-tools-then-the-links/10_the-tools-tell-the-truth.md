---
title: "The tools tell the truth"
outcome: "`agent-ks` always means installed, `agent-ks-dev` always means this tree, and every gate names which it read"
who: claude
status: open
subtasks:
  - "[Two commands, not one guess](../../subtasks/090_silent-failure-defects/040_two-commands-not-one-guess.md)"
---

## Todo

- [ ] Land the subtask in full — revert the walk-up, add the shim and `mise.toml`,
      sweep the sibling scripts, correct `releases/0.2.1.md`
- [ ] **Gate:** from the repo, `agent-ks` names the install and `agent-ks-dev`
      names the repo. From outside the repo, `agent-ks-dev` is not on `PATH` at all
- [ ] **Gate:** re-run `agent-ks-dev check skill-links` and record the count. No
      green quoted in later stages until this one exists

**Why this is stage one and not an afterthought.** Everything after this quotes a
gate, and the gate that covers skill files is currently reading the wrong tree.
Stage 30 edits both skills heavily; a clean report from the installed copy would
be exactly the failure this issue has already recorded three times.

**It is also the only stage with no dependency on the link work**, so it can be
finished and verified before anything with a blast radius starts.
