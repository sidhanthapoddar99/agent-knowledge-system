---
title: "The tools tell the truth"
status: done
agent: claude
---

# Goal

Make `agent-ks check skill-links` report on the tree the reader means, before any
later stage quotes one of its greens. The fix shipped in `0.2.1` had replaced a
wrong-tree bug with a guess, and the guess is wrong for consumers.

# Inputs

- [`090/040` — two commands, not one guess](../../../subtasks/090_silent-failure-defects/040_two-commands-not-one-guess.md)
- The shipped behaviour it corrects:
  [`090/030`](../../../subtasks/090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md)

# Expected Outcome

`agent-ks` always means the installed plugin, `agent-ks-dev` always means this
repo, neither infers anything from the working directory, and every run names the
tree it read.

# Outcome

**Done. The anchor is now the command you type, not where you stand.**

The `0.2.1` fix walked up from the CWD looking for a plugin source tree. In
**consumer mode** the framework clone sits *inside* the user's project, and that
is exactly where a consumer stands to run `./start dev` — so the walk-up found
the bundled skills and labelled them `[source tree]`, which reads as *more*
authoritative than the fallback it replaced.

**There is no filesystem test that separates "maintaining the plugin" from
"sitting in your framework folder", because those are the same directory.** That
is why the answer had to move into the command rather than get a narrower
heuristic — and the file itself had predicted this, having said after the second
wrong scope: *"if a third turns up, change the anchor rather than the radius."*

| Run | Resolved | Label |
|---|---|---|
| `./bin/agent-ks-dev check skill-links` from repo root | the repo's skills | `[repo source tree]` ✅ 44 files clean |
| the new script copied to `/tmp` (no `.git`), **run from `/tmp`** | its own copy | `[installed plugin]` ✅ |
| repo, with a probe file carrying one broken link | the repo | ✅ **45** files, 1 error naming the repo file |
| repo, probe removed | the repo | ✅ **44** files, clean |

The `/tmp` run is the one that proves the walk-up is gone: under the old logic,
standing anywhere inside a repo changed the answer.

**Sibling audit clean.** No other script anchors a *skills* tree on the CWD.
`_env.mjs` has the only other walk-up and it resolves **content**, where
anchoring on where you stand is correct. Recorded as checked rather than left
silent.

**Still needs `/plugin install`.** The on-`PATH` `agent-ks` runs the *old* script
until then — visible in the control test, where the first run through the
installed dispatcher still reported the repo with the old label. The defect
demonstrating itself one last time.
