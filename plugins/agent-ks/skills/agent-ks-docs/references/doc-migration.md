# Format migrations

How the on-disk content format moves to a new version without hand edits. Migrations are rare. They are not part of normal authoring.

## When to use this file

| Trigger | Action |
|---|---|
| The engine's version gate fired: "This content targets engine X, but this engine is Y" | Run the upgrade flow below. The gate names the range to migrate across |
| The user asks to run or write a migration | Run the flow. A new script is framework maintenance; see the last section |
| A build error or a validator warning names a legacy field | Run the detect pass, report the count and the locations, and wait for a go-ahead |
| The user asks "does X need migrating?" or "check legacy" | Run the detect passes and report |

If none applies, author content in the current format from the other references.

The contract: `site.yaml → engine_version` names the version the content targets; a missing value counts as `0.0.0`. The engine accepts the range `[MIN_CONTENT_VERSION, ENGINE_VERSION]` from `astro-doc-code/src/loaders/engine-version.ts`.

**Confirm before you apply.** A migration rewrites content in place. Run the detect pass, show the count and the files, and wait for an explicit go-ahead. The one exception: the user asked you to run that migration.

## Where migrations live

`<framework-repo>/migration/<to-version>_<statement>.py`. The code is part of the framework repo. This skill holds only the operating manual.

| Fact | Detail |
|---|---|
| One file per migration | Named by the engine version it brings content to, `N.N.N`, then a short statement |
| Version order is execution order | Authoring dates live inside docstrings, as provenance only |
| Python, stdlib only | One-off runs, outside the live CLI |
| Self-documenting | The module docstring carries purpose, behaviour and usage. Read it before you run the script |

The convention lives in `migration/README.md` in the framework repo.

## The upgrade flow

The gate exists to detect format drift here, loudly. A bare bump of `engine_version` moves the breakage downstream, where it shows as silent misrendering. So the only exit from a gate error is the chain. If the user asks to "just change the version", explain this and run the detect passes. They are read-only and take seconds.

| Step | Action |
|---|---|
| 1 | List every script in `migration/` with a version in `(X, Y]`. All of them, not only the newest |
| 2 | For each script, ascending, run `detect`. Zero hits is a passed check, not a skipped script |
| 3 | Where detect finds hits: run `migrate --dry-run`, show the user, get the go-ahead, run `migrate`. Then run `detect` again and confirm zero |
| 4 | Verify the tree: `agent-ks check issues`, `agent-ks check section …`, and a build |
| 5 | Set `engine_version: "Y"` in `site.yaml`. This is the last step, never the first |

## Script structure

Every script has one shape.

| Subcommand | Does |
|---|---|
| `detect` | Summary counts. Does the tree need this migration, and how much |
| `locate` | Every instance, with file and line |
| `migrate [--dry-run]` | Apply, or preview without writing |
| `verify` | Assert the tree is clean; exits non-zero when legacy content remains. Some scripts exit-code `detect` instead |

Inside, read-only detect functions sit apart from writing fix functions. `verify` reuses the detection core, so `migrate` then `verify` with exit `0` proves the tree is clean.

The docstring also lists the manual steps the script cannot automate. A clean `verify` proves the automated part only.

`agent-ks check legacy-tags [root]` finds custom-tag syntax the renderer does not support (`:::callout`, `<callout>`, `<tabs>`, `<collapsible>`). It names the native replacement for each hit and skips fenced examples.

## Writing a new migration

That is framework maintenance, not this skill. The authoring contract and the shipping checklist: `@root/default-docs/data/dev-docs/30_versioning/05_authoring-migrations.md`.
