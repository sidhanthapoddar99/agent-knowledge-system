---
title: "Audit the efficiency losses"
status: done
---

# Overview

Measure — not estimate — how much agent output goes into recording work versus
doing it, and find the structural cause. Triggered by the observation that a
couple of hours of work on a consumer project produced far more activity log and
source comment than code.

**Done, 2026-08-02.** Headline: **8.8% of everything written over 24 hours was
code.** Full result in [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md).

# References

- Findings: `notes/10_efficiency-audit-2026-08-02.md`
- Run record: `agent-log/010_au_recording-overhead/`
- Subject: the `neurasutra-docs` + `neurasutra-canvas` pair — read-only,
  nothing was changed there
- Feeds: [Brainstorm: cutting the recording overhead](./020_brainstorm-efficiency-remedies.md)

# Todo list

- [x] Count lines added per repo over a fixed 24h window (`git log --numstat`)
- [x] Classify every added `.ts` line as comment / blank / code
- [x] Break the markdown down by tracker section
- [x] Isolate the worst window and get its production-code line count
- [x] Measure restatement — how many files repeat the same fact
- [x] Measure read-back — how many activity files are ever touched twice
- [x] Trace each symptom to the rule that causes it
- [x] State what *earned* its cost, so the fix does not overshoot

# Outcomes and Next Steps

**What landed** — five counted findings:

1. 8.8% of written output was code (18,799 markdown lines vs 2,111 code lines).
2. The ratio is worst on small changes — **1,928 log lines for a 5-line
   production change**.
3. The cost is **restatement, not detail** — single facts repeated in up to 12
   files.
4. 588 of 749 activity files were written once and never touched again.
5. 73% of writing is `agent-log/`; audit reports alone are 46.7%.

**Root cause.** Every rule in force pushes toward more recording and **none takes
change size as an input.** The mandatory six-slot scaffold, the skill's
"detailed, line-rich records" instruction, the per-scope audit report schema, the
prompt-as-committed-file rule, and the never-delete correction rule compound with
no counter-pressure anywhere.

**Next.** [Brainstorm: cutting the recording overhead](./020_brainstorm-efficiency-remedies.md) turns the root-cause
list into rules. The plans-section half of this issue exists because finding 3 is
partly the log growing to fill the plan's absence.

# Details

## Method

- Window: 24 hours ending 2026-08-02 09:29, plus a two-hour sub-window isolating
  one run.
- `git log --since=… --numstat` for per-file line counts; the same with `-p`
  piped through a line classifier for comment-vs-code.
- Restatement measured by counting files containing distinct fact-markers (a
  changed constant, a mutant id, a test count, a table row count).
- Read-back proxied by `git log -- <file> | wc -l` per activity file.

## Caveats — what this audit does NOT establish

- **One project, one window.** The subject is the heaviest, most rule-dense
  consumer we have, chosen deliberately — not a random sample. The *rules* it
  follows are ours, so the gradient generalises; the exact ratios may not.
- **Read-back is proxied, not observed.** "Touched by one commit" is strong
  evidence a file was never revised; it is not proof it was never read.
- **Comment classification is line-prefix based.** A continuation line inside a
  block comment that does not start with `*` counts as code, biasing the comment
  share *down* — so the real figure is at least as bad as reported.
