---
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-02
---

# A/B results — 8 agents, 4 scenario pairs

## Goal
Run the paired experiment designed in `00_goal.md` and grade both arms against the
operating-rules rubrics.

## Approach
- 8 background agents in parallel: with-skill arms read the repo `doc-issues`
  SKILL.md (identical to installed v0.4.0) + had `docs-guide`; baseline arms were
  barred from `plugins/`, `.claude/`, and the CLI (but, unavoidably, still received
  repo `CLAUDE.md`).
- Graded from each agent's report AND the on-disk artifacts;
  `docs-guide check issues --tracker` re-run after all writes.

## Result

| Pair | Skill arm | Baseline arm |
|---|---|---|
| S1 work-an-issue (Opus) | **Full pass** — note with `title:`, `it` activity folder (goal/summary/milestone), subtask → `review` citing the human-only-close rule, self-validated | **Hard fail on lifecycle** — flipped the subtask to `closed` (human-only transition); note missing `title:` frontmatter; otherwise good shape (proper `lp` activity folder, handoff comment) |
| S2 idea capture (Sonnet) | **Pass** — dump entry, litmus-test rationale, post-write validation | **Pass** — dump entry, correct format; reasoned from the tracker's own embedded conventions (vocabulary comment + dump contract) |
| S3 graduation (Opus) | **Full pass** — note + `Resolved →` marker + subtask unblocked + handoff comment + validation; 15 tool uses | **Full pass (minus comment)** — found the convention by reading the user-guide pages the rules were propagated into today; 22 tool uses (orientation cost) |
| S4 review queue (Sonnet) | **Pass w/ noise** — used `issue review-queue`, named review-debt promotion, 2/2 recall, closed-issue excluded; noise = flagged the A/B twin folders as duplicates (test-bed artifact, defensible) | **Partial** — 2/2 recall, closed excluded, but framed dump entries and resting states as "needing attention", contradicting the dump-doesn't-shout / blocked-doesn't-shout doctrine |

**Score: skill 4/4 convention-clean · baseline 2/4 clean, 1 hard violation, 1 doctrine-noise.**

### Efficiency — tokens · tool calls · wall time per agent

| Agent | Model | Tokens | Tool calls | Duration |
|---|---|---:|---:|---:|
| S1a work-an-issue · skill | Opus | 44,386 | 20 | 150.5 s |
| S1b work-an-issue · baseline | Opus | 51,757 | 28 | 152.3 s |
| S2a idea capture · skill | Sonnet | 37,774 | 11 | 66.7 s |
| S2b idea capture · baseline | Sonnet | 34,527 | 9 | 39.8 s |
| S3a graduation · skill | Opus | 36,928 | 15 | 91.0 s |
| S3b graduation · baseline | Opus | 41,012 | 22 | 109.3 s |
| S4a review queue · skill | Sonnet | 46,977 | 12 | 92.7 s |
| S4b review queue · baseline | Sonnet | 37,223 | 4 | 49.3 s |
| **Skill arms total** | | **166,065** | **58** | **400.9 s** |
| **Baseline arms total** | | **164,519** | **63** | **350.7 s** |

Cost is a wash in aggregate (+0.9% tokens for the skill arms), but the pattern
inside the pairs is informative:

- **Write-heavy convention tasks (S1, S3 — the Opus pairs): the skill is cheaper
  AND faster.** S1: 44.4k vs 51.8k tokens, 20 vs 28 tool calls; S3: 36.9k vs
  41.0k, 15 vs 22 calls, 18 s quicker. Baselines burn their extra budget *hunting
  for the conventions* (reading guide.ts, fixtures, user-guide pages) that the
  skill hands over directly — and S1's baseline still got the lifecycle rule wrong
  after paying that cost.
- **Light tasks (S2, S4 — the Sonnet pairs): the skill costs more** (S2 +3.2k
  tokens / +27 s; S4 +9.8k / +43 s), spent on reading the skill, running
  `docs-guide` tooling, and self-validation. That's the price of the rule-grounded
  rationale and the checker pass the baselines never did.

Wall times overlap heavily since all 8 ran in parallel — the whole experiment
completed in ~2.5 minutes end to end.

Findings:

1. **The lifecycle AI rule is the highest-value guardrail.** The only hard failure
   in the whole run was a baseline agent closing a subtask — exactly the
   `review`-is-the-agent-ceiling rule the skill carries. Environment docs alone did
   not prevent it even though the agent had read `guide.ts` and the demo fixture.
2. **The environment propagation is load-bearing.** Baseline agents repeatedly
   succeeded *by reading what we shipped today* — the vocabulary comments, the dump
   contract in the dump issue's `issue.md`, and the user-guide graduation pages.
   The skill's added value on top: rule-grounded rationale, the self-validation
   habit (3 of 4 skill arms ran the checker unprompted; 0 of 4 baseline), and
   cheaper orientation.
3. **Read-only doctrine needs the skill.** Both S4 arms found the true positives,
   but only the skill arm treated `review` as *the* actionable category; the
   baseline promoted resting states into the attention list.
4. **Zero validator errors from any of the 8 agents** — the folder-shape
   conventions are learnable by all arms; it's the *judgment* rules (lifecycle,
   what-shouts) that need the skill.
5. Design caveats for future runs: S4 (read-only) raced against the writer agents
   mid-run — sequence read-only scenarios after writers, or freeze a snapshot;
   baseline arms still see `CLAUDE.md`, so this measures skill-on-top-of-project-
   memory, not skill-vs-nothing.

## Next
Summary + verdict in `01_summary.md`; test tracker left in place for sidhantha's
inspection (delete or keep as fixture corpus at his call).
