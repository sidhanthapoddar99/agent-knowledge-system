---
title: "Retire the plugin's rendering gate — the URL is the engine's, so the check is too"
status: open
---

# Overview

**`agent-ks check links` asks a question about the renderer and ships to
consumers inside the plugin.** Its replacement, repo-root
`scripts/checks/check-links.mjs`, is written, control-tested and in use. What remains is
removing the old one — and that was deliberately left until the replacement was
proven, so there was never a window with no rendering gate.

The framing that settles it is the project's **three stages**: a tool that needs
only files on disk is usage-stage and belongs in the plugin; a tool that needs a
build or a running server is development-stage and belongs in `scripts/`. Written
into the project `CLAUDE.md` under *Three stages*.

**Done when** `check-content-links.mjs` is gone from the plugin, nothing
advertises `agent-ks check links`, and the file-level gate that stays is
unaffected.

# Why it matters more than tidiness

**When the plugin's gate failed, the fix was never the plugin's.** It reported
418 broken links; the fix was in the renderer. A gate that reports defects it
cannot own sends whoever trips it to the wrong layer — and that is literally how
341 correct content links came to be rewritten and then reverted.

**And reading `dist/` cannot answer the question at all.** It *constructs* each
page URL as `'/' + path + '/'`, so it only ever measured the trailing-slash
column. Every number this class produced from `dist/` had to be retracted.

# Done when

- [ ] Remove `plugins/agent-ks/skills/agent-ks-docs/scripts/check-content-links.mjs`
- [ ] Remove its `_manifest.mjs` entry (`docs-check-links` / `agent-ks check links`)
- [ ] Remove every mention of `agent-ks check links` from skill text — **repo
      source and the installed cache** — and read the tree line each gate prints
      before quoting a pass
- [ ] `agent-ks check skill-links` clean afterwards, so no reference is left
      dangling
- [ ] Confirm `agent-ks check link-form` — the file-level gate, which **stays**
      and grows — is untouched

# References

- The replacement, and its control tests:
  [recheck the rendered links](./070_recheck-rendered-links.md)
- The three stages: the project `CLAUDE.md`
- The file-level gate that stays in the plugin, and the work that extends it:
  [relative but not a path](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/170_relative-but-not-a-path.md)

# Details

## What stays in the plugin, and why it is the right half

`agent-ks check link-form` asks *is this link maintainable, and does its target
exist on disk*. That is a question about **files** — it needs no build, no
server, and no framework source, so every consumer can run it. It is also the
half that catches the failure the rendering gate structurally cannot: a link
whose target does not exist as a file but whose published URL happens to work.

## The lesson this carries out of the old subtask

*"A checker written while believing the wrong cause encodes that belief in what
it reports."* It held twice over: the tool blamed authors for a renderer defect,
**and** it was placed in the tree that could not fix what it found. The header
rewrite it eventually produced is kept in the replacement.
