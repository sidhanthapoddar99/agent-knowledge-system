---
title: "M2 — skills + code audit (Opus): skills clean, 3 medium code findings"
iteration: 2
agent: claude
status: done
date: 2026-07-04
---

## Goal

Two Opus validators, report-only: O1 verified the diagram claims in both
skills against the shipped code plus repo↔cache parity; O2 reviewed the nine
diagram-pipeline files for correctness, escaping, traversal, caching, and
collision handling.

## Result — O1 (skills)

**Clean.** Repo `plugins/documentation-guide/skills/` and the installed
cache tree are byte-identical (`diff -rq`, includes `_order-prefix.mjs`).
Every concrete claim verified against code: embed grammar, extension→kind
map, `./`/`../` fence rule, sidecar fields (+`.jsonc`), no-prefix
warning+skip, assets exclusion, collision behaviour, `allow_diagram_pages`
scope (docs-only), title derivation, and the excalidraw/asset postprocessors
running on docs+blog+issues. `guide.ts` has no diagram content (nothing to
sync). One soft phrasing note: agent-ks-issues `10_writing.md:107` says assets
are the home for diagrams "that don't need to be first-class" — first-class
diagram pages are docs-only, so the contrast implies a tracker option that
doesn't exist. Cosmetic.

## Result — O2 (code) — findings ranked

**Medium:**

1. **`content-assets` over-serves** (`content-assets/[...path].ts`) — the
   denylist (`.md`, settings) means *any* other colocated file under every
   content root (e.g. tracker `agent-memory/*.json`, scratch files) gets a
   public URL and is baked into the prod build, referenced or not. Fix
   direction: allowlist of servable extensions.
2. **Double-escaped `data-title`** (`excalidraw-embed.ts:47-48,68`) — alt
   text is already escaped by marked; `escapeAttr()` re-escapes, so
   `![A & B](…)` captions render as `A &amp; B`. Safe (over-escape) but
   visibly wrong. Drop the redundant escape on the captured alt.
3. **`mermaid securityLevel: 'loose'`** (`diagrams.ts:44`) — permits click
   directives/HTML labels; a stored-XSS vector iff untrusted content is
   ever rendered. Fine for trusted authors; a deliberate policy call.

**Low:** `assets/[...path].ts` containment isn't symlink-proof (its
content-assets sibling is — close for symmetry); pure markdown-vs-markdown
slug collisions mark `dropped` but never remove the extras from the caller's
content (diagram-involved collisions are handled correctly); `initDiagrams`
has no re-entry guard for concurrent `diagrams:render` (masked by the only
caller today); embedded (non-page) scenes aren't cache deps of their host
page so the baked `?v=` goes stale in dev (masked by the client
`no-cache` fetch); prod could skip the `no-cache` fetch since `?v=` already
busts; `renderExcalidraw` has no scene-size/timeout bound; `.svg` under
content-assets executes script on direct navigation (pre-existing).

**Checked and clean:** path traversal (both embed-src resolution and the
content-assets GET, realpath containment), all other attribute escaping,
diagram collision drops, first-class cache deps (source + sidecar),
`?v=` vs static hosts, postprocessor ordering (excalidraw before asset-src
in all three content types), renderExcalidraw error paths, ETag/304
symmetry, `.excalidraw` MIME, no dead custom-tags/diagrams code.

## Next

Triage with sidhantha — recommended order: content-assets allowlist,
alt double-escape, then a policy decision on mermaid `loose`.
