---
title: "Docs and skills say the same thing"
status: open
---

The AI skills are the agent's operating manual; the docs are the user's. In 1.0 they must describe the same system: the same commands, the same content rules, the same tracker model. The plugin port ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)) rewrites the skills for the new version; this leaf makes the two sets consistent before the switch-over. It links each skill topic to its hosted docs page, removes facts the skills copy from the docs or the binary, and runs a cross-check. It takes over the skills work left in [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) (subtasks 019 and 029).

# 01 To Do
- [ ] **Map topics.** A table of every skill reference file against the docs page that covers the same topic. Record it in this leaf's Result.
- [ ] **Link, don't copy.** Each skill links to its hosted page (`https://agentks.neuralabs.org/docs/…`) for background, and names the command that prints a fact (`agentks help …`, `agentks theme tokens`) instead of copying it.
- [ ] **Cross-check claims.** For every rule a skill states (statuses, prefixes, link form, frontmatter fields, log kinds), check it against the docs page and the binary. Fix whichever is wrong; when the code and the text disagree, the code wins.
- [ ] **Carry over the unfinished skills-v2 work.** Read the [skills-v2 spec](../../../2026-04-19-docs-phase-2/notes/skills-v2-spec.md) and [subtask 029](../../../2026-04-19-docs-phase-2/subtasks/029_skills-v2-temp-plugin.md): the review, fix and integration rounds never ran. Apply their review criteria to the rewritten 1.0 skills instead of reviving the 0.x temp plugin.
- [ ] **The issue guide.** If the 1.0 issues layout keeps a bundled "Guide" panel (today's [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts)), keep it in step with the tracker skill: the skill carries the full manual, the guide carries the map.
- [ ] **A consistency run.** A fresh agent with only the 1.0 plugin and the docs performs five tasks (create an issue with subtasks, write a docs page, add a library, fix a broken link, publish); record where the skill and the docs disagreed.

## Guardrails
- Skills describe the current system only; no history ([AGENTS.md](../../../../../../AGENTS.md), "skills are lean and history-free").
- Only `AGENTS.md` instruction files in the new repositories, no `CLAUDE.md` ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).
- Don't edit the 0.x plugin in this repository; it stays in use until the switch-over.

## Done when
- Every skill topic has a docs page and a link to it, and the topic map is recorded.
- The cross-check finds no rule stated differently in a skill, a docs page and the binary.
- The consistency run's five tasks complete with no disagreement left unfixed.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `plugins/agentks/` and `docs/data/`.
- **Read first:**
  - [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — the two plugins, "skills never copy facts the binary can print".
  - [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 03 ("the docs link into the skills' topics and the skills link to hosted pages").
  - Today's skills: [plugins/agent-ks/skills](../../../../../../plugins/agent-ks/skills).
  - Absorbed: [docs-phase-2 subtask 019](../../../2026-04-19-docs-phase-2/subtasks/019_skills-compaction.md) and [subtask 029](../../../2026-04-19-docs-phase-2/subtasks/029_skills-v2-temp-plugin.md).
- **Depends on:** [130/10 agentks plugin port](../130_ai-plugins/10_agentks-plugin-port.md), [130/20 library dev plugin](../130_ai-plugins/20_library-dev-plugin.md), the other leaves of this group.
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the skills for the new version are ready before the switch; then everything switches at once ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (claude, 2026-09-30): the unfinished skills-v2 review is applied to the rewritten 1.0 skills, not to the 0.x temp plugin, because the temp plugin describes a system that is being replaced.

# 05 Notes & Analysis

## Watch out
- Hosted links only resolve once the site is live ([195](../195_hosting/00_overview.md)). Check them with a link checker at launch, not before.
