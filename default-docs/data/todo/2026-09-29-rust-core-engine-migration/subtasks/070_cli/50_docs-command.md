---
title: "Docs command — `agentks docs [page]` opens the hosted docs"
status: open
---

After the migration there is no framework checkout on a user's machine, so the docs no longer sit next to the tool. They live at `agentks.neuralabs.org/docs`, latest version only. `agentks docs` opens them in the browser, and `agentks docs <page>` opens one page. The command ships when the site is live (launch step 5); before then it would open a page that does not exist.

# 01 To Do
- [ ] **`agentks docs`** opens `https://agentks.neuralabs.org/docs` with the system browser (`open` crate or equivalent; `xdg-open`, `open`, `start`).
- [ ] **`agentks docs <page>`** opens a page by short name. The name → path map is built from the published docs' index at release build time (the docs' `llms.txt` or a small generated table embedded in the binary), so names stay correct for the version that shipped. An unknown name lists close matches and exits `1`.
- [ ] **`--print`** (and automatically when there is no display, for example over SSH) prints the URL instead of opening it.
- [ ] **`--json`** returns `{ "url": "…" }` and never opens a browser — for agents.
- [ ] **Reachability:** no network check before opening (it would slow the command); if the browser cannot be launched, print the URL and say so.
- [ ] **Agent route:** the help text tells agents that each docs page has a raw markdown twin and an `llms.txt` index on the site ([150/00](../150_publishing/00_overview.md)).

## Guardrails
- Do not bundle or download the docs (sidhantha, 2026-09-29/30).
- Ships with launch step 5; until then the command is hidden from `help` behind a build flag, not half-working.

## Done when
- `agentks docs --json` prints the docs URL; `agentks docs issues --json` prints the issues page URL; `agentks docs nosuchpage` suggests matches and exits `1`.
- On a desktop, `agentks docs` opens the browser.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

**Read first:**
- [The agentks docs command (brainstorm)](../../brainstorm/02_future-stages/08_agentks-docs-command.md).
- [Rust CLI, section 03](../../notes/02_engine/05_rust-cli.md).
- [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md) — the site's URL layout.

**Depends on:** [195/00 hosting](../195_hosting/00_overview.md) (the site must be live), [180/00](../180_documentation/00_overview.md) (the page names).
**Unblocks:** skills that point users at the docs ([130/00](../130_ai-plugins/00_overview.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `agentks docs` opens agentks.neuralabs.org/docs; the docs are hosted, latest only.
- Decided (claude, 2026-09-30): the command ships at launch step 5, once the site is live.
- Decided (claude, 2026-09-30): page names come from a table generated from the published docs at release build time.

# 05 Notes & Analysis

## Watch out
- A page renamed on the live site after a release breaks that release's `docs <page>`. The site should keep redirects for renamed pages ([195/00](../195_hosting/00_overview.md)).
