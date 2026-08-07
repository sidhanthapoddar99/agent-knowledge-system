---
title: "Rounds"
---

# Rounds

One round per plan stage. **The findings live on the stages**, which carry the
per-stage tables and the reasoning — this index says what each round turned up
and points there rather than restating it.

- [the measurement method](./010_measurement-method.md) — the harness every
  number below came from, and the two ways it lied before it was trusted
- [stage 10, baseline](../../../plans/01_implementation/10_baseline-and-safety-net.md)
  — every audit figure reproduced, so none of them had to be re-argued; only the
  page count moved, and only because this issue added a folder
- [stage 20, the load-time fix](../../../plans/01_implementation/20_load-time-fix.md)
  — the index was rendering 861 bodies to build a table of titles. Fixing that
  took `/todo` to 0.155 s; the theme CSS was a second, unrelated 63 MB
- [stage 30, de-risk](../../../plans/01_implementation/30_de-risk-the-upgrade.md)
  — the cache split is real and reproducible, but it breaks invalidation rather
  than freshness, which is narrower than the migration issue claims
- [stage 40, the upgrade](../../../plans/01_implementation/40_the-upgrade.md) —
  the only thing that broke was our own path arithmetic, and the build got twice
  as fast on 38% less memory, which the plan had predicted it would not
