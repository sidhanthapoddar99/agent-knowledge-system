---
title: "M1 — benchmark run: raw metrics + graded results"
iteration: 1
agent: claude-fable-5
date: 2026-07-08
status: success
---

## Goal

Execute the 6-arm benchmark (sonnet / opus / fable × with / without the
agent-ks skills+CLI) over the 8 serial tasks and grade against ground truth.

## Approach

Six `general-purpose` agents, one per arm, each in an isolated git worktree;
identical task prompts except the tooling rule (skills arm: skills + CLI
allowed; no-skills arm: Skill tool, `plugins/`, and the CLI banned — repo
files + standard tools only). Metrics from the harness; accuracy graded by
mechanical checks against each worktree (frontmatter, sidecar parse,
vocabulary conformance, file existence) plus manual review of headings,
artifact theming, and note content.

## Raw metrics

| Arm | Tokens | Wall time | Tool calls | Score /11 |
|---|---|---|---|---|
| sonnet + skills | 103.6k | 7m 51s | 52 | 11.0 |
| sonnet − skills | 103.1k | 4m 17s | 35 | 10.5 |
| opus + skills | 83.1k | 6m 16s | 32 | 11.0 |
| opus − skills | 73.1k | 4m 27s | 29 | 9.5 |
| fable + skills | 79.9k | 4m 23s | 27 | 11.0 |
| fable − skills | 76.0k | 5m 0s | 27 | 10.75 |

Rubric (11 pts): T1 path 1 + exact dedup-section heading 1 (parent-only 0.5) ·
T2 FAQ edit 1 · T3 artifact 2 (valid placement, `NN_` prefix, parseable
sidecar with title, valid theme approach) · T4 issue metadata 1 · T5 issue
conventions 2 (slug, vocabulary-conformant settings.json, issue.md, subtask
with status) · T6 coverage note 1 (literal count, or wider count explicitly
justified) · T7 comment 0.5 · T8 validation depth 1.5 (tracker-aware 1.5 /
build + route verification 1.25 / build-only 1.0 / hand-checks 0.5).

## Grading notes

- **Every arm produced convention-valid output** on T2–T7: correct slug
  format, single valid component, valid status/priority, `NN_` prefixes,
  parseable sidecars, frontmatter'd notes/comments. Two rubric checks had to
  be corrected against reality: `issue.md` carries no frontmatter (title
  lives in settings.json), and artifacts consuming host `var(--color-*)`
  tokens are *site-mode* theming (preferred in-site), not a missing
  dual-theme.
- Deductions: opus−skills answered the parent heading instead of the dedup
  subsection (−0.5) and could only hand-validate (no CLI by rule, skipped
  the heavy build) (−1). sonnet−skills validated by build only (−0.5).
  fable−skills cited both parent + subsection and verified rendered routes
  (−0.25 only).
- T6 split 1 vs 3 pages: literal "shallow clone" appears on one page; the
  3-page arms counted `--depth 1` coverage and said so explicitly in their
  notes — both graded full.

## The incident: CLI worktree escape (2 independent reproductions)

Both sonnet+skills and opus+skills hit the same defect: run from inside
`.claude/worktrees/<agent>/`, `agent-ks` walks up, finds the MAIN repo's
`.env`, resolves the tracker to the main repo, and **wrote a comment file
outside the worktree**. Both agents caught it (git status discipline),
removed the stray file, and recovered — opus via explicit `--tracker`,
sonnet via a worktree-local `.env`. Main repo verified clean afterwards.
This is a real toolkit bug the benchmark surfaced: the `.env` upward walk in
`_env.mjs` should stop at (or special-case) a worktree boundary, or the
skill should mandate `--tracker`/local `.env` in worktrees.

## Next

01_summary.md carries the comparison verdict. Worktrees removed after
grading (three arms ran full builds — ~0.5 GB each); all graded evidence is
recorded here.
