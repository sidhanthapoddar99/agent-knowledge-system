---
title: "Absorb the 11 shell wrappers into the CLI binary"
state: cancelled
---

Today the framework ships 11 CLI wrappers (`docs-list`, `docs-show`, `docs-subtasks`, `docs-agent-logs`, `docs-set-state`, `docs-add-comment`, `docs-add-agent-log`, `docs-review-queue`, `docs-check-blog`, `docs-check-config`, `docs-check-section`) as bash wrappers inside the Claude Code plugin (`plugins/documentation-guide/bin/`). Each wrapper exec's a `.mjs` script via `bun`. This means the tooling only works inside Claude Code with the plugin loaded *and* requires Bun on PATH.

Once we have the Method-1 Go binary (subtask `03_method-1-cli-tool`), it makes sense to absorb the wrappers as subcommands — `docs list`, `docs show`, `docs check-config`, etc. Single binary, no Claude/Bun dependency for tooling, usable in CI, coherent UX.

## Language choice

> See **[`notes/02_cli-language-decision.md`](../notes/02_cli-language-decision.md)** for the full cross-language comparison (C / Rust / Go / Zig / Bun-compile / Deno-compile) with both tables and the misleading-metrics caveats. Working assumption: **Go**, with shell-out to `bun scripts/...` for the 3 validators.

## Checklist

- [ ] **Lock in language decision** — confirm Go (or pick Bun-compile if framework-internal access for validators outweighs startup cost; see note 02).
- [ ] **Inventory the 11 wrappers + their backing `.mjs` scripts** — short table mapping each wrapper to its script and what it touches (tracker FS, framework loader, etc.).
- [ ] **Classify each wrapper as native-port vs shell-out**:
   - Native (pure tracker FS + JSON/YAML/MD): `docs list`, `docs show`, `docs subtasks`, `docs agent-logs`, `docs set-state`, `docs add-comment`, `docs add-agent-log`, `docs review-queue`.
   - Shell-out to `bun scripts/...` (framework loader integration): `docs check-blog`, `docs check-config`, `docs check-section` — unless we choose Bun-compile and unify them.
- [ ] **Port the 8 native wrappers to Go subcommands** under the Method-1 binary. Schemas (`settings.json` vocabulary, frontmatter shapes) get modelled in a small Go package — keep it minimal, no over-engineering.
- [ ] **Wire shell-out for the 3 validators** — Go binary spawns `bun scripts/check-*.mjs`, streams stdout/stderr, propagates exit code. (Only if Go is chosen; with Bun-compile, all 11 are native.)
- [ ] **Drop `bin/docs-*` wrappers from the plugin** — replaced by the binary's subcommands. Keep the **2 slash commands** (`/docs-init`, `/docs-add-section`) — those are user-facing chat commands, not CLI tools.
- [ ] **Update the `documentation-guide` skill** — references change from `docs-list ...` to `docs list ...`, etc. Single sweep across `SKILL.md` + the 5 reference files.
- [ ] **Update CLAUDE.md, README, user-guide** — any place that lists the 11 wrappers needs the subcommand form.
- [ ] **Drop `bun` from the plugin's hard dependencies** if the validator shell-out is gone (i.e. Bun-compile chosen) — the plugin then needs only the binary on PATH.

## Why this is filed under the cli-tool issue

The work is parallel to subtask `03_method-1-cli-tool` (which builds the Go binary that runs the framework via compose). This subtask extends that same binary with the tracker / validator subcommands. No new binary, no new toolchain — just additional Cobra commands.

## Out of scope

- Reimplementing framework loaders / theme resolution / validation logic in Go. We shell to `bun` for those (or accept the Bun-compile binary if we go that route).
- Rebranding (`docs` → final binary name) — handled by the rebrand issue.
- Adding *new* tracker commands — port-only for now; new functionality is its own subtask.
