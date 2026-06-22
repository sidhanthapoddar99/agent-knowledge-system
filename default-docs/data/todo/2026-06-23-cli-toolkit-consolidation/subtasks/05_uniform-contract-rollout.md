---
title: "Category 0a — roll out the uniform contract to every command"
state: closed
---

Make every command speak the same contract, using the shared `_cli.mjs` (subtask 02) and generated help (subtask 03).

## Tasks

- [ ] `--help` **and** `-h` honored by every command (fixes the 8/9 broken `-h` in issues commands)
- [ ] Help text printed to **stdout** (not stderr), exit `0` on `--help`, regardless of missing required args
- [ ] `--json` on every command — **including the 4 validators** (machine-readable findings) and `move`/`img`
- [ ] One exit-code scheme everywhere: `0` ok · `1` error/no-match · `2` usage error (fix `review-queue` always-0)
- [ ] Consistent unknown-flag rejection across all commands
- [ ] Verify via the self-test harness (subtask 14): every command's `--help` exits 0 + `--json` parses
