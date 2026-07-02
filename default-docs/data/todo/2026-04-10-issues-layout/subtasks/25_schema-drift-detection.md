---
title: "Schema-drift detection in `check.mjs` — unknown-key warnings + flag controls"
status: done
---

The existing validator catches *missing* required fields and *invalid* enum values, but tolerates **unknown keys** silently. So a stale `"milestone": "phase-2"` left behind by an incomplete migration would slip through. Add unknown-key detection across every settings + frontmatter surface, with flag controls so the noise is opt-out.

- [x] **Define canonical key sets** at the top of `check.mjs` for: per-issue `settings.json` top-level keys; tracker-root `settings.json` top-level keys + the inner `fields.*` enum names; subtask frontmatter; note frontmatter; agent-log frontmatter; comment frontmatter. Source the sets from real-world usage (audit existing files) minus anything we know is obsolete (`milestone`, `due`, manual `updated`, `type`).
- [x] **Set-difference each file's keys against its canonical set.** Emit a warning per file with the offending key list — same channel as existing warnings.
- [x] **`--quiet` / `--no-warnings`** — suppresses warning output entirely; only errors print. Exit code unchanged. For consumers that care about hard failures only.
- [x] **`--verbose`** — for each unknown-key warning, append the canonical key list inline (so an author upgrading from an older framework version can see what was expected without grepping).
- [x] **`--strict`** — promote *unknown-key* warnings to errors (exit 1). Other warnings (component>1, AI-handoff hint, vocabulary mismatches) stay as warnings even under strict — those are conventions, not contract violations. Strict targets schema drift specifically.
- [x] **Baseline test**: run on current tracker → 0 unknown-key warnings (drift-free). Inject a fake `"foo": "bar"` into one `settings.json` → warning surfaces → remove.
- [x] **Doc updates**: brief mention in plugin skill `references/issue-layout.md` (validator section) + user-guide `04_settings/01_per-issue.md` § Validation. Three flags listed; "use during framework upgrades" framing.

## Why this earns its keep

- **Migration safety net.** The recent `milestone`/`due`/`updated` cleanup mass-stripped 36 issues — if one had been missed, this would have caught it the next time the validator ran. As schemas evolve, this is the cheapest insurance against silent drift.
- **Upgrade aid.** When a downstream consumer pulls in a newer framework version that renamed or dropped a key, the warning surfaces every drift point in one pass.
- **Zero schema config.** Canonical sets live in the script as JS Sets. No JSON-schema dance, no external dependency. ~30 lines of code plus the wiring.

## Why warnings, not errors

By default. The principle: a stale key in someone's working copy isn't a release-blocker — it's noise the loader ignores. Promoting to errors would block CI on every harmless leftover. `--strict` exists for the case where the user explicitly wants a clean schema gate (e.g. a framework-upgrade PR).

## Files likely touched

- `plugins/documentation-guide/skills/documentation-guide/scripts/issues/check.mjs` — canonical sets, key-walk logic, flag wiring.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md` — validator section, brief flag mention.
- `default-docs/data/user-guide/19_issues/04_settings/01_per-issue.md` — § Validation, three new flags listed.

**Landed.** Canonical key sets defined for issue settings, tracker-root settings (top-level + `fields.*`), and frontmatter on subtasks / notes / agent-log / comments. Flags wired via `parseArgs`: `--quiet`/`--no-warnings`, `--verbose`, `--strict`. Verified round-trip — drift-free baseline on current tracker, injected `"fakeStaleKey"` triggers warning (default), error+exit-1 (strict), suppressed (quiet), and canonical-list inline (verbose). Build passes (376 pages). Doc updates landed in plugin skill `references/issue-layout.md` § "Validating after writes" and user-guide `04_settings/01_per-issue.md` § "Schema-drift detection".
