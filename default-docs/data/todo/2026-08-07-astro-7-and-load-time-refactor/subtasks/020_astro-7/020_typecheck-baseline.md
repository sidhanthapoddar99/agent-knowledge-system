---
title: "Add a typecheck — as a report before the upgrade, a gate after"
status: in-progress
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

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

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
