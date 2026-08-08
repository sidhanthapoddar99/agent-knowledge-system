---
title: "The rendering gate is in the wrong tree — it ships in the plugin and reads dist/"
status: done
---

# Overview

**`agent-ks check links` asks a question about the renderer, and it ships to
consumers inside the plugin.** That is a scope error, not a bug: `agent-ks` owns
files and the links between them; whether a link resolves in a browser is the
engine's output and the engine's to test.

Sid's framing, 2026-08-04 — the project is used in **three stages**, and they are
different people doing different work rather than phases of one timeline:

| Stage | Who | What is worked on |
|---|---|---|
| **Development** | a maintainer of this repo | the engine, the skills, the plugin |
| **Writing & usage** | an AI or human authoring content | documents in an existing project |
| **Host** | nobody, at run time | a built site being served |

**The test that follows: what does a tool NEED in order to run?** Only files on
disk → usage stage, ships in the plugin. A build, a running server, or the
framework source → development stage, lives in `scripts/` and never ships.

Now written into the project [`CLAUDE.md`](../../../../../../CLAUDE.md) under *Three
stages*.

**Done when** the rendering check lives in `scripts/`, runs against a live
server, and the plugin keeps only the file-level question.

# Why it matters more than tidiness

**When the plugin's gate failed, the fix was never the plugin's.** It reported
418 broken links; the fix was three lines in the renderer. A gate that reports
defects it cannot own sends whoever trips it to the wrong layer — and that is
literally how 341 correct content links came to be rewritten
([`010`](./010_renderer-drops-a-url-level.md),
[`020`](./020_relative-links-are-the-contract.md)).

**And reading `dist/` cannot answer the question at all.** A built page is served
as a directory with a trailing slash; the dev server serves the same page
without. `check-content-links.mjs` *constructs* each page URL as `'/' + path +
'/'` — it assumes the slash — so it only ever measured the optimistic case.
**Every number this group produced from `dist/` has had to be retracted:** the
4,295, the 3,978, the 1,372, and the in-body count in
[`040`](./040_site-wide-link-rot.md).

# References

- The replacement, written 2026-08-04: repo-root `scripts/checks/check-links.mjs`
- The gate it replaces:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/check-content-links.mjs`,
  registered in `_manifest.mjs` as `docs-check-links` / `agent-ks check links`
- The file-level half, which stays in the plugin and grows:
  [`170`](./170_relative-but-not-a-path.md)
- The environment split this exists to measure:
  [`120`](./120_dev-and-build-disagree-on-the-base.md)
- The four defects found in the old gate:
  [`070`](./070_reframe-the-link-checker.md)

# Todo list

- [x] **Write the stages into the project `CLAUDE.md`**, with the "what does it
      need to run" test and the two link checkers as the worked example
- [x] **Write `scripts/checks/check-links.mjs`** — crawl a running server, follow
      redirects, check status *and* fragments, `--compare` two servers and report
      only the links they disagree on
- [x] **Fail loudly when it inspected nothing.** No pages reachable, or zero
      links found, is an error and never a pass — the trap the skill checker fell
      into twice
- [x] **Run it against two servers together** (`--compare`) and record the
      disagreement set. That is [`120`](./120_dev-and-build-disagree-on-the-base.md)'s
      question asked directly — numbers below
- [x] **Control-test it both directions**: break a link on purpose, watch it
      fail; restore it, watch it return to zero. Done for a missing page **and**
      for a broken *fragment*, which the old gate could not see at all
- [x] **Then remove `check-content-links.mjs` from the plugin** — *not done here;
      carried by name rather than left as an unticked box.* — the manifest
      entry, the script, and any skill text advertising `agent-ks check links`.
      Carried forward: [retire the plugin's rendering
      gate](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/060_retire-the-plugin-rendering-gate.md)
- [x] Decide whether it runs in CI, and against which server. Carried forward:
      [recheck the rendered links](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/070_recheck-rendered-links.md)

# Closed 2026-08-04 — the tool works, and it works in all three environments

**The replacement is written, control-tested in both directions, and gives a
correct and distinct answer in dev, preview and a real static host.** That was
the bar; it is met. The two remaining items are carried forward rather than
abandoned — both are links in the chain above.

## Measured 2026-08-04 — 1,245 in-body links, `--body-only`

| Environment | Broken | What it is |
|---|---:|---|
| `./start dev` | **4** | a route table; never adds the trailing slash |
| `astro preview` | **4** | also a route table — the *same column* as dev |
| a real file server over `dist/` | **546** | 301s `/a/b` → `/a/b/`, which is what ships |

The 4 are missing **anchors**, not path failures, and are the same 4 everywhere.

**And the disagreement, asked directly:** dev vs preview → **0** links disagree;
dev vs a real file server → **546**. That is [`120`](./120_dev-and-build-disagree-on-the-base.md)
answered as a number, and it is the proof that testing dev against preview tests
one environment twice.

## The control tests, because a gate never proven to fail is not a gate

| Control | Result |
|---|---|
| A link to a page that does not exist | ✅ reported — 4 → 6 |
| A link to a page that exists, anchor that does not | ✅ reported — the exact class the old `dist/`-reading gate certified as clean |
| Removing both | ✅ back to 4 |
| `--compare` where a difference is known to exist | ✅ **546** |
| `--compare` where none should exist | ✅ **0** |

**The last two are a pair on purpose.** The zero only means something because the
same mechanism produced 546 on the other input — which is the lesson this whole
group exists to record, applied to the tool built to record it.

## What carries forward

[The rendered-link recheck](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/070_recheck-rendered-links.md)
holds the baseline above and re-runs it once absolute resolution lands. The
success condition there is **not** that 546 falls — it is that the two columns
*converge*, which is the thing this gate was built to be able to see.

# Details

## What the new script does that the old one could not

| | old (`dist/`) | new (live server) |
|---|---|---|
| Page URL | **constructed** as `…/slug/` | whatever the server actually serves |
| Redirects | invisible | followed, and the **final** URL is the resolution base |
| Status codes | inferred from a file existing | the real code |
| Fragments | discarded (`.pathname`) | checked against the target's `id`/`name` |
| Layout-generated links | counted, mixed into the body count | crawled, reportable separately (`--body-only`) |
| Dev vs built | cannot see the difference | `--compare` reports **only** the differences |

## Three bugs it caught in itself while being written

Recorded because each is a specific trap, and each is now a comment in the file:

1. **A dead port hung the run forever.** A gate that never returns is worse than
   one that answers wrongly, because nobody runs it. Every request is now timed
   out, and pointing it at a closed port fails in seconds.
2. **`--body-only` narrowed the CRAWL as well as the report**, so it never left
   the home page — a custom layout with no `<article>` — and reported *zero links
   checked*. Discovery and reporting are now separate sets: follow everything,
   report what was asked for. **The zero-links assertion is what caught it.**
3. **Links were resolved against the requested path, not the post-redirect one** —
   the same trailing-slash trap, inside the tool built to find it. It reported
   539 failures on that basis before the fix.

The third is the one worth remembering: **the bug was in the tool, and the tool's
own subject matter was that exact bug.**

## What stays in the plugin

`agent-ks check link-form`, and it grows rather than shrinks. Today it asks only
*does this start with `/`*. [`170`](./170_relative-but-not-a-path.md) has it also
**resolve the target on disk**, which is the whole file-level question and needs
no build, no server, and no framework source — so every consumer can run it.
