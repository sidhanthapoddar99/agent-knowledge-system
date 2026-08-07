---
title: "Partial rebuilds — is the 99% claim true?"
---

Sid's case, 2026-08-07: a full build writes 1,290 files every time, 99% of which
are the same as last time; that wears the disk, wastes time, and a partial rebuild
would remove the whole problem.

**The 99% is not a guess. It measures at 98.7%, and the rest of this file is what
that number does and does not license.**

# What was measured

Two builds of *identical* input, then a third after a one-line edit to a single
markdown file:

| | Pages | Byte-identical to previous build |
|---|---|---|
| Build A vs build B (nothing changed) | 1,290 | **1,273** (98.7%) |
| Build C, after a one-line edit to one file | 1,290 | **1,273** (98.7%) |

**The edit changed at most 17 pages out of 1,290, and probably fewer** — because
the *same* 17 already differed between two builds where nothing changed at all.

# Why two identical builds differ at all, and why that is good news

Exactly one thing varies, and it is not the content:

```
- <time datetime="2026-08-07T13:38:52+05:30" ...>10 min ago</time>
+ <time datetime="2026-08-07T13:38:52+05:30" ...>11 min ago</time>
```

A relative timestamp rendered at build time. The `datetime` attribute — the real
data — is identical. Only recently-touched issues carry a drifting string, which
is why all 17 sat in one folder.

**This makes the build deterministic in everything that matters, and the exception
is trivially removable**: the absolute time is already in the DOM, so rendering
"11 min ago" client-side from `datetime` would take the build to 100% reproducible.
That is a small change with a large consequence, because *determinism is the
precondition for skipping work*. Without it you cannot tell "unchanged" from
"regenerated differently".

# So: is a partial rebuild possible?

**Yes, and this codebase is unusually well-placed for it** — but it is not free,
and the honest framing is that it solves a narrower problem than it first appears.

What is already in place:

- Output is 100% static, one file per URL. No server state to reconcile.
- The loaders already compute an **mtime signature** per issue folder, and the work
  in this issue added a per-folder variant (`computeFolderSignature`). That is
  half of a dependency graph already written.
- The theme CSS is no longer inlined. **Before this issue, any theme edit changed
  all 1,290 files** — which would have capped any incremental scheme at "useless
  whenever you touch a colour". Now it changes exactly one file.

What is missing:

- **The dependency direction is not recorded.** We know which files feed an issue;
  we do not know which *pages* a given file feeds. A subtask edit changes the
  subtask page, its issue page, the plan page that references it, and the index.
  That fan-out is real and has to be modelled, not guessed.
- **`cache-manager` has dependency tracking with zero call sites** — the audit found
  it, and [its subtask](../subtasks/030_correctness/020_cache-manager-dependency-tracking.md)
  currently asks whether to implement or delete it. **This is the argument for
  implementing.** It was built for exactly this and never wired up.
- Astro has no incremental static build. Anything here is ours to write around
  `getStaticPaths`, or a post-build diff-and-copy step.

# The cheapest version, and why it might be enough

**Build to a scratch directory, hash every output, copy only what changed into
`dist/`.** No dependency graph, no framework surgery.

- Kills the disk-wear argument completely: 17 file writes instead of 1,290.
- Kills nothing else. The build still takes 7 s, because it still *renders* all
  1,290 pages — it just stops writing 1,273 of them.

**The expensive version** — render only affected pages — needs the reverse
dependency graph above. It is where the 7 s actually goes, since generating routes
is 4.28 s of it.

# The part that argues against doing either right now

Sid's stated problem is the edit loop. **The edit loop does not run builds.**

```
  dev server, page served on demand      14–17 ms
  full build, per page                    3.4 ms
  full build, total                      ~7 s      ← only at deploy
```

The dev server is *already* a partial rebuild: it renders one page on request and
caches it. The 7 s is a deploy-time cost paid once, and the work in this issue
already halved it.

So the ranking is:

| | Value | Cost |
|---|---|---|
| Make the build deterministic (client-side relative time) | Enables everything else; also removes 17 phantom diffs per build | Very small |
| Diff-and-copy into `dist/` | Ends disk churn: 17 writes not 1,290 | Small — a post-build step |
| Reverse dependency graph, render only affected | Takes 7 s toward ~0.1 s | Large, and touches `getStaticPaths` |

**Recommendation: do the first two, and treat the third as a separate issue that
must justify itself against a 7-second baseline rather than the 14-second one it
was imagined against.** The third is also the piece a Go rewrite is often argued
to deliver — worth noting that nothing about it requires Go; it requires the
dependency graph, which is language-independent.

# Open

- [ ] Does anything else vary between builds once relative time is client-side?
      The 98.7% figure is a floor, not a proof — it was measured twice, not
      exhaustively, and a hash-everything check would settle it.
- [ ] What is the real fan-out of one subtask edit, once timestamp noise is gone?
      The measurement above cannot separate the two, and the whole case for the
      expensive version rests on that number.
