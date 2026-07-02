---
title: "Three integration methods — how the editor plugged into distribution"
sidebar_label: "04 · Three integration methods"
---

# Three integration methods

This is the branch of the deliberation that **graduated cleanly**. The cancelled issue carried a
cross-reference (`comments/001`) sketching how the extracted editor would slot into the *three
usage methods* first defined in `2026-04-26-framework-as-cli-tool`. That three-method model
survived the runtime migration — see `notes/deployment-methods/01_three-methods.md` — even though
the Rust-editor-as-separate-product framing around it did not.

## The editor's place in each method (as originally sketched)

| Method | How the editor slotted in |
|---|---|
| **1 — CLI / compose** | The editor server was just another service in `docs.yaml` (`editor: { enabled, port, auth }`); a compose command could bring up editor + renderer together, or the editor alone. |
| **2 — From source** | A separate long-running process started beside the renderer (a sibling to the `start` wrapper), sharing the same `.env` / `docs.yaml` — no duplicate config. |
| **3 — Docker** | The editor shipped as its own container / long-lived service, with auth gating (from the auth subtask) enforced at the container's HTTP/WS boundary. |

## What changed under the migration

The original framing assumed a **CLI that *launches* the framework** (spawns `bun run dev`) with
the editor as a *separate process/container* beside it. The runtime migration collapses that: the
binary **is** the framework, so the three methods differ only in *how you got the binary*
(curl-install / build-from-source / container), not in what runs. Concretely:

- The `docs.yaml` compose-schema-that-spawns-bun is replaced by a simpler `doc-engine.toml` run
  config; Bun bootstrapping and the framework-deps cache disappear (no deps to install).
- The editor-as-its-own-service assumption weakens: under phase 3a the editor is *inside* the one
  binary, not a sibling process — so "bring up the editor separately" is no longer the default
  story (it returns only under phase 3b).
- What survived verbatim: the **three-methods model itself**, the **Docker design**, and the
  **auth-at-the-boundary** placement — all now living in `notes/deployment-methods/` rather than
  scattered across the editor issue and `framework-as-cli-tool`.

## Why this file exists

It records the *reasoning* the successor notes flattened away: the editor was never meant to be a
distribution afterthought — it had a concrete slot in each method (config key, sibling process,
dedicated container), and losing the standalone-product framing did **not** invalidate that
slotting. It re-materializes as an optional surface of the single binary, or — under phase 3b — as
the separate-container case the Docker design already anticipates.

**Related deliberation upstream** (from the cancelled issue's cross-reference): the three-method
architecture and `docs.yaml` schema came from `2026-04-26-framework-as-cli-tool`; naming for the
editor product was downstream of `2026-04-26-project-rebrand`.
