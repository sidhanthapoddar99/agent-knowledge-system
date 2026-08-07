---
title: "Round 2 — JIT rendering, the B-tree cache, theme parity, and the case against"
status: done
---

# Round 2 — the four questions

Four agents, each handed all seven surface digests from
[round 1](./010_surface-inventory.md) and told to read the underlying code themselves
rather than trust another agent's finding. Two of them built and ran real Go code to
answer their question rather than reasoning about it; that is why this round's numbers
are `measured` where round 1's port estimates are `read`.

| Producer | Question | Answer |
|---|---|---|
| [JIT rendering](./021_question_jit-rendering.md) | Is per-request rendering possible, and the right default? | **Yes**, with a warm body cache — conditional on two fixes |
| [B-tree cache](./022_question_btree-cache.md) | Should the cache be a B-tree, in memory or on disk? | **No** to both. Persist one 4 KB file |
| [theme parity](./023_question_theme-css-parity.md) | Does CSS and theme customization survive? | **Yes.** 13 of 21 capabilities unchanged, 6 better, 1 lost |
| [the case against](./024_question_case-against.md) | Red-team it | **Do not do it now.** Ship a 16–22 day package instead |

---

## 1 · JIT rendering — yes, and it is the right default

**Build mode first, because the whole question turns on it.** Established from source,
not assumed: `astro.config.mjs:89-92` is `output: isDev ? 'server' : 'static'`, there are
zero `prerender` exports repo-wide, and `dist/` contains 1,257 `.html` files with no
`dist/server/` and no `entry.mjs`. **Production today is 100% static generation; dev is
full server-side rendering.** So a Go JIT server does not replace a request-time
renderer — it replaces a build step.

The agent built a working Go JIT server (goldmark 1.8.5 + chroma 2.27.0 +
`html/template` + `yaml.v3`) and load-tested it over real sockets against this repo's
pages, at 84–152 KiB responses.

Per-request budget, measured:

```
  frontmatter parse    14–24 µs   ─┐
  goldmark parse      64–835 µs    ├─ all noise
  outline walk         3–45 µs     │
  template execute   219–447 µs   ─┘
  syntax highlight    0.07 ms p50 … 21 ms worst page   ← the entire budget
```

| Configuration | p50 | p90 | p99 | RSS |
|---|---|---|---|---|
| JIT, no cache at all | 1.83 ms | 10.11 ms | — | — |
| JIT + warm body cache | 0.54 ms | — | 1.14 ms | 13.9 MB for the whole corpus |

Two porting traps found, both cheap and both silently expensive if missed:

- **Memoise `lexers.Get`.** Naive per-call lookup costs 1.91 ms per file across the
  corpus; a memoised lexer map costs 0.30 ms. That is 6.5x on the corpus and 14x at p90,
  for about ten lines.
- **Do not port `loadContent` / `loadIssues` as they stand.** The issues index reads only
  metadata — a grep for `.html` across every issues-index component returns zero hits —
  yet `loadIssues` renders all 871 tracker files to build it (146 ms in Go). Serving one
  docs page must read one markdown file.

**Chroma is not uniformly faster than Shiki.** It is a wash on `css` and `markdown`, and
on the corpus's worst page Chroma takes 22.0 ms against Shiki's 13.4 ms. The corpus has
94 markdown-in-markdown fences; untreated, these are the pages that would make a JIT
server feel slow.

**Global-knowledge surfaces need only a cheap structural index**, not eager rendering:
`WalkDir` 3.1 ms + 4 KiB frontmatter head-reads 9.0 ms + `settings.json` 0.3 ms =
**12.4 ms for all 1,030 pages**, plus 55.5 ms of `git log` for derived dates.

**Concurrency** ran race-clean under `go build -race` at 16 goroutines with a shared
goldmark instance and shared chroma lexers behind an `RWMutex`. Worth stating plainly:
Go removes the Vite module-splitting *mechanism* outright, and upgrades the residual
shared-state hazard into a data race that `-race` actually finds. That is a real
improvement over the trigger bug's failure mode, which was silent.

**Static export survives** only if produced by enumerating the same index and calling the
same handler — not by crawling, which silently drops orphans. And "Astro gives you both
from one code path" is already only half true: dev and `dist/` measurably diverge today
on plan sub-URLs and section 404s.

---

## 2 · The B-tree cache — no, to both readings

The question was read two ways, because both are plausible and both matter.

### (A) An ordered B-tree as the in-memory content tree — no

**The corpus is too small and too flat for the structure to do anything.** Measured:
1,030 markdown files, 1,184 files total, 5.29 MB, 350 directories, 53 issue folders.
Directory fan-out is **p50 = 3 entries**, p90 = 8, max 54; docs sections reach depth 4.

A B-tree node holds 16–32 keys. At a median fan-out of three, **every "tree" in this
corpus collapses into a single node.** Benchmarked on the real corpus with Go 1.26.5
against both `google/btree` and `tidwall/btree`:

| Operation | Nested struct (today's shape) | B-tree |
|---|---|---|
| Full rebuild | 0.377 ms | — |
| Full traversal | 0.002 ms | — |
| Prefix scan | 0.0017 ms (linear) | 0.0048 ms (range scan) |

**The linear scan is 2.8x faster than the B-tree range scan.** Even at 100x the corpus
(103,000 documents) a linear scan is 0.20 ms and a full rebuild is 39 ms.

The access patterns confirm it independently: `useSidebar.ts` builds one materialised
nested tree per section, caches it under a single key, sorts per level by `NN_` position
— **not by slug**, so a single ordered key would have to be synthesised — and never
mutates in place. `issues.ts` sorts once by `updated`, and the index does all filtering,
sorting and paging client-side over DOM rows. **There is zero server-side range or
prefix scan at request time.**

A B-tree would need all three of: more than 50,000 documents, in-place index mutation
between requests, and a real ordered range-query API. None is true.

### (B) An on-disk B+tree as the persistent cache — no

The decisive number: **a warm restart re-derives the entire corpus in 7.8 ms, which is
less than the 11.2 ms it takes to merely read back an equivalent 17 MB cache file.**
Persistence is slower than not persisting.

Supporting measurements, on real ext4 (the agent's first run was on tmpfs, which reported
`fsync` as free; it caught and corrected this — one `fsync` here costs 0.737 ms):

| | |
|---|---|
| Warm JIT boot | 7.8 ms |
| Cold boot | 142.1 ms |
| Whole corpus rendered, goldmark + chroma | 790 ms serial / 175 ms at 8 workers / 0.77 ms per page on demand |
| All rendered HTML held in memory | 15.6 MB heap |
| bbolt | 0.0006 ms/key read, **0.68 ms per write transaction**, 16.78 MB file |
| SQLite WAL | 0.0159 ms/key, 0.06 ms/write, 9.99 MB |

**bbolt is disqualified on coexistence, not performance.** Verified by execution, not
read: bbolt refuses a second opener — `timeout` after 452 ms even with
`ReadOnly: true` — while SQLite in WAL mode served a concurrent read. This repo ships a
**37-command CLI that users run while the server is up**. A single-writer memory-mapped
store is the wrong shape for that.

And the invalidation key is cheaper than the thing it would replace: content-hashing the
whole corpus costs 4.68–6.98 ms with xxhash (6.42–6.76 ms with sha256) against
0.82–1.15 ms for `stat`. The "expensive correct key" costs less than the boot walk. That
is the whole argument against persisting, in one line.

### What to do instead

Keep the materialised nested struct, and add one flat `[]SidebarItem` plus a
`map[href]int` beside it in the same cache entry so `getPrevNext` stops flattening and
linear-scanning on every docs page render — about 15 lines, and it removes the only
per-request linear pass that exists.

Persist exactly one thing: **the git-derived `updated` dates, ~4 KB of JSON keyed by the
HEAD SHA.** `issue-dates.ts` already stores `syncedAt` for diagnostics, so the design is
90% there.

### The experience answer

Good, and the reason it is good is that there is nothing to feel. A 7.8 ms warm boot and
0.54 ms p50 page renders mean no spinner, no warm-up, no first-request penalty worth
naming. **A persistent cache would make the experience worse, not better** — it
introduces a staleness class that outlives the process, which means a wrong entry
survives a restart and the user has to learn that a cache exists and how to clear it.
Today no user has to know that. Keeping it that way is the feature.

Two platform hazards to record, because this project runs on WSL and supports Windows:
mtime granularity on `drvfs` / `/mnt/c` / `\\wsl$` is **1 second**, and the existing
implementation *sums* mtimes (`issues.ts computeSignature`) — a sum is not injective, so
a checkout touching many files in the same second can produce a colliding signature.
Separately, editors that write-then-rename (VS Code atomic save, vim's default
`backupcopy`) give a file a new inode and make `fsnotify` emit CREATE/RENAME rather than
WRITE, so an inode-keyed cache is wrong and a WRITE-only watcher silently stops
refreshing.

**If cold start ever becomes a real complaint, the lever is syntax highlighting** — 85 ms
without chroma against 790 ms with it, over 2,954 fenced blocks — not a database.

---

## 3 · Theme and CSS customization — yes, it survives

The direct answer to the question as asked: **yes, you can still do the CSS
customization you do now.** Same folders, same `theme.yaml`, same syntax. Of 21
user-facing capabilities, **13 are unchanged, 6 get better, and 1 is lost** — Astro's
automatic component-style scoping, which is framework-internal CSS, not anything a user
writes.

The reason is structural rather than lucky: **`theme.ts` is 513 lines of `fs`, `path` and
`js-yaml` with exactly one framework call, and dark mode is 100% browser-side.** The
theme system owes Astro nothing. Serving a `.css` file is trivial in any language, and
CSS custom properties are a browser feature.

Measurements that anchor this: 53 `required_variables`, 109 declared properties, the
merged theme block is 64,938 bytes inlined identically on 988 pages — **46.2% of the
built site** — and it sits at character 1,060 in the document while the Vite bundle
`<link>` sits at character 66,444.

Four things that need deciding rather than porting:

**Runtime-parsed `html/template`, not `templ`.** `templ` buys compile-time type-safety
the project has never actually had — there is no `astro check`, `@astrojs/check` is not
installed, no `tsc --noEmit` runs anywhere, and running it by hand today produces 27
errors — and it pays for that by **closing the advertised `LAYOUT_EXT_DIR` extension
point**. Runtime parsing keeps user-shipped layouts working; correctness comes instead
from a boot-time parse-and-execute-against-fixtures pass and a `check --templates`
subcommand. The three built-in custom layouts do exactly one server-side thing —
`loadFile(dataPath)` → parsed YAML — which `yaml.Unmarshal` into `map[string]any` covers
completely.

**De-scope 1,327 lines to sibling `.css` files**, keeping the existing BEM prefixes and
adding one stylelint `selector-class-pattern` rule. 76% of it (1,010 lines) is inside
`issues/default` alone. Then delete all 21 `:global()` wrappers **and the project rule
that mandates them** — that rule exists only because of scoping.

**Do not "just serve raw CSS files".** The notes present that as identical behaviour; it
is not. Today's inline delivery is what produces zero round-trips and zero flash on a
cold cache. The right split is to inline only the token layer (3,421 bytes gzipped:
color, font, element, breakpoints, carrying `:root` and `[data-theme=dark]`) and link the
9,466-byte-gzipped bulk as one cacheable ETagged file.

**Move layout CSS into the theme chain**, so a theme's `issues.css` actually wins the
cascade. Today it loses, measured. This costs framework developers per-component Vite CSS
HMR and hands them an SSE swap instead — the right trade, because a documented user
capability that does not work is the worse defect.

One regression worth naming plainly: **the CSS half of a user theme needs nothing, but
the JavaScript half loses free Vite bundling** — a user layout's island would need
`doc-engine dev --vite`, i.e. Node on the themer's machine.

And two hot-reload findings that correct the notes. CSS hot reload is **two paths today,
not one**: `shouldTriggerReload()` covers only `watchPaths`, so `src/layouts/**` falls
through to Vite's native CSS HMR — confirmed against the live server, where
`GET /src/layouts/issues/default/styles/index.css` returns a module containing
`__vite__updateStyle`. So HMR exists for what a *developer* edits and not for what a
*user* edits. The real win the notes never name is SSE pushing new CSS straight into
`#theme-styles.textContent` — flash-free and state-preserving.

---

## 4 · The case against — do not do it now

The red-team agent measured on this machine against the live dev server and a real
`go build`, and returned the round's sharpest result.

**The trigger has a one-day fix that four sibling files already use.** A grep over
`src/loaders/` returns exactly two bare module-level caches — `issue-dates.ts:40` and
`issues.ts:462` — while `cache-manager.ts:44`, `paths.ts:131`, `cache.ts` and `theme.ts`
**all already park their state on `globalThis`**, and `paths.ts`'s own comment names Vite
module splitting as the reason. About ten lines each, after which the 25-line
`moduleGraph` reach-in at `integration.ts:206-232` deletes.

**The framing error underneath the whole proposal.** `astro.config.mjs:92` is
`output: isDev ? 'server' : 'static'`, with a comment saying the choice is for CDN
builds. So "fast production and full features are mutually exclusive" — which the notes
call the migration's deepest win — **is a config line, not a framework limit.** The
four-way comparison table is missing its competing column: Astro SSR in production via
`@astrojs/node`, which nobody has measured.

**Binary size survives, contrary to the distribution surface's finding.** A real
`go build` probe (goldmark + chroma + chi + cobra + fsnotify + yaml + `html/template` +
ygo + go-git, `-s -w`) came to **21.08 MB** with pre-gzipped assets, 25.73 MB with
go-git, 37.96 MB with raw assets. `ygo` adds 434 KB, not the 2 MB assumed. So the single
binary really is roughly the size claimed — the claim that failed was the *input*
budget (1–2 MB of embedded `dist/` against a measured 6.1 MB gzipped), not the output.

**Cost.** Seven surface estimates sum to 38–59 weeks; de-duplicated 33–51; times a
1.3–1.6 optimism multiplier gives **10–19 months**. An independent cross-check from
measured churn — +19,405 net lines in `src/` over 90 days, about 5,350 lines/month —
against 22,500–30,000 lines of Go needed gives 4.2–5.6 months of pure line production
before docs, plugin and Windows CI. Both bracket **6–12 months** of a one-person
project's entire output. The two bottom-ups share an input (line counts), so they are
not fully independent.

**Adoption, which decides whether the distribution benefit has anyone to benefit.** The
GitHub API returns **0 stars, 0 forks, 0 watchers, 7 releases, 0 asset downloads**;
616 commits, one author. The distribution argument is the one part of the case that
survived measurement, and it currently serves zero measured users.

**The language count.** After migration the project spans Go, TypeScript, Python
(migration scripts) and shell — plus the 8,630-line zero-dependency JavaScript CLI, whose
stated performance justification collapses (bun startup is 1 ms, not 150 ms).

### The alternative package it recommends instead — 16–22 days

1. Move `issue-dates.ts` and `issues.ts` state to `globalThis`; delete the `moduleGraph`
   reach-in. **1 day — kills the trigger.**
2. One URL resolver serving both `serve` and `build`, plus `dist/404.html`. **5–8 days —
   kills the only measured architectural defect.**
3. Install `@astrojs/node` and measure Astro SSR in production. **2 days — supplies the
   table column the proposal never measured.**
4. Spike `bun build --compile` on that server. **2 days — tests the single-binary claim
   at 1% of the cost.**
5. Delete the dead weight round 1 found. **3–5 days.**
6. Fix the double `computeSignature` per issue request; add a Windows CI job.
   **3–4 days.**

**Re-open the migration only if steps 3 and 4 come back negative *and* real external
consumers exist** — and re-argue it then on distribution, cold start and memory, the
three claims that survived, not on the performance tables and not on the bug.

### Where the red team could be wrong

Recorded because a red team that hides its own weak points is not one:

- **No Go-side runtime number could be measured** — no `.go` file or `go.mod` exists in
  the repo. The binary sizes are real; the speed claims remain unfalsifiable in either
  direction until someone runs a spike. (Round 2's JIT agent did build one, which
  partially closes this — see above.)
- **The `bun build --compile` counter-proposal is unverified** beyond a 94.6 MB
  hello-world baseline. Astro's node adapter reads client assets from disk at runtime and
  may not survive `--compile` without a shim. If it fails, one leg of the case weakens.
- **The 1.3–1.6x effort multiplier is judgement, not measurement.**
- **Memory is the one row where the proposal understates its own case** — 874 MB RSS
  measured after 24 minutes against a claimed 150–300 MB idle. If containerised
  multi-tenant deployment ever becomes real, that argument gets much stronger than the
  notes make it.
- **The verdict assumes the goal is shipping product features.** If the actual goal is
  learning Go or building a portfolio artefact, the opportunity-cost argument — the
  load-bearing one — does not apply, and the decision should be re-taken on other
  grounds.
