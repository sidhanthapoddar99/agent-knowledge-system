---
title: "Astro 5.17.1 → 7.2.0"
status: open
---

# Overview

Move the engine two majors, from Astro 5.17.1 to 7.2.0. This drags **Vite 6 → 8** and a
**Node 22.12 floor** underneath it.

This buys **no measured speed** on the paths that hurt — Rolldown makes JavaScript bundling
faster, and the engine's slow path reads files and renders markdown. It is currency and
maintenance work: Astro 5 is two majors behind and drifting toward end of life, and the
gap only gets more expensive to close.

The good news the audit produced: **the blast radius is far smaller than the earlier Astro 6
study assumed**, because most of the co-bump surface turns out to be inert in this codebase.

# References

- [the parent issue](../../issue.md) — the scope tiers and why this sits beside the load-time fix
- [the Astro 6 research thread](../../../2026-05-08-runtime-stack-migration/brainstorm/03_research_astro-6-upgrade/02_breaking-changes-and-upgrade-path.md) — the ordered upgrade steps and the `./start` reinstall gotcha. Written for 5 → 6; still the starting point
- [its impact and risk note](../../../2026-05-08-runtime-stack-migration/brainstorm/03_research_astro-6-upgrade/03_impact-and-risk.md) — per-subsystem blast radius and the risk ranking
- [the layouts and components audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/012_surface_layouts-and-components.md) — the measurements showing zero islands, zero hydration directives, zero `define:vars`
- [the dev-tools audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/015_surface_dev-tools-and-live-editing.md) — the toolbar coupling, which is the one real risk surface here

# Todo list

- [ ] Delete `@astrojs/mdx` and its `astro.config.mjs` integration entry — **do this first**
- [ ] Branch, then bump Astro to 7.2.0 and let Vite 8 come with it
- [ ] Resolve the config surface: `astro.config.mjs` reads `.env`, sets `output`, registers the integration
- [ ] Verify all six dev-toolbar apps still register and open
- [ ] Verify the editor: CodeMirror mounts, saves land, the watcher does not echo-loop
- [ ] Test whether the `moduleGraph` reach-in at `integration.ts:206-232` can be deleted
- [ ] Run the full production build and compare page count and wall time against the baseline
- [ ] Walk the four page types for visual regression
- [ ] Update the version-gate constants and any docs that name an Astro version

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## The target

| | Now | After |
|---|---|---|
| Astro | 5.17.1 | 7.2.0 (released 2026-08-06) |
| Vite | 6 | 8 (`^8.0.13`) |
| Node floor | — | 22.12. This machine runs **24.16.0**, so it already clears it |

## What does NOT break, and why the generic upgrade guide overstates the work

Every row measured across the repo. These are the co-bumps the Astro 6 study listed as
risk; none of them applies here:

| Astro surface | Generic risk | Measured here |
|---|---|---|
| `@astrojs/mdx` 4 → 6 | co-bump | **0 `.mdx` files.** Delete the dependency and the co-bump disappears |
| Content collections / content layer | co-bump | **0 uses** — the engine owns its own pipeline |
| Zod 3 → 4 | co-bump | **0 imports** |
| `astro:assets`, image service | co-bump | **0 uses.** Also 1 `?url` import, 0 `?raw`, 0 `?inline`, 0 image imports |
| `client:*` hydration directives | co-bump | **0 uses** across all 53 `.astro` files |
| Shiki 3 → 4 bundled with Astro | co-bump | Shiki is a **direct** dependency here; Astro's bundled copy is inert |

**The whole module-level Astro coupling is one file.** A grep for every Astro API
(`addDevToolbarApp`, `astro:config:setup`, `astro:server:setup`, `astro:build`,
`moduleGraph`) across `src/` returns `src/dev-tools/integration.ts` and nothing else — 376
lines. Plus 8 `astro-dev-toolbar-*` custom-element references in the toolbar apps.

## The one real risk: the dev toolbar

Six apps, 1,793 lines, all hanging off Astro's proprietary dev-toolbar API. This is the
largest Astro lock-in in the repo and the thing most likely to break.

Two specifics from the Astro 6 research, carried forward:

- Astro **6.0.0 – 6.0.3** shipped a regression that made the toolbar vanish; 6.0.4 fixed it.
  Going straight to 7.2.0 should sidestep it, but if you step through 6, pin ≥ 6.0.4.
- 6.0.4 also fixed a toolbar prebundling issue that targets this project's exact shape.

Check all six: layout selector, error logger, system metrics, cache inspector, browser
cache, and the editor entry.

## The conditional prize

`integration.ts:206-232` holds a 25-line `moduleGraph.invalidateModule` reach-in — a
workaround for Vite splitting module state between plugin and SSR contexts. Astro 6.3.4+
carries an upstream fix (#16757).

**Whether it covers this project's git-ref-driven invalidation path is still unverified** —
the Astro 6 research flagged it as the one conditional benefit and nobody has tested it.
Test it here: delete the reach-in, touch a tracked file, and confirm the derived `updated`
date refreshes.

If the prerequisite `globalThis` change has already landed, this test is cleaner — that
change removes the two bare module-level caches the workaround was compensating for.

## Baselines to compare against

Recorded 2026-08-07 on Astro 5.17.1:

| | Baseline |
|---|---|
| `ready in` | 372 / 378 / 410 ms |
| Cold start, wall | 1.81 / 1.85 / 1.91 s |
| Full production build | 1,229 pages in 14.76 s, peak RSS 2,011,160 KB |
| Dev server RSS after 24 min | 874 MB |
| Warm first byte | 6.3–8.7 ms docs/blog/home; 26.6–35.7 ms issues |

Re-run each after the upgrade. Two are worth watching in particular: **Rolldown should move
the build number**, and **RSS is the one place Astro 7 might genuinely help**, since Vite 8
bundles in Rust rather than on the JavaScript heap. Neither is predicted — measure them.

## Done when

- [ ] `bun run build` completes and produces 1,229 pages or more, with the wall time recorded
- [ ] `bun run dev` starts and serves all four page types
- [ ] All six dev-toolbar apps register and open
- [ ] The editor mounts, saves, and does not echo-loop against the watcher
- [ ] Live theme and layout switching still works
- [ ] The `moduleGraph` reach-in is either deleted with evidence, or kept with the reason written here
- [ ] `agent-ks check issues`, `check link-form` and `check config` pass
- [ ] The baseline table above is re-run and the after-numbers recorded in **Outcomes**
- [ ] No documentation still names Astro 5

## Watch for

There is **no typecheck in this project** — no `astro check`, `@astrojs/check` is not
installed, and no `tsc --noEmit` runs in any script or workflow. Running it by hand today
produces 27 errors. A two-major upgrade with no type gate means breakage surfaces at
runtime, on a page you happen to open. Consider adding the gate before the bump rather than
after; that decision is in the parent issue's candidate tier.
