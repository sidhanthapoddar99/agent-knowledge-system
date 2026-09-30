---
title: "Rename to agentks — every user-facing name, in one change"
status: in-progress
---

The product becomes `agentks` everywhere a user sees it: the binary, the installer, environment variables, the home folder, help text, error messages and the plugin. A second name for the same thing is exactly what the rename removes, so there is no `agent-ks` alias. This leaf does the rename inside the new binary and lists everything that must follow it elsewhere.

# 01 To Do
- [ ] **Binary name** `agentks` (Cargo `[[bin]] name`), on every platform (`agentks.exe` on Windows).
- [ ] **Every string** in help, errors and output says `agentks`. A test greps the built binary's help output for `agent-ks` and fails on any hit.
- [ ] **Environment variables:** `AGENTKS_CONFIG_FOLDER` (unchanged), `AGENTKS_HOME`, `AGENTKS_PORT`, `AGENTKS_AUTO_UPDATE`. Remove every `AGENT_KS_*` or old name.
- [ ] **Home folder** `~/.agentks/` ([040/50](../040_caching/50_document-cache-by-location.md)); the updater's state moves there ([070/70](./70_update-and-shell-init.md)).
- [ ] **The development name.** In state 1, mise provides `agentks` for the working-tree build and a second name for the installed release, so maintainers can run both ([Rust CLI, section 08](../../notes/02_engine/05_rust-cli.md); the exact name is fixed by [010/00](../010_project-setup/00_overview.md)).
- [ ] **Error output**, handed here by [030/20](../030_rust-engine/20_error-model.md): the CLI prints each `ErrorRecord` in its `Display` form (`file:line: kind: message (key K)`, then `  fix: suggestion` on its own line), and `--json` prints the records themselves.
- [ ] **Hand-offs** (not done here, tracked by their owners): the installer script and archive names ([160/10](../160_distribution/10_installer-and-release-workflow.md)); the plugin and skills rename ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)); the final 0.x notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)); the docs ([180/00](../180_documentation/00_overview.md)).

## Guardrails
- No `agent-ks` alias, symlink or fallback name in the 1.x binary (sidhantha, 2026-09-29).
- 0.x keeps working under its own name until the switch-over; nothing here edits the old repository's CLI.

## Done when
- `agentks --version` and `agentks help` work; `strings` on the binary and a grep of all help output find no `agent-ks`.
- The test suite runs only with the new variable names.

# 02 Status and Result
In progress. Everything inside the binary is done (wave 2, branch `wave2/cli`); one hand-off item is left: the second mise name for the installed release, which is a root `.mise.toml` change owned by project setup, outside the cli crate.

## Result
- The binary is `agentks` (`crates/cli`, `[[bin]] name = "agentks"`). `agentks --version` prints `agentks 1.0.0`; `agentks help` lists 65 commands.
- Every help text, error and output says `agentks`. The test `catalog::tests::no_help_text_names_the_old_binary` renders the long help of every command, the command list, the conventions and every `help --json` entry, and fails on `agent-ks` or `AGENT_KS`. `strings` on the built binary finds no `agent-ks`.
- Environment variables the CLI reads: `AGENTKS_CONFIG_FOLDER`, `AGENTKS_HOME`, `AGENTKS_AUTO_UPDATE`. The 0.x `AGENTKS_UPDATE_DIR` is gone (the home replaces it). `AGENTKS_PORT` is read by the config crate.
- Update state lives in `~/.agentks/update.json` (`MachineHome::update_file`), with `update.lock` beside it.
- Error output: `src/output.rs` prints `agentks: <message>` on stderr, then each `ErrorRecord` in its `Display` form (`file:line: kind: message (key K)` and `  fix: …`). Under `--json`, a failure also writes `{"error": {"kind", "message", "records"}}` to stdout, with the records themselves.
- **Left:** the second name for the installed release in state 1 (today `.mise.toml` puts `data/builds/agentks` first on the PATH inside the repo, so the working-tree build shadows the release, but there is no second name for the release yet).

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

**Read first:**
- [Rust CLI, section 08 The rename](../../notes/02_engine/05_rust-cli.md).
- [2026-04-26-project-rebrand](../../../2026-04-26-project-rebrand/issue.md) — the earlier rename that fixed `agent-ks`, and what it had to touch.
- [Distribution and install, section 05](../../notes/05_delivery/04_distribution-and-install.md) — moving users over.

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md).
**Unblocks:** every other leaf in this group.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the installer and the binary are named `agentks`; the rename covers everything the user sees.
- Decided (sidhantha, 2026-09-29), recorded in the CLI note: `agentks` has no `agent-ks` alias; it all ships in 1.0.0.
- Decided (claude, 2026-10-01): a failed command under `--json` writes one error document (`{"error": {"kind": "usage|not-implemented|failed", "message", "records"}}`) to stdout as well as the message on stderr, because an agent that parses stdout otherwise gets an empty string it cannot tell from a crash. Today's toolkit wrote nothing to stdout on failure. Clap's own usage errors (exit 2) still write only to stderr.
- Decided (claude, 2026-10-01): a closed stdout (`agentks … | head`) exits 0 silently, as today's toolkit does, because the reader chose to stop.

# 05 Notes & Analysis

## Watch out
- Skills and docs that print commands are the easiest place for the old name to survive. The grep test covers the binary; [130/00](../130_ai-plugins/00_overview.md) and [180/00](../180_documentation/00_overview.md) need their own.
