---
title: "using-with-ai page — rewrite the 'planned' tooling framing to shipped reality"
status: open
---

Surfaced by the four-agent consistency audit on the lifecycle issue
(`2026-07-02-issue-lifecycle-and-creation-rules/agent-log/030_au_four-agent-consistency-audit/`,
milestone 102) and deferred out of that wave as its own concern.

`user-guide/19_issues/09_using-with-ai.md` still frames the AI tooling as a
*future design*: it describes an `/issues` skill at
`.claude/skills/issues/SKILL.md` plus helper scripts, gated behind
"⏸ Not implemented yet" markers. Reality shipped differently and is live — the
`agent-ks-issues` + `agent-ks-docs` skills (in the `agent-ks`
plugin) and the `agent-ks` CLI. The page therefore both names the wrong
architecture and presents it as unbuilt, contradicting `01_overview.md`, which
already points agents at the real skill. (The AI *rules* on the page — including
rule 7 on review-badge inheritance — were updated during the lifecycle wave;
it's the tooling/framing sections that are stale.)

- [ ] Rewrite the tooling sections present-tense around what shipped: the two
      skills, the `agent-ks` CLI (`issue` group + `check issues`), and the
      plugin install path — drop every "planned"/"not implemented" marker.
- [ ] Cross-check the result against the skills' own SKILL.md operating rules so
      the page and the skill can't drift (the skill is the full manual; the
      page is the user-facing summary).
- [ ] Reconcile with `05_getting-started` skill catalogue coverage (see
      `06_claude-skills-maintenance.md` in this issue — coordinate, don't
      duplicate).
- [ ] Verify: no `Not implemented` / `.claude/skills/issues` references remain
      on the page; build green.
