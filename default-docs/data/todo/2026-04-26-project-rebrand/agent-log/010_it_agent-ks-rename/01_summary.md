---
title: "Summary — agent-ks rename shipped to review"
---

## Result

- **Plugin**: skill folders + `SKILL.md` names renamed; all sibling
  cross-references, `plugin.json` description, plugin README, and the three
  slash commands updated. Bin shims are `bin/agent-ks` + `bin/agent-ks.cmd`
  (the shim path into `skills/agent-ks-docs/scripts/cli.mjs` is functional,
  not cosmetic). Two historical asides deleted per the lean-skill rule
  (doc-agent absorption notes).
- **Repo surfaces**: CLAUDE.md skills section rewritten (now correctly lists
  3 skills), root README plugin table de-staled (it still advertised the
  retired flat `docs-*` wrappers), data/README's dead `.claude/skills/` paths
  fixed, user-guide claude-skills page reworked (3 skills incl. a new
  `agent-ks-artifacts` section, cache tree, "why three skills"), `/docs-init`'s
  CLAUDE.md-patch template modernized, dev-docs examples fixed, loader error
  strings now point at the real repo-root `migration/` scripts.
- **Cache mirror**: full rsync + `diff -rq` parity; `which agent-ks` resolves
  to the cache bin and runs.
- **Verification**: CLI self-test PASS; `agent-ks check skill-links` clean;
  `agent-ks check issues` only the 4 pre-existing warnings (other issues);
  production build clean (824 pages).

## Next

Fleet validation (read-only Haiku agents) over the committed state, requested
by sidhantha — findings, if any, land as a follow-up commit. Then human review
of subtask 10; subtasks 20–110 remain queued.
