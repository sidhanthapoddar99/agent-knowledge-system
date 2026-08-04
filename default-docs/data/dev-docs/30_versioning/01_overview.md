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
| **Content version** | `site.yaml → engine_version: "0.2.0"` | The engine version this content tree targets — bumped only after migrations run |
| **Engine version** | `src/loaders/engine-version.ts → ENGINE_VERSION` | What the engine currently is |
| **Compatibility floor** | same file → `MIN_CONTENT_VERSION` | The **oldest content version that still works unmigrated** on this engine |

A content tree with no `engine_version` declaration is treated as **`0.0.0`** —
every pre-contract project trips the gate exactly once, migrates, and is on the
contract from then on.

## Version semantics

- Format is `X.Y.Z`. Described by **position**, because "minor" and "patch" name
  different places to different readers:

  | Place | Moves for |
  |---|---|
  | `X` | reserved — beta (`0`) versus production |
  | `Y` | major upgrades |
  | `Z` | small additions and fixes |

- **All three places participate in compatibility.** The minimum means the
  minimum: content below `MIN_CONTENT_VERSION` is refused, whichever place
  differs. There is no rule about which one "counts".
- Comparison is numeric per segment, not lexicographic.

## Why the contract exists

Without it, format drift is discovered *downstream*: a validator warning here,
a silently misrendered page there, an agent mass-producing content against a
stale convention. The contract converts all of that into **one loud, early,
self-explanatory failure** at startup — and because the primary consumer of the
error message is an AI assistant, the message contains the complete recovery
procedure (see [The Version Gate](./02_version-gate.md)).

## This section

| Page | Covers |
|---|---|
| [The Version Gate](./02_version-gate.md) | Where the gate runs, both failure directions, exact messages |
| [Minimum Version](./03_minimum-version.md) | The floor — breaking vs good-to-have changes, release discipline |
| [Migrations](./04_migrations.md) | The `migration/` system — naming, the chain, the upgrade flow |
| [Authoring Migrations](./05_authoring-migrations.md) | Writing a new migration script, testing it, shipping it |

Consumer-facing summary: the user-guide's
[Versioning & Migrations](../../user-guide/10_configuration/07_versioning.md) page.
