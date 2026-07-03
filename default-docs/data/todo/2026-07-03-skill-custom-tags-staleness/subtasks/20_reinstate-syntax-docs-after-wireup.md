---
title: Reinstate full custom-tags guidance once the transformers are wired
status: blocked
---

Blocked on [2026-04-20-custom-tags](../../2026-04-20-custom-tags/issue.md) — the
framework issue that wires `createCustomTagsRegistry()` into the parser pipeline.
Until tags actually render, the skills should carry only the caveated snippet from
subtask 10; promoting custom tags as a first-class authoring feature would recreate
the original staleness in reverse.

- [ ] When wiring lands, remove the not-yet-wired caveats from both writing
      references and align the snippets with whatever final syntax shipped.
- [ ] Re-point "full list and syntax" at the restored user-guide page (the restore
      itself is owned by 2026-04-20-custom-tags).
