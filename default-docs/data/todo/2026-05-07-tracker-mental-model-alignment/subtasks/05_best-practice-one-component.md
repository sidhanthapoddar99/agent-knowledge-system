---
title: "Best-practice: 1 component per issue (multiple = exception)"
state: closed
---

- [x] Document the convention in the user-guide: an issue should declare a **single primary component**. Multiple components is allowed but should be reserved for genuinely cross-cutting concerns (e.g. a refactor that touches loaders + layouts + plugin scripts simultaneously). When tempted to list two, ask "should this be two issues instead?" — the answer is usually yes.
- [x] Document the same in `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md` and `references/writing.md` so AI agents creating issues default to a single component.
- [x] **No hard validation.** Validator continues to accept arrays of any length. The rule is convention, not enforcement. Optional: `docs-check-section` could emit an info-level note ("issue declares N components — consider splitting"), but only as a hint, never an error.

## Landed

User-guide overview (`01_overview.md`) and `04_settings/01_per-issue.md` document the convention; matching framing in plugin skill `references/issue-layout.md` (Operating model section) and `references/writing.md` (new "Issue best practices" section). `check.mjs` emits an info-level warning when an issue declares >1 component — never an error.

## Why no hard rule

Cross-cutting issues do exist. A "drop a deprecated convention everywhere" issue genuinely touches multiple components. Hard-validating to one would force a fake assignment ("which is the *most primary*?") that adds bookkeeping without value. The soft rule + the question "should this be two issues?" catches the 95% case without the false-precision tax.

## Files likely touched

- `default-docs/data/user-guide/19_issues/` — likely a new "best practices" page or an addition to an existing overview.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`
- `plugins/documentation-guide/skills/documentation-guide/references/writing.md`
- Optionally `plugins/documentation-guide/scripts/issues/check.mjs` for the soft hint.
