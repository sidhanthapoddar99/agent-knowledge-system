# Distribution brainstorm — from npm-package to tool-package

> **Resolved →** [`comments/003_superseded-by-runtime-stack-migration.md`](../comments/003_superseded-by-runtime-stack-migration.md) — superseded by [`2026-05-08-runtime-stack-migration`](../../2026-05-08-runtime-stack-migration/issue.md)

This log captures the conversation that pivoted the distribution direction from "framework as an npm package" (issue `2026-04-25-framework-as-npm-package`) to "framework as a standalone tool with three usage methods." It's a thinking log, not a polished spec — written so the reasoning survives long enough to drive subtask design later.

## Origin — today's `astro-doc-code/` move

Earlier today we restructured the repo:

- `src/`, `astro.config.mjs`, `package.json`, `bun.lock`, `tsconfig.json` moved into a new top-level `astro-doc-code/` folder.
- `dynamic_data/`, `plugins/`, `.claude*`, `.env*`, `CLAUDE.md`, `README.md`, and a new `start` bash wrapper stayed at the repo root.
- Two surgical source edits made it work: `astro-doc-code/src/loaders/paths.ts` now exports both `frameworkRoot` (where `src/` lives) and `projectRoot` (the repo root, where `dynamic_data/` and `.env` live); `astro-doc-code/astro.config.mjs` derives `repoRoot` from `__dirname` and uses it for `loadEnv()`, `CONFIG_DIR`/`LAYOUT_EXT_DIR` resolution, and Vite `fs.allow` (replacing `process.cwd()`).
- Build verified passing (326 pages, ~10s); user-guide / plugin / README all updated to reflect the new shape.

This was framed at the time as "the first concrete step toward `2026-04-25-framework-as-npm-package`" — and it still is, in the sense that the framework / content split is foundational for any distribution shape. The npm-vs-tool-package question got opened later in the same session.

## The pivot question

The user opened the next round by asking about adding a `@root` alias that points at the repo root (where `dynamic_data/` lives), not the framework root. Discussing it surfaced the deeper architectural question: *when the framework is shipped, what does the consumer's repo actually look like?* I sketched three npm-style models (publish `astro-doc-code/` as a dep + thin shell, full template clone, hybrid scaffolder). The user pushed back on all of them and described what they actually want:

> we have a docs folder ... we have a separate folder where the repo lies ... in the docs folder we can have a `.env` which defines the config, the host and port, the layout extension if any, and optionally the location of the repo: blank is cached in temp folder or something

That reframed everything. The model isn't "consumer's repo has `node_modules/framework/` inside it" — it's "consumer has a pure content folder, framework lives elsewhere (cached, global, or pinned), tool reads `docs.conf` and runs the framework against the content folder." The Hugo / MkDocs / `npx` pattern, not the npm-dep pattern.

## The vision (user, paraphrased)

**Three usage methods, all running the same framework underneath:**

### Method 1 — CLI tool (the ideal)

- Installed via `curl … | sh` (with optional zsh/bash PATH integration).
- Binary name: `astro-doc` (placeholder — naming decision still open).
- A small Rust binary, target ≤30 MB.
- Config: `docs.conf` in the docs folder (a deliberate, named replacement for `.env`).
- Docker-style CLI flags: `--config` (default `./docs.conf`), `--production` (default false; controls hot-reload), `--help`, `--host`, `--static` (default false; static build), `--detached` / `-d`.
- Internally: downloads and version-manages the framework as git checkouts under a cache directory.

### Method 2 — Manual

- Clone the framework repo, set env / `docs.conf`, run `start`. The current developer flow, basically.

### Method 3 — Docker

- Same UX as Method 1 but containerised. Mount `docs.conf` and the docs volume.
- A Claude skill generates a `Dockerfile` (and possibly `docker-compose.yml`) for the user's chosen mode (static prod export, dev with hot-reload, future editor mode, etc.). The skill picks the right base image and CMD.

The architectural requirement: **all three methods must support all modes the framework offers.** Static build, dev with hot-reload, future editor-server mode, future collab-server mode — each method should be able to run any of them.

## The architectural insight that makes it all work

The convergence point is this: **the framework exposes a stable interface as `package.json` scripts (`dev`, `build`, `preview`, and later `editor-server`, `collab-server`, ...). All three methods just call those scripts.**

- **Method 1 (CLI):** Rust binary internally runs `bun run <script>` against the cached framework dir, with env vars and cwd set per `docs.conf` + flags.
- **Method 2 (Manual):** user runs `bun run <script>` directly inside the cloned framework dir, with env or `docs.conf` set themselves.
- **Method 3 (Docker):** the container's `CMD` is `bun run <script>` with mounted volumes.

The framework code stays oblivious to how it was launched. It needs only: a working directory (the docs folder), its own location (the framework root), and config (`docs.conf` parsed or env vars set, doesn't care which).

**Implication:** don't make the CLI smart about modes. Make the framework expose modes as scripts; the CLI is a dumb forwarder. New modes ship by adding a script to `package.json` and a flag to the CLI; all three methods pick them up automatically without per-method work.

## The Node/Bun reality (named explicitly)

The Rust CLI does **not** replace Node. The framework is Astro, which is JS-based. The CLI's actual job is:

1. Manage framework versions (git clone, checkout, cache under `~/.cache/astro-doc/versions/<ver>/`)
2. Parse `docs.conf` and merge with CLI flags
3. Resolve paths so the framework can find the docs folder (set `CONFIG_DIR`, `LAYOUT_EXT_DIR`, etc. into env)
4. Make sure Bun (or Node) is available
5. Spawn `bun run <script>` and forward stdin/stdout/signals

Step 4 is a real design decision. Three options:

| Option | Binary size | Self-contained | UX |
|---|---|---|---|
| Require user-installed Bun | 5–10 MB | No (errors if Bun missing) | "install bun first, then `astro-doc`" |
| Bootstrap Bun on first run | 5–10 MB | Yes (auto-installs Bun to `~/.cache/astro-doc/runtime/bun/`) | First run does extra setup; like Volta/fnm |
| Bundle Bun in the binary | 50–80 MB | Yes (zero external deps) | Single binary, but blows the 30 MB target |

**Working assumption:** bootstrap (option 2). Hits the size target, gives the "no install needed" UX, doesn't touch system Bun if already present. Decision should be confirmed in a subtask.

## On `.env` → `docs.conf`

The user's instinct is right (move to a named config file), but the *reason* given was "`.env` is unsecure and unnecessary." That phrasing isn't quite right — `.env` and `docs.conf` have identical filesystem semantics; both are files, both leak if committed. Worth correcting in subsequent design docs so downstream readers don't over-engineer security around `docs.conf`.

The actual reasons to move are:

- **Explicitness** — named config file vs implicitly auto-loaded dotfile. The CLI reads `docs.conf` because the user pointed it at one; nothing magic.
- **Typed schema** — `docs.conf` can be validated against a known shape; `.env` is always strings.
- **Scoping** — `docs.conf` is unambiguously "config for the docs tool"; `.env` is generic and may collide with other tools that also load `.env` from cwd.
- **Future-extensibility** — `docs.conf` can grow nested sections (e.g. `[framework]` for version pinning, `[server]` for host/port, future `[editor]` for collab settings) without inventing a multi-`.env` convention.

## Open design decisions

These are the questions that need subtask-level answers before building. None are blocking the discussion, but they shape the implementation order.

1. **`docs.conf` format.** TOML matches the docker-CLI feel and has strong precedent (`Cargo.toml`, `pyproject.toml`); YAML matches existing `site.yaml` and feels continuous with the rest of the project's config; custom INI is bad — don't invent a format. TOML probably wins for a pure config file; worth a one-paragraph subtask to lock it in.
2. **Version pinning per-project.** Likely shape:
   ```toml
   [framework]
   version = "0.5.0"   # or "main", or a git sha
   ```
   CLI fetches the named version into `~/.cache/astro-doc/versions/<ver>/` on first run. Multiple versions coexist. Default to "latest stable" if unspecified.
3. **CLI language: Rust vs Go.** Both work. Rust pulls double-duty if the editor extraction (`2026-04-26-editor-as-standalone-product`) also goes Rust — they could share base crates. Go is faster to write, smaller resulting binary (5–8 MB unbundled), simpler dependency story, more than fast enough for spawn-and-forward work. **Don't pick Rust just for performance** — it's a CLI, neither language matters speed-wise. Pick Rust for shared-core synergy with the editor; pick Go for shipping speed.
4. **Bun handling** — see the table above. Working assumption: bootstrap. Confirm in a subtask.
5. **Windows support.** `curl … | sh` doesn't work on Windows natively. A parallel `iwr -useb get.astro-doc.dev/install.ps1 | iex` PowerShell script is needed, plus path-handling tweaks. Decide upfront whether Windows is first-class or "later."
6. **Naming.** `astro-doc` couples the tool to Astro's brand. If the engine ever swaps (or rebrands), the name is stuck. Worth considering an engine-agnostic name (`litdocs`, `bookbinder`, etc.) or owning Astro publicly. Decision can wait until the rest of the design is firm.
7. **The Rust shared-core question (cross-cuts with `2026-04-26-editor-as-standalone-product`).** That issue proposes a Rust core (yrs CRDT, file I/O, persistence) shared between a server binary, a Tauri desktop app, and a web frontend. If we go Rust here too, the CLI and the editor's coordinator could share base crates (config parsing, path resolution, version cache). Worth surfacing the option before either issue commits to a language.

## Suggested implementation order

Method 2 first, Methods 1 and 3 on top.

1. **Method 2 (manual).** Get the framework running cleanly when invoked from a separate docs folder, with `docs.conf` instead of `.env`. Cherry-pick subtasks from `2026-04-25-framework-as-npm-package` for the engine refactors that need to happen anyway:
   - Externalise `paths.ts` so the framework takes project root as input (already partly done by today's `frameworkRoot` / `projectRoot` split — finish the job)
   - Make `astro.config.mjs` consume `docs.conf` instead of `.env`
   - Decide and document which env vars / config keys exist
2. **Method 1 (CLI).** Once the framework's "scripts as the interface" pattern is locked in, the CLI is just a packaging layer. Build the version cache, the `docs.conf` parser, the spawn-and-forward logic, the install script.
3. **Method 3 (Docker).** Base image bakes the framework + Bun cache; Dockerfile (skill-generated) mounts the user's docs folder. Cherry-pick from `2025-06-25-deployment/subtasks/02_deployment-skill.md` for the skill structure.

## What we're not deciding yet

- Exact CLI flag set beyond the docker-style sketch (`--config`, `--production`, `--host`, `--static`, `-d`). Will firm up when the script interface is locked.
- Whether the CLI ships its own update mechanism or relies on `curl … | sh` re-runs.
- Plugin model — does the CLI know about `documentation-guide` and similar plugins, or are they fully framework-side?
- Multi-tenancy / shared cache layout when multiple users share a machine.

## What was rejected (and why)

- **Pure npm package** (the original `2026-04-25-framework-as-npm-package` direction) — would put the framework inside `node_modules/` of every docs folder. Couples docs folders to a `package.json`, makes the docs folder feel like "a Node project," doesn't give clean CLI ergonomics. The user explicitly wants no `npm install` step.
- **Two separate frontends in the desktop/web split** (mentioned in the editor discussion earlier) — same instinct applies here: collapse symmetric paths into one shared interface where possible. The framework's script interface is that shared point for distribution.
- **Bundling Bun into the CLI binary** — blows the 30 MB target without proportional UX gain. Bootstrap on first run wins.

## Cross-issue notes for follow-up

- `2026-04-25-framework-as-npm-package` — needs to be either renamed/repurposed or marked superseded. Its architectural subtasks (`02_path-and-config-externalization`, `03_astro-integration-packaging`) are still valid foundation; cherry-pick into this issue. The npm-publish pieces (`05_build-and-publish-pipeline`) become irrelevant.
- `2025-06-25-deployment/subtasks/02_deployment-skill.md` — already plans a Claude skill for Dockerfile/compose generation. Method 3 here uses the same skill pattern; subtask is reusable verbatim or with minor scope expansion.
- `2026-04-26-editor-as-standalone-product` — share the Rust shared-core question. Both issues should reference each other once the language decision is firm.
