---
title: "Add a typecheck — as a report before the upgrade, a gate after"
status: dropped
---

# Overview

**There is no typecheck anywhere in this project.** No `astro check`, `@astrojs/check` is
not installed, and no `tsc --noEmit` runs in any script or workflow. Running it by hand
today produces **27 errors**.

A two-major framework upgrade with no type gate means breakage surfaces at runtime, on
whatever page you happen to open. Capture the error list *before* the bump so you can diff
it *after* and see what the upgrade actually broke.

**Do not try to fix the 27 errors as part of this.** That is a different job, and mixing it
in destroys the diff that makes this subtask worth doing.

# References

- [the Astro 7 upgrade subtask](./010_astro-5-to-7-upgrade.md) — this runs immediately before it
- [the layouts and components audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/012_surface_layouts-and-components.md) — where the 27-error measurement and the "no typecheck exists" finding come from

# Todo list

- [ ] Run `tsc --noEmit -p tsconfig.json` and commit the output as the baseline
- [ ] Add a `typecheck` script to `package.json`
- [ ] Install `@astrojs/check` so `.astro` files are covered, not just `.ts`
- [ ] Run the upgrade, then re-run and diff against the baseline
- [ ] Decide separately whether the gate becomes blocking in CI

# Outcomes and Next Steps

**Dropped by Sid. The thing this existed to produce cannot be produced any more.**

## Why

Read the Details below: every step is ordered around *before the bump* and *after
the bump*. The deliverable was the **diff** — new errors are the upgrade's, old
ones are not.

**The upgrade landed without the baseline being taken.** There is no
before-state, so there is no diff, and no protocol recovers one: the 27 errors
were counted on Astro 5 with a `tsc` that is no longer the one installed, against
a `tsconfig.json` the upgrade touched.

Running it now would produce a *first report*, which is a different and smaller
thing than what is written above. Leaving the subtask open to deliver that would
mean quietly redefining it — the failure mode this tracker exists to prevent.

## What survives, and where it goes

**"Add a `typecheck` script and decide whether it gates CI"** is still worth
doing. It is not this issue's business: this issue was an Astro upgrade and a
load-time refactor, and a type gate is neither. It needs `@astrojs/check`
installed, a decision about the ~27 pre-existing errors, and a CI decision — its
own component and its own first subtask.

**Open it fresh when you want it.** Do not reopen this one; it is tied to a
comparison that stopped being answerable the moment
[the upgrade](./010_astro-5-to-7-upgrade.md) merged.

## The lesson, since it cost something real

The plan named this as a hard constraint —
[stage 10 before stage 40](../../plans/01_implementation/overview.md), *"you
cannot diff a typecheck against a baseline you never recorded"* — and the
constraint was correct. It was skipped because `@astrojs/check` prompted for an
install and the prompt was declined, which read as a small tooling detour rather
than as the one irreversible step in the plan.

**A measurement that can only be taken before an event is not a task, it is a
gate.** Nothing in the run treated it as one.

# Details

## Report first, gate later

Making it blocking on day one means fixing 27 pre-existing errors before you can bump
anything. That is the wrong order. Sequence:

1. **Before the bump** — record the 27 as the baseline. This is the deliverable.
2. **After the bump** — re-run. New errors are the upgrade's; old ones are not.
3. **Later, separately** — burn the baseline down, then make it blocking.

Note that `tsc` alone does not cover `.astro` files. There are 1,184 lines of render-time
TypeScript inside layouts (`server/helpers.ts` at 512 lines, `guide.ts` at 504) that only
`@astrojs/check` will see.

## Done when

- [ ] `bun run typecheck` exists and runs
- [ ] The pre-upgrade error list is recorded in **Outcomes** with its count
- [ ] The post-upgrade list is recorded beside it, and the delta is named
- [ ] A decision on making it blocking is written down, either way
