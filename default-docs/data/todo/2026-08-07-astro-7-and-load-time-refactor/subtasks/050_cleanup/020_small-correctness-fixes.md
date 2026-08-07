---
title: "Two small correctness fixes — the production POST and the unhighlighted fences"
status: done
---

# Overview

Two unrelated defects, grouped because each is an afternoon and neither earns its own
subtask.

**1 · A dev-only endpoint is called in production.**
`layouts/issues/default/scripts/detail/subtask-state.ts:14` POSTs to
`/__editor/subtask-toggle` with **no dev guard**. Its `catch` at line 176 rolls the UI back,
so in a built site the checkbox flickers and reverts with no explanation. It fails quietly,
which is why nobody has reported it.

**2 · 139 fenced code blocks render with no highlighting.** Their languages are requested
nowhere in the Shiki config:

| Language | Blocks |
|---|---|
| `astro` | 104 |
| `env` | 13 |
| `jsonc` | 11 |
| `nginx` | 6 |
| `text` | 3 |
| `diff` | 2 |

104 of them are in this project's own documentation, which is where a reader judges the
tool.

# References

- [the content-pipeline surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/011_surface_content-pipeline.md) — the fence census and the Shiki language configuration
- [the layouts surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/012_surface_layouts-and-components.md) — the unguarded POST
- [the issues-layout issue](../../../2026-04-10-issues-layout/issue.md) — the original proposed home for the POST fix

# Todo list

- [x] Guard the subtask-toggle POST so it only fires in dev
- [x] Decide what a built site shows for that checkbox — read-only, or hidden
- [x] Add the missing languages — five grammars and one alias, not six grammars
- [x] Re-count unhighlighted fences and confirm it reaches zero
- [x] Check the bundle-size effect of the added grammars

# Outcomes and Next Steps

Both done. Commit `36c0497`.

## The POST — read-only, and guarded in both halves

**The product decision: the glyph stays, the control goes.** A subtask's status is
*content* — it is the main thing an issue page communicates — so hiding it would
remove information from every published page to fix an interaction bug. What has to
go is the promise: a `<button>` labelled *"Click to cycle"* that silently reverts.

Implemented server-side rather than in the client script, which matters for two
reasons: no flash of a clickable-looking control before JS runs, and it is still
correct with JS disabled.

```
  dev    <button ... aria-label="Subtask state: open. Click to cycle.">
  build  <button disabled ... aria-label="Subtask state: open">
```

The listener guard in `subtask-state.ts` is the second half, so no handler attaches
even if the markup is reached another way. Hover and `cursor: pointer` are dropped
via `:not(:disabled)`.

Verified against `dist/`:

| Check | Result |
|---|---|
| JS chunks containing `/__editor/subtask-toggle` | **0** — dead-code eliminated, since `import.meta.env.DEV` is statically false |
| State buttons on a sample issue page | 1 of 1 carries `disabled` |
| `"Click to cycle"` occurrences | 0 |

⚠️ **A grep for `__editor/subtask-toggle` across `dist/**/*.html` returns 14 hits and
they are all false positives** — tracker pages that quote the endpoint as prose,
including this one. Check the JS, not the HTML.

## The fences — 137 → 0, and the bundle worry was misdirected

Added `astro`, `jsonc`, `nginx`, `diff`, `dotenv`, plus an alias table so `env`
resolves to `dotenv` (`env` has no Shiki grammar; `dotenv` is that syntax under a
name nobody types in a fence). Language lookup is now case-insensitive too, so a
```` ```JSON ```` fence no longer falls through to plain.

**`text` was deliberately left alone.** It is not a missing grammar — Shiki treats it
as "no highlighting", which is what the author asked for. Counting it as a defect
inflated the census by 3.

Measured with **one script run against both configurations**, asking the real
highlighter the same question the renderer asks (`getLoadedLanguages()`), because
comparing against the literal `langs:` list gets it wrong — Shiki resolves aliases,
so `ts`, `js` and `md` are already covered without appearing in the list:

```
  before   137 unhighlighted   astro 105 · env 13 · jsonc 11 · nginx 6 · diff 2
  after      0
```

### The grammars cost a reader nothing, and the audit's premise was wrong

The subtask warned that `emacs-lisp` (764 KB) and `cpp` (612 KB) already ship as
chunks, so adding six more would cost every reader. **Traced it instead of assuming,
and the chain does not reach a reader:**

```
  emacs-lisp / cpp / wolfram chunks
     ← referenced by  _astro/dist.C004Xhtd.js
     ← referenced by  _astro/editor.astro_…_lang.NCg3Ym0F.js
     ← referenced by  0 published pages
```

Shiki runs **server-side** in `parsers/renderers/marked.ts` and emits plain HTML.
Those chunks exist because the **dev editor** bundles Shiki for its live preview —
nothing a docs reader loads.

| | before | after | delta |
|---|---|---|---|
| Build wall time (best of 2) | 5.97 s | 6.46 s | **+0.49 s** |
| `dist/` total | 114 MB | 115 MB | **+1 MB** |
| Bytes a reader downloads | — | — | **0** |
| Pages | 1279 | 1279 | — |

So aliasing over adding was the right call for `env` (no grammar exists) but was
never needed as a *bundle-size* tactic.

## Next steps

Chasing that chunk chain surfaced something bigger, now filed separately:
**the dev-only `/editor` route is built into the production site**, dragging
10.8 MB across 427 chunks that no reader can reach — see
[the editor bundle follow-up](../060_followups/050_editor-ships-in-production-builds.md).

# Details

## The POST needs a product decision, not just a guard

Adding `import.meta.env.DEV` stops the failed request. It does not answer what a reader of
the published site should see when they click a subtask checkbox. Pick one and implement
it: render it disabled, or do not render the control at all. Leaving a clickable control
that silently does nothing is the current bug in a quieter form.

## The fences — watch the bundle

Shiki loads grammars per language, and they are not small: the built output already carries
`emacs-lisp` at 764 KB, `cpp` at 612 KB and `wolfram` at 260 KB as separate chunks. Adding
six more languages adds more.

Two of the six may not need a grammar at all. `text` is plain by definition, and `env` is
close enough to `ini`/`shell` to alias rather than add. `astro` is the one that matters —
104 blocks, and it is the language this project documents itself in.

Check whether the chunks are loaded lazily per page or eagerly. If eagerly, adding
languages costs every reader, and aliasing becomes the better answer for most of them.

## Done when

- [ ] No `/__editor/*` request is made from a built site — verified against `dist/`
- [ ] The published subtask checkbox has a defined, deliberate appearance
- [ ] A re-run of the fence census returns zero unhighlighted blocks, or a written reason per exception
- [ ] The bundle-size change from added grammars is measured and recorded
