---
title: "Tool + skill rename — agent-ks CLI, agent-ks-* skills"
status: review
---

The first executable slice of the rebrand, unblocked by the name lock
(agent-knowledge-system, decided with sidhantha 2026-07-08). The plugin's three
skills and the CLI dispatcher move to the new namespace; the plugin folder and
marketplace identity move later (see [50](50_plugin-rename-agent-ks.md)).

| Old | New |
|---|---|
| `documentation-guide` (skill) | `agent-ks-docs` |
| `doc-issues` (skill) | `agent-ks-issues` |
| `artifact-authoring` (skill) | `agent-ks-artifacts` |
| `docs-guide` (CLI entrypoint) | `agent-ks` |

## Tasks

- [x] Rename skill folders + `SKILL.md` frontmatter names; sweep all
      cross-references inside the plugin (sibling paths, prose, `plugin.json`
      description, plugin README, slash commands).
- [x] Rename the bin shims (`bin/agent-ks`, `bin/agent-ks.cmd`) and their
      internal CLI path; `.gitattributes` eol rules follow.
- [x] Repo surfaces: CLAUDE.md skills section (now 3 skills), root README
      plugin table (was stale — flat `docs-*` wrappers), data/README,
      user-guide (claude-skills page reworked, issues overview, workflows,
      artifact pages, versioning), dev-docs (plugins section, artifacts,
      routing, provenance), source-code comments, stale loader error strings
      (now point at repo-root `migration/`), `.claude/settings.local.json`.
- [x] Mirror the renamed plugin into the installed cache (skills + bin +
      commands + plugin.json + README), byte-identical; verify `agent-ks` on
      PATH resolves and runs. *(rsync + `diff -rq` clean; `which agent-ks`
      resolves to the cache bin.)*
- [x] Verify: CLI self-test (PASS), `agent-ks check skill-links` (clean),
      `agent-ks check issues` (4 pre-existing warnings in other issues only),
      production build (824 pages, clean). Executed on branch
      `rebrand/agent-ks`.

Tracker history under `data/todo/` is deliberately not rewritten — old names in
closed issues are history. Forward-looking references in *open* issues are
[subtask 30](30_open-issues-consistency.md).
