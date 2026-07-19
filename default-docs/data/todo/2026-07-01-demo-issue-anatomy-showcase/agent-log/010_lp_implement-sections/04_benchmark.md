---
agent: claude-opus-4-8
status: success
date: 2026-07-01
---
# Benchmark — full-site build after the section rollout

A **`04_benchmark` slot in file form** — numbers inline, no heavy artifacts, so it stays a
single file. (Had it produced a trace or CSV, it would become a `04_benchmark/` folder.)

## Method
- Baseline: `main` before the change vs the feature branch after both milestones.
- Hardware: reference dev box — 8-core / 16 GB.
- Scenario: `./start build` over the full corpus, cold cache, 3 runs averaged.
- Instrument: build wall-clock + page count from the Astro build summary.

## Results
| Metric | Before | After | Delta | Notes |
|--------|--------|-------|-------|-------|
| Pages built | 561 | 566 | +5 | new subdoc routes |
| Build wall-clock | 41.2 s | 42.0 s | +0.8 s | within run-to-run noise |
| Cache signature walk | 3 levels | 5 levels | +2 | deeper mtime tracking |

## Claim vs measured
Milestone #2 claimed "no build regression". Measured +0.8 s on a 42 s build (~2%, within
noise) — verdict: **confirmed (no regression)**.

## Artifacts
Lightweight run — none. Heavy artifacts (traces, CSVs, screenshots) would live in a
`04_benchmark/` folder beside this report.
