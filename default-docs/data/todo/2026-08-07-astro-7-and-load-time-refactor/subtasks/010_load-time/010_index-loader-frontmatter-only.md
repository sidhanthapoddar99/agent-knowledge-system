---
title: "Index loader reads frontmatter only"
status: done
---

# Overview

The first request to `/todo` takes **3,207 ms**. The second takes 32 ms. The cause is that
`loadIssues` renders all 861 tracker markdown files through `marked` + `shiki` to build an
index that displays only titles, statuses, components and dates. **No issues-index
component references rendered HTML** — a grep for `.html` across every one of them returns
zero hits.

Make the index path read frontmatter and `settings.json` only. Render a body when, and
only when, someone asks for that document.

This is the single largest measured performance defect in the engine, and it grows
linearly with the tracker. On a larger repo it already reaches 10 s.

# References

- [the parent issue](../../issue.md) — why this and the Astro 7 upgrade share one issue
- [the Astro 7 versus Go comparison, item 13](../../../2026-05-08-runtime-stack-migration/notes/astro-7-vs-go/01_comparison.md) — the benchmark showing the frontmatter-only walk costs ~15 ms in JavaScript against 12.4 ms in Go, so this fix lands the same win without a rewrite
- [the JIT rendering analysis](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/021_question_jit-rendering.md) — where the "one page should read one file" rule comes from, and the per-stage cost breakdown
- [the loaders and cache surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/016_surface_loaders-cache-routing.md) — `issues.ts` broken into responsibilities with line ranges; read this before opening the file

# Todo list

- [ ] Reproduce the baseline with the harness in **Details** and record the number
- [ ] Map which fields the issues index actually consumes — read the index components, do not assume
- [ ] Split `loadIssues` into a metadata path and a body path
  - [ ] Metadata path: walk, 4 KB head read, frontmatter parse, `settings.json` parse
  - [ ] Body path: unchanged, called per requested document
- [ ] Apply the same split to the docs sidebar path — its cold request is 396 ms, same class, smaller
- [ ] Fix the double `computeSignature` per issue request found in the audit
- [ ] Re-measure with the same harness; record before and after in **Outcomes**
- [ ] Regression-check the four page types listed in **Details**

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## The measurement harness — use this exact one, before and after

The baseline must come from a cold server. A warm request is 32 ms and tells you nothing.

```bash
cd astro-doc-code
(timeout 90 bun run dev --port 3921 > /tmp/cold.log 2>&1 &)
until grep -q "ready in" /tmp/cold.log; do :; done
curl -s -o /dev/null -w '%{time_total}s\n' http://localhost:3921/todo
curl -s -o /dev/null -w '%{time_total}s\n' http://localhost:3921/todo   # warm, for contrast
pkill -f "port 3921"
```

Baseline recorded 2026-08-07 on this repo — 53 issue folders, 861 tracker markdown files,
1,038 markdown files across all of `data/`:

| Route | Cold | Warm |
|---|---|---|
| `/todo` | **3,207 ms** | 32 ms |
| `/user-guide/getting-started/overview` | 396 ms | 8 ms |
| `/blog` | 10 ms | 6 ms |

Astro reports `ready in` at 372–410 ms across three runs. That is the server, not the
content — do not confuse the two.

## What the target looks like

Benchmarked over all 1,038 markdown files in `data/`, warm page cache:

| Step | Measured |
|---|---|
| Directory walk | 2.4 ms |
| 4 KB head read + `gray-matter` parse | 12.6 ms |
| **Index total** | **~15 ms** |
| Full read + `gray-matter` (for contrast) | 22.7 ms |

Add the git-derived `updated` dates — measured at 50 ms across 235 commits — and the model
construction. A realistic target is **under 300 ms cold**, from 3,207 ms.

Note what this says: the 3.2 s is **not** file I/O and **not** frontmatter parsing. Both are
already fast. It is `marked` + `shiki` rendering bodies. Do not go looking for an I/O
optimisation; there isn't one to find.

## The rule to implement

> **Serving one page reads one markdown body. Building an index reads no markdown bodies.**

Read only the head of each file for the index. 4 KB covers every frontmatter block in the
corpus; if a file's frontmatter is truncated, fall back to a full read for that file rather
than failing.

## Do not parallelize the walk — it is measurably slower

The obvious instinct at thousands of files is to read them concurrently. **Measured, it
loses at every concurrency level.** Benchmarked over the real corpus repeated ten times:

| 10,410 files | Time |
|---|---|
| **Sequential, synchronous, head-read + parse** | **83.3 ms** |
| Async, 8 concurrent | 189.8 ms — 2.3x slower |
| Async, 32 concurrent | 148.0 ms — 1.8x slower |
| Async, 128 concurrent | 167.2 ms — 2x slower |

Two reasons. The per-file work is tiny — a 4 KB read plus a small parse — so the promise
and scheduling overhead per file costs more than the I/O wait it hides. And the work splits
roughly evenly at that scale: **48.9 ms of I/O against 45.2 ms of parsing.** Async I/O
cannot touch the parsing half at all; that would need `worker_threads`, which is not worth
its own complexity for 83 ms.

**Scale reference: 10,000 files cost 83 ms sequentially.** A 3,000-file tracker costs about
25 ms. The walk is not the problem at any realistic size — rendering bodies is.

One caveat worth keeping. These numbers have a warm page cache. On a genuinely cold cache,
or on a network filesystem, real I/O latency appears and concurrency would start to pay.
If this ever runs somewhere like that, re-measure before assuming sequential still wins.

**Where parallelism does pay: rendering, not indexing.** The audit measured a full-corpus
markdown render at 790 ms serial against 175 ms across 8 workers. That is the shape of work
worth parallelizing — and after this subtask lands, the index does none of it.

## Do not cache your way out of this

The warm path is already 32 ms, so a bigger or persistent cache fixes nothing — it only
hides the first request. The measured full re-derive is ~15 ms, which is why the audit
concluded no persistent store is worth its staleness risk. Fix the algorithm.

## Done when

- [ ] Cold `/todo` is **under 300 ms**, measured with the harness above, recorded in **Outcomes**
- [ ] Cold docs page is under 150 ms with the same harness
- [ ] Warm requests are unchanged or better (32 ms / 8 ms baseline)
- [ ] No issues-index component receives rendered HTML — the grep for `.html` across them still returns zero
- [ ] The four page types render unchanged: an issue detail page with a body, an issue sub-document, a docs page with code blocks and diagrams, the blog index
- [ ] `agent-ks check issues` and `agent-ks check link-form` pass
- [ ] The before-and-after numbers are written into **Outcomes** with the harness that produced them

## Watch for

`issues.ts` is 1,474 lines — the largest file in the repo. Read the responsibility map in
the loaders surface audit before opening it. The index path and the detail path are not
cleanly separated today; that separation is most of this subtask's work.
