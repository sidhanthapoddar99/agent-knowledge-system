---
title: Versioning Overview
description: The content ↔ engine version contract — anchors, semantics, and why it exists
sidebar_position: 1
---

# Versioning Overview

The framework runs two things that evolve at different speeds: the **engine**
(`astro-doc-code/`) and the **content** it renders (`data/`, `config/`,
`themes/`). The version contract keeps them honest with each other: content
declares which engine version it targets, the engine declares what it supports,
and a startup gate refuses to run any combination outside that range.

## The three anchors

| Anchor | Lives in | Meaning |
|---|---|---|
| **Content version** | `site.yaml → engine_version: "0.7.0"` | The engine version this content tree targets — bumped only after migrations run |
| **Engine version** | `src/loaders/engine-version.ts → ENGINE_VERSION` | What the engine currently is |
| **Compatibility floor** | same file → `MIN_CONTENT_VERSION` | The **oldest content version that still works unmigrated** on this engine |

A content tree with no `engine_version` declaration is treated as **`0.0.0`** —
every pre-contract project trips the gate exactly once, migrates, and is on the
contract from then on.

## Version semantics

- Format is `N.N.N` (major.minor.patch). Major stays `0` while the project is
  in beta.
- **Only major.minor participate in compatibility.** A patch release never
  changes the content format, by definition — the gate ignores the third
  segment entirely (`compareFormatVersions()` compares two segments).
- Comparison is numeric per segment, not lexicographic.

## Why the contract exists

Without it, format drift is discovered *downstream*: a validator warning here,
a silently misrendered page there, an agent mass-producing content against a
stale convention. The contract converts all of that into **one loud, early,
self-explanatory failure** at startup — and because the primary consumer of the
error message is an AI assistant, the message contains the complete recovery
procedure (see [The Version Gate](./version-gate)).

## This section

| Page | Covers |
|---|---|
| [The Version Gate](./version-gate) | Where the gate runs, both failure directions, exact messages |
| [Minimum Version](./minimum-version) | The floor — breaking vs good-to-have changes, release discipline |
| [Migrations](./migrations) | The `migration/` system — naming, the chain, the upgrade flow |
| [Authoring Migrations](./authoring-migrations) | Writing a new migration script, testing it, shipping it |

Consumer-facing summary: the user-guide's
[Versioning & Migrations](/user-guide/configuration/versioning) page.
