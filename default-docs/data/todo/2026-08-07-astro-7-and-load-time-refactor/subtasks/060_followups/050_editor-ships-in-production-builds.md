---
title: "The dev editor is built into the production site — 10.8 MB no reader can reach"
status: open
---

# Overview

`bun run build` emits `dist/editor/index.html` and the whole CodeMirror + Shiki
client bundle behind it. **That is development tooling landing in the artefact a
consumer deploys.**

It is not a rendering bug and nothing looks wrong — the page just sits there,
reachable by URL, dragging half of `_astro` with it.

Found while checking whether adding Shiki grammars would cost a reader bytes
([the fences subtask](../050_cleanup/020_small-correctness-fixes.md)). It does not,
and the reason it does not is this: the grammar chunks belong to the editor, and the
editor belongs to nobody.

Done when a production build contains no dev-tools route or chunk, proven by a
byte count rather than an inspection.

# References

- [the small correctness fixes subtask](../050_cleanup/020_small-correctness-fixes.md)
  — where this was found, and the chunk trace that found it
- the project `CLAUDE.md` → "Three stages, and they decide which tree a tool
  belongs in" — the rule this breaks
- `astro-doc-code/src/dev-tools/integration.ts` — the Astro integration that wires
  the dev tools
- `astro-doc-code/src/pages/` — where the `/editor` route is declared

# Todo list

- [ ] Find out why the route builds at all — an integration that does not check
      `command === 'build'`, or a page that is not dev-gated
- [ ] Decide the mechanism: gate the route, or gate the whole dev-tools integration
      at config time. Prefer the one that also removes `/api/dev/*`
- [ ] Check the other dev surfaces too — `pages/api/dev/` and the toolbar apps
- [ ] Re-measure. The claim is a byte count, so the proof is a byte count
- [ ] Check whether this changes deploy time for anything rsync-like

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## What was measured

Transitive chunk closure from each entry page, over `dist/_astro`:

```
  _astro total                      22.0 MB   (582 files)
  reachable from /editor            10.8 MB   (427 files)
  reachable from a docs page         0.0 MB   (0 files)
  ─────────────────────────────────────────────────────────
  EDITOR-ONLY, dead for readers     10.8 MB   (427 files)   = 49% of _astro
```

**The `0.0 MB` row is not an error.** A docs page ships as static HTML plus the
theme stylesheet and loads no JS chunks at all — which is what
[the load-time work](../../plans/01_implementation/20_load-time-fix.md) left behind.
That is what makes the other row stark: *every* chunk in `_astro` that the editor
pulls is weight no reader will ever ask for.

## Why this is worth fixing beyond the number

`dist/` is what a consumer publishes. So today a consumer's site carries:

- a **route** at `/editor` that renders a live editor UI against content it cannot
  save (the `/__editor/*` endpoints are dev-only), so it is broken on arrival
- 427 chunks that inflate every deploy, every CDN sync and every "what changed?"
  diff

The second one compounds with
[the incremental-builds issue](../../../2026-08-07-incremental-builds/issue.md):
a deploy that syncs by hash currently has 427 extra files to consider forever.

## Do not fix this by deleting the editor

The editor is wanted — see
[the presence/sync issue](../../../2026-04-10-sync-and-presence/issue.md). The
defect is that a **development-stage** tool is being emitted by a build, not that it
exists. The fix is a gate, and the gate should sit somewhere a future dev surface
inherits automatically rather than needing to remember.
