---
title: "Docs: the CLI reference, generated from the binary"
status: open
---

Every `agentks` command, its arguments, flags, examples and exit codes, as a set of reference pages. The binary already describes itself (`agentks help --json` returns the full catalog), so the reference is generated from that output rather than written by hand. It can then never disagree with the release it documents.

# 01 To Do
- [ ] **A generator** in the main repository (`apps/agentks-engine/tools/gen-cli-docs` or a `ctl docs-cli` verb) that runs the built binary's `help --json` and writes one markdown page per command group into `docs/data/user-guide/65_cli-reference/`, with a `settings.json` and `NN_` prefixes in catalog order.
    - [ ] Each page: the synopsis, the description, every flag with its type and default, examples, exit codes, and the config precedence line where it applies.
    - [ ] An index page listing every command with its one-line description.
- [ ] **A freshness check** in the gate: regenerate into a temporary folder and fail when the committed pages differ. A command change then needs its docs regenerated in the same commit.
- [ ] **Hand-written overview** at the top of the section: global flags, `--json` output, exit codes, how agentks finds the project.
- [ ] **Link from the user guide** to the relevant reference page wherever a command is first introduced.

## Guardrails
- Never hand-edit a generated page. Fix the help text in the binary instead.
- Group rules in [180/00 overview](./00_overview.md).

## Done when
- The generator writes the section, and it renders with the new engine.
- The freshness check fails when a flag's help text changes without regenerating, and passes after regenerating.
- Every command in `agentks help --json` has a page.

# 02 Status and Result
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis

## Watch out
- The generator runs the built binary. In CI it must use the same build as the rest of the gate, not an installed release.
