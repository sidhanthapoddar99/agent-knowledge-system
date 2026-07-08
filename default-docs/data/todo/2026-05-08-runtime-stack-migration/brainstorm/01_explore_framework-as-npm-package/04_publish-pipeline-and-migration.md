---
title: "Publish pipeline and the 30-project migration — what obsoleted, what endured"
---

# The publish pipeline and the migration playbook

The tail end of the npm-package branch: how the package gets built and published, and how the
30 existing full-clone projects move to thin shells. This is the sharpest place to see the
pivot — the **publish pipeline was fully obsoleted** by Go binary distribution, while the
**migration problem endured** with only its target shape swapped.

## The publish design (now obsolete)

The package needed a build step, since source runs directly under bun/node today. The
deliberation settled on the lean option:

- **`tsc` for `.ts` → `.js`** — no bundler; `.astro` and `.css` ship as-is (Astro recognizes
  them in the consumer). `dist/` mirrors `src/`.
- **`exports` map** — subpath exports (`./integration`, `./layouts/*`, `./loaders`,
  `./parsers`) so system aliases like `@docs/default` resolve to package files.
- **`files: ["dist/", ...]`** + `prepublishOnly: build` + a `npm publish --dry-run` acceptance
  check that lists exactly the shipped files (no source `.ts`, no fixtures, no docs source).
- **Semver for 30 consumers** — stay in `0.x` (breaking changes allowed, bump minor for
  breakage) until ≥3 consumers have upgraded through a real release cycle; only then cut
  `1.0.0` and go strict. Manual `npm publish` for v0.1; a GitHub Action was a nice-to-have.

**Why it all dropped:** source comment `002` is explicit — "npm publishing replaced by Go binary
distribution + `curl | sh` installer + git-tag-based version manifest. No longer relevant in
its current form." Every artifact above (the `tsc` build, the `exports` map, the
npm-semver-for-30-consumers policy) is npm-registry machinery with no analogue in the Go world.
Its replacement is specced in `notes/architecture/04_distribution-single-binary.md`:
`goreleaser` cross-compiling five platform targets, a `curl -sSf .../install.sh | sh`
installer, Homebrew tap, GitHub releases, and per-project version pinning via
`doc-engine.toml` instead of a `package.json` dep range.

## The migration playbook (endured, target reshaped)

The problem it solved is distribution-shape-agnostic: **30 projects are full clones and each
needs a one-time move to a thin shell.** The npm target was:

```
my-docs/                     my-docs/
├── src/            ──►       ├── astro.config.mjs   ← 5 lines
├── astro.config.mjs         ├── package.json       ← one dep + Astro peer
├── package.json             ├── dynamic_data/      ← unchanged
├── dynamic_data/            └── .env               ← unchanged
├── .env
└── node_modules/  (bloated)  →  (lean)
```

The playbook's *durable* content — the parts that survive any distribution shape — is the
**edge-case catalogue**, which is where the genuine deliberation lived, not the happy-path
steps:

- **Local engine patches** — if a project hand-edited `src/loaders/...` for a one-off, the
  migration *drops the patch*. Surface loudly: identify local edits first, upstream or skip.
- **Custom layouts / themes** in `dynamic_data/themes/<name>/` — consumer-owned, should survive,
  but verify the override mechanism still resolves across the new boundary.
- **`.env` var drift** — same names, but some may move; document any diff.
- **Astro version pinning** — consumer must match the engine's declared peer; surface mismatch.

And the **cohort rollout** — pilot one (simplest, most-recent) → three of varying complexity →
the rest in batches, sharpening the playbook at each step — is pure migration-management wisdom
that reads identically whether the target is a thin npm shell or a `default-docs/` folder + a
binary on PATH.

**Where it landed:** comment 002 marks this "partially transferable — still needed; target shape
changes from 'thin npm shell' to 'docs folder + CLI.'" In the Go end-state the migration is
arguably *simpler*: delete `astro-doc-code/` and `node_modules/`, drop the binary on PATH, run
`doc-engine serve` in a folder containing `default-docs/`. No `package.json` re-init, no Astro
peer to pin, no `bun install`. The edge-case catalogue above is the part worth carrying into
whatever migration doc the Go cutover eventually writes.

## Open questions that never got answered

Because the branch was cancelled before implementation, these stayed open — noted here so the
Go migration doesn't rediscover them cold:

- **Package name** (`agent-knowledge-system` vs `@scope/...` vs branded) — moot for npm, but the
  *binary* name is the live version of this (`doc-engine` is the working placeholder).
- **What happens to the framework's self-hosted `user-guide/`** once engine and content split —
  answered by "stays in the engine repo as an example consumer / reference site," which the Go
  repo inherits directly.
- **Bun vs npm multi-runtime support** — dissolved entirely: the Go binary has no JS runtime at
  the consumer at all.
