---
title: "Should the cache be a B-tree, and what would the experience be?"
---

# Should the cache be a B-tree, and what would the experience be?

**No, to both readings — and the corpus measurements say so loudly enough that this
is not a close call.**

- **(A) In memory**: the content tree is not a B-tree workload. The median folder in
  this corpus holds **3 entries**; a B-tree node holds 16–32 keys, so every "tree"
  would collapse into a single node with pointer indirection on top. Keep the
  materialised nested struct the code already builds, add one flat index for
  prev/next, and stop.
- **(B) On disk**: do not persist rendered HTML, parsed frontmatter, or the folder
  index. Measured, a **warm** restart re-derives all of it in **7.8 ms** — less than
  the **11.2 ms** it takes to merely *read back* an equivalent 17 MB cache file.
  Persistence is slower than no persistence in the normal case, and it adds a
  staleness bug class the user has to learn a command to escape.
- **One exception, and it is not a B-tree**: the git-derived `updated` dates. That is
  the only value whose cost is proportional to *commit history* rather than to the
  corpus. **55 ms today**, projecting to ~700 ms at 3,000 commits. Persist that as a
  ~4 KB JSON file keyed by the HEAD SHA.

---

## 1. The corpus, measured

All figures below are `measured` on this machine (WSL2, ext4 on `/dev/sdd`, 32 cores,
64 GB RAM) on 2026-08-07, against
`default-docs/data/`.

Corpus scale — the numbers every later section is calibrated against:

| Quantity | Value | Unit |
|---|---|---|
| Markdown files | 1,030 | files |
| All files (md + json + html + assets) | 1,184 | files |
| Directories | 350 | dirs |
| Markdown bytes | 4,574,167 | bytes (4.57 MB) |
| All bytes under `data/` | 5,289,233 | bytes (5.29 MB) |
| `settings.json` / `.jsonc` files | 107 | files |
| Issue folders under `todo/` | 53 | folders |
| Markdown inside `todo/` | 868 | files |
| Mean files per issue folder | 18.0 | files |
| Largest issue folder | 164 | files |
| Largest markdown file | 52,265 | bytes |
| Markdown size p50 / p90 / p99 | 2,804 / 9,616 / 27,381 | bytes |
| Deepest path below `data/` | 9 | levels |

Tree *shape* — this is the number that answers reading (A) on its own:

| Fan-out (entries per directory) | Value |
|---|---|
| p50 | **3** |
| p90 | 8 |
| max | 54 (`todo/` itself: 53 issues + `settings.jsonc`) |
| max in the largest docs section | 12 (`user-guide/15_writing-content`) |
| `user-guide` — md files / folders / max depth | 95 / 27 / 4 |
| `dev-docs` — md files / folders / max depth | 64 / 17 / 4 |

A B-tree exists to keep a *deep* ordered structure shallow by packing many keys into
one node. Here the structure is already shallow (4 levels for docs, 9 at the extreme
in the tracker) and the nodes are already tiny. There is nothing for it to flatten.

---

## 2. Reading (A) — the content tree in memory

### 2.1 What the code actually does

I read `astro-doc-code/src/hooks/useSidebar.ts` (372 lines),
`astro-doc-code/src/loaders/issues.ts` (1,481 lines), and the issues index layout
under `astro-doc-code/src/layouts/issues/default/`.

The access pattern is **build-once, materialise whole, traverse in order, cache the
result**:

```
  loadContent(section)              --> flat []LoadedContent  (one filesystem walk)
        |
        v
  buildSidebarTree(content, base)   --> nested []SidebarNode
        |                                 - Map<string,TreeNode> per level while building
        |                                 - Array.sort by position at EACH level
        |                                 - whole result stored under one cache key
        v
  cacheManager.setCache('sidebar', `${dataPath}:${basePath}`, sortedResult, settingsDeps)
```

`useSidebar.ts:151` builds the cache key as `${dataPath}:${basePath}` — **one entry
for an entire section**. There is no per-node cache, no incremental update path, and
no partial invalidation. When anything changes, the whole tree is thrown away and
rebuilt. That is the correct design for this size, and it is also exactly the design
a B-tree would be pointless under: you never mutate the index in place.

Ordering is applied per level:

```js
// useSidebar.ts:288
children.sort((a, b) => a.position - b.position);
```

`position` comes from two different places depending on node kind — a folder's
position is its `NN_` prefix (`extractPosition`, defaulting to 999), a file's is
`item.data.sidebar_position ?? 999` from frontmatter. **The sort key is not a
property of the slug string.** To put this in a single ordered B-tree you would have
to synthesise a composite path key like `\x00{pos:05d}\x00{name}/\x00{pos:05d}\x00{name}`
at every level — i.e. materialise the ordering *before* inserting, which is the work
the nested struct already did.

Two more patterns matter:

- **Prev/next pagination** (`useSidebar.ts:337-366`) flattens the whole tree into a
  linear slice and does `findIndex` by href. Linear, on every docs page render.
- **The issues index does no server-side range work at all.** `issues.ts:1456` sorts
  once by `updated` descending, and `parts/index/IssuesTable.astro:66` renders
  *every* issue into the page. Filtering, column sort, grouping and pagination all
  happen in the browser over DOM rows (`scripts/index/filters.ts`,
  `parts/index/Pagination.astro`). There is no server-side prefix scan to accelerate.

So the two things a B-tree sells — ordered iteration over a mutating index, and
range/prefix scans — are used **zero times** at request time.

### 2.2 Measured: four structures, three corpus scales

Go 1.26.5, `google/btree v1.1.3`, `tidwall/btree v1.8.1`. Build time is the mean of
5 runs; traversal the mean of 20; prefix scan the mean of 100. `1x` is the real
corpus; `10x` and `100x` are the same slugs replicated under synthetic prefixes.

Build time, in milliseconds:

| Structure | 1x (1,030 items) | 10x (10,300) | 100x (103,000) |
|---|---|---|---|
| Materialised nested struct (today's model) | 0.377 | 4.300 | 38.872 |
| `map[parent][]Item` + sort per level | 0.201 | 2.124 | 27.272 |
| `google/btree` (degree 32) | 0.111 | 1.593 | 16.500 |
| `tidwall/btree` (generic) | 0.077 | 1.213 | 13.836 |

Heap held, in megabytes:

| Structure | 1x | 10x | 100x |
|---|---|---|---|
| Nested struct | 0.08 | 1.01 | 10.13 |
| map + sorted slice | 0.06 | 0.56 | 6.81 |
| `google/btree` | 0.06 | 0.65 | 6.56 |

Read operations, in milliseconds:

| Operation | 1x | 10x | 100x |
|---|---|---|---|
| Full ordered traversal — nested struct | 0.002 | 0.021 | 0.350 |
| Full ordered traversal — `google/btree` | 0.002 | 0.022 | 0.248 |
| Full ordered traversal — map + slice | 0.002 | 0.025 | 0.424 |
| Prefix scan `"todo"`/`"dupNN"` — btree `AscendGreaterOrEqual` | 0.0048 | 0.0048 | 0.0055 |
| Prefix scan — linear over the flat slice | 0.0017 | 0.0158 | 0.2001 |

Read the prefix-scan rows carefully, because they are the only honest argument in the
B-tree's favour and they still lose: at **1x the corpus the linear scan is 2.8x
FASTER** than the B-tree range scan (0.0017 ms vs 0.0048 ms), because 1,030
`strings.HasPrefix` calls over a contiguous slice beat tree descent and node
indirection. The B-tree only overtakes somewhere between 1x and 10x, and even at
**100x — 103,000 documents — the linear scan costs 0.20 ms.**

That is the shape of the whole answer:

```
  prefix-scan cost (ms)
  0.20 |                                        * linear
       |                                    .
       |                              .
  0.10 |                        .
       |                  .
       |            .
  0.01 |      .
       | *  ------------------------------------ btree (flat, ~0.005 ms)
       +------------------------------------------------------
        1x        10x                            100x
      (1,030)   (10,300)                       (103,000 docs)
                    ^
                    |  crossover is somewhere here.
                    |  The real corpus sits far to the LEFT of it,
                    |  and BOTH sides are under a millisecond anyway.
```

### 2.3 Recommendation for (A)

**Keep the materialised nested struct, built once per section and cached whole. Add
one thing: store the flattened `[]SidebarItem` and a `map[href]int` alongside the
cached tree, so `getPrevNext` becomes O(1) instead of flatten-plus-linear-scan on
every docs page render.**

Why this one: it preserves the property that makes the current design correct — the
in-memory shape is a *projection of the filesystem*, rebuilt wholesale whenever the
filesystem moves, so it can never partially disagree with disk. Incremental
structures earn their keep by avoiding rebuilds; a rebuild here costs 0.38 ms, so
there is nothing to avoid. Adding the flat index is ~15 lines and removes the only
per-request linear pass in the surface.

**Runner-up: `map[parent][]Item` plus a sorted slice per level.** It builds ~1.9x
faster (0.201 ms vs 0.377 ms) and holds 25% less heap, and it is arguably a cleaner
Go shape than a pointer-linked tree. What would make it win: if the Go port ends up
needing to answer "give me the children of path X" without walking from the root
often enough that the map lookup matters. It does not today — `nodeToSection`
recurses from the root and renders everything.

**What would make a B-tree win, stated plainly so the door stays open**: a corpus
past ~50,000 documents *combined with* a server that mutates the index in place
between requests rather than rebuilding it, *combined with* a real ordered
range-query API (e.g. server-side pagination or search-as-you-type over an ordered
key). All three would have to be true. At 100x the current corpus a full rebuild is
still 39 ms, so the second condition alone is a long way off.

---

## 3. Reading (B) — an on-disk B+tree as the persistent cache

### 3.1 What is even expensive?

Before choosing a store, measure what persistence would save. Go 1.26.5,
`goldmark v1.8.5` + `goldmark-highlighting v2` + `chroma v2.27.0`, over the real
corpus with frontmatter stripped.

Per-stage cost of building the whole site from scratch, warm page cache:

| Stage | Time | Notes |
|---|---|---|
| `WalkDir` metadata only, 1,184 files / 350 dirs | 1.6–2.1 ms | measured, 3 runs |
| Walk + `Info()` (stat) on all 1,534 entries | 2.6–4.2 ms | measured, 3 runs |
| Walk + read all 1,030 md (4.57 MB) | 6.2–8.5 ms | measured, 3 runs |
| goldmark render, **no** syntax highlighting, serial | **85 ms** | 0.083 ms/file |
| goldmark + chroma, serial | 787–893 ms | 0.77 ms/file |
| goldmark + chroma, 8 workers | **175 ms** | measured |
| goldmark + chroma, 32 workers | 141 ms | measured |
| Largest single file (52,210 bytes) render | 1.45 ms | → 73,910 bytes HTML |
| `git log --no-merges --name-only -- data/todo` | **55 ms** | 235 commits, 307 KB output |
| Whole rendered corpus held in RAM | 9.8 MB HeapAlloc / 15.6 MB HeapInuse | 1,030 docs, 7.11 MB HTML |

Three things fall out of that table.

1. **Syntax highlighting is ~90% of the render cost.** 85 ms without chroma, 790 ms
   with it, over 2,954 fence markers. If cold start ever becomes a real complaint,
   the lever is highlighting strategy, not a database.
2. **The entire corpus renders in 175 ms on 8 cores.** A JIT server does not do that
   — it renders the page you asked for, at 0.77 ms.
3. **All the rendered HTML fits in 15.6 MB of heap.** There is no memory pressure
   argument for spilling to disk.

### 3.2 The cold-start measurement, which is the interesting one

`FADV_DONTNEED` on every file, then `sync()`, then walk — a genuine cold page cache
(the inode/dentry cache survives, which is realistic: the directory tree is
touched by everything on the machine, the file *contents* are what get evicted).

| Boot shape | Cold | Warm |
|---|---|---|
| Metadata-only walk + stat (1,184 files) | **3.09 ms** | ~2.6 ms |
| Walk + read all 1,184 files (5.29 MB) | **156–163 ms** | 8.2–8.3 ms |
| Realistic JIT boot: walk + stat + 107 `settings.json` + first 4 KB of every md | **142.1 ms** | **7.8 ms** |
| Sequential read of one 17 MB file | **7.9 ms** | 11.2 ms |
| Sequential read of one 10 MB file | 4.3 ms | 2.9 ms |

The cold penalty is **not bytes, it is per-file IOs**: 5.29 MB scattered across 1,184
files costs 156 ms, while 17 MB in one file costs 7.9 ms. That is the strongest —
and only — technical argument for a single-file persistent cache, and it is worth
stating fairly: **on a truly cold start, one cache file replaces ~1,030 scattered
reads with one sequential one, saving roughly 130 ms.**

Now the part that kills it:

```
  ONE PAGE REQUESTED AFTER A BINARY RESTART  (measured components)

  WARM page cache  — the normal case, every restart during a work session
  ------------------------------------------------------------------------
  no persistence   walk+frontmatter  7.8 ms  + render 0.8 ms  =   8.6 ms
  persistence      stat-revalidate   1.2 ms  + read 17 MB DB 11.2 ms = 12.4 ms   <-- SLOWER
                   (mmap'd bbolt avoids the full read: ~1.2 ms + 0.0006 ms/key)

  COLD page cache  — after a machine reboot, or memory pressure
  ------------------------------------------------------------------------
  no persistence   walk+frontmatter 142.1 ms + render 0.8 ms = 142.9 ms
  persistence      stat-revalidate   3.1 ms  + read 17 MB DB  7.9 ms =  11.0 ms  <-- 130 ms better
  persistence      ...but ONLY if the invalidation key is stat-based.
                   With a content-hash key you must read every file anyway
                   = 156 ms + 7.9 ms = 164 ms                                    <-- WORSE than none
```

So persistence is: **slower in the common case, ~130 ms faster in the rare case, and
only if you accept the weaker invalidation key.** Nobody will feel 130 ms once per
machine reboot. Everybody will eventually feel a stale entry.

### 3.3 The three stores, measured

All on real ext4 (not tmpfs — my first run was on `/tmp`, which is tmpfs here, and
reported fsync as free; the numbers below are the corrected ones). Calibration:
**one `fsync` on this filesystem costs 0.737 ms**; on tmpfs it costs 0.0004 ms.
Payload is the real corpus rendered to HTML: 1,030 keys, 7,244,305 bytes.

| Operation | bbolt v1.5.0 (B+tree, mmap) | SQLite (modernc pure-Go, WAL) |
|---|---|---|
| Bulk write, 1,030 keys, one transaction | 22.5 ms | 31.9 ms |
| 200 individual write transactions | **136.3 ms (0.68 ms each)** | **12.1 ms (0.06 ms each)** |
| Read all 1,030 keys, one transaction | **0.65 ms** | 9.94 ms |
| 1,000 single-key reads | **0.56 ms (0.0006 ms each)** | 15.87 ms (0.0159 ms each) |
| File size on disk | 16.78 MB | 9.99 MB (db + wal + shm) |
| Size vs payload (~8.6 MB written incl. 200 dupes) | **~1.95x** | **~1.15x** |
| Second process opens it while the first holds it | **FAILS — `timeout`** | **works** |
| Second process opens it **read-only** | **FAILS — `timeout`** | works |

badger is the third name in the question. It is an **LSM tree, not a B-tree**, and it
is the wrong shape here for a reason worth stating: LSM buys write throughput through
compaction, which means background goroutines, periodic value-log GC, and write
amplification on a workload that writes ~1,030 keys once and then reads them forever.
A doc engine is read-mostly with occasional single-key rewrites. It is the least
suitable of the three; I did not benchmark it and would not recommend it.

**The bbolt lock result is decisive for this project specifically, and I verified it
rather than reading it**: `bolt.Open` with `Timeout: 500ms` on an already-open
database returns `timeout` — *including* with `ReadOnly: true`. This repo ships a
separate CLI with 37 commands (`agent-ks`) that a user runs *while the dev server is
up*. Under bbolt, any command wanting the cache would hang for its timeout and then
fail; under SQLite WAL, a second connection read the value cleanly in the same test.

Comparison against the criteria asked for:

| Criterion | bbolt | SQLite (modernc) | badger |
|---|---|---|---|
| Cold-start benefit | one sequential mmap; best raw read (0.0006 ms/key) | good (0.0159 ms/key), needs page-cache warmup | good, but LSM levels mean scattered reads |
| Write amplification | rewrites whole 4 KB pages; **~1.95x on-disk** | WAL append then checkpoint; **~1.15x on-disk** | highest — compaction rewrites data repeatedly |
| Single-writer vs concurrent HTTP | writers serialise on one global lock; readers are MVCC and never block — but a long read tx pins pages and the file grows | WAL: many concurrent readers + one writer, no reader blocking | multi-writer-ish, but GC goroutines compete |
| Memory map behaviour | fully mmap'd; must remap on grow, which briefly blocks; RSS tracks file size | optional mmap, page-cache based; predictable RSS | value log mmap'd; RSS can spike during compaction |
| Corruption / recovery | fsync'd two-phase meta pages; robust, but **no repair tool** — a bad file is deleted, not fixed | WAL journal + `PRAGMA integrity_check` + widely understood recovery | checksums + value-log replay; recovery is slow |
| Disk footprint (this corpus) | 16.78 MB | 9.99 MB | not measured; LSM typically ≥ bbolt pre-compaction |
| Cross-platform / Windows | pure Go, works — but mmap remap-on-grow and the exclusive `LockFileEx` are sharper on Windows, and the file cannot be truncated while mapped | pure Go (modernc) or cgo (mattn); WAL needs shared memory, which **does not work over network shares / `\\wsl$` / some Docker volume drivers** | pure Go; heaviest fsync load, worst on Windows |
| Multi-process (server + `agent-ks` CLI) | **impossible** (measured) | **works** (measured) | single-process only |

One Windows caveat that applies to *both* and deserves a line, because this project
supports it: SQLite's WAL mode uses a `-shm` shared-memory file, and it is documented
as not working across network filesystems. A user with their content on a mapped
drive, or accessing a WSL tree through `\\wsl$`, would get a cache that fails to open.
Under `journal_mode=DELETE` it works but loses the concurrent-reader property that was
the reason to pick SQLite in the first place. `read` confidence — I did not have a
network share to test.

### 3.4 What *should* be persisted, if anything

Four candidates were named. Each judged on: is the cost proportional to something
other than the corpus, and can it be recomputed cheaply?

| Candidate | Recompute cost (measured) | Persist? | Why |
|---|---|---|---|
| Rendered HTML | 0.77 ms per page on demand; 175 ms for all 1,030 at 8 workers | **No** | JIT never pays the bulk figure. Per-page is under a millisecond. |
| Parsed frontmatter | inside the 7.8 ms warm boot | **No** | Cheaper to re-read than to validate a cached copy. |
| Folder index | 1.6–3.1 ms walk | **No** | Cheaper than opening a database. |
| **Git-derived `updated` dates** | **55 ms today, 235 commits; ~700 ms projected at 3,000** | **Yes** | The only cost that scales with *history*, not corpus. Recomputing is a `spawnSync` of git, and it grows forever. |

The git-dates cache is 53 entries of `folder-slug → ISO date`. Serialised that is
about **4 KB**. It has a perfect invalidation key that costs one `git rev-parse`:
the HEAD SHA. `astro-doc-code/src/loaders/issue-dates.ts:33-36` already stores
`syncedAt` for exactly this and comments that it is "stored only for diagnostics" —
the design is 90% there, it just never writes to disk.

**A 4 KB JSON file keyed by a commit SHA is not a B+tree, and should not become one.**

---

## 4. The experience question

### 4.1 What each choice feels like

Scenarios asked about, with the measured components filled in.

| Moment | No persistence (recommended) | With a persistent HTML/index cache |
|---|---|---|
| Cold binary restart, warm page cache (typical dev restart) | first byte ≈ **8.6 ms** | ≈ 12.4 ms full-read / ≈ 1.2 ms mmap — indistinguishable |
| First start after a machine reboot | ≈ **143 ms** to first byte | ≈ **11 ms** — the one real win, felt once a day at most |
| `git pull` touching 400 files | watcher fires, in-memory caches drop, next request re-walks (7.8 ms warm) and re-renders on demand (0.77 ms/page) | must revalidate 1,184 entries (0.8–1.2 ms stat, or 4.7–7.0 ms hash) then re-render the changed 400 anyway |
| Edit a file, see it refresh | watcher → invalidate → re-render one file: **~0.8 ms** plus reload | same, **plus** a write transaction: **0.68 ms** (bbolt, fsync-bound) or **0.06 ms** (SQLite WAL) |
| A stale entry survives a restart | **cannot happen** — nothing survives the process | happens; user sees old content, F5 does not fix it, and they must know a command exists |

The last row is the whole argument. Everything above it is single-digit
milliseconds either way; a human cannot tell 8.6 ms from 12.4 ms. The bottom row is
the only one anybody will ever report as a bug, and it exists in exactly one column.

### 4.2 Staleness: what invalidation key, and what each misses

Measured cost of each candidate key over all 1,184 files:

| Key | Cost, whole corpus | What it misses |
|---|---|---|
| mtime only | 0.82–1.15 ms (warm) / 3.09 ms (cold) | Two writes inside one mtime tick. On ext4 that is nanoseconds and safe. **On `drvfs` / `/mnt/c` / `\\wsl$` — which this project runs on — it is 1 second, and this is a real hazard.** FAT/exFAT is 2 s. Also: the current TS implementation *sums* mtimes (`issues.ts:computeSignature`), and a sum is not injective — a checkout that sets many files to the same second can produce a colliding signature. |
| **mtime + size** | **same 0.82–1.15 ms** (both come from one `stat`) | Only same-tick edits that preserve byte length. Strictly better than mtime for zero extra cost. |
| Content hash (xxhash64) | **4.68–6.98 ms** | Nothing, for practical purposes. |
| Content hash (SHA-256) | 6.42–6.76 ms | Nothing. |

Two behaviours worth naming explicitly, because they are where mtime schemes break:

- **`git checkout` / `git stash pop` set mtime to *now*, not to the commit time.** That
  means git operations *over*-invalidate — safe, and cheap here. The dangerous
  inverse (a tool restoring an old mtime) does not occur in normal git usage, but
  `rsync -a`, `tar -x` and `cp -p` all do it, and any of those can restore a file
  whose content differs while its mtime is older than the cache entry. mtime alone
  misses that entirely; **size catches most of it; only a hash catches all of it.**
- **Editors that write-then-rename** (VS Code atomic save, `vim` with default
  `backupcopy`, most Go/Rust tooling) replace the file with a new inode. The
  *mtime* is correct, so mtime-keyed caches are fine — but an **inode-keyed cache is
  wrong**, and `fsnotify` reports `CREATE`/`RENAME` rather than `WRITE`, so the
  watcher must handle all three or the refresh silently stops working. This is the
  same class of trap as the existing chokidar echo-suppression counter in
  `astro-doc-code/src/dev-tools/server/editor-store.ts`.

**The punchline is that the "expensive, correct" key is not expensive.** Hashing the
entire corpus costs **4.7–7.0 ms** — about one HTTP round trip, and *less than the
warm boot walk it would be replacing anyway*. There is no reason to pick a weaker key
on cost grounds. And once you notice that hashing the whole corpus costs 6 ms, you
notice that *re-deriving* the whole corpus warm costs 7.8 ms, and the case for
persisting evaporates: you are paying a database to avoid work you could just do.

### 4.3 The escape hatch, and whether the user must know it exists

This is the real acceptance test for a persistent cache, and it is a product test,
not an engineering one:

> **Does the user ever have to learn that a cache exists?**

With no persistence: **never.** Restarting the binary is a complete reset, and users
already know how to restart a binary. There is no `--no-cache` flag to document, no
`cache clear` verb in the CLI's 37, no FAQ entry, no support conversation that begins
"try deleting `.agent-ks/cache/`". That is a genuine product property and it is worth
more than 130 ms once per reboot.

If persistence is adopted anyway — for the git dates, which I do recommend — the
escape hatch discipline is:

1. **The file must be disposable and derivable.** Deleting it costs 55 ms, never
   correctness. Put it under a clearly named, gitignored `.agent-ks/cache/` so
   `rm -rf` is the obvious move and does not need documenting.
2. **Stamp it with `ENGINE_VERSION` and a hash of the resolved config.** A version
   bump or a `site.yaml` change discards the whole file rather than trying to
   migrate it. `astro-doc-code/src/loaders/engine-version.ts` already carries the
   constant.
3. **Key it on the HEAD SHA, not on mtime.** Git dates derive from git; the SHA is
   the exact and complete key. A mismatch means recompute — there is no partial
   validity to reason about.
4. **Fail open, never fail closed.** Unreadable, truncated, wrong version, wrong SHA
   → ignore it and recompute. Never surface an error about a cache to the user.

Rule 4 is what turns a persistent cache from a bug class into an optimisation. A
cache that can only make things faster or make them equally slow is safe; a cache
that can make them *wrong* is not.

---

## 5. Recommendation

**(A) In-memory structure — the materialised nested struct the code already builds,
plus a flat `[]SidebarItem` + `map[href]int` stored beside it in the same cache
entry.** No B-tree, no ordered index, no incremental mutation.

Why: the workload is build-once / traverse-in-order / rebuild-wholesale, at a scale
where a full rebuild is **0.38 ms** and a full traversal is **0.002 ms**. Median
directory fan-out is **3**, so a B-tree node would never fill. The one thing a
B-tree buys — O(log n) range scans — is 2.8x *slower* than a linear scan at this
corpus size (0.0048 ms vs 0.0017 ms) and is never invoked at request time anyway.
Meanwhile the flat index removes the only genuine per-request linear pass on the
surface, `getPrevNext`.

Runner-up: `map[parent][]Item` with a sorted slice per level, which builds 1.9x
faster and holds 25% less heap. It wins if the Go port finds itself doing
children-of-path lookups without walking from the root.

**(B) Persistent store — none for HTML, frontmatter or the folder index. One 4 KB
JSON file for the git-derived `updated` dates, keyed by the HEAD SHA.**

Why: a warm restart re-derives everything in **7.8 ms**, which is *less* than the
**11.2 ms** it takes to read back an equivalent cache file. The only case persistence
wins is a genuinely cold page cache (**142.9 ms → 11.0 ms**), which happens after a
machine reboot and cannot be felt as anything but "it started". Against that, a
persistent cache adds a class of bug that outlives the process and needs a documented
escape hatch. The git dates are the sole exception because their cost scales with
commit history rather than corpus size — **55 ms at 235 commits, ~700 ms projected at
3,000** — and they have a perfect, free invalidation key.

If persistence is ever adopted more broadly, **use SQLite (modernc pure-Go), not
bbolt.** The reason is not performance — bbolt is 26x faster on single-key reads
(0.0006 ms vs 0.0159 ms) and would be the better engine in isolation. The reason is
that **bbolt refuses a second opener, even read-only** (verified: `timeout` after
452 ms with `ReadOnly: true`), and this project ships a 37-command CLI that users run
while the server is up. SQLite in WAL mode served a concurrent read from a second
connection in the same test, uses **1.15x** on-disk footprint against bbolt's
**1.95x**, and takes **0.06 ms** per individual write against bbolt's fsync-bound
**0.68 ms**. bbolt would win if the cache were guaranteed server-private forever and
read latency dominated — neither holds here.

**Invalidation key, whichever path is taken: content hash (xxhash64), not mtime.**
Measured at **4.68–6.98 ms for the entire 1,184-file corpus**, it is not the expensive
option people assume, and it is immune to the two failures that will actually bite —
1-second mtime granularity on `drvfs`/`\\wsl$`, and archive-extraction tools restoring
old mtimes onto changed content.

**What the user would feel: nothing, which is the goal.** First byte after a restart
stays under 10 ms warm. Editing a file and seeing it refresh stays at sub-millisecond
render plus reload. And they never learn that a cache exists, because the only thing
that survives the process is a 4 KB file about git commits, which cannot make a page
render wrong.

---

## 6. Bad news, stated plainly

- **A persistent HTML cache would make the normal case slower, not faster.** Warm
  restart: 8.6 ms without it, 12.4 ms with a full DB read. If it ships, it ships as a
  cold-start optimisation for a moment nobody times, and it should be argued that way
  rather than as a speedup.
- **The 175 ms full-corpus render figure is not a cost anyone pays.** A JIT server
  renders 0.77 ms per requested page. Any design that quotes 175 ms as the thing
  being avoided has assumed an eager build the proposed architecture does not do.
- **Chroma is 90% of render cost.** goldmark alone is 85 ms for the whole corpus;
  with highlighting it is 790 ms serial. If cold start ever becomes a complaint, the
  lever is highlighting (cache highlighted fences by fence-content hash, or skip
  highlighting for offscreen content), not a database.
- **`bbolt` is disqualified for a reason unrelated to its merits.** It is the better
  B+tree and the better read engine, and it cannot coexist with this project's own
  CLI. That is measured, not inferred.
- **I could not test SQLite WAL over a network share or `\\wsl$`.** The
  cross-platform row for SQLite is `read`, not `measured`, and it is the one place
  where the recommended store could fail on a supported platform.
- **Everything above was measured on WSL2/ext4 with 32 cores and a warm-ish disk.**
  Absolute numbers on a consumer laptop with 4 cores will be roughly 2-4x worse on
  the parallel render row and similar elsewhere. The *ratios* — which is what every
  conclusion here rests on — do not move.
