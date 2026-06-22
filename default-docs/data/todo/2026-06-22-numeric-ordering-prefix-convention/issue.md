## Goal

One numeric ordering-prefix convention across the whole framework: **leading digits =
numeric sort order, width 2–5, stripped for the URL, gap-spaceable.** Today docs are
locked to exactly 2 digits (`\d{2}`) while the issue tracker already accepts any width
(`\d+`) — two rules for the same idea. Unify them behind a single parser, widen docs to
`\d{2,5}` (min 2 for tidiness, max 5 for headroom), and keep it fully backward compatible.

Full reasoning — the case **for**, the case **against**, and the design — lives in
[notes/rationale-and-design.md](notes/rationale-and-design.md). Read that first.

## Why (short)

- A **single shared parser** replaces ~7 duplicated prefix regexes across loaders, parsers, and the validator.
- **Consistency**: one mental model (`docs = issues`) instead of "docs are 2-digit, issues are N-digit".
- **Real need**: occasional 3–4 digit cases have come up; min-2/max-5 gives headroom without going silly.
- **Grouping affordance**: the leading digit can annotate a group inside a *flat* folder (`110_`, `120_` = group 1; `210_` = group 2) — no subfolders needed.
- **Backward compatible**: every existing `05_`/`10_` still matches; sort is already numeric so values are unchanged; nothing renumbers.

## Scope / change surface

The fixed-2-digit assumption is hard-coded in ~5 framework spots (all must move to the shared helper / `\d{2,5}`):

- `astro-doc-code/src/parsers/content-types/docs.ts` — prefix extraction + `generateSlug`
- `astro-doc-code/src/parsers/core/base-parser.ts` — "has a prefix?" detector
- `astro-doc-code/src/parsers/postprocessors/internal-links.ts` — URL prefix strip
- `astro-doc-code/src/loaders/data.ts` — sidebar sort key (already numeric; only the regex width is the blocker)
- `plugins/documentation-guide/skills/documentation-guide/scripts/docs/check.mjs` — validator (also switch the collision key to the **numeric value**, so `02_` and `002_` are caught as colliding)

Out of scope: renaming any existing files (numeric sort means widths coexist).

## Tasks

See `subtasks/`. Order: shared helper → relax the 5 spots → numeric collision key →
update the skill references → build + render-test a 3-digit and a grouped page.

## Acceptance

- A docs section mixing `05_`, `010_`, and a grouped set (`110_`, `120_`, `210_`) builds, sorts by value, and produces clean prefix-stripped URLs.
- Existing 2-digit docs are byte-for-byte unaffected (same URLs, same order).
- `docs-check-section` accepts 2–5 digits, rejects 1-digit and >5, and flags numeric-value collisions across widths.
- One shared `parseOrderPrefix` helper is the only place the prefix grammar is defined.
