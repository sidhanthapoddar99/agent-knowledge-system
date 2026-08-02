---
title: "Origins"
---

# How we got here

**Write-once.** A record of what happened cannot expire, which is exactly what
makes it safe to leave alone.

- The fixture started as three folders and a `settings.json`, to prove the loader
  read anything at all.
- A one-pass reader was tried and abandoned — it needed a discriminator per
  section anyway, so it was four functions wearing a switch statement, 11%
  slower. Recorded in [the spike](../../agent-log/030_ex_one-pass-spike/01_summary.md).
- The six-slot agent-log shape lived here until it was replaced. **The old
  folders are not rewritten** — history stays as written; the new shape governs
  what is recorded next.
