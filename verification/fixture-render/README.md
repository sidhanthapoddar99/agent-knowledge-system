# `verification/` — mechanical render checks

Harnesses that answer **yes/no** questions about a built site. A harness is a
deliverable: a result that says *"verified, see /tmp/x"* stops being verified the
moment `/tmp` is cleared.

**These check that something HAPPENED, never that it happened WELL.** Layout,
spacing, density and readability are a human's call, and a headless dev-box
result on any of those reads as authoritative while being the wrong answer.

## `fixture-render/check.mjs`

Asserts the demo fixture (`default-docs/data/todo/2026-07-01-demo-issue-anatomy-showcase`)
renders the current section shapes. It serves `astro-doc-code/dist/` from inside
its own process, so nothing outlives the run and no port is left listening.

```bash
./start build
cd verification/fixture-render && npm install playwright && node check.mjs
```

What it asserts:

| Group | Assertion |
|---|---|
| Routing | nine representative section pages return 200 |
| Plans | the group exists, both plans are listed, and the **active** one — highest-numbered not `done`/`dropped` — is pinned |
| Plans | clicking the pinned entry navigates and **changes the DOM** |
| Plan table | one row per stage, the status column populated, subtask counts resolved live, no broken-reference warning |
| Agent log | `summary.md`, `working/`, `debrief/` and a child agent log all appear; the open sub-doc is marked active |
| Depth | a level-4 producer file renders; one level past the cap 404s |
| Console | zero errors, excluding the deliberate 404 probe |

Add an assertion here rather than re-deriving it by hand next time.
