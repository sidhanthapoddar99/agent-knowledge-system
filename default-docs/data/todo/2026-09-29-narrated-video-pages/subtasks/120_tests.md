---
title: T10 Tests — compiler, SVG allowlist, golden data, seek determinism, size gate and end to end
status: open
---

The tests come last, once the pieces exist, so they test the real shapes rather than guesses. This track adds the fast Rust and player tests and the end-to-end checks that keep the video engine honest.

# 01 To Do
- [ ] **Rust tests for the compiler:** each error and warning code from a broken file, with line, column and path; whole-word anchors, including the prefix case that must fail.
- [ ] **The loader's folder rules:** each folder error (`video-no-controller`, `video-no-scenes`, `video-unknown-file`, `video-duplicate-prefix`, `video-duplicate-id`, `video-asset-outside`, `video-morph-unmatched`, `self:` in a single file) from a broken folder, naming the right file, line and column; `check video` on a scene file.
- [ ] **Rust tests for the SVG allowlist:** `<style>`, animation elements, links and outside references are refused; ids are prefixed per use.
- [ ] **Golden `VideoData` fixtures:** the example and the skill's three examples compile to checked-in JSON; a change shows as a diff. The example in both forms compiles to the same `VideoData` apart from `source`, slide ids and positions.
- [ ] **Seek determinism by screenshot:** seeking to ten times shows the same frame as playing to them.
- [ ] **The size gate:** the player stays under 30 KB gzipped, 22 KB for what every video loads, and the gate fails past it.
- [ ] **End to end:** the example plays in the client, in the standalone page and in a static build; its review sheet lists no diagnostic.

## Guardrails
- Unit and integration tests in the gate run in under 10 seconds in total. Screenshot and browser checks run in the end-to-end suite, not the fast gate.
- Tests use fixture data and a fixture library folder; none needs the voice model.

## Done when
- Every item above runs in CI and passes.
- The fast gate stays under 10 seconds.

# 02 Status and Result
Not started. Waits for every other track.

## Result
Nothing yet.

## Agent log
none

# 03 References
- [The artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md#06-how-it-is-checked) — the error and warning codes.
- [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md#svg-safety-an-allowlist) — the allowlist.
- [The player](../brainstorm/01_video-artifact-engine/06_player.md) — seeking and the size budget.
- [170/30 End to end](../../2026-09-29-rust-core-engine-migration/subtasks/170_testing/30_end-to-end.md) — the migration's end-to-end suite, which gains the video checks.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- Each earlier track keeps its own basic tests; this track adds the cross-cutting ones.
