---
title: "Rename to agentks — every user-facing name, in one change"
status: open
---

The product becomes `agentks` everywhere a user sees it: the binary, the installer, environment variables, the home folder, help text, error messages and the plugin. A second name for the same thing is exactly what the rename removes, so there is no `agent-ks` alias. This leaf does the rename inside the new binary and lists everything that must follow it elsewhere.

# 01 To Do
- [ ] **Binary name** `agentks` (Cargo `[[bin]] name`), on every platform (`agentks.exe` on Windows).
- [ ] **Every string** in help, errors and output says `agentks`. A test greps the built binary's help output for `agent-ks` and fails on any hit.
- [ ] **Environment variables:** `AGENTKS_CONFIG_FOLDER` (unchanged), `AGENTKS_HOME`, `AGENTKS_PORT`, `AGENTKS_AUTO_UPDATE`. Remove every `AGENT_KS_*` or old name.
- [ ] **Home folder** `~/.agentks/` ([040/50](../040_caching/50_document-cache-by-location.md)); the updater's state moves there ([070/70](./70_update-and-shell-init.md)).
- [ ] **The development name.** In state 1, mise provides `agentks` for the working-tree build and a second name for the installed release, so maintainers can run both ([Rust CLI, section 08](../../notes/02_engine/05_rust-cli.md); the exact name is fixed by [010/00](../010_project-setup/00_overview.md)).
- [ ] **Hand-offs** (not done here, tracked by their owners): the installer script and archive names ([160/10](../160_distribution/10_installer-and-release-workflow.md)); the plugin and skills rename ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)); the final 0.x notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)); the docs ([180/00](../180_documentation/00_overview.md)).

## Guardrails
- No `agent-ks` alias, symlink or fallback name in the 1.x binary (sidhantha, 2026-09-29).
- 0.x keeps working under its own name until the switch-over; nothing here edits the old repository's CLI.

## Done when
- `agentks --version` and `agentks help` work; `strings` on the binary and a grep of all help output find no `agent-ks`.
- The test suite runs only with the new variable names.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-cli/`.

**Read first:**
- [Rust CLI, section 08 The rename](../../notes/02_engine/05_rust-cli.md).
- [2026-04-26-project-rebrand](../../../2026-04-26-project-rebrand/issue.md) — the earlier rename that fixed `agent-ks`, and what it had to touch.
- [Distribution and install, section 05](../../notes/05_delivery/04_distribution-and-install.md) — moving users over.

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md).
**Unblocks:** every other leaf in this group.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the installer and the binary are named `agentks`; the rename covers everything the user sees.
- Decided (sidhantha, 2026-09-29), recorded in the CLI note: `agentks` has no `agent-ks` alias; it all ships in 1.0.0.

# 05 Notes & Analysis

## Watch out
- Skills and docs that print commands are the easiest place for the old name to survive. The grep test covers the binary; [130/00](../130_ai-plugins/00_overview.md) and [180/00](../180_documentation/00_overview.md) need their own.
