---
title: "Summary"
---

# State

Stages 10–40 of [the implementation plan](../../plans/01_implementation/overview.md) are
landed and committed on `go-astro7-migration`, in five commits. **Stages 50 and 60 have not
started.**

The engine now runs Astro 7.2.0 / Vite 8.2.1. Nothing is left in the working tree.

What happens next is Sid's: three things need eyes on a screen, one red item needs a
control test, and `./start` needs trying against the new CLI. All four are listed under
[Outcome](#outcome).

# Goal

Execute the implementation plan autonomously — measure, decide, and land the work without
stopping to ask — on a throwaway branch.

Triggered mid-run by Sid, 2026-08-07: *"i would allow you to check and take decision this
is seperate branch so its fine // so test out and take decision just autonomously upgrade
this and execute the plan ultracode this where every necessary"*.

That instruction replaced an earlier one. The plan had been written but not started, and
the three open questions at the end of [the overview](../../plans/01_implementation/overview.md)
were still waiting on an answer. This run answered them by measuring rather than by asking.

# Todo

- [x] [Stage 10 — baseline](../../plans/01_implementation/10_baseline-and-safety-net.md) —
      every audit figure re-measured on this machine; all reproduced. Page count moved
      1,229 → 1,265 because this issue added a folder
- [x] [Stage 20 — the load-time fix](../../plans/01_implementation/20_load-time-fix.md) —
      both halves. `/todo` 1.206 s → 0.155 s, built HTML 136.6 MB → 73.8 MB
- [x] [Stage 30 — de-risk](../../plans/01_implementation/30_de-risk-the-upgrade.md) —
      cache split **reproduced first**, then fixed; `@astrojs/mdx` dropped
- [x] [Stage 40 — the upgrade](../../plans/01_implementation/40_the-upgrade.md) —
      Astro 5.17.1 → 7.2.0. One break, and it was ours
- [ ] [Stage 50 — correctness sweep](../../plans/01_implementation/50_correctness-sweep.md)
      — not started
- [ ] [Stage 60 — routing parity](../../plans/01_implementation/60_routing-parity.md) —
      not started

Subtask-level detail sits on the stages, which carry the per-stage tables. This log does
not repeat them.

# Out of Scope

Stage 60 — deliberately. It is larger than stages 10–50 combined and nothing depends on
it; whether it stays in this issue at all is still an open decision, and starting it would
have made that decision by accident.

# Outcome

## What it bought

Two independent wins, from two different stages. They are worth reading separately because
the second one contradicts what the plan predicted.

**From the code fix (stage 20)** — this is the one that scales with tracker size:

| | Before | After |
|---|---|---|
| `/todo`, module graph warm | 1.206 s | **0.155 s** |
| Detail page, first request | 2.543 s | 1.576 s |
| Built HTML, all files | 136.6 MB | 73.8 MB |
| `/todo`, gzipped | 51,928 B | 39,138 B |

**From the upgrade (stage 40)** — a flat win, independent of tracker size:

| | Astro 5.17.1 / Vite 6.4.1 | Astro 7.2.0 / Vite 8.2.1 |
|---|---|---|
| Build, wall | 13.7–15.1 s | **7.1–7.3 s** |
| Build, peak RSS | 2,049 MB | **1,239 MB** |
| `/todo` first request | 1.039 s | **0.590 s** |
| Dev server ready | ~400 ms | ~1,057 ms — slower |
| Built HTML, total | 73.8 MB | 79.7 MB — +8% |
| Typecheck | 27 errors | 27, same files, same codes |

Real browser traffic during the run served pages at **14–17 ms**, `/theme.css` at 0 ms.

**A full build is already in milliseconds per page**: 143 ms collecting, 1,360 ms
bundling, 4,280 ms generating 1,265 pages — **3.4 ms each**. The seconds are the page
count, not the per-page cost, so no runtime change reaches them. Only rebuilding fewer
pages does.

## Two predictions this run falsified

**"The upgrade buys no measured speed."** Written into stage 40 before it ran. Right about
warm request time; wrong about the build (~2×) and wrong about memory (−38%) — which is
the problem Sid named first.

**The migration issue's cache bug is narrower than it claims.** It reproduces: two live
module instances in one dev server, so a module-level `Map` is two Maps. But the mtime
signature already masks it for staleness. What it actually broke was *targeted
invalidation* — `invalidateIssuesCache(dataPath)` deleting a key shape that never existed.
That bug is [the migration issue's](../../../2026-05-08-runtime-stack-migration/issue.md)
stated justification, so this weakens the case for a rewrite rather than supporting it.

## The one thing that broke, and it was ours

`paths.ts` found the framework root by counting directory levels up from its own file.
That was correct only because Astro 5 happened to bundle chunks at a matching depth; Astro
7 bundles one level deeper and it resolved to `dist/`. A latent defect that an upgrade
exposed, not an upgrade that caused one. It now walks up to a marker file.

## Decisions taken without asking

- **Thread the render mode explicitly rather than adding a module-level flag.** The cheap
  version was three lines. It was rejected because a stale flag caches empty bodies
  silently, and because the audit already names module-level state here as a defect class.
- **Fold the embed collector into the same per-load context**, removing a piece of module
  state instead of adding one.
- **Drop a cache-reuse shortcut I had just written** in `loadIssue` — it read the
  tracker-wide entry without checking its signature, and the build never calls that path.
- **Commit at every stage boundary**, so a bad stage can be reverted alone.
- **Leave the `moduleGraph` reach-in in place.** Stage 30 removed its reason for existing,
  but it is unsafe to delete while the watcher that contains it is silent.

## Open — and what each one needs

🔴 **The git-ref watcher did not fire on a real commit.** Made with the dev server running;
its log stayed silent, though the paths register at boot. If real, derived `updated` dates
go stale in dev until restart. **Not confirmed as a regression** — the same watcher could
not be made to fire on Astro 5 either, so there is no control. Getting one is the next
step, and the `moduleGraph` question is parked behind it.

⚠️ **`./start` and `start.ps1` are untested against Astro 7.** The CLI changed underneath
them: `astro dev` now backgrounds itself when it detects an AI-agent environment, writes a
per-project lock, and prints JSON instead of `ready in 428 ms`. The wrapper parses that
output.

🟡 **Three things need a screen**, and none of them are mine to sign off: the six toolbar
apps, the editor overlay (its theme CSS now comes from a `<link>`, not copied text), and
whether a cold cache flashes.

## Honest notes on the method

Two measurement failures, both mine, both caught before they reached a conclusion:

- A leaked `cd` sent `bun run dev` to a directory with no `dev` script, and the harness
  reported 133 s and 135 s "timings" for a server that never started.
- Eleven orphaned dev servers accumulated across harness runs — Astro 7 backgrounds the
  server, so `$!` is the launcher and killing it leaves the daemon alive. They produced a
  fake 72-second first request that looked exactly like an Astro 7 regression. Cleaned up
  and re-measured on a quiet machine; every number above is from the clean runs.

The harness that survived is `/tmp/measure.sh`. **Its protocol matters more than its
numbers**: protocol A makes `/todo` the first request of all, so it pays for the shared
module graph too; protocol B warms other routes first. Comparing one against the other
invents a win or a regression that is not there.
