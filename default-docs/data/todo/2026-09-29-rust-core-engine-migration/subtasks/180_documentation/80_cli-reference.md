---
title: "Docs: the CLI reference, generated from the binary"
status: in-progress
---

Every `agentks` command, its arguments, flags, examples and exit codes, as a set of reference pages. The binary already describes itself (`agentks help --json` returns the full catalog), so the reference is generated from that output rather than written by hand. It can then never disagree with the release it documents.

# 01 To Do
- [ ] **A generator** in the main repository (`apps/agentks-engine/tools/gen-cli-docs` or a `ctl docs-cli` verb) that runs the built binary's `help --json` and writes one markdown page per command group into `docs/data/user-guide/65_cli-reference/`, with a `settings.json` and `NN_` prefixes in catalog order.
    - [ ] Each page: the synopsis, the description, every flag with its type and default, examples, exit codes, and the config precedence line where it applies.
    - [ ] An index page listing every command with its one-line description.
- [ ] **A freshness check** in the gate: regenerate into a temporary folder and fail when the committed pages differ. A command change then needs its docs regenerated in the same commit.
- [x] **Hand-written overview** at the top of the section: global flags, `--json` output, exit codes, how agentks finds the project.
- [ ] **Link from the user guide** to the relevant reference page wherever a command is first introduced.

## Guardrails
- Never hand-edit a generated page. Fix the help text in the binary instead.
- Group rules in [180/00 overview](./00_overview.md).

## Done when
- The generator writes the section, and it renders with the new engine.
- The freshness check fails when a flag's help text changes without regenerating, and passes after regenerating.
- Every command in `agentks help --json` has a page.

# 02 Status and Result
In progress. The hand-written overview and a hand-written command map are in `user-guide-2/65_cli-reference/` (0 errors from `check section` and `check link-form`); the generator, the freshness check and the links from the user guide are still to do.

## Result
This is the hand-written map, not the generated reference. It was written from the CLI worktree's clap tree (`crates/cli/src/args/`) and command table (`crates/cli/src/catalog/table.rs`), 65 commands.

- [65/01 The agentks CLI](../../../../user-guide-2/65_cli-reference/01_overview.md) (about 790 words): how agentks finds the project (`--config-dir` > `AGENTKS_CONFIG_FOLDER` > `./config`), commands that need no project, human and `--json` output with the stderr diagnostic format and the JSON error shape, exit codes, unknown flags, getting exact flags (`agentks help`, `help <group>`, `help <group> <command>`, `--help`, `help … --json` and its fields), what each command needs (network, `git`, `magick`, Bun or Node, `uv` or Bun), and commands that ask before removing. This is the overview the To Do item asks for, and it stays when the generated pages arrive.
- [65/05 Command map](../../../../user-guide-2/65_cli-reference/05_command-map.md) (about 870 words): every command group in one table row each (reading content, the tracker, checks and files, the local app, projects and publishing, libraries and cache, sharing) and the global flags, with `agentks help <group> <command> [--json]` for exact flags. The generator's index page replaces it.

The video and voice commands in the Rust CLI note (`check video`, `video …`, `voice …`) are not in the CLI worktree and are left out while the video format is revised.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `docs/data/user-guide/65_cli-reference/` and the generator.
- **Read first:**
  - [The Rust CLI](../../notes/02_engine/05_rust-cli.md) — the command surface and output conventions.
  - Today's catalog, for the JSON shape: run `agent-ks help --json` in this repository; the command reference in the CLI skill ([cli-toolkit.md](../../../../../../plugins/agent-ks/skills/agent-ks-cli/references/cli-toolkit.md)).
- **Depends on:** the [070/00 CLI](../070_cli/00_overview.md) group.
- **Unblocks:** [180/95 skills update](./95_skills-update.md) (skills link to these pages), [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the reference is generated from `agentks help --json` and checked for freshness in the gate, so it cannot drift from the binary.
- Decided (claude, 2026-10-01): until the generator exists, the section holds the hand-written overview (01) and a hand-written command map (05); the generated group pages take prefixes after 05 and the generated index replaces 05. The leaf stays in-progress, because its deliverable is the generator.

# 05 Notes & Analysis

## Watch out
- The generator runs the built binary. In CI it must use the same build as the rest of the gate, not an installed release.
