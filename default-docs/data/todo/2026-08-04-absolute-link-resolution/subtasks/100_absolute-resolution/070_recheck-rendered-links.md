---
title: "Re-run the rendered-link gate under the new scope, once the resolver lands"
status: open
---

# Overview

**The live crawler is built and proven; this subtask is the re-measurement it
exists for.** `scripts/check-links.mjs` crawls a *running server*, follows
redirects, resolves each link against the **post-redirect** URL, and checks
fragments as well as status. It gave the numbers that made the trailing-slash
diagonal visible.

What it has not yet measured is the state after
[the shared resolver](./020_the-shared-resolver.md) lands — and that measurement
is the acceptance test for this whole issue.

**Done when** dev and a real static host report the **same** result, and that
result is zero path failures.

# The baseline it is measured against

All from 2026-08-04, after both attempts were reverted — 1,245 in-body links
across the docs sections, `--body-only`:

| Environment | Broken | What it is |
|---|---:|---|
| `./start dev` | **4** | a route table; never adds the trailing slash |
| `astro preview` | **4** | also a route table — the *same column* as dev |
| a real file server over `dist/` | **546** | 301s `/a/b` → `/a/b/`, which is what ships |

The 4 are missing **anchors**, not path failures — three on the custom-pages
overview and one on the theme-tokens page. They are the same 4 in every
environment.

**Disagreement, measured directly:** dev vs preview → **0** links disagree; dev
vs a real file server → **546**. That is the environment split stated as a
number, and it is why testing dev against preview proves nothing.

# Done when

- [ ] Re-run all three environments after the resolver lands, and record the
      numbers here beside the baseline above
- [ ] **The two columns converge.** The success condition is not "the static
      number falls" — it is that dev and a static host report the same thing,
      because that convergence is what absolute resolution actually buys
- [ ] `--compare` dev against a static host reports **0** disagreements
- [ ] The 4 broken anchors are fixed or explicitly accepted; they are a content
      defect, not a routing one
- [ ] Decide whether this runs in CI, and against which server. A static host is
      the only environment that ships, so it is the one that must be gated
- [ ] Re-run once more after [the hosting prefix](../200_path-prefix/010_prefix-path-env.md)
      lands, against a host mounted at a sub-path

# References

- The tool: repo-root `scripts/check-links.mjs`
- What the numbers mean: [the trailing-slash matrix](../../notes/10_the-trailing-slash-matrix.html)
- The change being measured: [the shared resolver](./020_the-shared-resolver.md)
- The old gate this replaced, and its removal:
  [retire the plugin's rendering gate](./060_retire-the-plugin-rendering-gate.md)

# Details

## How the tool was controlled, so the numbers can be trusted

Recorded because a gate that has never been proven to fail is not a gate. Run
2026-08-04:

| Control | Result |
|---|---|
| A link to a page that does not exist | ✅ reported — 4 → 6 |
| A link to a page that exists with an anchor that does not | ✅ reported — the exact class the old `dist/`-reading gate was blind to |
| Removing both | ✅ back to 4 |
| `--compare` where a difference is known to exist (dev vs a real file server) | ✅ **546** disagreements |
| `--compare` where none should exist (dev vs preview) | ✅ **0** disagreements |

The last two are a pair on purpose: the zero result only means something because
the same mechanism produced 546 on the other input.

## Three defects it caught in itself while being written

Each is now a comment where it happened:

1. **A dead port hung the run forever.** A gate that never returns is worse than
   one that answers wrongly, because nobody runs it. Every request is timed out.
2. **`--body-only` narrowed the *crawl* as well as the report**, so it never left
   the home page and reported zero links checked. Discovery and reporting are now
   separate sets. **The zero-links assertion is what caught it.**
3. **Links were resolved against the requested path, not the post-redirect one** —
   the same trailing-slash trap, inside the tool built to find it. It reported
   539 false failures before the fix.

The third is the one worth remembering: **the bug was in the tool, and the tool's
own subject matter was that exact bug.**
