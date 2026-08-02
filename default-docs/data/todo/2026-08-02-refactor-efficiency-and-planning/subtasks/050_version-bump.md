---
title: "Version bump — agent-ks 0.7.0"
status: open
---

# Overview

Ship the whole issue as **agent-ks 0.7.0**. A minor bump rather than a patch: a
new issue section, a retired `agent-memory/plans/` shape, a renamed CLI verb and
a content migration are breaking for consumers.

**Done when** the version is bumped, the marketplace listing matches reality, and
a consumer repo can upgrade and run the migration without hand-editing anything.

# References

- Everything under [Execution](./040_execution/00_overview.md) must land first
- Version source of truth: `plugins/agent-ks/.claude-plugin/plugin.json`
- Marketplace listing (separate repo):
  `sids-plugin-marketplace/.claude-plugin/marketplace.json`
- Migration convention: `migration/<to-version>_<statement>.py`

# Todo list

- [ ] Bump `plugins/agent-ks/.claude-plugin/plugin.json` → `0.7.0`
- [ ] Update the plugin `description` — skills, section list, CLI verb count
- [ ] Sync the marketplace listing (see the drift note below)
- [ ] Confirm the migration script is named for `0.7.0` and is idempotent
- [ ] Smoke-test a real consumer upgrade end to end
- [ ] Verify the CLI verb count in the description against `agent-ks help`

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Version lives in exactly one place here, and one more elsewhere

Grepped 2026-08-02: `0.6.7` appears **once** in this repo, in
`plugins/agent-ks/.claude-plugin/plugin.json`. Good — nothing else to chase.

But the **marketplace repo carries its own copy of the long description**, and
it has already drifted: it advertises *"28 CLI commands"* where this repo's
`plugin.json` says *29*, and `agent-ks help` currently lists 33 entries
including `new-memory-plan`, `new-subtask` and `theme tokens` that the
description never mentions.

This is the audit's own finding in miniature — **a fact with two homes drifts,
and nobody notices.** Worth deciding whether the marketplace description should
be generated from `plugin.json` rather than maintained twice. That is a small
piece of work with a permanent payoff, and it belongs to this subtask because
this is when the drift becomes visible.

## Why minor, not patch

Consumers must act: run a migration, and stop using `new-memory-plan`. Under this
project's continuous-shipping convention that is a minor bump, not a major one —
but it is emphatically not a patch, and shipping it as one would leave consumers
upgrading silently into a broken plan path.
