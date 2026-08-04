---
title: "The plugin ships four undeclared dependencies and no package.json"
status: open
---

# Overview

**`plugins/agent-ks/` has no `package.json` and no `node_modules`, and its
scripts import four packages it does not own.** They resolve today because Node
walks up the directory tree and finds `astro-doc-code/node_modules` — which is
true *in this repo* and is an accident everywhere else.

| Import | Used by |
|---|---|
| `gray-matter` | `issues/check.mjs`, and most read paths |
| `mdast-util-from-markdown` · `micromark-extension-gfm` · `mdast-util-gfm` | `_links.mjs`, so **all four** link-walking gates |

**This was already true before, with one package.** It is worth a subtask now
because the number went to four and because the new three sit under
`_links.mjs`, which every gate loads — so a resolution failure stops being one
broken command and becomes the whole toolchain.

**Done when** a consumer who installs the plugin and runs `agent-ks check issues`
gets either a working command or a clear error naming what to install — never a
module-resolution stack trace, and never a silent pass.

# References

- Where the three new ones came from:
  [`025`](./025_an-index-is-checked-not-generated.md) and the round that made the
  call, [`060`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/060_stop-hand-rolling-the-parser.md)
- The install path: `plugins/agent-ks/README.md`

# Todo list

- [ ] **Establish the fact first.** Install the plugin into a project that is
      *not* this repo and run each gate. Does resolution actually fail, or does
      the Claude Code plugin cache sit somewhere that resolves anyway? **Every
      decision below depends on this and it has not been measured** — the
      failure is currently assumed, not observed
- [ ] Decide the shape: a `package.json` the consumer installs · vendoring the
      three parser packages · or a preflight check that fails loudly with the
      install command
- [ ] Whichever it is, add a **startup check that names the missing package**,
      because a bare resolution error points at a file inside the plugin rather
      than at what the reader must do
- [ ] Cover it: a gate that runs the CLI with the tree's `node_modules` hidden

# Outcomes and Next Steps

**Open.** Raised 2026-08-04 while swapping the hand-rolled markdown scanner for
a real parser. Sid took that trade knowingly; this is the cost it named.

# Details

## Why vendoring is not obviously the answer

It is the tempting one — the plugin becomes self-contained and nothing can fail
to resolve. But `mdast-util-from-markdown` pulls a tree of micromark packages,
and the point of using it was that **it is the same engine the site renders
with.** A vendored copy drifts from the renderer, and then the gate and the site
disagree about what a link is — which is the exact defect the parser swap
existed to remove.

## The measurement that decides it

`gray-matter` has been imported by the plugin for its whole life with no reported
failure, which is weak evidence that resolution works in practice. Weak, because
nobody has looked: a consumer hitting a stack trace would more likely stop using
the command than file it.

**So the first task is to reproduce the failure, not to fix it.** If it turns out
resolution succeeds through the plugin cache, this closes as a documented
assumption with a covering test, and nothing needs building.
