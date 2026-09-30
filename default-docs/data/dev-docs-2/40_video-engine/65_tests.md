---
title: "Tests"
description: "What each video test suite proves, where it lives and what runs it: the compiler's Rust tests, golden VideoData fixtures, the player's unit tests and size gate, the helper's tests, and the browser checks."
---

The video engine is tested at every layer: the video crate in Rust, the player in TypeScript, the voice helper in its own workspace, and the whole path in a browser. This page lists each suite, what it proves and what runs it. Read it before you change any part of the engine, so you know which test must change with it.

## The suites

| Suite | Where | Run by |
|---|---|---|
| Video crate tests | `apps/agentks-engine/crates/video/` | `cargo test -p agentks-video-compiler`, and `ctl test engine` |
| Golden `VideoData` fixtures | The video crate's test data | The same |
| The `/api` schema test | `apps/agentks-engine/crates/api/tests/contract.rs` | `ctl test engine` |
| Player unit tests and the size gate | `apps/packages/agentks-video/test/`, `scripts/size.ts` | `ctl test video` |
| Voice helper tests | `apps/agentks-voice/crates/*` | `ctl test voice`, only when named |
| Browser checks and end to end | The player's `dev/checks/`, and the end-to-end suite | Playwright, outside the fast gate |

## The video crate

**Every kind from a broken file.** For each error and warning kind, a broken copy of a fixture video produces it, and the test asserts the file, line, column and path. The anchor tests include the prefix case that must fail: `@con` on a beat that says "config".

**The folder rules.** Broken video folders produce `video-no-controller`, `video-no-scenes`, `video-unknown-file`, `video-duplicate-prefix`, `video-duplicate-id`, `video-asset-outside` and `video-morph-unmatched`, and `self:` in a single file produces `library-element-unknown`. Each error must name the right file: the scene file, not the folder. `check video` on one scene prints only that scene's errors and the controller's.

**The SVG allowlist.** `<style>`, animation elements, links and outside references are refused, each with the element and its line. Ids come back as placeholders, and references follow them.

**No outside world.** Tests pass a library folder through the same resolver the real libraries use, so there is no second code path. No test needs the voice model or the network: tests that need audio use fixture clips and word-timing files. Tests set `AGENTKS_HOME` to a temporary folder, as every engine test does ([tests](../55_contributing/15_tests.md)).

## Golden fixtures

The example three-minute video, and each example the authoring skill ships, compile to checked-in `VideoData` JSON. A compiler change then shows as a diff someone reads.

- **Both forms match.** The example exists as a video folder and as a single file. Both compile to the same `VideoData`, apart from `source`, the slide ids and the source positions. The single file also gets its one `video-file-size` warning.
- **The player plays them.** The player's own fixture, `dev/fixture/tour.json`, is the same video. The crate's output must play in the player unchanged.
- **The schema agrees.** The `/api` schema test fails when the committed `api.schema.json` differs from the Rust types, and checks a sample video page payload against them. The player's generated types come from the same file, so a type change reaches both sides or fails.

## The player

`ctl test video` runs `bun test` on the player's unit tests, then a production build and the size gate ([diagnostics and size](./45_diagnostics-sheet-and-size.md)).

| Test file | Proves |
|---|---|
| `grid.test.ts` | The stage grid: column widths, the heading band, spans, the nine built-in layouts, auto-flow and alignment |
| `timeline.test.ts` | Finding the slide and beat at a time, which slides a moment needs, captions, and where browser speech restarts after a seek |
| `motion.test.ts` | How each verb fills and combines, the built-in presets and transitions, preset tokens, the camera, arrows, trees and SVG id prefixes |
| `fixture.test.ts` | The golden example: slides back to back, every name resolves, every action targets an item inside its slide's span, and SVG carries placeholders |

These run in milliseconds. They need no browser, because they test the rules, not the drawing.

## The voice helper

`ctl test voice` runs the helper workspace's unit tests: pronunciation, the phoneme map, word times, the protocol, loudness and fades, and reading, writing and joining streams in `agentks-ogg-opus`. They need no model and run in under a second. The helper links ONNX Runtime, so `ctl test` and `ctl gate` skip it unless it is named ([ctl and the gate](../55_contributing/10_ctl-and-the-gate.md)). `cargo deny` checks every licence in the helper's dependency tree.

## In a browser

Some things can only be proved by drawing. These checks use Playwright and run in the end-to-end suite, not the fast gate.

| Check | Proves |
|---|---|
| Seek against play | Seeking to ten times, each in the middle of a motion, shows the same frame as playing to them, compared by screenshot |
| Play-through | The example plays from start to end in each browser engine, with no page error |
| Text sharpness | Text stays as sharp as native text after stage scaling and after a `focus` |
| The review sheet | Every slide of the example appears, in light and dark, and the sheet lists no diagnostic |
| End to end | The example plays in the client, on the standalone page and in a static build, with the generated voice from a plain static server |

## The rules

- **The fast gate stays fast.** The video crate's and the player's unit tests together stay under 10 seconds.
- **Screenshots are evidence, not the gate.** Browser checks run in the end-to-end suite, where a flaky browser cannot block every push.
- **A rule is tested where it lives.** A check is tested in the video crate, once, not in each command that calls it.

## Related

- [Tests](../55_contributing/15_tests.md): the suites of the whole repository.
- [The meaning checks](./20_the-meaning-checks.md): the kinds these tests cover.
- [VideoData](./35_video-data.md): the contract the golden fixtures pin.
