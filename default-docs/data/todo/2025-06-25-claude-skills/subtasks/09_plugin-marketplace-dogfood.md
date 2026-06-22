---
title: "Plugin marketplace · dogfood install · init slash commands · retire download-script"
state: closed
---

Switch the skill distribution model from "curl-down a `download-skills.sh`" to a **Claude Code plugin marketplace hosted in this same repo**. Dogfood it (this repo installs its own plugin), ship slash commands inside the plugin to bootstrap new projects, then update the docs and README to match.

One source of truth (`plugins/documentation-guide/`), one install command across all 30 framework instances, updates flow via `/plugin update`.

## Why this supersedes the old plan (subtask 07)

Subtask 07 (`07_update-readme-and-download-scripts.md`) planned a `download-skills.sh` / `download-skills.mjs` one-liner to recursively pull `references/` and `scripts/` into a consumer's `.claude/skills/`. The plugin marketplace replaces it on every axis:

- `/plugin install` is the existing UX consumers already know
- Updates come for free via `/plugin update` — no "re-run the script" step
- No path-decoupling cliffs caused by the user picking a non-standard install location
- Discovery is built into Claude Code's plugin system
- Scope handling (user / project / local) is automatic; the script approach has no concept of it

Once Part 1 of this subtask lands, **cancel subtask 07** with a comment pointing here.

## How plugins actually work (recap before reading further)

**Read `notes/claude-code-extensions-reference.md` first** for the full explanation. The short version that informs everything below:

- Plugin **files are cached ONCE at user level** in `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` regardless of which scope "installed" them
- Each scope's `settings.json` independently sets `enabledPlugins[<plugin-name>]: true` — that's the only per-scope state
- At session start the active plugin set is the **union** of `enabledPlugins` across Managed + Local + Project + User scopes; the plugin loads **once** even if multiple scopes enable it
- "Installing at project scope" is a misnomer — it's just "writing the boolean into the project's `settings.json`"; the files always live in user cache

Implication for dogfood: when this repo installs its own plugin, the marketplace add + plugin install just means (a) the plugin files land in *your* user-level cache and (b) a boolean gets written into a settings file. There's no project-level plugin cache; the project's `.claude/settings.json` (or `.claude/settings.local.json`) just carries the enable boolean for teammates who clone.

## Conceptual model — dogfood

The `documentation-guide` skill currently lives at `<repo>/.claude/skills/documentation-guide/` (project-local, hand-authored). After this subtask:

- **Canonical source on disk in this repo:** `plugins/documentation-guide/skills/documentation-guide/` (committed to git)
- **Project-local hand-authored copy:** deleted — this project becomes consumer #1 of its own marketplace
- **Marketplace manifest:** `.claude-plugin/marketplace.json` at the repo root, listing `documentation-guide` as the only plugin
- **Install loop for any project:** `/plugin marketplace add <this-repo-url>` once → `/plugin install documentation-guide@<marketplace-name>` per project
- **Project-scope dogfood for this repo:** add `enabledPlugins` boolean to this repo's `.claude/settings.json` so teammates who clone it auto-enable the plugin in their user cache
- **Where the skill loads from in this repo, after dogfood:** `~/.claude/plugins/cache/<marketplace>/documentation-guide/<version>/skills/documentation-guide/SKILL.md` — same as every other consumer

You're consumer #1 — any breakage in path resolution, `${CLAUDE_PLUGIN_ROOT}` interpolation, or skill loading shows up in your own usage immediately.

## Parts (track each as a checkbox)

The order below is intentional. Parts 1-3 build the architecture; Parts 4-5 update the user-facing surfaces **after** the architecture works.

- [ ] **Part 1 — Retire the download-script direction**
  - Cancel subtask 07 (`07_update-readme-and-download-scripts.md`) with a one-paragraph comment explaining the pivot to plugin-marketplace and pointing at this subtask
  - If any download-script stubs already exist (under `scripts/install/`, `tools/install/`, etc.), delete them
  - Search the tracker for `download-skills` / `curl.*bash` mentions and reconcile (most likely some agent-log entries; just leave a note pointing here)

- [ ] **Part 2 — Create the marketplace + dogfood**
  - Add `.claude-plugin/marketplace.json` at the repo root, listing `documentation-guide` as the only plugin
  - Move `<repo>/.claude/skills/documentation-guide/` → `plugins/documentation-guide/skills/documentation-guide/` (full subtree: `SKILL.md` + `references/` + `scripts/`)
  - Add `plugins/documentation-guide/.claude-plugin/plugin.json` with: `name`, `version: "0.1.0"`, `description`, `author`, `homepage`, `repository`. Keep it minimal.
  - Add `plugins/documentation-guide/README.md` and `plugins/documentation-guide/LICENSE` (matches the convention in `notes/claude-code-extensions-reference.md`)
  - **Path decoupling — the highest-risk piece.** The skill body has many literal `bun .claude/skills/documentation-guide/scripts/issues/list.mjs` paths. After install, those paths point nowhere because the skill loads from `~/.claude/plugins/cache/...`. Two strategies, try in order:
    1. Replace literal paths with `${CLAUDE_PLUGIN_ROOT}/scripts/issues/list.mjs` interpolation. Verify Claude Code resolves the env var inside skill markdown bodies (it does in commands and hooks; markdown is the question). Test with one path first before mass-replacing.
    2. Fallback: ship slash-command wrappers (`/docs-list`, `/docs-show`, `/docs-subtasks`, etc.) inside the plugin's `commands/` folder, and have the skill body say "run `/docs-list --search foo`" instead of the bun invocation. This is also a UX win — slash commands are nicer than long bun paths.
  - Verify the helper scripts' `findProjectRoot()` (in `_lib.mjs`) still walks correctly from inside `~/.claude/plugins/cache/...` toward the consumer's `dynamic_data/`. Walking up from the cache should NOT find a `dynamic_data/`; the function should fall back to `process.cwd()` discovery (which is what `findProjectRoot` does today — verify behaviour explicitly).
  - Delete the project-local `<repo>/.claude/skills/documentation-guide/` after the move. **Don't keep both** — the project-local copy and the plugin copy would create the kind of confusion the architecture was designed to avoid.
  - Add `enabledPlugins: { "documentation-guide@<marketplace-name>": true }` to the repo's committed `<repo>/.claude/settings.json` so teammates auto-enable on clone.
  - Update `.gitignore` to exclude `.claude/plugins/` if anything cache-related leaks in; the install cache lives in `~/.claude/plugins/`, not the repo, so this should be a no-op verification.
  - Add a short note in `CLAUDE.md` pointing future agents at the installed `documentation-guide` skill (especially the `settings-layout.md` reference for `site.yaml` / `navbar.yaml` work and the `issue-layout.md` reference for the tracker), so the agent knows the skill is available without having to discover it.
  - **Verification:** `/plugin marketplace add <repo-path>` (plain absolute or relative path — `file://` URLs are rejected as "Invalid marketplace source format" in the interactive UI) → `/plugin install documentation-guide@documentation-template` → `/reload-plugins` → run `docs-list --priority high` to confirm the wrapper is on PATH and works end-to-end.

- [x] **Part 3 — Init slash commands inside the plugin (`/docs-init` + optional `/docs-add-section`)** — landed in `plugins/documentation-guide/commands/{docs-init,docs-add-section}.md`. Both verified by `/reload-plugins` after install.

  After Part 2 ships, bundle slash commands inside the plugin's `commands/` folder so consumers can scaffold a new docs project from zero with one command. Reduces "clone framework, copy starter files, edit settings, write CLAUDE.md" to one prompt.

  **Primary command: `/docs-init`** — interactive bootstrap

  Flow the model walks the user through:
  1. **Pre-flight check.** Detect whether the current directory is already initialised (`dynamic_data/` exists, or any of the canonical folders are populated). If yes, abort with a one-liner pointing at `/docs-add-section` instead.
  2. **Ask: scope.** "Is this entire repo going to BE the docs site, or should the docs live in a subfolder?"
     - Whole repo → initialise at the repo root
     - Subfolder → ask for the folder name (default `docs`), create it, initialise inside
  3. **Initialise the canonical structure** (matching the framework's expected shape — read the framework's actual conventions, don't hand-code the names):
     ```
     <chosen-root>/
     ├── assets/                    ← logos, images, served at /assets/
     ├── config/                    ← site.yaml, navbar.yaml, footer.yaml
     ├── data/                      ← content (user-guide/, blog/, todo/, …)
     ├── layout/                    ← project-wide custom layouts (optional)
     ├── themes/                    ← custom themes
     └── documentation-template/    ← framework engine — git-cloned for now;
                                       once 2026-04-25-framework-as-npm-package
                                       lands, this becomes `bun add documentation-template`
     ```
  4. **Seed starter files** so the project boots:
     - `config/site.yaml` with sensible defaults (site name, theme, one `pages:` entry)
     - `config/navbar.yaml` and `config/footer.yaml` minimally populated
     - `data/user-guide/05_getting-started/01_welcome.md` + sibling `settings.json`
     - `README.md` at the chosen-root
     - `.gitignore` if at repo root (`node_modules/`, `.astro/`, `dist/`)
  5. **Patch `CLAUDE.md`** at the **repo root** (create if absent). This is the *single most important output* — without it, future Claude Code sessions in this project don't know:
     - Where the docs folder is (especially if subfolder option was chosen)
     - That the `documentation-guide` skill is installed and applicable to this project (the skill triggers on description, but a CLAUDE.md note adds belt-and-braces grounding)
     - The build commands (`bun run dev`, `bun run build`)

  **Secondary command: `/docs-add-section`** (optional, lower priority)

  Same project, scaffold a new top-level section under `data/`:
  1. Ask: section name (kebab-case)
  2. Compute next `XX_` prefix by scanning siblings
  3. Create `data/<XX>_<name>/settings.json` with default label + position
  4. Create starter `data/<XX>_<name>/01_overview.md` with frontmatter
  5. Optionally prompt to add a corresponding `pages:` entry to `config/site.yaml`

- [x] **Part 6 — Dev-docs `25_plugins/` section (added on user ask, ~1300 lines)** — top-level + 6-page deep-dive subfolder explaining the plugin architecture from the maintainer's POV. Sources distilled from `notes/claude-code-extensions-reference.md` and `notes/plugin-build-guide.md`. Validator clean. Out-of-band relative to the original Parts 1-5 plan but lands ahead of Parts 4-5 because it's the architecture-explanation surface that the user-guide and README will both link into.

  ```
  dev-docs/25_plugins/
  ├── 01_overview.md · 02_storage-and-scope.md · 03_installation.md · 04_marketplaces.md
  └── 05_creating-plugins/
      ├── 01_ecosystem-mental-model.md · 02_plugin-structure.md · 03_capabilities.md
      └── 04_bin-wrappers.md · 05_testing-locally.md · 06_versioning-and-publishing.md
  ```

- [x] **Part 4 — Update the user-guide docs**
  - Rewrote `05_getting-started/05_claude-skills.md` end-to-end — full plugin-install flow, slash commands documented (`/docs-init`, `/docs-add-section`), 11-wrapper inventory, `/plugin update` cycle, on-disk cache layout. Cross-links to dev-docs `25_plugins/` for the architecture deep-dive.
  - Replaced the "Claude Code Skills (Optional)" block in `05_getting-started/02_installation.md` with the marketplace flow + a pointer at `/docs-init` for fresh-project setup. Trimmed redundancy — the catalogue page is now the canonical surface.
  - Swept the user-guide for `download-skills` / `curl … | bash` mentions: only the two install touchpoints above carried them. The "skill" mentions in `19_issues/*` are generic (skill triggers, AI workflow) and don't reference the install flow.

- [x] **Part 5 — Update the README** (created at repo root — there was no README before)
  - Project description, then the 4-command quick start (`/plugin marketplace add` → `/plugin install` → `/reload-plugins` → `/docs-init`) as the very first thing a new user sees
  - Surface table for the plugin (skill, slash commands, 8 tracker wrappers, 3 validators)
  - Manual-setup fallback for users who don't want the plugin
  - Build commands, repo layout map, dogfood note (this repo IS the marketplace)
  - "What's coming" pointer at `2026-04-25-framework-as-npm-package` as the next chapter for engine packaging

## Out of scope

- Publishing to a public / community marketplace (this subtask only sets up the user's own GitHub repo as a marketplace; community distribution is its own decision later)
- Versioning policy beyond an initial `0.1.0` in `plugin.json`. Semver discipline matters once there are 30 consumers; for now any push to `main` is "the latest"
- Multi-plugin marketplace structure. We have one plugin (`documentation-guide`); the manifest leaves room to add more later
- Replacing the per-script `bun` invocation with full slash-command coverage if `${CLAUDE_PLUGIN_ROOT}` interpolation works in skill markdown. Slash commands are a *fallback* unless they prove to also be a UX win
- Migration commands for *existing* projects to adopt the structure — covered by `2026-04-25-framework-as-npm-package/subtasks/06_migration-playbook-for-existing-projects.md`

## Cross-references

- `notes/claude-code-extensions-reference.md` — full reference on plugin/skill/command/MCP/scope architecture, with the cache-vs-registration model that informs Part 2
- `2026-04-25-framework-as-npm-package` — sister issue covering the engine-as-npm-package refactor; once it lands, `/docs-init` migrates from `git clone documentation-template` to `bun add documentation-template`
