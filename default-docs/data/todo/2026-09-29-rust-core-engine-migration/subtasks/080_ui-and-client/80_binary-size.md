---
title: "Shrink the release binary"
status: open
---

The release engine is 42.2 MB, 37.3 MB stripped, and 16.7 MB compressed with xz, measured on 2026-10-01 after main `3328cb7` removed the client's source maps. It is already under 20 MB compressed. But half the binary is the client stored three times (raw, brotli and gzip), and the release profile keeps its symbols. This leaf removes what the binary does not need. The estimate with the first two items done is about 23.6 MB, and about 12.7 MB with xz; that is not measured.

# 01 To Do
- [ ] **Strip symbols in the release profile.** Add a `[profile.release]` with `strip` to the engine workspace (`apps/agentks-engine/Cargo.toml`). Saves 4.9 MB of the binary. Compare `strip = "symbols"` with `strip = "debuginfo"`: check what a panic message and a backtrace still show, and pick the smallest that keeps a useful panic message.
- [ ] **Drop the raw copy of each client file that has a compressed copy.** The server crate's build script (`apps/agentks-engine/crates/server/build.rs`) stores every file raw, plus brotli and gzip when they are smaller. Saves about 13.7 MB of the binary and about 3.7 MB of the xz file.
    - [ ] Keep the raw copy of a file that has no compressed copy (a file that does not compress).
    - [ ] A request that accepts neither brotli nor gzip gets the gzip copy decompressed at run time. Only non-browser clients such as a bare `curl` send that request.
    - [ ] The `ETag` of a decompressed answer stays the raw content's hash, so a client's cached copy stays valid.
    - [ ] `tests/embedded.rs` covers a request with no `Accept-Encoding`.
- [ ] **Excalidraw's language files: the owner decides.** Vite emits 54 of them, 1.1 MB raw, about 0.3 MB of the xz file. Dropping them makes the drawing editor English only. Recommendation: keep only English, because the rest of the UI is English only.
- [ ] **Measure after each change** with the kit in `data/bench/`, the same way as comment 005: the binary, the stripped binary, `xz -9e`, `zstd --ultra -22` and gzip. Put the numbers in `## Result`.

## Guardrails
- Keep the gzip copies. Chromium asks a LAN address over plain HTTP for gzip only, and for brotli only on localhost and HTTPS (checked 2026-10-01 with `data/bench/accept-encoding-check.ts`). Without them, other people on the network would download uncompressed files.
- Keep the release guard of [080/70](./70_embed-in-binary.md): a release build fails when `dist/` is missing or older than the client sources.
- No source maps in the embedded client. If production maps are ever wanted, they ship outside the binary.
- Do not drop the language files without the owner's yes.
- `./ctl gate` and `./ctl build engine --release` green after each step.

## Done when
- The release binary carries no symbols and no raw copy of a client file that has a compressed copy.
- `tests/embedded.rs` passes for a request with brotli, with gzip, and with neither.
- `## Result` lists the new sizes next to the 2026-10-01 ones.

# 02 Status and Result
Open. Not started. Source maps were removed in `3328cb7` (78.0 → 42.2 MB).

## Result
None yet.

## Agent log
none

# 03 References
- [Comment 005, performance metrics](../../comments/005_2026-10-01_performance-metrics.md) — the sizes, the three-part split and the compressed sizes this leaf starts from.
- [080/70 Embed in binary](./70_embed-in-binary.md) — the embedding this leaf changes.
- [170/40 Performance budget](../170_testing/40_performance-budget.md) — owns the size budget in CI.
- [160/10 Installer and release workflow](../160_distribution/10_installer-and-release-workflow.md) — the release note states the size.
- [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 06 (size).
- Main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-engine/Cargo.toml`, `apps/agentks-engine/crates/server/build.rs` and `src/client/`, `apps/agentks-client/vite.config.ts`. The benchmark kit is in `data/bench/`, which git ignores, so it exists on this machine only.

# 04 Decisions
## 01 Drop the raw copies, keep the gzip copies
- Decided (claude, 2026-10-01): of the three copies, the raw one goes, because every browser asks for brotli or gzip, so the run-time decompression only serves tools like `curl`. The gzip copy stays, because Chromium asks a LAN address over plain HTTP for gzip only.

# 05 Notes & Analysis
## 01 What the release binary holds

| Part | Size | Share of 42.2 MB |
|---|---|---|
| Vite client: raw 13.70 + brotli 3.74 + gzip 4.31 MB | 21.75 MB | 51.5% |
| Rust engine: code and data | 15.54 MB | 36.8% |
| Symbols | 4.92 MB | 11.7% |

In the xz file the client is about 11.8 MB (70%) and Rust about 4.9 MB (30%), because the brotli and gzip copies do not compress further.

## 02 The heavy client chunks stay

By chunk name, no library is bundled twice. The biggest chunks are the draw.io viewer (4.0 MB raw, vendored), Mermaid (1.8 MB), Excalidraw (1.1 MB), Graphviz (0.8 MB), the editor engine (0.5 MB), Cytoscape (0.4 MB) and KaTeX (0.25 MB). Each loads only on a page that uses it, and the start-up JavaScript is 34.5 KB gzipped against a 120 KB budget. Making them smaller means dropping features, which is outside this leaf.

## Watch out
- `ls` on this machine is colorls, and its output breaks `awk` and `stat` parsing. Measure with `stat -c %s`.
- `ctl build engine` fails with "Text file busy" while a running engine uses the binary. Stop the demo engine first.
- The shell exports `AGENTKS_CONFIG_FOLDER` for the old repository. The kit's scripts unset it.
