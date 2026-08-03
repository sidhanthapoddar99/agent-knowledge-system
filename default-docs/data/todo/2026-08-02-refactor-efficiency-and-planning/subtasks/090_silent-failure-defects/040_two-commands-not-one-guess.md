---
title: "Two commands, not one guess — agent-ks-dev, and reverting the walk-up"
status: open
---

# Overview

**[`030`](./030_skill-links-checks-the-wrong-tree.md) fixed a wrong-tree bug with
a guess, and the guess has the same bug pointing the other way.**

The shipped fix makes `check-skill-links.mjs` walk up from the current directory
until it finds any `plugins/agent-ks/skills/` holding a `SKILL.md`, and treats
the first hit as authoritative. That reads intent from where you happen to be
standing.

In **consumer mode** — which this project's `CLAUDE.md` documents as a first-class
way to run the framework — the clone sits *inside* the user's project:

```
<their-project>/
└── agent-knowledge-system/          ← where they stand to run ./start dev
    └── plugins/agent-ks/skills/     ← the walk-up finds THIS
                                       and labels it "[source tree]"
```

So a consumer on installed plugin `0.7.1` runs `agent-ks check skill-links` and
gets a verdict about whatever skills their framework clone is pinned at — not the
copy they actually run. And it is labelled `[source tree]`, which reads as *more*
authoritative than the fallback, not less.

**The replacement is two names, each meaning exactly one thing:**

| Command | Always checks | Exists |
|---|---|---|
| `agent-ks` | the **installed** plugin | everywhere |
| `agent-ks-dev` | **this repo's** source tree | only where the repo is |

Intent is stated by which command you type, never inferred from your working
directory. Sid's design, and the argument that settled it is his second one:
**with both present you can run them side by side** — the installed copy is a
frozen reference pinned at a real release, which makes before-and-after a command
rather than a git dance.

**Done when** `agent-ks` never scans a source tree, `agent-ks-dev` never scans an
install, the banner still names which tree it read, and `releases/0.2.1.md` no
longer describes behaviour that has changed.

# References

- The subtask this corrects: [`030`](./030_skill-links-checks-the-wrong-tree.md)
- The script: `plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs`
- The repo's own dispatcher: `plugins/agent-ks/bin/agent-ks`
- The published record to correct: `releases/0.2.1.md`
- Consumer mode, which is what breaks under the walk-up: this repo's `CLAUDE.md`,
  *"Two operating modes"*

# Todo list

- [ ] **Revert the walk-up** in `check-skill-links.mjs` — delete
      `resolveSkillsDir()`, restore the script-location anchor (exact before/after
      in Details)
- [ ] **Keep the banner.** The mode label stays, with `installed` reworded — under
      two explicit commands, scanning the install is correct behaviour rather than
      a fallback, so it must stop reading as an apology
- [ ] **Keep the `filesScanned === 0` error.** A run that read nothing still fails
- [ ] **Add `bin/agent-ks-dev`** at the repo root — a two-line shim exec'ing
      `plugins/agent-ks/bin/agent-ks`, which resolves `cli.mjs` relative to itself
      and therefore dispatches into the source tree
- [ ] **Add `mise.toml`** at the repo root putting `bin/` on `PATH`, so
      `agent-ks-dev` works from any subdirectory of the repo and nowhere else
- [ ] **Audit the sibling scripts for the same walk-up.** Only
      `check-skill-links.mjs` got it, but confirm rather than assume —
      `resolve-context.mjs`, `check-legacy-tags.mjs`, `check-content-links.mjs`
      and `_env.mjs` all read `import.meta.url`
- [ ] **One line in this project's `CLAUDE.md`** — see Details for the wording,
      which states the invariant rather than a workaround
- [ ] **Correct `releases/0.2.1.md`** — it describes the walk-up as shipped
      behaviour. Same class of task as
      [`100/050`](../100_link-integrity/050_correct-the-published-records.md)
- [ ] **Control-test both directions**: from the repo, `agent-ks` must name the
      install and `agent-ks-dev` must name the repo; from outside the repo,
      `agent-ks-dev` must not exist on `PATH` at all

# Outcomes and Next Steps

> [!NOTE]
> **PLACEHOLDER** — not started. Agreed with Sid 2026-08-03; execution follows the
> link-integrity discussion.

# Details

## The revert, exactly

**Delete** `resolveSkillsDir()` and the `RESOLVED` indirection (currently around
lines 60–92), and restore the anchor the file carried before `cf437fd`:

```js
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OWN_SKILL  = path.dirname(SCRIPT_DIR);   // scripts/ → this skill's root
const SKILLS_DIR = path.dirname(OWN_SKILL);    // …/skills/
```

That anchor is **correct under both names**, which is the whole point: run through
the installed dispatcher and it resolves the installed skills; run through
`agent-ks-dev` and the same three lines resolve the repo's, because the script
being executed *is* the repo's.

**Delete** the `source === 'installed'` warning block. Under two commands there is
no fallback and nothing to warn about — a warning that fires on correct behaviour
trains people to skim warnings.

**Keep** the `MODE` label, rewording the `installed` case. It currently reads
`[FALLBACK — the copy beside this script, not a tree you are in]`, which is an
apology for a guess. With no guess left it becomes a plain statement of scope:

```js
const MODE = { installed: ' [installed plugin]',
               repo:      ' [repo source tree]',
               explicit:  ' [explicit path]' }[…]
```

The banner is the half of `030`'s fix that was right regardless of anchoring. The
original failure was not only that the wrong tree was read — it was that the green
*looked* like it covered your work. Naming the scope in words is what stops that,
and it survives this revert unchanged in purpose.

Distinguishing the two cases after the revert is a one-line comparison: the script
is the repo's if `SKILLS_DIR` is under a directory containing `.git` alongside
`plugins/agent-ks/`. It does not have to *find* anything — it only has to describe
where it already is.

## Why the walk-up cannot be kept, even narrowed

The obvious patch is to narrow the walk-up — only accept a source tree if it looks
like *the framework's own* repo. That fails for the same reason the original did:
in consumer mode, the framework's own repo **is** a subfolder of the consumer's
project, and it is where they stand. There is no test on the filesystem that
separates *"Sid developing the plugin"* from *"a consumer sitting in their
framework folder"*, because the two directories are the same shape.

**When two situations are structurally identical, only the human can tell them
apart — so the command they type has to carry the answer.**

That is this group's own rule, applied one level up. `090` exists because a check
that cannot see its subject was reporting success; here the check *can* see two
subjects and has no honest way to choose. Choosing anyway is how a plausible wrong
answer gets produced.

## The `agent-ks-dev` shim

`plugins/agent-ks/bin/agent-ks` already resolves the CLI relative to its own
location:

```bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="$DIR/../skills/agent-ks-docs/scripts/cli.mjs"
```

So the repo copy already dispatches into the repo's scripts when invoked directly.
It only needs a second name that does not collide with the installed one.

**A symlink does not work.** `BASH_SOURCE[0]` would be the symlink's path, so
`$DIR/../skills/…` would resolve against wherever the symlink lives rather than
against `plugins/agent-ks/bin/`. It needs a real file:

```bash
#!/usr/bin/env bash
# bin/agent-ks-dev — this repo's plugin source, never the installed copy.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../plugins/agent-ks/bin/agent-ks" "$@"
```

Mark it executable, and commit it — `bin/` is repo content, not a local
convenience.

## The `mise.toml`

```toml
[env]
_.path = ["bin"]
```

`mise` is already installed on Sid's machine and this repo has no `mise.toml`
yet, so the file is new and carries nothing else. The property that matters:
**`agent-ks-dev` is on `PATH` inside this repo and nowhere else**, so it cannot be
typed by accident in a consumer project, and a stale muscle-memory invocation
fails loudly with *command not found* rather than quietly checking something else.

Anyone without `mise` still has `./bin/agent-ks-dev`. `mise` buys the bare name
from subdirectories, not the capability.

## The `CLAUDE.md` line

State the invariant, not the workaround. *"Run the script by path"* was true for
one afternoon and would have gone stale at the next reinstall; this stays true
permanently:

> **In this repo, `agent-ks-dev` runs the working tree and `agent-ks` runs the
> published plugin.** Every gate names the tree it scanned — read that line
> before quoting a pass.

## What having both names buys, beyond safety

Sid's second argument, and the stronger one. The installed copy becomes a frozen
reference pinned at a real release — the version consumers actually have, not an
arbitrary commit.

| Question | Before | With both names |
|---|---|---|
| Is my install stale? | no cheap way to tell — the confusion that ran through this whole subtask | `agent-ks --version` vs `agent-ks-dev --version` |
| Does my change alter behaviour? | stash, or plant probe files, or trust whoever ran it | run both against the same input, diff the output |
| Does the gate fire on the defect *and* stay quiet on correct input? | a procedure someone has to remember | the natural way to invoke it |

That last row matters most. **Both-directions control testing keeps being
rediscovered in this issue** — `020`'s guard refused two working pages, `030`'s
green named a scope nobody looked at, and each time the check was a manual setup
someone had to think of. Two binaries make it the default shape of a run.

**The limit, stated so nobody over-claims it:** you can only compare things that
*run*. A script's output diffs; a `SKILL.md`'s prose does not — the only way to
evaluate a wording change is to have an agent read it and behave differently. So
this covers the code half of the plugin, not the writing half. That is where every
silent-failure defect in this group has been, so it is the right half to cover.
