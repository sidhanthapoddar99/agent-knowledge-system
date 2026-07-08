---
title: "Summary — do the agent-ks skills earn their keep? (6-arm benchmark)"
---

## Verdict

**The skills buy correctness-depth and precision, not raw speed — and the
conventions themselves are the real star.** Every arm, including the
no-skills ones, produced convention-valid tracker and doc output: CLAUDE.md
plus the repo's own self-describing structure (existing issues as examples,
`settings.jsonc` vocabulary comments, example artifacts with sidecars)
carried even skill-less Sonnet to a near-perfect mechanical score. That is
the system working as designed — the repo teaches its own conventions.

What the skills+CLI measurably added:

1. **Validation depth** — only skills arms ran tracker-aware validation
   (`agent-ks check issues/section`) and could *prove* their work clean
   against pre-existing warnings. No-skills arms fell back to full builds
   (4–5 minutes of bun install, or skipped as too heavy).
2. **Perfect scores across all three models** — every with-skills arm hit
   11/11; every no-skills arm dropped something (heading precision,
   validation depth).
3. **Model equalization** — with skills, Sonnet matched Fable on accuracy.
   Without, weaker precision showed (opus−skills' parent-heading answer).

Costs: with-skills runs used ~5–40% more tokens and were slower for
sonnet/opus (skill loading + CLI exploration; sonnet also burned time
recovering from the CLI worktree escape). **Fable+skills was the best
overall arm**: top score, fewest tool calls (27), 4m23s, 80k tokens.

## The one real finding

`agent-ks` run inside a git worktree **escapes to the main repo**: the
`.env` upward walk (`_env.mjs`) exits `.claude/worktrees/<agent>/` and
resolves CONFIG_DIR against the outer checkout — two arms independently
wrote a comment into the real tracker before catching and reverting it.
Fix options (either suffices): stop the upward walk at a worktree boundary
(`.git` file vs dir is detectable), or have the skill mandate `--tracker` /
a local `.env` when `git rev-parse --git-common-dir != --git-dir`.
**Recommended follow-up issue** — not filed yet.

## Table

| Arm | Score /11 | Tokens | Time | Calls |
|---|---|---|---|---|
| fable + skills | **11.0** | 79.9k | 4m23s | **27** |
| opus + skills | 11.0 | 83.1k | 6m16s | 32 |
| sonnet + skills | 11.0 | 103.6k | 7m51s | 52 |
| fable − skills | 10.75 | 76.0k | 5m00s | 27 |
| sonnet − skills | 10.5 | 103.1k | 4m17s | 35 |
| opus − skills | 9.5 | **73.1k** | 4m27s | 29 |

Full rubric, per-arm grading detail, and the incident narrative:
[101_run-and-metrics.md](101_run-and-metrics.md).
