---
title: Repo check scripts
description: The development-stage gates in scripts/ — what each one asks, and why none of them ship
sidebar_position: 8
---

# Repo check scripts

Three executables live in repo-root `scripts/`. They are **development-stage tools**: each needs something a consumer authoring documents does not have — the framework source, a running dev server, or a `dist/`. None of them ship in the plugin, and none should ever be asked of a consumer. See the "Three stages" section of the repo `CLAUDE.md` for the rule.

They exist because each guards a failure that is **silent**. Nothing here checks something a person would notice by looking.

| Script | Asks | Needs |
|---|---|---|
| `check-links.mjs` | does the engine turn a correct file reference into a URL that works? | a running server |
| `check-theme-contract.mjs` | does every CSS variable resolve, and does the contract still describe reality? | framework source |
| `check-route-parity.mjs` | do dev and the build resolve the same URL the same way? | a dev server **and** a `dist/` |

All three exit non-zero on failure, so they drop into CI unchanged.

## `check-links.mjs`

Crawls real URLs over HTTP and reads real statuses. It asks a **renderer** question — whether a link that is correct on disk survives the transform into an href — which is deliberately not the question `agent-ks check link-form` asks. That one reads markdown and asks whether a link is maintainable and its target exists; it is about **files**, and it is the plugin's.

Both answers can differ. 418 links once 404'd on the site while every one of them was correct on disk.

It compares environments rather than trusting one, because there are **three** and Astro's own servers reproduce only two: `astro dev` and `astro preview` are application servers that match a route table, while a static host is a file server where every page is a directory and a request without a trailing slash must 301 to the slash form. `--static <dir>` exists so the shipped behaviour is one flag away.

```bash
./start dev &  scripts/check-links.mjs --base http://localhost:4321
scripts/check-links.mjs --base http://localhost:4321 --compare http://localhost:4322
```

## `check-theme-contract.mjs`

Three gates over the framework source. It needs no server.

| Gate | Fails when |
|---|---|
| **A** | a `var(--x)` anywhere in the engine names something nothing declares |
| **B** | a shipped layout reads a variable `required_variables` does not name — **and the reverse** |
| **C** | a circular `extends` goes undetected, checked against five on-disk theme fixtures |

**Gate A** catches the defect the theming rule exists to prevent: an undeclared name freezes on its inline fallback, so that one rule stops responding to dark mode and nothing reports it.

**Gate B** is the one that keeps [the theme contract](../../user-guide/25_themes/02_the-theme-contract.md) honest. A `merge` theme inherits everything and never notices a gap; a `replace` theme drops the parent and loses anything the contract fails to name, silently, because validation only checks that list. Failing in *both* directions means a variable can neither quietly leave the contract nor quietly enter the layouts without it.

**Gate C** runs fixtures rather than reading the code, and two of the five are **negative** controls — a normal child/base pair, and a diamond, where two paths reach one shared ancestor. A diamond is legal. Without those, a detector that reports a cycle unconditionally would pass every positive test.

```bash
scripts/check-theme-contract.mjs
scripts/check-theme-contract.mjs --json
```

## `check-route-parity.mjs`

Two pieces of code know the URL space, and they are not the same piece:

```
  src/pages/lib/route-match.ts     resolves a REQUEST   (dev / SSR)
  src/pages/lib/static-paths.ts    enumerates the SET   (build)
```

They share the URL *spellings* — `static-paths` imports `sourceFormSlug`, `canonicalContentUrl` and `planStageAliasUrl` from `route-match`, so there is one place each URL is written down. What they do **not** share is the traversal: which URLs exist at all. Nothing forces those two walks to agree.

So the harness enumerates every URL from `buildStaticPaths` — the build's own source of truth — and checks each against a running dev server *and* against the files in `dist/`. It also probes URLs that must **not** resolve, because "the set of addresses that should 404" is the half nothing enumerates.

This is a different question from `check-links.mjs`, which crawls hrefs that appear in rendered pages. An address the build emits that dev refuses, or one dev serves that the build never wrote, need not appear as an href anywhere.

Every URL lands in one of three buckets, and only the third is a finding:

| Verdict | Meaning |
|---|---|
| `agree` | dev and `dist` tell the same story — page, or redirect to the same target |
| `explained` | they differ for a reason the script states in its own output |
| `DIVERGE` | they differ and nothing accounts for it |

**The `explained` bucket is a claim, not a mute button.** Each entry carries the reason it is correct, and the reasons print with the results. Two are currently declared, and both are environment differences rather than resolver disagreements:

- **A dotted final segment needs a trailing slash.** `/…/03_docs.html` is a *file* request to `astro dev`, so it never reaches the page route; `/…/03_docs.html/` resolves. The build writes that URL as a directory, and a static host 301s the bare form to the slash form. Same target once the slash is there.
- **An unknown docs slug renders the section shell** with a 404 status, so the tree stays navigable while a file is mid-edit. The build writes no file, so a static host answers its own 404. Both say "not found"; only the body differs.

It also asserts `dist/404.html` exists. Without it, every dead link on a deployed site lands on the host's generic page.

```bash
./start build
./start dev &
scripts/check-route-parity.mjs --base http://localhost:4321
scripts/check-route-parity.mjs --base http://localhost:4321 --json --limit 200
```

⚠️ **Build before running it.** The harness compares against `dist/` as it finds it, so a stale build reports every page added since as a divergence. That is correct behaviour and a confusing first run.

## Adding a fourth

The bar is the same one these three meet: **the failure must be silent.** A check for something that already errors loudly buys nothing and costs a run.

Two properties, both learned the hard way:

1. **It must be able to fail.** Break the thing it guards, on purpose, and confirm the check goes red — then restore. A harness that has never failed is not evidence. All three above were controlled this way, and the route-parity harness had a real bug found by exactly that exercise: it compared a path against a path-plus-anchor and reported 17 correct redirects as broken.
2. **Prefer one gate that fails both ways.** A check that only catches additions lets deletions through. Gate B above is the model.
