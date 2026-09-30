---
title: "Docs migration: bring every 0.x project to 1.0.0"
status: in-progress
---

1.0.0 breaks every existing project: the binary is renamed, the config layout changes, custom layouts go, and `dep.yaml` becomes required. This leaf writes the migration scripts that bring any content from the oldest supported 0.x version up to 1.0.0, so `agentks migrate` takes a 0.x project to a working 1.0.0 project in one run. It includes porting today's 0.x scripts into the new home, so content that is several 0.x versions behind still migrates. It is tested on this repository's own docs and tracker first.

# 01 To Do
- [x] **Port today's 0.x scripts** from [agent-ks-engine/migration/](../../../../../../agent-ks-engine/migration/README.md) into `apps/agentks-engine/migrations/docs/`: `0.1.0_done-to-state`, `0.1.1_state-to-status`, `0.1.2_legacy-custom-tags`, `0.1.2_root-settings-schema`, `0.2.0_agent-log-slot-numbering`, `0.2.0_agent-log-status-vocabulary`, `0.2.0_status-colors-to-css`, `0.2.3_slug-form-links`. Their I/O follows the runner's `--root` and `--json` contract, and their old extra steps fold into the five contract steps. Their behaviour is otherwise unchanged, except for the changes listed in Decisions: two bug fixes, and the slug-link "nothing was read" guard, which now only reports.
- [ ] **Write the 1.0.0 scripts** once the new format settles, one statement each (names indicative). Each carries the same shared block as the 0.x scripts:
    - [ ] `1.0.0_config-folder-and-env` — find the config folder the 0.x project used (`CONFIG_DIR` in the framework `.env`); make sure content sits under the project root as `config/` plus section folders; move `PORT`/`HOST` from `.env` into `server.port` in `site.yaml`; create `config/.env` only for real overrides; remove `CONFIG_DIR`.
    - [ ] `1.0.0_dep-yaml` — create `config/dep.yaml` with `libraries: {}` when missing.
    - [ ] `1.0.0_custom-layouts` — find `LAYOUT_EXT_DIR`, `@ext-layouts` references and user layout folders; switch each section to the closest built-in style; report every section it changed and every user layout it could not replace. Never delete user layout code; list it for the user.
    - [ ] `1.0.0_site-yaml-keys` — remove `server.allowedHosts` and the `editor:` block; keep a report of removed values.
    - [ ] `1.0.0_themes-location` — move user themes to the 1.0.0 theme location decided in [100/10 theme contract](../100_layouts/10_theme-contract-and-css.md) and update `theme_paths`.
    - [ ] Any content-syntax change the new renderer makes (confirm with [020/00 content contract](../020_content-contract/00_overview.md); if there is none, record that in the result).
    - [ ] Leftovers from the 0.2.3 → 0.3.10 gap, which shipped no scripts (see Result): drop a leftover `unit:` field from agent-log round frontmatter, if 1.0.0 rejects unknown frontmatter keys; and, for a user theme with `override_mode: replace`, report every required theme variable it lacks (the 0.3.0 contract grew from 53 to 65 names). Fold these into the scripts above or add one script each.
    - [ ] **Pre-existing broken links do not block.** The migration leaves a link it cannot resolve exactly as it was, reports it as a non-blocking manual item, and `verify` fails only when the migration broke a link that resolved before. Adjust `0.2.3_slug-form-links`'s `verify` to that rule.
- [ ] **The framework folder** in consumer projects (`<project>/agent-knowledge-system/`): do not delete it. Report it and tell the user to remove it after checking the migrated site ([180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md)).
- [ ] **Each script** has the five contract steps (`detect`, `locate`, `dry-run`, `migrate` (idempotent), `verify`), `--json`, inline dependencies, the shared block, and a test with before/after fixtures.
- [ ] **Try the chain on real content first:** a copy of this repository's `default-docs/`, the [demo issue fixture](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md), and the starter template; then run [170/20 route and content parity](../170_testing/20_route-and-content-parity.md) against the 0.x output.
- [ ] **Record the checklist** of every 0.x → 1.0.0 change in the 1.0.0 release note ([140/10](./10_version-and-release-stream.md)).

## Guardrails
- Never delete user files that are not provably generated; report them instead.
- Each script touches one kind of change and is idempotent.
- Syntax changes need a script too: old markup misrenders silently.

## Done when
- A copy of this repository's `default-docs/` migrates with `agentks migrate --yes`, verifies clean, and passes route and content parity.
- A consumer-mode 0.x fixture (framework subfolder, `CONFIG_DIR=../config`) migrates and starts with the new binary.
- Running the chain twice changes nothing the second time.

# 02 Status and Result
In progress. The eight 0.x scripts are ported and tested; the 1.0.0 scripts wait for the new format.

## Result
- **The 0.x chain**, on the main repository's `main` branch, in `apps/agentks-engine/migrations/docs/`: `0.1.0_done-to-state.py`, `0.1.1_state-to-status.py`, `0.1.2_legacy-custom-tags.py`, `0.1.2_root-settings-schema.py`, `0.2.0_agent-log-slot-numbering.py`, `0.2.0_agent-log-status-vocabulary.py`, `0.2.0_status-colors-to-css.py`, `0.2.3_slug-form-links.py`. Each is one file with inline dependencies (PyYAML 6.0.3), run as `uv run <script> detect|locate|dry-run|migrate|verify --root <project> [--json]`. The contract is in `apps/agentks-engine/migrations/README.md`; the chain and the gap finding are in `docs/README.md`. `apps/agentks-engine/migrations/library/README.md` exists with an empty chain.
- **Test:** `uv run apps/agentks-engine/migrations/tests/test_docs_chain.py` — 3 tests, about 1.6 s. `ctl test` runs it (`scripts/test/test.sh`), so the gate's test rung does too. One 0.0.0 fixture holds a leftover for every script; the test checks each `detect` finds it, runs the chain in version order, checks every `verify` passes, checks a second run changes nothing, and checks the shared code block is identical in all eight files.
- **Read-only run on this repository's `default-docs/`:** every `detect` is clean except `0.2.3_slug-form-links`, which refuses 25 links that name files that do not exist (19 in `2026-04-19-docs-phase-2/agent-log/030_wf_skills-v2-temp/`, 6 in `2026-08-02-refactor-efficiency-and-planning/`, pointing at `CLAUDE.md`, old plugin paths and a moved spec). They are pre-existing broken links, not slug links. 0.2.3 is below this repository's 0.3.10, so they do not block its own migration today. `0.2.0_agent-log-slot-numbering` reports 24 retired-shape agent logs, left as written.
- **The 0.2.3 → 0.3.10 gap.** Every release note from 0.2.4 to 0.3.10 says "No content migration", and the floor stayed at 0.2.0. Three changes touched content without a script: 0.2.4 stopped writing the `unit:` field on round files (the validator reports a leftover as an unknown key; none is left in this repository); 0.3.0 grew the theme contract from 53 to 65 required variables (only a theme with `override_mode: replace` is affected, silently; this repository has none); 0.3.6 added `superseded` (additive). So the 0.x chain is complete for content that loaded on its own engine. The first two go on the 1.0.0 list above.
- **Left:** the 1.0.0 scripts and everything after the port in the To Do list.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-engine/migrations/docs/`.

**Read first**
- [Project config](../../notes/02_engine/02_project-config.md), section 04 (what changes from 0.x).
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), sections 03 and 04.
- Today's scripts and README: [migration/](../../../../../../agent-ks-engine/migration/README.md); consumer and dogfood modes: [this repository's AGENTS.md](../../../../../../AGENTS.md), "Two operating modes".
- [Layouts](../../brainstorm/01_initial-discussion/11_layouts.md) — dropping custom layouts.

**Depends on:** [140/20 migrate command](./20_migrate-command.md), [020/20 config folder](../020_content-contract/20_config-folder.md), [100/10 theme contract](../100_layouts/10_theme-contract-and-css.md), [120/10 dep.yaml](../120_libraries/10_dep-yaml-and-lock.md).
**Unblocks:** [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md), [200/00 launch](../200_launch/00_overview.md) (moving this repository's docs and tracker).

# 04 Decisions
- Decided (claude, under sidhantha's delegation, 2026-10-01): a link that was already broken before the migration does not block it. The migration never guesses a target, so it leaves such a link unchanged and reports it; it fails only on a link it broke itself. Refusing to migrate a whole project over problems the migration did not cause helps nobody, and the report keeps them visible. This repository's 25 broken tracker links are fixed separately, as ordinary content fixes.
- Decided (claude, under sidhantha's delegation, 2026-09-30): `paths:` aliases stay in 1.0.0 ([020/20 config folder](../020_content-contract/20_config-folder.md)), so no script rewrites them.
- Decided (sidhantha, 2026-09-29): migrations are forced ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-29): user-authored custom layouts are dropped ([project config](../../notes/02_engine/02_project-config.md)).
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required.
- Decided (claude, 2026-09-30): a script finds its folders by reading `--root/config/site.yaml` (`pages.*.data` through the `paths:` aliases; trackers are the pages with `type: issues`) and touches nothing else, because in consumer mode the project folder can be a whole code repository whose own markdown is not content. If it cannot resolve the folders it exits 2 instead of guessing. `@root` resolves to the one 0.x framework folder found beside, above or inside the project; `--framework-root` overrides it.
- Decided (claude, 2026-09-30): tracker-only scripts (0.1.0, 0.1.1, 0.1.2 root settings, both 0.2.0 tracker scripts) scan trackers; the two markup scripts (custom tags, slug links) and the slot-numbering link pass scan every section folder, because links into an agent log can come from any section.
- Decided (claude, 2026-09-30): each script carries one identical shared block (arguments, scope, output) instead of importing a shared module, because the contract is one runnable file per script and a released script never changes. A test fails when the copies differ.
- Decided (claude, 2026-09-30): old `locate` and `relink` steps fold in: `locate` stays as a human view of `detect`; slot-numbering `migrate` always runs the link repair after its renames, so re-running it finishes a half-done run, and its `detect` reports stale links into renamed slots. The old `guide` step of the root-settings script becomes its `dry-run`/`migrate` output: paste-in text as blocking items for a person.
- Decided (claude, 2026-09-30): fixed two bugs while porting. `0.2.0_agent-log-status-vocabulary` treated `"status": "blocked"` in an issue's settings as the retired `blocked` label and would have cut the line to `"status":`; a key's value is now left alone. `0.1.2_legacy-custom-tags` read `{type=tip}` as `tip}` and fell back to NOTE; an unquoted value now stops at `}`, `,` or a quote.
- Decided (claude, 2026-09-30): the slug-link script's "nothing was read" guard reports but does not block, because the folders now come from `site.yaml`, so an empty read means an empty project rather than a mistyped path. Refused links still block `verify`, as before.
- Decided (claude, 2026-09-30): no new script for the 0.2.4 `unit:` leftover. A 0.2.4 script would not run for content already declaring 0.2.4 or later, so the 1.0.0 chain is the one place that reaches every project.

# 05 Notes & Analysis
## Watch out
- This repository's own content is at `engine_version: "0.3.10"`. The 0.x chain after 0.2.3 has no scripts; checked 2026-09-30, see Result.
- A combined dry run of a chain is a preview, not a promise: a later script's `detect` cannot see what an earlier script will write. For a 0.0.0 project, `0.1.1_state-to-status` sees no `state:` lines until `0.1.0` has written them. The `verify` pass after `migrate` is the real check.
- A very old 0.x `site.yaml` might give its tracker a page type other than `issues`. The tracker-only scripts would then find no tracker and report clean. Check this against the oldest supported content before trusting the chain for 0.0.0 projects.
