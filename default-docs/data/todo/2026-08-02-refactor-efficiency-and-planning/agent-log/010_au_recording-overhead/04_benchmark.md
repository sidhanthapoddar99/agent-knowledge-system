---
title: "Benchmark"
---

# Benchmark — recording output vs code output

The full tables live in [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md). This slot
carries the headline and the method, so the number is reproducible without
re-reading the note.

## Method

- **Baseline:** none — this is a first measurement, not a before/after. The
  numbers here *become* the baseline that
  [Sidequest: NeuraSutra's memory](../../subtasks/060_sidequest-neurasutra.md) re-measures against.
- **Window:** 24 hours ending 2026-08-02 09:29, plus a two-hour sub-window
  isolating one run.
- **Subject:** `neurasutra-docs` + `neurasutra-canvas`, read-only.
- **Instrument:** `git log --since=… --numstat` for line counts;
  `git log -p` piped through a line-prefix classifier for comment-vs-code;
  `git log -- <file> | wc -l` per file for revisit counts.

## Results

| Metric | Measured |
|---|---|
| Share of added lines that were code | **8.8%** (2,111 of 23,900) |
| Tracker markdown added | 18,799 lines · 1.13 MB |
| Code diff added | 5,101 lines · 315 KB |
| Comment share of added `.ts` | 53.4% comment · 42.6% code · 3.9% blank |
| Worst window — production code vs comment | **5 code lines · 147 comment lines** |
| Worst window — activity log written | **1,928 lines across 13 files** |
| Single facts repeated across files | up to **12** |
| Activity files never revisited | **588 of 749** |
| Subject issue total | 872 files · 132,567 lines · 7.6 MB |

## Claim vs measured

No prior claim to test — the run existed because the ratio *looked* wrong. It
was, and worse than it looked: the impression was "a lot of comments"; the
measurement was that recording outweighs code roughly ten to one, and that the
gap widens as changes get smaller.

## Artifacts

None retained. Every figure is reproducible from the commands in Method against
the same window; no harness was needed and none was written.
