---
title: "Tighten TypeScript types — drive out `any`"
state: open
---

**What it means.** Replace loose `any` usage in the loaders with real types: concrete interfaces, generics, or `unknown` + a narrowing check. `any` disables the type checker for that value and everything derived from it, so bugs (typos in property names, wrong shapes) slip through silently.

**Current state.** ~31 `any` occurrences (`: any`, `<any>`, `as any`) concentrated in:
- `theme.ts`
- `paths.ts`
- `cache-manager.ts`
- `cache.ts`

**Approach.** For each: if the shape is known, declare an interface; if it's a container of varied values, prefer `unknown` and narrow at the use site; reserve `as any` only for genuinely untyped third-party seams (and comment those).

**Why it matters.** The cache/path/theme layers are foundational — a wrong shape here propagates everywhere downstream. This is where type safety pays off most.

**Done when.** `any` in `src/loaders/` is near zero (remaining ones commented with a reason), and a `tsc` run shows no new implicit-any regressions.
