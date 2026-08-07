---
title: "Theme loader — the extends cycle hang and the reachability of 'default'"
status: open
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

- [ ] Write a failing fixture: two themes that extend each other
- [ ] Make the cycle check throw, in every environment, not only under DEV
- [ ] Write the cache entry before recursing, so the memo breaks the loop
- [ ] Decide and document what happens to a user theme named `default`
- [ ] Correct the user-guide page that claims the cycle already errors at startup

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

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
