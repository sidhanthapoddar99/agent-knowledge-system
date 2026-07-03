---
title: "Native-markdown-only — retire custom tags entirely"
---

> **Resolved →** subtasks/10–40 (decision settled in-session 2026-07-03; subtasks execute it in prefix order)

# Native-markdown-only — retire custom tags entirely

Recorded from the 2026-07-03 session that opened this issue. What began as "fix the
stale `:::callout` snippets in the skills" escalated through "should we wire the
transformers or remove them?" and landed on a policy decision that reframes both this
issue and [2026-04-20-custom-tags](../../2026-04-20-custom-tags/issue.md).

## The decision (sidhantha)

**No custom tags at all — remove every reference to them, everywhere.** Skills,
user-guide, and eventually the dormant transformer code. The documentation describes
a **native-markdown-based system only**, and doesn't mention custom tags even as an
absent feature — the concept simply isn't part of the platform's vocabulary.

## Why

- **The project's center of gravity moved.** It started as a documentation engine;
  it has become an AI platform. AI agents are the primary authors, and models write
  native markdown reliably — complex visual tag syntaxes are exactly where they
  fail. The 45-file `:::callout` incident (see `agent-log/010_au_stale-syntax-audit/`)
  is the proof: a documented custom syntax gets mass-produced wrong at agent scale.
- **The tier ladder covers every real need without tags:**

  | Need | Native answer | Status |
  |---|---|---|
  | Callouts | Blockquotes (open: GFM `> [!NOTE]` alerts, see below) | renders today |
  | Collapsible | Native `<details><summary>` | renders today |
  | Diagrams | Fenced ```mermaid / ```graphviz blocks | wired (`src/scripts/diagrams.ts`) |
  | File/content embeds | `[[path]]` Obsidian-style embed | wired (`src/parsers/preprocessors/asset-embed.ts`, all 3 content types) |
  | Future embeds (Excalidraw etc.) | Extend `[[path]]` recognition by file extension — the reference architecture | planned |

- **"We legit don't need anything more"** — the `[[]]` transformer is the one
  extension pattern the platform keeps; anything an embed needs should ride on it
  rather than introduce attribute-bearing tag syntax.

## What this rejects

- Wiring `createCustomTagsRegistry()` / `TagTransformerRegistry` into the pipeline
  (the previous session's lean). The registry + `src/custom-tags/` transformers
  (callout, tabs, collapsible) are retired, not completed.
- Tabs as a feature — no native equivalent, and no demonstrated need.
- The premise of `2026-04-20-custom-tags` (wire-up, showcase, author-defined tags)
  is reversed; flagged there in a comment for a human close-out call.

## Open point (small)

> **Settled 2026-07-03 (sidhantha): yes** — callouts use GFM alerts (`> [!NOTE]`
> etc.). Renderer + theme support ships as `subtasks/20_gfm-alerts-callouts.md`,
> before the docs (30) and skills (40) describe the syntax.

Whether "native markdown" includes **GFM alerts** (`> [!NOTE]`) for callouts — they
are ecosystem-standard, degrade gracefully as plain blockquotes, and `marked` has an
off-the-shelf plugin — or whether plain blockquotes are enough.
