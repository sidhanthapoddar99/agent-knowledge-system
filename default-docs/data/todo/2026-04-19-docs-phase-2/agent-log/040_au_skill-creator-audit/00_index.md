---
title: Index
---

Audit all ten agent-ks skills against the skill-creator plugin's guide and the house rules, one Opus reviewer per skill, so we can improve every skill
Serves: [agent-ks-docs + agent-ks-issues skills — compact and dedupe](../../subtasks/019_skills-compaction.md)

## Files

Ten Opus reviewers, one per skill, all given the same brief. Each report follows the brief's shape: verdict, measured sizes, findings table, trigger test, proposed description, dry run, cut and add.

- [05_brief.md](./05_brief.md) — the brief every reviewer read: why, the eight checks, the house rules, the report shape
- [06_fix-brief.md](./06_fix-brief.md) — the brief every fix agent read: read order, edit rules, gates to run
- [10_agent-ks-config.md](./10_agent-ks-config.md)
- [11_agent-ks-docs.md](./11_agent-ks-docs.md)
- [12_agent-ks-blog.md](./12_agent-ks-blog.md)
- [13_agent-ks-issues.md](./13_agent-ks-issues.md)
- [14_agent-ks-issue-logs.md](./14_agent-ks-issue-logs.md)
- [15_agent-ks-qna.md](./15_agent-ks-qna.md)
- [16_agent-ks-artifacts.md](./16_agent-ks-artifacts.md)
- [17_agent-ks-cli.md](./17_agent-ks-cli.md)
- [18_agent-ks-quick-idea-note.md](./18_agent-ks-quick-idea-note.md)
- [19_agent-ks-index-check.md](./19_agent-ks-index-check.md)
- [20_fixes.md](./20_fixes.md) — the verdict on every finding, the cross-cutting decisions A to I, the deferred list
- [07_reaudit-brief.md](./07_reaudit-brief.md) — the brief every second-round reviewer read: closure, regressions, fresh eyes, the dry run again
- [21_fixes-round-2.md](./21_fixes-round-2.md) — the verdict on every second-round finding, decisions J to L, the engine and CLI table
- Second round, fresh reviewers, one per skill: [30_agent-ks-config.md](./30_agent-ks-config.md) · [31_agent-ks-docs.md](./31_agent-ks-docs.md) · [32_agent-ks-blog.md](./32_agent-ks-blog.md) · [33_agent-ks-issues.md](./33_agent-ks-issues.md) · [34_agent-ks-issue-logs.md](./34_agent-ks-issue-logs.md) · [35_agent-ks-qna.md](./35_agent-ks-qna.md) · [36_agent-ks-artifacts.md](./36_agent-ks-artifacts.md) · [37_agent-ks-cli.md](./37_agent-ks-cli.md) · [38_agent-ks-quick-idea-note.md](./38_agent-ks-quick-idea-note.md) · [39_agent-ks-index-check.md](./39_agent-ks-index-check.md)

## Verdict

Two rounds. Round one: 10 reviewers, ~150 findings, every skill "needs fixes"; the verdict on each is in [20_fixes.md](./20_fixes.md), one reject, the rest fix or defer. Round two: 10 fresh reviewers on the fixed skills; every round-one fix ruled closed or partly closed, none open, ~60 new findings, three blockers; the verdict on each is in [21_fixes-round-2.md](./21_fixes-round-2.md). All round-two fixes are applied. No third review round ran; the orchestrator read the five riskiest passages and the gates are green: `check skill-links`, `_selftest.mjs`, `check issues`, `check config` (repo and template), `./start build` (1342 pages).

Engine changes from this audit: the agent-log slot rule now keys on a folder's name and its parent, not its depth (`issues.ts` `readAgentLogGroups`). CLI changes: `check links` removed; `new-round --json` carries `indexUpdated`; `check config` resolves hyphenated aliases and `@root`; `--kind` help lists `re`; `check issues` flag help corrected. Engine 0.3.10, plugin 0.11.0, note in `releases/0.3.10.md`.

Decisions taken alone and flagged: A (engine and CLI win over the user guide), the engine fix, removing `check links`, the plugin minor bump. J was first written wrong (`\|`) and corrected.

## Handover

Open, in the deferred tables of the two verdict files. The largest: the user-guide re-sync (`19_issues/`, `18_blogs/`, `16_layout-system/`, `10_configuration/02_env.md`, `data/README.md`); the CLI exit-code unification and self-test checks; the docs sort tuple ignoring a file's own prefix (engine, reorders sidebars, Sid's call); the 35 legacy `01_summary.md` logs; the dump issue's bucket shape. Three single-file skills grew past the old sizes and stay exempt from the cap: blog 1074 body words, quick-idea-note 1163, issue-logs 743 with a reference. Tagging `v0.3.10` is Sid's.
