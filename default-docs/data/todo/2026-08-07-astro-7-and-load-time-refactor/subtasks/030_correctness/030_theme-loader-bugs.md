---
title: "Theme loader — the extends cycle hang and the reachability of 'default'"
status: review
---

# Overview

Two defects in `theme.ts`, one of which hangs the build.

**1 · A circular `extends` recurses until the stack is exhausted.** `validateTheme:268-287`
detects the cycle — then calls `addError()` and never throws, and that call is gated behind
`import.meta.env.DEV`. Meanwhile `getThemeCSS:384-426` writes its cache entry **after** the
recursive call, so the memo never breaks the loop. A real `A → B → A` chain recurses until
it dies. The user guide states this "is detected and errors at startup". It is not.

**2 · A user theme folder named `default` is unreachable.** `theme.ts:57` short-circuits the
literal name to the built-in styles directory before any directory scan runs, and
`getAvailableThemes()` seeds `default` into its `seen` set first. The folder is invisible.

# References

- [the theming and CSS surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/013_surface_theming-and-css.md) — both defects with line numbers, and the inheritance algorithm
- [the theme-system refactor issue](../../../2026-04-10-theme-system-refactor/issue.md) — the long-term home for theme architecture; these two are point fixes, not that redesign

# Todo list

- [x] Write a failing fixture: two themes that extend each other
- [x] Make the cycle check throw, in every environment, not only under DEV
- [x] Break the recursion — done with a re-entry guard, not a pre-written cache entry (see below)
- [x] Decide and document what happens to a user theme named `default`
- [x] Correct the user-guide page that claims the cycle already errors at startup

# Outcomes and Next Steps

Both defects fixed and proven end to end. Commit `36c0497`.

## The cycle now throws — proven against a real build, not read off the code

The detector was extracted into `findExtendsCycle` in
`astro-doc-code/src/loaders/theme.ts`, called unconditionally from
`loadThemeConfig` **outside** the `import.meta.env.DEV` gate. `validateTheme` calls
the same function, so what gets reported and what gets enforced cannot drift.

**One thing the audit did not catch:** the old check compared `extends` values as
**strings**. The same theme is routinely named two ways — an absolute path when it
comes from config load, `@theme/<name>` when it comes from another theme's
`extends` — so a real cycle could walk straight past a string comparison.
Comparison is now by resolved absolute path.

The control that matters: a genuine `full-width → minimal → full-width` was written
into the real `default-docs/themes/`, `bun run build` was run, and the themes were
restored:

```
  exit=1   wall=5.5s
  [ERROR] Circular theme inheritance: full-width → minimal → full-width.
          A theme cannot extend itself, directly or through its ancestors.
          Remove one of the "extends" values in the chain.
```

Five fixtures live in `scripts/check-theme-contract.mjs` gate C, and **two of them
are negative controls** — a normal child/base pair, and a *diamond* (two paths
reaching one shared ancestor, which is legal). Without those, a detector that
returns a cycle unconditionally would pass every positive test.

**Deviation from the plan, and why.** This subtask asked for the cache entry to be
written *before* recursing, so the memo breaks the loop. That is not implementable
as written — the value does not exist yet, so the entry would have to be a lie. The
throw in `loadThemeConfig` fires before any recursion happens, which achieves the
stated goal. A re-entry guard (`enterThemeCSS`) was added anyway, because
`loadThemeConfig` returns early on a **cache hit** and that early return skips its
own check — so the guard closes a hole the throw alone leaves open.

## A user theme named `default` is rejected — and the subtask's recommendation was wrong

Rejected at startup with a message naming the directory. Verified by creating
`default-docs/themes/default/` and building: exit 1, correct message, fixture
removed.

**This subtask recommended option 2 (let the user win, scan first), on the grounds
that it matches how `@ext-layouts` overrides built-in layouts. That reasoning does
not carry over, and taking it would have made things worse.** `@theme/default` is
not just a name that happens to be taken — it is *the documented reference to the
built-in theme*, and **both** shipped user themes extend it:

```
default-docs/themes/minimal/theme.yaml     extends: "@theme/default"
default-docs/themes/full-width/theme.yaml  extends: "@theme/default"
```

So a directory claiming the name silently retargets every `extends` in the project
to that directory — and for the directory itself, resolves to itself, which is the
cycle above. A layout override affects one layout; this affects the root of every
theme chain. Reserving the name is the option that keeps `@theme/default` meaning
one thing.

## Next steps

None for this subtask. The reserved-name list is a `Set` in `theme.ts` if another
framework-owned name ever needs adding.

# Details

## The cycle bug needs two fixes, not one

They are independent and either alone leaves you broken:

- **Throw, and outside the DEV gate.** A detected cycle that only warns is not detection.
  A production build must fail loudly rather than hang.
- **Write the cache entry before recursing.** This is what actually stops the recursion.
  Even with a throw, a deep chain does needless work first.

Guard the fixture: it must be a genuine `A → B → A`, and the test must assert a *thrown
error*, not a logged one. A test asserting "it does not hang" passes trivially if the throw
happens to fire first.

## The `default` name — pick a rule and state it

Three options. Any is fine; silence is not:

1. **Reserve it.** Reject a user theme named `default` at load with a clear message.
2. **Let the user win.** Scan first, fall back to built-in only if nothing is found — this
   matches how `@ext-layouts` already overrides built-in layouts by name.
3. **Leave it, document it.** Cheapest, and the worst of the three: it stays a trap.

Option 2 is the most consistent with the rest of the system. Whichever is chosen, write it
into the theming documentation.

## Done when

- [ ] A circular `extends` throws a clear error in dev **and** in a production build
- [ ] A fixture proves it, and asserts a thrown error
- [ ] The `default` name has a stated rule, implemented and documented
- [ ] The user-guide inheritance page matches what the code does
