---
title: Versioning & Migrations
description: The content ↔ engine version contract — engine_version in site.yaml, the startup gate, and the migration flow
---

# Versioning & Migrations

Your content and the documentation engine carry an explicit **version contract**.
The content declares which engine version it targets; the engine refuses to run
content outside its supported range — so an engine upgrade can never silently
misread an older content format.

## Declaring the content version

`site.yaml` carries one top-level key:

```yaml
engine_version: "0.7.0"
```

- Format is `N.N.N` (major stays `0` while the project is in beta). Only
  major.minor participate in compatibility — a patch bump never changes the
  content format.
- **A missing `engine_version` is treated as `0.0.0`** — projects created before
  the contract trip the gate once, migrate, and are on the contract thereafter.

## The gate

On every dev / build / preview start, the engine compares your declaration
against its own version and its backward-compatibility floor (both declared in
`astro-doc-code/src/loaders/engine-version.ts`). Two failure directions, both
hard stops:

**Content too old:**

```
This content targets engine 0.5.0, but this engine is 0.7.0 and supports content
0.7.0 or newer. The content must be migrated from 0.5.0 to 0.7.0 — ask your AI to
do it: the migration scripts live in migration/ at the repo root, named by the
version they bring content to. Run each script between 0.5.0 and 0.7.0 in version
order (detect pass, then --dry-run, then migrate), verify with docs-guide check,
then set engine_version: "0.7.0" in site.yaml.
```

**Content too new** (engine behind the content):

```
This content targets engine 0.9.0, but this engine is only 0.7.0. Update the
framework to 0.9.0 or newer (./start offers the update when the upstream is
ahead), or check upgrade options for your install.
```

The message is deliberately complete — paste it to your AI assistant and it has
everything it needs to perform the migration.

## Migrating

Migration scripts live at the **repo root** under `migration/`, shipped with the
engine itself — updating the framework always brings exactly the migrations that
engine needs. Naming is `<to-version>_<statement>.py` (e.g.
`0.6.0_state-to-status.py`); version order is execution order.

The flow:

1. The gate reports *content targets X, engine is Y*.
2. Run **every** `migration/` script with a version in `(X, Y]`, ascending —
   going 0.5 → 0.7 means checking all scripts above 0.5 up to and including
   0.7. Each is self-documenting (read its docstring) and ships detect +
   `--dry-run` + idempotent migrate. A detect pass with zero hits is a passed
   check, not a script you were allowed to skip.
3. Verify — re-run the detect passes (zero hits) and the validators
   (`docs-guide check issues`, `docs-guide check section …`, or a build).
4. Set `engine_version: "Y"` in `site.yaml` — **the bump is the last step**.

> [!CAUTION]
> Never edit `engine_version` to make the error go away without running the
> chain. The gate's entire purpose is to *detect* that migration is needed —
> a bare version bump doesn't make your content compatible, it just moves the
> breakage somewhere the engine can no longer point at it.

See `migration/README.md` for the script convention, and the dev-docs
[Versioning section](/dev-docs/versioning/overview) for the full engineering
detail (gate mechanics, floor discipline, authoring migrations).

## For engine maintainers — only breaking changes move the floor

The contract has a development side, and it is not optional. Any release that
changes the content format ships with `ENGINE_VERSION` bumped (minor) and a
`migration/<new-version>_<statement>.py` covering the change. What happens to
`MIN_CONTENT_VERSION` depends on the **class of change**:

- **Good-to-have migration** — old content still loads and renders correctly on
  the new engine; the migration just modernizes it. Ship the script, **leave the
  floor alone**. Older trees keep working and migrate opportunistically (or get
  swept up by the chain the next time a breaking change forces one).
- **Breaking change** — old content fails or misrenders without the migration.
  Ship the script **and raise `MIN_CONTENT_VERSION` to that version**.

That is the floor's entire meaning: **the oldest content version that still
works unmigrated** — not the newest migration available. Raising it for
non-breaking changes forces pointless migrations on everyone; forgetting to
raise it for a breaking change lets old content load unmigrated — silently
wrong, with no error pointing anywhere. Releases that don't touch the content
format at all just bump `ENGINE_VERSION`, and consumers feel nothing.
