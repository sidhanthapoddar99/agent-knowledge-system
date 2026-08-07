---
title: "Would JIT rendering be possible under a Go runtime?"
---

# JIT rendering under a Go runtime

**Yes, and it should be the default — but only as JIT-with-warm-cache, and only after
one structural fix that has nothing to do with Go: the loaders must stop rendering a
whole section (or the whole tracker) to serve one page.**

Everything below was measured on this machine on 2026-08-07 with Go 1.26.5 (32 logical
cores, WSL2) and bun 1.3.14, against this repo's real corpus. Where a number is
inferred rather than run, it says so.

**The three numbers that decide it:**

| Question | Measured answer |
|---|---|
| Can Go render a page inside an HTTP request fast enough? | Yes — **p50 1.83 ms, p90 10.11 ms** first byte with *no cache at all*, on real pages with 84–152 KiB responses |
| What does a warm body cache buy? | **p50 0.54 ms, p99 1.14 ms**, 1,729 req/s single-connection; costs **13.9 MB of RSS** for the entire 1,033-page corpus |
| Is the current bottleneck Astro? | No. `marked` alone renders this corpus at **5.54 ms/file mean**; `goldmark` renders it at **0.09 ms/file**. The markdown library is 60× the difference; Astro is not in that path |

---

## 1. What the build mode actually is

**Definitively hybrid-by-environment: full SSR in dev, 100 % static prerender in
production.** Evidence, all measured:

- `astro-doc-code/astro.config.mjs:89-92` — `const isDev = process.env.NODE_ENV !== 'production';`
  then `output: isDev ? 'server' : 'static'`.
- `grep -rn "prerender" astro-doc-code/src astro-doc-code/astro.config.mjs` returns
  **nothing**. There is no per-page escape hatch; the single `output` switch governs
  everything.
- The built `astro-doc-code/dist/` contains **1,257 `.html` files, 1,847 files total,
  166 MB**, and **no `dist/server/`, no `entry.mjs`, no `dist/404.html`**.
- Of the 1,251 HTML files that parse as pages, total 138,481,123 bytes, of which
  **64,085,632 bytes (46.3 %) is the same inlined `<style id="theme-styles">` block**
  repeated per page. (Independently reproduced; agrees with the theming surface.)

So the production artefact is a fully materialised static tree with no request-time
rendering at all. **A Go JIT server is not replacing a per-request renderer — it is
replacing a build step, and adding a server where production currently has none.**
That reframes the whole comparison: the notes' "First-byte time 50–200 ms → 5–20 ms"
row in [`06_performance-comparison.md`](../../../notes/architecture/06_performance-comparison.md)
compares Go's production path against Astro's *dev* path. Nobody serves Astro's dev path.

---

## 2. Is JIT technically possible? The per-request budget

### Method

I built a real Go JIT server (goldmark v1.8.5 + chroma v2.27.0 + `html/template` +
`gopkg.in/yaml.v3`) that on every request: resolves URL → file, reads the file,
splits and unmarshals frontmatter, parses with goldmark (GFM + auto heading IDs +
a custom fenced-code renderer emitting Shiki's dual-theme `--shiki-dark` span shape
through chroma), walks the AST for the outline, and executes a page template
carrying the 63,378-byte merged theme CSS inline, a 60–120-entry sidebar, navbar and
outline. Responses are 84–152 KiB — the same shape the current site emits.

### Per-stage cost, six real pages (200 warm iterations each, microseconds)

| Page | src KiB | frontmatter | goldmark parse | render + highlight | outline walk | template | **total** | out KiB |
|---|---|---|---|---|---|---|---|---|
| `user-guide/05_getting-started/01_overview` | 6.6 | 16 | 124 | 211 | 6 | 247 | **604 µs** | 77.9 |
| `todo/…/notes/01_excalidraw` | 2.8 | 14 | 64 | 132 | 3 | 219 | **433 µs** | 70.9 |
| `dev-docs/10_layouts/03_blog-layout/04_conventions` | 7.8 | 21 | 140 | 2,746 | 9 | 366 | **3,282 µs** | 129.3 |
| `todo/…/016_surface_loaders-cache-routing` | 51.0 | 24 | 835 | 883 | 45 | 447 | **2,233 µs** | 151.5 |
| `user-guide/15_writing-content/02_markdown-basics` | 7.2 | 23 | 153 | 10,877 | 10 | 253 | **11,316 µs** | 86.5 |
| `todo/…/03_debrief/01_proposed-claude-md` | 17.1 | 22 | 135 | 21,342 | 4 | 221 | **21,724 µs** | 110.6 |

Read the shape, not the rows: **frontmatter, parse, outline and template are all
noise** (16–835 µs combined even on a 51 KiB page). **Syntax highlighting is the
entire budget**, and its distribution is brutally skewed — 0.2 ms on a normal page,
21 ms on a page containing a 13 KiB fenced `markdown` block.

The inline theme CSS costs ~71 µs of the template time (measured: 246 µs with the
63 KiB block, 175 µs with it empty) and ~62 KiB of every response. That is a network
cost, not a CPU one, but it is why throughput saturates where it does (§6).

### The chroma trap that must be written down

`chroma/v2`'s `lexers.Get(name)` documents itself: *"if there isn't an exact match on
name or alias, this will call `Match()`, so it is not efficient."* On a miss it
iterates every filename pattern of every registered lexer, twice. This corpus has
**105 ` ```astro ` fences and 2,000 unlabelled fences**, all of which miss.

| Corpus-wide render (1,033 files, 4.67 MB source) | total | mean | p50 | p90 | p99 | max |
|---|---|---|---|---|---|---|
| goldmark only, no highlighting | 92 ms | 0.09 ms | 0.06 | 0.18 | 0.59 | 1.12 ms |
| goldmark + chroma, naive `lexers.Get` per fence | 1,970 ms | 1.91 ms | 0.08 | 5.57 | 23.01 | 48.14 ms |
| goldmark + chroma, **`map[string]Lexer` memoised** | **305 ms** | **0.30 ms** | 0.07 | 0.64 | 3.25 | 17.60 ms |

**A ten-line memo table is worth 6.5× on the whole corpus and 14× at p90.** Anyone
porting this will write the naive form first; it belongs in the port checklist, not
in a post-mortem.

### Head-to-head against what ships today

Same corpus, same machine, the project's exact `marked` + `marked-alert` + `shiki`
config from `astro-doc-code/src/parsers/renderers/marked.ts` (the async,
highlighting one — `base-parser.ts:36` uses `createMarkdownRendererAsync`, confirmed).

| Pipeline | total | mean | p50 | p90 | p99 | max |
|---|---|---|---|---|---|---|
| `marked` + `marked-alert` + `shiki` (ships today) | 6,764 ms | **6.57 ms** | 3.74 | 13.76 | 52.70 | 102.99 ms |
| `marked` + `marked-alert`, **no** shiki | 5,727 ms | 5.54 ms | 3.03 | — | — | 97.52 ms |
| goldmark + memoised chroma | **305 ms** | **0.30 ms** | 0.07 | 0.64 | 3.25 | 17.60 ms |

Three things fall out, and two of them are corrections:

1. **The Go pipeline is ~22× faster on the mean.** That is a real, reproducible win
   and it is bigger than the notes claim.
2. **Shiki is not the cost in the current stack — `marked` is.** Removing shiki
   entirely saves 1.0 ms of a 6.6 ms mean. The notes' line *"Code-block syntax
   highlight 5–20 ms/block → 1–3 ms/block (chroma is fast)"* attributes the saving
   to the wrong component.
3. **Chroma is not uniformly faster than shiki.** Per KiB of code (µs/KiB, measured
   on ~1 KiB samples): yaml 406 vs 1,469; typescript 953 vs 4,329; json 912 vs 3,269;
   bash 1,028 vs 2,462; **css 1,634 vs 1,679 (a wash); markdown 1,301 vs 1,300 (a
   wash)**. On the worst real page in the corpus — a 13,062-byte ` ```markdown `
   block — **chroma takes 22.0 ms and shiki 13.4 ms**. Chroma's markdown lexer
   delegates into sub-lexers and is the single worst tail in the Go pipeline.

I could not reconcile my 6.57 ms/file mean with the content-pipeline surface's
1.36 ms/file ([`011_surface_content-pipeline.md`](./011_surface_content-pipeline.md)).
Same corpus scale, same libraries, 4.8× apart. My method is above and repeatable;
theirs is not stated in enough detail to diff. **It does not change any conclusion
here** — Go wins at either figure — but the discrepancy should be resolved before
either number is quoted in a decision.

### End to end over HTTP

Real server, real sockets, six representative URLs mixed randomly, 2,000 requests
per row, warm page cache. Responses 84–152 KiB.

| Mode | conc | req/s | MB/s | p50 | p90 | p99 | max |
|---|---|---|---|---|---|---|---|
| **Pure JIT** (re-render every request) | 1 | 309 | 33.4 | **1.83 ms** | 10.11 | 10.91 | 11.60 ms |
| | 4 | 931 | 99.7 | 2.29 | 12.63 | 14.44 | 19.46 ms |
| | 16 | 1,547 | 167.0 | 6.61 | 24.17 | 34.17 | 40.45 ms |
| | 32 | 1,915 | 206.5 | 11.18 | 37.89 | 55.07 | 70.65 ms |
| **JIT + mtime-validated body cache** | 1 | 1,729 | 187.0 | **0.54 ms** | 0.69 | 1.14 | 2.35 ms |
| | 4 | 4,656 | 499.6 | 0.77 | 1.29 | 1.71 | 2.23 ms |
| | 16 | 6,316 | 682.3 | 2.38 | 3.98 | 5.55 | 7.82 ms |
| | 32 | 6,736 | 726.2 | 4.38 | 7.96 | 11.36 | 14.28 ms |

**Verdict against the notes' "5–20 ms first byte": pure JIT lands inside it at p50
and at the top of it at p90; the cached form beats it by 10–35×.** The notes'
number is achievable, and their component breakdown ("template render ~3–10 ms") is
3–30× pessimistic — Go's `html/template` executes this page in 220–447 µs.

Memory, measured with `/usr/bin/time -v`: the process holding **every** rendered
page body (1,033 bodies, 8.59 MB of HTML) peaks at **48.1 MB RSS**; without the
cache, 34.2 MB. **The whole-corpus warm cache costs 13.9 MB.** Compare Astro's
measured 2.0 GB peak RSS during `astro build`.

---

## 3. What cannot be pure JIT

Everything that needs knowledge the requested file does not contain. Inventory, with
what each needs and what it costs in Go:

| Surface | Global knowledge required | Index needed | Built when | Measured cost |
|---|---|---|---|---|
| Docs sidebar tree | every `.md` in the section + every folder `settings.json` | path, `NN_` position, `title`/`sidebar_label`, folder labels | boot + on watcher event | 1.6 ms for `user-guide` (95 pages); **12.4 ms for all 1,030** |
| Docs pagination (prev/next) | flattened sidebar order | same index, no extra read | with the sidebar | 0 |
| Issues index (`/todo`) | metadata of all 53 issue folders + subtask status counts | `settings.json` + frontmatter of every tracked `.md` | boot | **10.1 ms** (walk 2.5 + frontmatter 7.3 + settings 0.3) |
| Issue detail page | that one issue's folder, fully rendered | none — per-issue JIT | on request | 0.17 ms mean × ~16 files/issue |
| Derived `updated` timestamps | `git log --name-only` over the tracker | slug → most-recent ISO date | boot, refreshed on `.git/HEAD` change | **55.5 ms** (298,478 bytes, 235 commits) |
| First-class diagram / artifact pages | slug-collision pool shared with markdown pages | path → slug map | with the file index | in the 12.4 ms |
| Route table / 404 vs 200 | the complete set of valid URLs | URL → source-file map | boot | in the 12.4 ms |
| Page outline | **nothing** — it is in the page's own AST | none | per request | **3–45 µs** |
| `[[path]]` embeds | which files a page inlines, and the reverse map for invalidation | forward + reverse dependency map | at first render of each page, incrementally | **223 occurrences across 64 files** (measured) |
| Site-wide search (planned, `2026-04-19-site-wide-search`) | full text of every page | inverted index | boot or background | not built; needs every body rendered or tokenised |
| Knowledge graph / backlinks (planned, `2026-04-19-knowledge-graph-and-wiki-links`) | every link in every body + a canonical URL registry | link graph | boot, incremental after | not built; the issue itself calls it "an engine restructure" |

**The load-bearing finding in that table.** The issues index consumes *only*
metadata. I grepped every component under `astro-doc-code/src/layouts/issues/default/parts/index/`
and `parts/shared/` plus `IndexBody.astro` for `.html` — **zero hits**.
`IssuesTable.astro` reads exactly `issue.id`, `issue.created`, `issue.updated`,
`issue.meta.{title,status,priority,component,labels,assignees}` and
`issue.subtasks[]`. Yet `loadIssues()` (`astro-doc-code/src/loaders/issues.ts:1388-1460`)
loads and *fully renders* every issue folder — 871 markdown files, 3.56 MB — to
produce it. In Go that is **146 ms of rendering to serve a page that needs 10 ms of
index**.

The same shape exists on the docs side: `loadContent()` in
`astro-doc-code/src/loaders/data.ts:193-230` calls `parser.parse()` on every file in
the section to serve one page. `user-guide` costs 110 ms of Go rendering (or ~620 ms
of `marked`) for a page that needs one file's body plus a 1.6 ms index.

**This is the real reason today's cold requests are slow, and it is not Astro's
fault.** Porting it faithfully would carry the defect into Go and waste most of the
22× the markdown library just handed us.

---

## 4. The hybrid — one design

**Eager structural index at boot; JIT page bodies with an mtime-keyed cache; nothing
else eager.**

```
 doc-engine serve
        │
        ├─ BOOT  (measured 68 ms total on this corpus, single-threaded)
        │   ├─ config + theme load .............................. ~2 ms  [assumed]
        │   ├─ WalkDir over @data ............................... 3.1 ms
        │   │     → path, mtime, size, NN_ position, file kind
        │   ├─ head-read 4 KiB + yaml of every .md .............. 9.0 ms
        │   │     → title, sidebar_label, draft, status, date
        │   ├─ read every settings.json / .jsonc ................ 0.3 ms
        │   ├─ git log --name-only over the tracker ............ 55.5 ms
        │   │     → slug → derived `updated`
        │   └─ derive, in memory:
        │         · URL → source-file map      (route table, 404s)
        │         · per-section sidebar tree + prev/next order
        │         · issue metadata table + subtask status counts
        │         · slug-collision pool (md + diagram + artifact)
        │      ⇒ server is answering requests
        │
        ├─ REQUEST  (JIT)
        │   URL → index lookup ................................. ~1 µs
        │   ├─ body cache hit (mtime unchanged)? ── yes ──┐  ~0 µs
        │   └─ no: read file → frontmatter → goldmark      │
        │          → chroma (memoised lexers) → outline    │  0.07–21 ms
        │          → store {html, outline, mtime}          │
        │                                                  ▼
        │   html/template: shell + navbar + sidebar + body + outline   0.22–0.45 ms
        │   ⇒ p50 0.54 ms warm · 1.83 ms cold
        │
        └─ WATCHER (fsnotify)
            .md changed        → evict THAT body + any page whose [[embed]]
                                 map names it; patch its index row
            settings.json      → rebuild that folder's subtree of the index
            site.yaml / theme  → rebuild config, evict all bodies
            .git/HEAD or ref   → re-run git log, patch `updated` column only
```

**Why this split and not another.** The boot index is cheap because it never opens
more than 4 KiB of any file and never invokes a markdown parser — 12.4 ms for
1,030 pages, measured. Page bodies are expensive and skewed (0.07 ms p50, 21 ms
worst), and there is no way to know which ones a given user will read. That is the
textbook case for lazy-with-cache. And the cache is affordable to the point of being
uninteresting: **13.9 MB of RSS holds every body in the corpus**, so eviction policy
is a non-problem at this scale — an LRU with a byte budget is enough, and a plain
unbounded map is defensible up to ~10× this corpus.

**The 55.5 ms `git log` is the only thing that makes boot feel like boot.** It is
81 % of the boot budget and it is unavoidable on a cold start. Two mitigations, both
cheap: run it in a goroutine and let the first `/todo` request block on it (docs
pages never need it), and persist the result keyed by branch + HEAD sha so a restart
on an unchanged tree skips it entirely.

**Cold vs warm, concretely:**

| Scenario | First-byte |
|---|---|
| Process start → first docs page | 12.4 ms index + 0.07–21 ms render + 0.25 ms template ≈ **13–34 ms** |
| Process start → first `/todo` | 12.4 ms index + 55.5 ms git + ~1 ms table build ≈ **69 ms** |
| Warm, any page | **0.54 ms p50, 1.14 ms p99** |
| After editing one `.md`, next request for that page | **0.07–21 ms** (one file re-rendered; every other page still warm) |

That last row is the one the current system gets worst: today, `onFileChange` clears
the whole `content` and `sidebar` caches, so editing one file forces the next
request to re-render its entire section.

**Runner-up: eager-render-everything at boot.** Measured, it is 305 ms of rendering
plus 55.5 ms of git plus 12.4 ms of walk — **~370 ms to a fully warm server**, and
`8.6 MB` of HTML. That is genuinely affordable, and it would make *every* request
p50 0.54 ms with no cold path at all. **What would make it win: a corpus that stops
growing, or a hosting model where boot latency is free but tail latency is not** (a
long-lived container behind a load balancer). What rules it out today is that boot
cost is linear in corpus size while JIT cost is not — at 10× this corpus, eager boot
is ~3.7 s and JIT boot is still ~124 ms — and this corpus grew 3.8× past what the
perf note assumed without anyone noticing.

---

## 5. Static export

**It survives, but only if it is produced by the same resolver — and this is where
the migration takes on something Astro currently gives free.**

The project needs static output in three live places: the proposal's own Docker
Pattern B (`doc-engine build --output /dist` → nginx, in
[`02_docker-design.md`](../../../notes/deployment-methods/02_docker-design.md)),
`agent-ks check links` which probes three `astro-doc-code/dist` locations, and any
consumer deploying to a CDN. Note that `default-docs/data/user-guide/30_deployment/`
is a 4-line placeholder — **there is no user-facing deployment documentation to
contradict, which means the contract lives only in code and in these notes.**

### How to produce it: enumerate from the index, render through the JIT handler

```
doc-engine build
   │
   ├─ same boot index as `serve`            (12.4 ms)
   ├─ URL list := every key in the route map + every redirect + 404.html
   └─ for each URL, in parallel:
         call the SAME handler `serve` calls, capture the response body
         write dist/<url>/index.html
```

Not a crawl. **A crawl finds only what is linked**, so an orphan page silently stops
being published and nothing errors — and the notes' own knowledge-graph issue exists
precisely because link resolution here is not yet trustworthy. Enumerate from the
index and the two outputs are the same function over the same input.

Measured feasibility: 1,033 bodies render in **295 ms single-threaded / 70 ms at 8
goroutines** (14,724 pages/s), plus ~1,257 × 0.3 ms of template execution, plus
writing ~166 MB. **A Go static export of this site is a 1–3 second operation against
Astro's measured 14.76 s** — and 46 % of those bytes are the repeated inline theme
block, so linking the theme instead would roughly halve the artefact.

### What diverges, and how to catch it

This is the honest cost. Astro today gives dev and prod from one component tree —
and *still* diverges, because the two route builders are separate code. Measured on
this repo:

| URL | Astro dev (SSR) | Astro `dist/` (static) |
|---|---|---|
| `…/plans/<plan>/zzz-does-not-exist` | 302 → plan page | missing → host 404 |
| `/user-guide/nope-does-not-exist` | 404 + 296,909-byte styled page | missing → host 404, and **there is no `dist/404.html`** |

So "Astro gives both from one code path" is only half true, and the half that is
false is exactly the half a Go rewrite fixes. Under the design above the divergence
class that remains is narrower and nameable:

| Divergence | Why it can happen | How it is caught |
|---|---|---|
| A URL served by `serve` but not emitted by `build` | enumeration and matching disagree | make matching *derive* from the enumeration: the route map is the index, and `matchServerRoute` is a map lookup, not a switch |
| Request-time-only behaviour baked wrongly | cookies, `?query`, dev overrides, SSE, `POST /__editor/*` | a `--static` flag on the render context; anything reading it in static mode is a hard error, not a fallback |
| Absolute vs relative href resolution | static hosts vary on trailing slashes | keep `scripts/check-links.mjs` — it fetches real URLs over HTTP and its own header records that `dist/`-derived numbers had to be retracted |
| Silent content drift | 900+ pages, no assertion | **a golden-diff harness: `build` twice — once via `serve` + enumerate + fetch, once via the in-process `build` path — and byte-compare.** Same code, so it should be zero-diff; a non-zero diff is a bug by construction |

**Take on this deliberately:** one route resolver, one render handler, two callers,
and a diff harness that proves the two callers agree. Anything less recreates the
divergence already measured above on day one.

---

## 6. Concurrency — does Go remove the bug class or relocate it?

**It removes the specific mechanism and relocates the discipline. That is a real
improvement, but it should not be sold as elimination.**

The Vite 6 bug is *module-instance splitting*: one process, two copies of a module,
two copies of its `const cache = new Map()`. Go has no module-instance concept — one
package variable per process, period. **That mechanism is gone.** But the underlying
hazard, "mutable state read by the render path and written by the watcher", is
identical and in Go it upgrades from *stale reads* to *data races*, which is worse
if unguarded and better if guarded, because `go test -race` and `go build -race`
find it and no equivalent tool finds the Vite one.

Shared mutable state in the design above, and what each needs:

| State | Written by | Read by | Guard |
|---|---|---|---|
| Boot index (route map, sidebar trees, issue metadata) | watcher | every request | `sync.RWMutex`, or copy-on-write: build a new immutable index and swap one `atomic.Pointer` — readers never lock |
| Body cache | any request (fill), watcher (evict) | every request | `sync.RWMutex` + mtime revalidation, or `sync.Map` |
| Derived `updated` map | git-watcher goroutine | issues requests | same swap as the index |
| Merged theme CSS | watcher on `theme.yaml`/`*.css` | every request | atomic pointer to an immutable string |
| chroma lexer memo table | first request per language | every request | `sync.RWMutex` (I used exactly this; race-clean) |
| Error / warning collector | every parse | dev toolbar | slice + mutex, or a channel |

**Measured, not assumed:** a single shared `goldmark.Markdown`, a shared
`map[string]chroma.Lexer` behind an `RWMutex`, and shared `*chroma.Style` values,
driven by 16 goroutines over 1,033 files under `go build -race`, reported **no data
races**. Chroma's `RegexLexer` carries its own `sync.Mutex`, but it is taken only in
`maybeCompile()` and the critical section after first use is a boolean check —
not a serialisation point.

Scaling of the render path (shared instance, no per-goroutine allocation):

| goroutines | pages/s | speedup |
|---|---|---|
| 1 | 3,503 | 1.00× |
| 2 | 6,498 | 1.85× |
| 4 | 10,554 | 3.01× |
| 8 | 14,724 | 4.20× |
| 16 | 14,597 | 4.17× |

It flattens at 8 — GC pressure and the per-lexer mutex, not a design flaw. End-to-end
HTTP throughput flattens earlier still (§2) because each response carries 84–152 KiB,
**46 % of which is the inline theme block**. If throughput ever matters, linking the
theme CSS is the lever, not more cores.

**The recommendation that follows:** make the index immutable and swap it behind
`atomic.Pointer`. Readers then take no lock at all, the watcher builds the
replacement off the request path, and there is no window where a request sees a
half-updated index. It costs 12.4 ms of rebuild per invalidation on this corpus,
which is cheaper than the reasoning about partial updates.

---

## 7. Verdict

**JIT-with-warm-cache, by default, in both `serve` and `dev`. Not eager, not pure JIT.**

| Option | Why not / why |
|---|---|
| **Eager-by-default** (render all at boot) | 370 ms boot today, but linear in corpus size and this corpus already grew 3.8× past the notes' assumption. It also throws away the property that makes the migration worth it — a save touches one page, not all of them |
| **Pure JIT** (no cache) | Works — p50 1.83 ms, p90 10.11 ms — but pays 21 ms on the tail for every repeat view of the worst pages, for no reason. A cache that costs 13.9 MB is not a trade-off |
| **JIT + mtime-validated body cache** ✅ | p50 0.54 ms / p99 1.14 ms warm, 13–34 ms cold on a docs page, 69 ms cold on `/todo`, 48 MB RSS fully warm. Boot is 68 ms, of which 55 ms is `git log` that can be deferred or persisted |

Two conditions attach to that verdict, and neither is optional:

1. **The section-wide and tracker-wide render must go.** Serving one docs page must
   read one markdown file, and `/todo` must read frontmatter, not bodies. Porting
   `loadContent`/`loadIssues` as they stand would put a 146 ms render behind a page
   that needs a 10 ms index, in a runtime whose whole selling point is that it does
   not do that.
2. **`lexers.Get` must be memoised.** 6.5× on the corpus, 14× at p90, ten lines.

And one correction to carry forward: **the performance case for this migration is
real but currently argued from the wrong numbers.** The measured wins are
22× on markdown rendering, ~10× on full-site build (14.76 s → 1–3 s), and ~40×
on memory (2.0 GB peak → 48 MB). The measured *non*-wins are the "50–200 ms Astro
first byte" row (it is 6.3–8.9 ms warm today) and "chroma is fast" (it is a wash
with shiki on CSS and markdown, and 1.6× slower on the corpus's worst page).

---

## 8. What I could not settle

- **The 1.36 ms vs 6.57 ms per-file discrepancy** with the content-pipeline surface.
  Same libraries, same corpus scale, 4.8× apart. Resolve it before either figure is
  quoted; my harness renders every `.md` under `default-docs/data/` through the exact
  `createMarkdownRendererAsync()` config after a full warm-up pass.
- **Cold page-cache boot.** All my numbers are warm-page-cache. A genuinely cold
  first boot on spinning storage or a cold container layer will be dominated by
  reading 4.67 MB across 1,184 files, not by CPU — unmeasured.
- **Whether the body cache should hold rendered HTML or the goldmark AST.** Holding
  the AST would let a theme change re-render without re-highlighting; holding HTML is
  what I measured. Untested.
- **Whether `/todo` needs the git dates at all before first paint.** If the index can
  render with `created` and fill `updated` over SSE, the 55.5 ms leaves the boot path
  entirely. Not designed here.
- **The `[[path]]` reverse-dependency map.** 223 embeds across 64 files exist and
  their invalidation is real work; today's dependency lists are recorded and never
  read (the loaders surface proved `invalidateByDep` is dead code), so there is no
  working implementation to port — it has to be designed.
