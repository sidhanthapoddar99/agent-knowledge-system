---
title: "GitHub issues layout (later stage)"
status: open
---

A later-stage built-in layout that shows the issues of a linked GitHub repository inside an agentks site. agentks signs in to GitHub once per machine and keeps the token in the machine home; the token never reaches a browser or a built site. This leaf holds the design constraints and the questions that stage must settle, so it can start cold when scheduled. It is not part of 1.0.0.

# 01 To Do
- [ ] **Settle the stage's questions** first, as decisions in this leaf: read-only or write; live data, build-time snapshot, or both; one repository or several; reuse the tracker's issue UI or a plain list; keychain first or the credentials file only.
- [ ] **Sign-in** with GitHub's device flow (`agentks auth login github`), least access (read issues; more only for a private repository), token in the OS keychain with `~/.agentks/credentials.json` (mode 600) as fallback; optionally reuse the `gh` CLI's token.
- [ ] **Config** in `site.yaml`: `github.repo: https://github.com/<owner>/<repo>`; the layout is placed like any section.
- [ ] **Data path.** Locally, the Rust server calls GitHub and sends results as page data. Published: a build-time snapshot, and for a private repository only if the site is private.
- [ ] **Layout** in `agentks-ui/src/layouts/github-issues/default/`, reusing tracker parts from [25](./25_issues-layouts.md) if that is the decision.

## Guardrails
- The token never reaches the browser or the static output.
- Writing to GitHub publishes on the user's behalf and needs its own decision from sidhantha.

## Done when
- The stage's questions are decided and recorded here, and a linked public repository's issues render locally and in a static build with no token in any output (checked by a grep of the build output and the network log).

# 02 Status and Result
Open. Later stage; not scheduled for 1.0.0.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`.
- **Read first:** [the GitHub issues layout](../../brainstorm/02_future-stages/06_github-issues-layout.md), [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (section 09), [machine home](../../notes/02_engine/06_machine-home-and-build-cache.md) (credentials).
- **Depends on:** [25](./25_issues-layouts.md), [070_cli](../070_cli/00_overview.md) for `auth` commands.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): a GitHub issues layout, with machine-level GitHub sign-in, is a later stage.

# 05 Notes & Analysis
## Watch out
- Without a token, the browser can call GitHub's public API only 60 times an hour per visitor; a snapshot is the reliable published option.
