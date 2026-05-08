---
author: claude
date: 2026-05-08
---

## Superseded by `2026-05-08-runtime-stack-migration`

Closing this issue. The direction has shifted: instead of a Rust/Go CLI that *spawns* the existing Astro+Bun framework, the runtime itself is being rewritten in Go with the Vite-built frontend embedded into a single binary. The "CLI tool" is no longer a wrapper — **it is the framework.**

This change collapses several of the open design questions that were blocking progress here:

| Question on this issue | Resolution under runtime migration |
|---|---|
| Bun bootstrapping (require / auto-install / bundle) | N/A — Go binary, no Node/Bun runtime |
| Framework-version cache as separate git checkouts | N/A — binary IS the framework; version pinning is per-binary, not per-checkout |
| `docs.conf` / `docs.yaml` compose schema | Replaced by simpler `doc-engine.toml` (TOML) for run config |
| CLI language (Rust vs Go) | Go (locked in by the runtime decision) |
| Dual caching strategy (`notes/03_dual-caching-strategy.md`) | Framework-deps cache disappears entirely; only content cache survives |
| Shared core with editor (`2026-04-26-editor-as-standalone-product`) | Editor issue also closed; live-editor handled per phase 3 of the runtime migration |

What was kept (carried over verbatim or condensed) into the new issue:

- **Three usage methods** (CLI / from-source / Docker) — `notes/deployment-methods/01_three-methods.md`
- **Docker design** (topologies, nginx config, multi-stage patterns) — `notes/deployment-methods/02_docker-design.md`
- **Distribution channels** (curl-installer, Homebrew, GitHub releases, Docker registry, version pinning, update flow) — `notes/deployment-methods/03_distribution-channels.md`
- **Shell-wrapper absorption** (the 11 `docs-*` wrappers → `doc-engine docs ...` subcommands) — `notes/claude-plugin-upgrade/02_subcommand-migration.md`
- **The CLI-language-decision note's analysis** (Go is the right pick) — referenced; the underlying analysis still stands.

What was dropped:

- All Bun/Node bootstrapping plumbing (irrelevant)
- The "compose-style services" framing (overkill for a single-process binary)
- The `docs.yaml` schema (replaced by simpler TOML)
- The version-pinning-via-git-checkouts design (binary self-update is simpler)

### Action

- Status → `closed` on this issue.
- The 5 subtasks (01_root-alias, 02_manual-from-source, 03_method-1-cli-tool, 04_method-3-docker, 05_absorb-shell-wrappers-into-binary) are not migrated as-is — they'll be re-decomposed under the new issue when work begins, since the subtask shapes change with the runtime swap. Their *content* lives in the new issue's notes.
- The 3 notes (`01_docker-deployment-design.md`, `02_cli-language-decision.md`, `03_dual-caching-strategy.md`) stay here as the source-of-record for the analysis that informed both issues. The new issue references back rather than duplicating.

### Cross-reference

New issue: [`2026-05-08-runtime-stack-migration`](../../2026-05-08-runtime-stack-migration/issue.md)
