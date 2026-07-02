---
title: "Research — upgrade to Astro 6 (the stay-on-Astro branch)"
---

> **Resolved →** rejected in favour of this issue's runtime migration — the bump lost on its own weak merits *and* was dominated by the Go-runtime decision (see `notes/architecture/06_performance-comparison.md`).

# Upgrade to Astro 6

This thread migrates the cancelled issue **`2026-06-09-astro-6-upgrade`** into the
runtime-stack-migration deliberation, where it belongs: it was the **"stay on Astro, just
stay current"** branch of the larger *"what runtime/framework direction do we take?"*
question — the conservative alternative to the Go + Vite rewrite this issue adopted. It was
researched thoroughly (a full discovery/documentation pass, 13 note files), then cancelled.
It's preserved here as the record of *why* the stay-on-Astro option lost.

## What was researched

Moving the framework from **Astro 5.16.12 → 6.4.5** (one major, but dragging **Vite 6→7**,
**`@astrojs/mdx` 4→6**, **Shiki 3→4**, **Zod 3→4**, and a **Node 22.12+** floor underneath).
The mechanical bump is two lines in `package.json`; the whole issue existed because of the
*blast radius* across the surfaces this framework leans on hardest — the dev-toolbar
integration, the SSR module-invalidation workaround, and the Vite dev server.

The research split three ways, condensed into the sibling files here:

| File | Source group | Carries |
|---|---|---|
| `02_breaking-changes-and-upgrade-path.md` | `00-astro-update/` | What breaks, the dependency co-bumps, the ordered upgrade steps, the `./start` reinstall gotcha. |
| `03_impact-and-risk.md` | `01-astro-update-impact/` | Per-subsystem blast radius, the highest-risk SSR/module-graph workaround, the risk ranking. |
| `04_benefits-and-verdict.md` | `03-astro-upgrade-benefits/` | The upside ledger (mostly infrastructural) and why the original research recommended *proceed* — then why the decision reversed. |

## Timeline

- **Original issue dated 2026-06-09.** Component `infra`, priority `medium`. Author: claude.
- A single-session discovery/documentation pass produced the three note groups above and
  three comments (kickoff, the `./start`-reinstall finding, the cancellation).
- **Cancelled 2026-06-09** — same day, after the documentation pass concluded the upgrade
  wasn't worth doing on its own merits.

## Why the upgrade lost

The cancellation comment (`2026-06-09-astro-6-upgrade/comments/003`) records four reasons —
the first three are the bump's *intrinsic* weakness, the fourth is the branch losing to this
issue:

1. **Upside-down cost/benefit.** No perceptible speed win (the headline Rolldown 10–30× build
   gains are Vite 8 / Astro 7, *not* this bump), and no new Astro 6 feature this framework can
   use — it rolls its own `marked` + `shiki` content pipeline, so Astro 6's content-layer /
   collections / image-service / adapter additions are all inert here.
2. **The one real prize is conditional.** Retiring the custom `moduleGraph.invalidateModule`
   SSR workaround only pays off *if* Astro 6.3.4+'s upstream fix (#16757) covers our
   git-ref-driven invalidation path — left ⚠️ unverified.
3. **Real risk for little reward.** A major bump dragging in Vite 7 touches the framework's
   highest-risk code (the SSR module-isolation workaround) with a *silent* failure mode; the
   testing effort would mostly go to defending the status quo.
4. **Dominated by a bigger decision.** This issue — replacing Astro with a Go + Vite single
   binary — makes the real question *"are we staying on Astro at all?"*. If the answer is no,
   the bump is throwaway. The Go runtime **structurally eliminates** the very SSR
   module-isolation bug class the upgrade was carefully re-testing (single process, single
   module instance, no Vite SSR graph — see `notes/architecture/06_performance-comparison.md`,
   "SSR module isolation cost"). That performance-and-correctness case out-competed a bump that
   only ever promised to keep the aging stack current.

**Not a permanent "never".** Version debt compounds — skipping 6 → 7 → 8 gets progressively
more painful. If the team ever commits to *staying* on Astro, the upgrade-steps and impact
notes in the source issue are ready to execute against. The graduation here is "rejected given
the migration is on," not "the research was wrong."
