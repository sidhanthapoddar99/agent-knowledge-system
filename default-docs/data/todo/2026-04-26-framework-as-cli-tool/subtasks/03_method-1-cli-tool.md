---
title: "Method 1 — CLI tool (Go binary, compose-driven, strict)"
state: cancelled
---

> **Prerequisite:** [`2026-04-26-project-rebrand`](../../2026-04-26-project-rebrand/issue.md) must lock the project + binary name before this subtask completes. The placeholder `astro-doc` is used throughout this design; substitute the real name at implementation time.

The "ideal way" usage path. A small Go binary, installed via `curl … | sh`, that reads a `docs.yaml` compose file and runs the framework. Single-source-of-truth philosophy — the compose file IS the run definition; no ad-hoc flag-driven runs, no env-var overrides, no detached-mode bookkeeping.

## Status

Design firm (see `brainstorm/01_discuss_distribution.md` for the discussion that produced it). Implementation depends on:

1. **Subtask 02** (Method 2 from-source) verified working — gives the underlying behaviour the CLI just spawns
2. **Subtask 01** (`@root`, defaults rename, template, init) — provides the template `docs.yaml` for `astro-doc init` to scaffold
3. **`2026-04-26-project-rebrand`** locking the binary name + install domain

## Design philosophy

The compose file is the unit of work. There are no ad-hoc flags that change *what* runs — if you want different behaviour, you edit the compose file (or copy it to a variant and use `--config`). Everything else falls out of this:

- **Foreground only.** Ctrl-C to stop. No PID files, no log management, no detached-instance bookkeeping. Signals propagate cleanly: CLI → bun → framework.
- **No env-var overrides.** Strict. The compose file is the only source of runtime config. CI scripts that need a variant template a different compose file (or use `--config`).
- **No flag explosion.** Only two flags affect run behaviour: `--config <path>` (which compose file) and `--verify` (validate without running). Service selection is positional: `astro-doc compose <service>...`.

Deliberate tradeoff: ad-hoc convenience traded for reproducibility. Most projects have one stable run mode; the compose file captures it; running is one command.

## Command surface (6 things)

```bash
# Run services from compose
astro-doc compose [--config <path>] [--verify] [<service>...]

# Project lifecycle
astro-doc init                # scaffold from the template (subtask 01)

# CLI lifecycle
astro-doc upgrade             # update the CLI binary itself

# Cache management
astro-doc cache list          # show cached framework versions + sizes
astro-doc cache prune         # remove old/unused framework versions
astro-doc cache clear         # nuke the entire cache

# Meta
astro-doc --version
astro-doc --help
```

Hard to misuse. Forward-compatible: new services = new entries in compose; CLI surface doesn't grow.

## `docs.yaml` schema (compose-style, forward-compatible)

```yaml
framework:
  version: "0.5.0"            # cached as ~/.cache/astro-doc/versions/0.5.0/
  # source: ./local-fork/     # optional escape hatch — point at a local checkout instead of the cache

services:
  renderer:                   # the Astro server (only service that exists today)
    mode: dev                 # dev | static | build
                              #   dev    → Astro dev server, content HRM (see callout below)
                              #   static → serve a pre-built site (no HRM at all)
                              #   build  → one-shot build, exit when done
    production: false         # default false. when true: hide dev toolbar, hide live editor,
                              #   suppress debug routes. independent of `mode` — you can run
                              #   `mode: dev, production: true` for a prod-feature-set with HRM.
    port: 4321
    host: localhost
    config_dir: ./config      # paths relative to docs.yaml location
    layout_extensions: ./my-layouts

  editor:                     # only relevant once the editor extraction lands
    enabled: false            # default: skip if not enabled
    port: 5173
```

The `services:` block is forward-compatible. Today there's one service; tomorrow (per `2026-04-26-editor-as-standalone-product`) there will likely be 2–4 (renderer, editor, collab, search). The CLI runs all enabled services, or only the named subset.

> [!note]
> **HRM behaviour differs between Method 1 and Method 2 — important to set expectations correctly in the user-guide.**
>
> - **Method 1 (CLI, this subtask):** The framework code is fetched into `~/.cache/<name>/versions/<ver>/` and treated as an immutable build artifact. **Content HRM works** — edits to markdown, `site.yaml`, themes, and anything under the user's docs folder hot-reload as expected. **Framework-code HRM does not apply** — you're not expected to edit files inside the cache; the CLI doesn't watch them, and changes there would be wiped on the next `astro-doc upgrade` or version switch.
> - **Method 2 (from-source, subtask 02):** You have the full framework source in the repo you cloned. **Both content AND framework-code HRM work** — edit a layout, a parser, `astro.config.mjs`, anything under `astro-doc-code/src/`, and Astro's normal HMR picks it up. This is the contributor / framework-hacker path.
>
> If a Method 1 user wants to hack on framework code, the supported route is to switch to `framework.source: ./local-fork/` (point at a local checkout) — at that point they're effectively in Method 2's editing model with Method 1's CLI ergonomics.

## Cache layout

```
~/.cache/astro-doc/
├── versions/                  # framework checkouts (git working trees)
│   ├── 0.5.0/
│   ├── 0.6.0/
│   └── main/
└── runtime/
    └── bun/                   # bootstrapped Bun (option 2 from earlier discussion)
```

No `instances/` folder — there are no detached instances to track.

`astro-doc cache list` shows what's cached + sizes. `prune` keeps the current version + N most recent. `clear` removes everything.

## Distribution

- **Language:** Go (decision recorded in brainstorm/01_discuss_distribution.md — Rust only wins if the CLI shares a core with the Rust editor backend; Go is the right call for a pure CLI).
- **Output:** single static binary per platform (linux-x86, linux-arm, mac-x86, mac-arm, windows-x86 — see open question on Windows).
- **Hosting:** an install domain (TBD via rebrand issue). `https://<domain>/install.sh` and `https://<domain>/install.ps1`.
- **Installer:** `curl https://<domain>/install.sh | sh` — downloads the platform-appropriate binary, drops it in `~/.local/bin/<name>`, optionally adds to `$PATH` in `~/.zshrc` / `~/.bashrc` (with the user's consent).
- **First run:** detects no cached framework version, fetches the latest stable into `~/.cache/<name>/versions/`. Detects no Bun in cache, bootstraps it into `~/.cache/<name>/runtime/bun/`.
- **`astro-doc upgrade`:** re-runs installer logic — HEAD-checks the install URL, redownloads if newer.

## Tasks

- [ ] Coordinate with rebrand issue to lock the binary name + install domain
- [ ] Lock the `docs.yaml` schema (services block, framework block, supported config keys per service)
- [ ] Build the Go CLI: command parsing, compose YAML parser + validator, version cache, Bun bootstrap, spawn-and-forward
- [ ] Build the install script (`install.sh` + `install.ps1`) and host it
- [ ] Build `astro-doc init` to scaffold from the template (subtask 01)
- [ ] Build `astro-doc cache` subcommands (list / prune / clear)
- [ ] Build `astro-doc upgrade`
- [ ] Document the CLI itself: usage, schema, install, upgrade, cache management (reference doc for Method 1)
- [ ] **Three-methods overview in the user-guide** — write a top-level "How to run this" page that walks through all three methods side-by-side: Method 1 (CLI), Method 2 (from-source), Method 3 (Docker). **Document Method 3 even before implementation lands** — frame it as "planned" with a clear scope note, so users see the full distribution story up front and can choose. Cross-link each method's deep-dive page from this overview.
- [ ] **Update the Claude Skills** (`plugins/documentation-guide/skills/documentation-guide/SKILL.md` + relevant references) so the AI orientation includes the three-methods model and routes to the right method based on user intent (CLI for end-users, from-source for contributors, Docker for self-hosters / production).

## Open questions

1. **Where is "the latest stable version" defined?** A `latest.json` at a known URL? A git tag query against the framework repo? A version manifest? Decide before `init` / `upgrade` ship.
2. **`init` template source — local cache or remote?** When the user runs `init`, copy from `~/.cache/<name>/versions/<latest>/template/` (already downloaded), or pull from a separate template repo? Lean toward the cached framework version — single source of truth.
3. **Windows support priority.** `curl | sh` doesn't work natively. Need parallel `iwr | iex` PowerShell installer + path-handling tweaks. Decide first-class or "later."
4. **Compose-file auto-discovery.** Like `docker-compose` looking for `docker-compose.yml` in cwd? Or always require explicit `--config`? Auto-discovery is friendlier; pick one.

## Out of scope

- The rebrand itself (separate issue: `2026-04-26-project-rebrand`)
- Editor-server / collab-service CLI integration — those services don't exist yet; their compose entries land when they do
- Multi-user / shared-cache machine semantics
- Plugin system for the CLI itself (e.g., user-defined commands) — not needed in v1
- Env-var overrides for compose values — explicitly rejected; CI uses `--config`
