---
title: "Canonical redirect: /<tracker>/<issue>/issue → /<tracker>/<issue>"
done: true
state: closed
---

`/<tracker>/<issue>/issue` previously 404'd (`issue` is not a sub-doc kind in `resolveSubDoc`). Added a base-agnostic canonical redirect to the detail root.

- [x] `route-match.ts` — issues branch returns a `redirectTo` prop for `parts[1] === 'issue'`.
- [x] `[...slug].astro` — early `if (routeProps.redirectTo) return Astro.redirect(...)`, before layout resolution; works in both SSR and static.
- [x] `static-paths.ts` — emits a per-issue `/issue` redirect path for static builds.
- [x] Verified: dev SSR → 302; static build → per-issue redirect page (`<meta refresh>` + canonical), 41 generated; points at `/todo/<id>`.

Artefact: code diff + built HTML. Human-verified 2026-06-10 → closed.
