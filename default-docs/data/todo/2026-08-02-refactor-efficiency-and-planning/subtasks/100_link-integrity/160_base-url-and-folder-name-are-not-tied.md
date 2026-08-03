---
title: "A cross-section link works only while base_url and the folder name happen to match"
status: open
---

# Overview

**`site.yaml` carries two independent values per section, and a cross-section
relative link silently depends on them being identical.**

```yaml
dev-docs:
  base_url: "/dev-docs"     # what the browser sees
  data: "@data/dev-docs"    # what a relative link walks through
```

A relative link climbs `../../` through the **folder** name on disk and lands on
a URL built from **`base_url`**. Nothing in the code ties the two. They match in
this repo because whoever wrote the config named them alike — a convention
nobody wrote down, holding up every link that crosses a section boundary.

Rename `base_url` to `/internals` while the folder stays `dev-docs`, and every
cross-section link 404s. Codex reproduced exactly that against a hypothetical
`/internals` base.

**Done when** a consumer can name a section's `base_url` differently from its
data folder without breaking links — or the framework refuses the mismatch at
config load, naming both values.

# References

- The two values: `default-docs/config/site.yaml` → `pages.<section>.base_url`
  and `pages.<section>.data`
- Where the "no cross-section exception" claim was made, having only been tested
  inside one content root:
  [`020`](./020_relative-links-are-the-contract.md)
- The structural fix, already decided:
  [`2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md`](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md)
- The transform that emits the relative href unchanged:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`

# Todo list

- [ ] **Reproduce it here**, rather than inheriting Codex's hypothetical. Rename
      one section's `base_url` away from its folder name in a scratch config,
      build, and record which links break and how many
- [ ] Establish whether **`2026-06-09` `03` actually removes it.** Resolving to
      absolute at render time reads `base_url` directly, which should make the
      folder name stop being load-bearing — confirm that rather than assume it,
      because a resolver that walks the source tree and *then* maps to a URL can
      reintroduce the same coupling
- [ ] Decide the fallback if it does not: **a config-load refusal beats a
      documented convention.** The project's own rule is to prefer making an
      invariant structural over documenting it
- [ ] Check whether the tracker has the same exposure — it keeps its `NN_`
      prefixes and serves without a trailing slash, so its links resolve
      differently. Coordinate with [`060`](./060_does-the-tracker-share-it.md)

# Details

## Why this was pulled out of `020`

`020` proved there is **no cross-section exception** to the relative-link rule,
by dry-running `agent-ks move` on a `user-guide` → `dev-docs` link and watching
it rewrite correctly. That proof stands, and it is about `move`.

It says nothing about **rendering**, and the test ran inside one content root
where the two names matched. So the rule `020` landed on is right, and the
question of whether it survives a differently-named `base_url` is a separate
one — which is why it is here rather than as a sixth wording item in a
documentation rewrite.

## What makes it the shape worth fearing

This is *a required rule expressed as an optional setting*, the defect class this
group keeps finding:

1. `base_url` must equal the data folder name for cross-section links to resolve.
2. Nothing says so — both are free-text config keys, and naming them differently
   is the obvious thing a consumer would do.
3. **When violated, the build succeeds.** Every page renders, the section works,
   and only links crossing into it 404 — a plausible result, not a failure.

Consumer mode makes it likelier, not less: a consumer names sections for their
own product and has no reason to mirror this repo's folder names.

## Not measured yet

No count of how many links this would break, because no mismatched config has
been built. `020` recorded six `user-guide` ↔ `dev-docs` links as the known
crossing set; that number is from a grep and is not a claim about the blast
radius.
