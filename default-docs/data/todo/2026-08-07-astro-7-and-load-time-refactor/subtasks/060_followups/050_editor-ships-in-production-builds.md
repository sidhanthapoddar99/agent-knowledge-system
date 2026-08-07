---
title: "The dev editor is built into the production site — 10.8 MB no reader can reach"
status: review
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
  the dev tools, and now the one place dev routes are declared
- `astro-doc-code/src/dev-tools/routes/` — where those routes live now, precisely
  because it is **not** `src/pages/`

# Todo list

- [x] **Find out why the route builds at all** — neither guess. The integration
      never gated anything because it never owned the routes: `editor.astro` and
      `api/dev/*.ts` sat in `src/pages/`, which Astro builds unconditionally.
- [x] **Decide the mechanism** — move them out of `src/pages/`, inject them from
      the integration under `command === 'dev'`. Removes `/api/dev/*` too.
- [x] **Check the other dev surfaces** — the toolbar apps were already clean;
      `addDevToolbarApp` is a no-op outside dev. Only the four routes leaked.
- [x] **Re-measure** — done, both directions, below.
- [x] **Check the deploy-time effect** — 430 fewer files per sync, forever.

# Outcomes and Next Steps

**Landed.** A production build now contains no `/editor`, no `/api/dev/*`, and
none of the client chunks behind them.

## The measurement

Two clean builds of the same content, `rm -rf dist` before each:

```
                     before          after         removed
  dist bytes    108,959,585 →   97,676,286     -11,283,299   (10.4%)
  _astro bytes   23,077,518 →   11,795,276     -11,282,242   (48.9%)
  _astro files          582 →          156            -426   (73.2%)
  files in dist       1,941 →        1,511            -430   (22.2%)
```

**Half of `_astro` was the editor**, which is what the original chunk trace
predicted (10.8 MB / 427 files) and within rounding of what came out. Pages built
went 1284 → 1283: the editor page, minus nothing else. The three `/api/dev/*`
endpoints were prerendering to files as well and are gone with it.

## What was actually wrong — not what the subtask guessed

Both guesses in the todo list were wrong, and the real answer is more boring and
more useful. The integration was not failing to check `command`. **It had nothing
to check.** `src/pages/` is Astro's route directory; every `.astro` and every
endpoint in it is a route, and no integration is consulted. The dev surfaces were
routes by *location*, so no gate could exist.

So the fix is not a condition — it is a move:

```
  src/pages/editor.astro        →  src/dev-tools/routes/editor.astro
  src/pages/api/dev/themes.ts   →  src/dev-tools/routes/api/dev/themes.ts
  src/pages/api/dev/layouts.ts  →  src/dev-tools/routes/api/dev/layouts.ts
  src/pages/api/dev/errors.ts   →  src/dev-tools/routes/api/dev/errors.ts
```

plus one table and one gate in `dev-tools/integration.ts`:

```ts
const DEV_ROUTES: Record<string, string> = {
  '/editor':           './routes/editor.astro',
  '/api/dev/themes':   './routes/api/dev/themes.ts',
  '/api/dev/layouts':  './routes/api/dev/layouts.ts',
  '/api/dev/errors':   './routes/api/dev/errors.ts',
};

if (command === 'dev') {
  for (const [pattern, entry] of Object.entries(DEV_ROUTES)) {
    injectRoute({ pattern, entrypoint: new URL(entry, import.meta.url).href });
  }
}
```

**This is the shape the follow-up asked for — a gate a future dev surface
inherits rather than remembers.** A dev surface added under `src/dev-tools/routes/`
is invisible to the build by default and needs a deliberate line to become a
route at all. A dev surface added to `src/pages/` still ships, but that is now the
wrong folder rather than an easy mistake, and the comment above the gate says so.

## Verified in both directions

Removing routes from a build proves nothing on its own — they have to still work
in dev. Against a fresh dev server on the new code:

| URL | dev | build |
|---|---|---|
| `/editor` | 200 | absent |
| `/editor?root=user-guide` | 200 | absent |
| `/api/dev/themes` | 200 | absent |
| `/api/dev/layouts` | 200 | absent |
| `/api/dev/errors` | 200 | absent |
| `/user-guide/` | 302 | present |
| `/nope-404` | 404 | `404.html` |

The editor's client entry resolves too — `/editor` serves a script module that
imports `/src/dev-tools/editor/editor-page.ts`, so the relative import survived the
move rather than silently 404ing at runtime.

❗ **One false negative worth recording.** The first probe run reported 404 on all
four routes and looked like a broken fix. The dev server was a stale one started
before the change: `injectRoute` runs in `astro:config:setup`, so HMR cannot pick
it up — only a restart can. **Any test of a route-injection change needs a fresh
server**, and a stale one fails in the direction that looks like success here
(routes missing), which is the dangerous direction.

**Next:** nothing blocking. Two things worth knowing:

- The 430 files compound with
  [the incremental-builds issue](../../../2026-08-07-incremental-builds/issue.md) —
  a hash-syncing deploy had 430 permanent extra files to consider on every run.
- `dist/` no longer carries a `/editor` page that renders a live editor against
  endpoints that do not exist. That page was broken on arrival for every consumer.

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
