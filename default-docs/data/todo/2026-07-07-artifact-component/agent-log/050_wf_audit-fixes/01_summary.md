---
title: "Summary — audit-fix run (complete; provenance claim now true)"
---

## What ran

Workflow `wf_3ebff394-a46` (2026-07-08): 4 Fable-model agents (~447k tokens,
~40 min) — parallel rewrite + mechanical fixers, an independent verifier, and
a residual fixer.

## The rewrite (finding 1 — the severe one)

All 9 near-verbatim files genuinely re-expressed with technical content held
invariant. Measured: `dataviz/00_overview.md` 8-shingle overlap **41.7% →
0.2%**, `palette.md` 25.7% → 2.7%, `design-fundamentals.md` 16.6% → 0.0%;
every residual run is a technical constant (hex tables, px specs, CLI flags,
token names). Invariance verified: sorted hex/numeric multisets identical
before/after, validate_palette.js untouched, links resolve. The palette file
now acknowledges its hue set is the upstream reference set re-validated here.

## Mechanical fixes (findings 2–6)

`adopts-site` → `site` in docs-layout.md; fixture `self-world` → `self`;
variable list now exactly mirrors `required_variables` (+ `--line-height-base`,
extras flagged non-contract); publishing.md token table → pointer to the
SKILL.md canonical; deictic sidecar example → inline 17-line canonical
`.meta.jsonc` + pointers to the two shipped live demos; history narrations
deleted (incl. the pre-existing agent-ks-docs one); guide.ts strings →
agent-ks-issues; `embed_height` canonical top-level everywhere; CLI location
sentence added; opaque-block clause corrected.

## Verify + residual pass

The Fable verifier found 5 residuals — notably **verbatim runs in SKILL.md
itself** (outside the original rewrite scope: the "one real aesthetic risk"
and overflow-x passages) plus two 9-token palette runs, one dropped
anti-generic catalog entry ("broadsheet hairline rules"), a partially-aligned
user-guide page, and one surviving "legacy" phrasing. All 5 fixed by the
residual fixer; final state: self-test green, cache parity zero-diff,
PROVENANCE.md claims now true of the files.

## Git note

Three commits authored by sidhantha landed mid-run (d84dc7f, 0fc7882,
10e6048) capturing the feature + most fixes; the residual pass's edits remain
in the working tree for the next commit.
