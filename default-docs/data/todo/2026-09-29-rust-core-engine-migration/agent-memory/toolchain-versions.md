---
title: "Toolchain versions"
---

sidhantha asked on 2026-09-30 for the latest Rust and the latest Vite.

| Tool | Version on 2026-09-30 | Check for newer |
|---|---|---|
| Rust (stable) | 1.98.1, edition 2024 | `rustup check` |
| Vite | 8.3.1 | `npm view vite version` |
| Bun | 1.4.2 | `bun upgrade --dry-run` or the Bun releases page |
| Node.js | 24.21.0 | `node --version` against the current LTS |

- Pin Rust in `rust-toolchain.toml` (with `clippy` and `rustfmt`) and the rest in `.mise.toml`, so every machine and CI builds with the same versions.
- When starting a subtask that adds a dependency, take its latest stable release at that time and check it builds on the pinned toolchain.
