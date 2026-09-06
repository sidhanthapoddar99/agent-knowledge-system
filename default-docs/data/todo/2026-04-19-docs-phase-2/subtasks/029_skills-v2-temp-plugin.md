---
title: "Skills v2 — build plugins/agent-ks-temp in the new shape"
status: in-progress
---

# Overview

Build a second plugin tree, `plugins/agent-ks-temp/`, in the new shape. It does not
replace `plugins/agent-ks` yet. It is the candidate for the next release.

The new shape: a `agent-ks-cli` skill that owns the code, the command reference and
the templates; flat STE references for docs, issues and artifacts; one body template
for every work file; a flat agent-log shape with no nesting; every command as a skill
folder so Codex reads it too.

Trigger: Sid, 2026-09-03. "Make the plugins here, copy content and format it or rewrite
it, I'll leave it up to you. Spawn multiple subagents, one per thing, self-reflect, max
effort, then review the output."

# References

- The spec: [the skills-v2 spec](../notes/skills-v2-spec.md). Goal, tree, rules, template, duties, log shape, never-table, per-builder specs, review criteria.
- The run: [030/01 the skills-v2 log summary](../agent-log/030_wf_skills-v2-temp/01_summary.md). Builder, reviewer, fix and integration reports sit in its `02_working/`.
- The first compaction pass, same design line: [019 skills compaction](./019_skills-compaction.md).
- Status vocabulary in code: `agent-ks-engine/src/loaders/issue-status.ts`.

# Todo list

- [x] Write the spec
- [x] Copy the code tree, the bin shims and the starter template into the new tree
- [x] Build a scratch tracker fixture for the rule test
- [x] Round 010: five builders (cli, docs, issues, artifacts, root)
- [ ] Round 020: one reviewer per output; the cli reviewer runs the code; the rule test — not run, Sid stopped here
- [ ] Round 030: fixes applied and re-checked — not run
- [ ] Round 040: whole-tree integration check — not run
- [ ] Sid reviews the tree, or restarts the review round

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at hand-off.

# Details

Decisions taken for this build are in spec section 15. The main ones:

- Templates are files in the cli skill, read at runtime by the scaffolders and checked by the validator. One source.
- Agent logs are flat. No `02_working/`, no `03_debrief/`, no index file, no child logs.
- Plans hold results at stage level. Never a copied status.
- `new-round` replaces `new-iteration`; the old name stays as an alias.
- The link rule and the markdown mechanics live in the docs skill's `writing.md`.

Decided (claude, 2026-09-03): the subtask template gains standard `##` sub-heads, agent logs move to the `index.md` shape and become opt-in, `add-agent-log` is retired. Reasoning and the full list: spec section 16.

Out of scope, listed in spec section 14: the framework loader, `guide.ts`, migrations,
the engine version bump, the release note, the swap of `plugins/agent-ks` for the new
tree.

Defect found during setup: `new-stage --subtask 10,20,30` writes `[10](10)`, a link
with a bare number as text and a path that resolves to nothing. The cli builder fixes it.
