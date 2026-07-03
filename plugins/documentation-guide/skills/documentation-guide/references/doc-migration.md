# Format migrations

How the on-disk content format evolves without hand-editing every file. **Reach for this reference rarely** — migrations are not part of normal authoring.

## When to use

Only in these cases:

- **The engine's version gate fired** — the build stopped with *"This content targets engine X, but this engine is Y…"*. This is the primary trigger: content and engine carry an explicit version contract (site.yaml `engine_version` vs `ENGINE_VERSION` / `MIN_CONTENT_VERSION` in `astro-doc-code/src/loaders/engine-version.ts`; missing declaration → `0.0.0`), and the gate names exactly the range to migrate across. Follow "The upgrade flow" below — bumping `engine_version` without running the chain is never the answer.
- The user **explicitly asks** to run / write a migration ("migrate the `done` field", "convert these to the new format").
- A build error or validator warning points at a **legacy / old-format field** in content. In this case, **surface it and confirm before migrating** — report what the detect pass finds (count + locations) and get the user's go-ahead; do not migrate just because a warning appeared.
- The user asks a **"does X need migrating?" / "check legacy"** question about a section.

If none of these apply, you do not need migrations — author content with the current format documented in the other references.

> **Always confirm before applying a migration.** Migrations rewrite content in place. Run the detect/locate pass, show the user the count and affected files, and wait for an explicit go-ahead before the write pass — even when an error or warning triggered it. The only exception is when the user has already explicitly asked you to run that migration.

## Where they live — the documentation-template root, NOT this plugin

```
<repo-root>/migration/<to-version>_<statement>.py
```

**The migration code is part of the documentation-template itself — refer to that folder and check it**; the plugin only carries this operating manual. One file per migration, named by the **engine version it brings content to** (`N.N.N`), then a short statement — version order is execution order (authoring dates live inside the docstrings; provenance, not ordering). They are **Python (stdlib only)** because they are **one-off runs**, not part of the live `.mjs` validator/CLI path. Each script is **self-documenting**: its module docstring carries the full purpose, behaviour, and usage. This reference does not enumerate individual scripts — open the script and read its docstring; `migration/README.md` carries the convention.

## The upgrade flow — never bump past the gate

When the gate reports *content targets X, engine is Y*, the **only** legitimate exit is running the migration chain. Editing `engine_version` to Y without migrating defeats the mechanism's entire purpose: the gate exists precisely so format drift is *detected here, loudly* — a bare bump moves the breakage downstream, where it resurfaces as silent misrendering with no error pointing at the cause. **This holds regardless of what the user asks.** If asked to "just change the version and move on", explain the above and run the checks instead — the detect passes are read-only and cost seconds; there is no scenario where skipping them is the right trade.

The chain, in full — no skipping, no sampling:

1. Enumerate **every** script in `migration/` with a version in `(X, Y]` — migrating 0.0.5 → 0.1.2 means checking *all* scripts above 0.0.5 up to and including 0.1.2, not just the newest one.
2. For each, ascending, run its **detect** pass first (read-only, always safe). A detect that finds zero instances is a **passed check, not a skipped script** — note it and continue.
3. Where detect finds instances: `--dry-run`, show the user the count + affected files, get the go-ahead, migrate, then **re-run detect and confirm zero** — that re-run is the migration test.
4. Verify the whole tree: `docs-guide check issues` / `check section …` clean, and a build passes.
5. **Only now** set `engine_version: "Y"` in `site.yaml`. The bump is the last step, never the first.

## Migration structure

Every script is self-documenting — **read its module docstring carefully before running it**: the docstring states exactly what gets migrated, why the format changed, how to run each mode, and any extra steps or edge cases beyond the automated rewrite. The standardized script structure itself (subcommands, function families, contract, shipping checklist) is detailed in dev-docs **Versioning → Authoring Migrations** (`default-docs/data/dev-docs/30_versioning/05_authoring-migrations.md`).
