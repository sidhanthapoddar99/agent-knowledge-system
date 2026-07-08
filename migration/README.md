# migration/ — content-format migrations

One-off scripts that bring a content tree from an older format to this engine's
format. They ship with the engine (same clone, same pull) — a consumer who
updates the framework automatically has exactly the migrations that engine needs.

## Naming

`<to-version>_<statement>.py` — the **engine version the script brings content
to** (N.N.N), then a short statement. Version order is execution order: when the
startup gate reports *"content targets X, engine is Y"*, run every script with a
version in `(X, Y]`, ascending. Authoring dates live inside each docstring —
provenance, not ordering.

## Script contract

- **Python, stdlib only** — one-off runs, not part of the live CLI path.
- **Self-documenting** — the module docstring carries purpose, behaviour, and
  usage; it is the source of truth for running the script.
- **Detect + migrate in one file** — a detect pass reports whether/where
  migration is needed (file + line) before anything changes; migrate supports
  `--dry-run` and is idempotent (re-running finds zero instances).

## The flow (AI-assisted)

1. The engine stops with a version error naming content version X and engine Y.
2. Run **each** `migration/` script in `(X, Y]` in version order: detect →
   dry-run → migrate. All of them — a zero-hit detect is a passed check, not a
   skipped script.
3. Verify (`agent-ks check issues` / `check section` / a build).
4. Set `engine_version: "Y"` in `site.yaml` — last step, never first. Bumping
   the version without running the chain defeats the gate's purpose (detecting
   that migration is needed) and moves the breakage where nothing points at it.

Maintainer side: every format change ships with an `ENGINE_VERSION` bump and a
`migration/<new-version>_*.py`. The floor (`MIN_CONTENT_VERSION` in
`astro-doc-code/src/loaders/engine-version.ts`) moves **only for breaking
changes** — it means "the oldest content version that still works unmigrated",
not "the newest migration". Good-to-have migrations leave it alone (old trees
keep running, migrate opportunistically); breaking ones raise it — forgetting
that ships silent breakage.

The version contract itself (site.yaml `engine_version`, `ENGINE_VERSION` +
`MIN_CONTENT_VERSION` in `astro-doc-code/src/loaders/engine-version.ts`) is
documented in the user-guide's configuration section.
