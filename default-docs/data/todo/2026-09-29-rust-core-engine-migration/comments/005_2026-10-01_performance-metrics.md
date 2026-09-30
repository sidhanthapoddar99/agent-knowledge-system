---
author: claude
date: 2026-10-01
---

The release engine is 42.2 MB, 37.3 MB stripped, and 16.7 MB compressed with xz. That is after main 3328cb7 turned off the client's source maps, which were 35.6 MB of the binary.
Measured on 2026-10-01 on an i9-13900K (32 threads), against a demo project built from this repo's data: 1,512 page routes, 57 issues, 106 user-guide pages.

## Binary size

| Build | Size |
|---|---|
| Debug, with source maps | 298.7 MB |
| Release, with source maps | 78.0 MB |
| Release, without source maps | 42.2 MB |
| Release, without source maps, stripped | 37.3 MB |

## What the release binary holds

| Part | Size | Share of 42.2 MB |
|---|---|---|
| Vite client, embedded three times: raw 13.70 + brotli 3.74 + gzip 4.31 MB | 21.75 MB | 51.5% |
| Rust engine: code and data | 15.54 MB | 36.8% |
| Symbols, which `strip` removes | 4.92 MB | 11.7% |

In the stripped binary the client is 58.3% and Rust is 41.7%. In the xz file the client is about 11.8 MB (70%) and Rust about 4.9 MB (30%). The client's share grows because its brotli and gzip copies are already compressed.

## Best compressed size, stripped release

| Compressor | Without source maps | With source maps |
|---|---|---|
| xz -9e | 16.65 MB | 31.95 MB |
| zstd --ultra -22 | 17.15 MB | 32.53 MB |
| gzip | 19.56 MB | 38.02 MB |

## Where more size can go

None of these is done yet.

| Change | Binary | xz file | Catch |
|---|---|---|---|
| Strip symbols in the release profile | −4.9 MB | none, the xz figures are already stripped | none |
| Drop the raw client copies. For the rare client that accepts no compression, the engine decompresses the gzip copy | −13.7 MB | about −3.7 MB | a gzip decoder at run time |
| Drop the gzip copies | −4.3 MB | −4.3 MB | Not safe. Chromium asks a LAN address over plain HTTP for gzip only; it asks for brotli only on localhost and HTTPS |
| Drop Excalidraw's 54 language files | −1.1 MB raw | about −0.3 MB | the drawing editor is English only |

The biggest client chunks, raw. All of them load only on a page that uses them. The start-up JS is 34.5 KB gzipped, against a 120 KB budget. By chunk name, no library is bundled twice.

| Chunk | Raw |
|---|---|
| draw.io viewer, vendored | 4.0 MB |
| Mermaid, main chunk | 1.8 MB |
| Excalidraw | 1.1 MB, plus 1.1 MB of language files |
| Graphviz | 0.8 MB |
| Editor engine | 0.5 MB |
| Cytoscape | 0.4 MB |
| KaTeX | 0.25 MB |

## Video files

The compiled preview reels in the library's `preview/video/fixtures/`. There is no audio: narration is captions or the browser voice.

| Reel | Raw | Gzip | Slides | Length |
|---|---|---|---|---|
| animations.json | 36.3 KB | 7.7 KB | 6 | 64.1 s |
| layouts.json | 20.3 KB | 4.9 KB | 8 | 51.5 s |
| slides-edge.json | 36.9 KB | 5.4 KB | 12 | 80.9 s |
| slides.json | 44.1 KB | 6.5 KB | 13 | 115.9 s |
| style-blueprint.json | 14.7 KB | 4.1 KB | 5 | 40.1 s |
| style-bold.json | 13.8 KB | 3.8 KB | 5 | 39.4 s |
| style-clean.json | 13.1 KB | 3.7 KB | 5 | 40.3 s |
| transitions.json | 17.3 KB | 3.5 KB | 11 | 42.0 s |
| **Total** | **196.5 KB** | **39.5 KB** | | |

One image asset, docs-page.webp, is 26.9 KB. The player's main chunk is 67.2 KB raw and 19.9 KB gzipped; its other chunks are 14.7, 7.4 and 1.9 KB raw.

## Speed, memory and CPU

**Cold** means the disk render cache was deleted before the server started, so every first request renders the page. **Restart** means the server restarted and kept the disk cache from the cold run. A Bun client sent the requests one at a time over one WebSocket, and timed each answer including its JSON parse.

| Measure | Debug cold | Debug restart | Release cold | Release restart |
|---|---|---|---|---|
| `start` command returns | 1987 ms | 2002 ms | 370 ms | 381 ms |
| Port open | 2010 ms | 2021 ms | 395 ms | 423 ms |
| RAM at start (RSS) | 82 MB | 82 MB | 39 MB | 39 MB |
| Threads | 35 | 35 | 35 | 35 |
| Manifest, first answer (460 KB) | 1.39 ms | 3.81 ms | 2.13 ms | 1.48 ms |
| Docs page, first: p50 / p95 / max | 6.22 / 110.2 / 592.5 ms | 6.34 / 111.7 / 591.9 ms | 0.85 / 12.0 / 63.7 ms | 0.05 / 0.15 / 0.96 ms |
| Docs page, cached in memory: p50 / p95 | 0.07 / 0.15 ms | 0.07 / 0.16 ms | 0.09 / 0.23 ms | 0.05 / 0.17 ms |
| Page unchanged (client already has the hash) | 0.05 ms | 0.05 ms | 0.05 ms | 0.07 ms |
| Tracker list, first / cached (22 KB) | 0.11 / 0.09 ms | 0.11 / 0.08 ms | 0.21 / 0.14 ms | 0.26 / 0.22 ms |
| Biggest issue, first / cached (88 KB) | 4.07 / 0.17 ms | 4.06 / 0.19 ms | 1.49 / 0.23 ms | 0.69 / 0.54 ms |
| Every page once: total | 12.43 s | 12.22 s | 1.33 s | 0.10 s |
| Every page once: p50 / p95 | 1.18 / 32.9 ms | 1.13 / 33.7 ms | 0.18 / 3.38 ms (max 128) | 0.04 / 0.19 ms (max 2.1) |
| CPU while serving every page once | 99% | 99% | 93% | 37% |
| Cached answers per second, one socket | 2,696 | 3,809 | 9,462 | 9,190 |
| CPU during 5,000 cached answers | 78% | 75% | 38% | 40% |
| HTTP index.html: p50 / p95 | 0.09 / 0.18 ms | 0.37 / 0.74 ms | 0.04 / 0.05 ms | 0.12 / 0.31 ms |
| HTTP start-up script, brotli: p50 / p95 | 0.72 / 0.96 ms | 0.62 / 1.08 ms | 0.30 / 0.38 ms | 0.21 / 0.97 ms |
| RAM after every page (also the peak) | 372 MB | 373 MB | 300 MB | 58 MB |
| CPU while idle | 0.1% | 0.1% | 0.0% | 0.0% |

CPU is a share of one core.

Three things are open:

- The release engine holds 300 MB after it renders every page cold. The target is 150 MB, and [030/90 memory and concurrency](../subtasks/030_rust-engine/90_memory-and-concurrency.md) already records the same gap. After a restart from the disk cache it holds 58 MB.
- The debug build rendered every page again after its restart, so its restart column matches its cold column. That is by design: a dev build keeps pages on disk only when compiled with `AGENTKS_DEV_COMMIT`, and nothing sets it yet, although the code says `ctl build` does. [040/97 dev build disk cache](../subtasks/040_caching/97_dev-build-disk-cache.md) tracks it.
- Shrinking the binary further is [080/80 binary size](../subtasks/080_ui-and-client/80_binary-size.md).
