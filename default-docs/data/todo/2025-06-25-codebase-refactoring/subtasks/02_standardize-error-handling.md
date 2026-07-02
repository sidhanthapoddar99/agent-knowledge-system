---
title: "Standardize error-handling patterns across loaders"
status: open
---

**What it means.** The loaders currently surface failures three different ways, with no consistent rule for which to use:

- **Structured reporting** — `addError` / `addWarning` (in `cache.ts`, `data.ts`, `theme.ts`, `index.ts`) → collected and shown in the error-logger toolbar.
- **Ad-hoc console** — `console.error` / `console.warn` (in `alias.ts`, `config.ts`, `theme.ts`, `data.ts`, `issues.ts`) → goes to the terminal only, invisible in the UI.
- **Throwing** — `throw new Error(...)` (in `paths.ts`, `theme.ts`, `config.ts`, `issues.ts`, `data.ts`).

On top of that there are **~15 silent `catch {}`** blocks that swallow errors with no signal at all.

**The convention to land on** (proposal — confirm during the work):
- *Recoverable / user-facing content problems* (bad frontmatter, missing settings, unresolved link) → `addError` / `addWarning` so they show in the toolbar.
- *Programmer errors / unrecoverable config* (missing required `theme`, non-absolute path) → `throw`.
- *Genuinely-ignorable* (optional file absent) → keep the `catch`, but add a one-line comment saying why it's safe to swallow.

**Why it matters.** Today whether a failure is visible to the user depends on which file happened to raise it. Silent catches actively hide bugs.

**Done when.** The convention is written down (a short comment block in `cache.ts` or the dev-docs), `console.*` calls that represent user-facing problems are converted to structured reporting, and every remaining `catch {}` either reports or carries a justifying comment.
