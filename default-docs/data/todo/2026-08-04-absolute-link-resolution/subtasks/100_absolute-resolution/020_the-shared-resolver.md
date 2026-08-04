---
title: "One shared resolver — every internal link becomes a root-absolute href"
status: open
---

# Overview

**Replace the href string-surgery with resolution.** Today
`internal-links.ts` takes the author's relative href and edits it — strip `.md`,
strip `NN_`, collapse `/index` — and emits something still relative, so the
browser finishes the job using an address the renderer never saw. This subtask
makes the renderer finish the job itself.

```
resolve(hrefAsAuthored, contextFilePath)  →  absolute URL | miss
```

**Done when** no postprocessor emits a relative href for an internal target, and
the rendered link is identical whether the page is served with a trailing slash,
without one, or embedded at a different URL depth.

# Deliverables

1. **One resolver function**, consuming [the map](./010_thread-base-url-and-build-the-map.md):
   resolve the authored href against the containing file's directory → an
   absolute file path → look up the URL.
2. **`internal-links.ts` calls it** and emits the absolute result.
3. **A miss is a warning with the file and line**, and the link is emitted
   unchanged rather than dropped. Tighten to a hard failure only once the count
   is zero — a gate that is red on arrival is a gate people learn to ignore.
4. **The behaviours that survive the rewrite are carried over deliberately**, not
   rediscovered — see *Details*.

# Done when

- [ ] Docs links render as root-absolute; `curl` the traced link and confirm
      `href="/user-guide/getting-started/installation"`
- [ ] **`scripts/check-links.mjs` against a dev server AND a real static host**,
      before and after, both recorded here. The target is the two numbers
      *converging*, not just the static one falling — today they are 4 and 546
- [ ] Control it: break one link's target file, confirm the miss is reported with
      the source named; restore, confirm zero
- [ ] A trailing-slash URL and a no-slash URL for the same page produce the same
      working links — check one of each by hand in a browser
- [ ] `internal-links.ts`'s `addLevel` / `isIndexPage` mirror is **deleted**, the
      fact now coming from the map
- [ ] `tsc` clean; `./start build` clean; page count unchanged

# References

- The design: [the path map](../../notes/30_the-path-map.md)
- The prerequisite: [thread base_url and build the map](./010_thread-base-url-and-build-the-map.md)
- The four combinations this deletes:
  [the trailing-slash matrix](../../notes/10_the-trailing-slash-matrix.html)
- The code being replaced:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
- The first consumer of the seam this creates:
  [the hosting path prefix](../200_path-prefix/010_prefix-path-env.md)

# Details

## Behaviours to carry over, not rediscover

Each of these was a bug once and is now handled. The rewrite must keep them, and
each deserves a case in whatever harness proves the resolver:

| Input shape | Required behaviour |
|---|---|
| `mailto:guide.md`, and any `scheme:` target | **Never touched.** It ends in `.md`, so it passes a naive markdown test and came out rewritten as a page path |
| `./05_diagram.mmd` with an `NN_` prefix | **A page.** The loader publishes prefixed diagram files |
| `./assets/05_diagram.mmd` | **An asset**, prefix notwithstanding — the loader scans with `ignore: '**/assets/**'` |
| `./image.png`, `../doc.pdf` | **An asset**, owned by `asset-src`, resolved against the source directory |
| `#section-only` | Untouched |
| `/anything` | Untouched — already absolute, and content should not contain these |
| `https://…` | Untouched |

## Shapes that are currently broken and must be fixed here

Handed over from the link-integrity round, where they were deliberately **not**
patched because they are defects of a function scheduled for deletion:

| Input | What happens today |
|---|---|
| `./asset.pdf?download=1` | The query string defeats the extension test, so an asset is treated as a page |
| `./page.md?x=1` | The `.md` strip is anchored to `$`, so the extension survives |
| a nested bare `index.md` | Emits `../index` instead of addressing the containing folder's index |
| blog sibling links | The date prefix is kept, so a sibling post lands underneath the current one |

**Two of these four are the same mistake:** any rule that reads a target's
extension has to tolerate `?` and `#` after it. Resolution makes that structural
rather than a regex to get right — split the query and fragment once, resolve the
path, reattach.

## Why "warn, don't fail" first

A miss means the link names a file that does not exist. There are known
populations of those — 334 slug-form links that name a published URL rather than
a file, and demo/fixture issues pointing at deliberately fictional paths. Failing
the build on arrival would block this change behind unrelated content work. Warn,
count, drive to zero, then tighten.
