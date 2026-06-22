---
title: Rationale & design — unified numeric ordering-prefix convention
---

# Rationale & design

Why widen the docs ordering prefix to a shared, variable-width numeric convention —
the case for, the case against, and the resulting design. Written so the decision is
re-checkable later, not re-litigated.

## Where things stand

The framework orders content with a leading numeric prefix, but two different rules exist:

- **Docs** (`data/<section>/`) — fixed **2 digits**, `^(\d{2})_`. Enforced by the
  validator and assumed by the loader/parsers. Range 01–99.
- **Issue tracker** (subtasks, comments, agent-logs) — **any width**, `^(\d+)[_-]`,
  ordered by `parseInt` value. Comments/agent-logs are auto-numbered 3-digit by the CLI.

So the same concept ("a number that sets order, stripped from the URL/title") is
implemented ~7 times across `parsers/`, `loaders/`, and the validator, with two
different width rules. This issue makes it **one rule, one parser, width 2–5**.

## The case FOR (the valid points)

1. **Unified parser.** Replace ~7 scattered prefix regexes with a single
   `parseOrderPrefix(name) → { sequence, rest }`. Docs and issues consume the same
   helper. Less duplication, one place to reason about, no drift between surfaces.
2. **Consistency lowers future confusion.** One model — *digits = numeric order,
   width 2–5, sort by value, gap-spaceable* — instead of "docs are 2-digit, issues are
   N-digit." This is the main point: it's not really about issues vs docs, it's about
   never having to remember which surface uses which rule.
3. **A real (if rare) need.** Cases have come up where 3 — occasionally 4 — digits
   would have helped. Rare, but real; today they're simply disallowed for docs.
4. **Backward compatible.** Every existing `05_`/`10_` matches `\d{2,5}`, and the sort
   is already numeric so `05` still means 5. Nothing renumbers, no URL changes, no
   existing page moves. The only "break" would be code that relied on the validator
   *rejecting* 3-digit — which nothing does.
5. **Grouping affordance.** A wider prefix lets the **leading digit annotate a group**
   inside a *flat* folder: `110_`, `120_`, `130_` = group 1; `210_`, `220_` = group 2.
   Hierarchical grouping without subfolders — the classic line-number / library-class
   trick. Not ideal for every case, but a useful option to have.
6. **Bounded headroom.** Min 2 (keeps things tidy and aligned, rejects lone `5_`), max 5
   (up to 99999 — absurd to exceed; genuine exceptions can be catered case-by-case).

## The case AGAINST (why one might NOT do this)

Captured honestly so the trade-off is visible:

1. **It's framework source, in ~5 coordinated spots.** Relaxing one regex but missing
   another causes *silent* breakage — a 3-digit page that sorts to the bottom, or a URL
   that keeps its prefix — with no error. Bigger blast radius than a doc/skill edit;
   needs an exhaustive `\d{2}` sweep + a build + a render test.
2. **The capacity argument alone is weak.** 2-digit + gap-numbering already gives
   ~19 (step 5) to ~49 (step 2) siblings per folder. A docs section with >99 entries is
   a signal to *split the section*, not to widen the prefix.
3. **Fixed width is visually tidier.** Uniform 2-digit prefixes align cleanly in a file
   listing; mixed widths (`05_` next to `110_`) read raggedly.
4. **Equal-value-different-width ambiguity.** `02_` and `002_` both parse to 2 and would
   tie in sort. Mitigated — but only if the validator's collision check keys on the
   numeric value (it currently keys on the string), so this is extra work the change
   *must* include to stay safe.
5. **Partly cosmetic gain.** Much of the upside is consistency/elegance, not capability.
   That's a real benefit, but it's worth being honest that it isn't unblocking anything
   for most folders.

## Decision

**Proceed.** The unified parser (1), the consistency model (2), the grouping affordance
(5), and the standing real need (3) outweigh the costs — and the costs are mostly
*mitigatable*: the blast radius (against-1) is contained by an exhaustive grep + build +
render test, and the ambiguity (against-4) is closed by the numeric collision key, which
we fold into the same change. Width is **`\d{2,5}`** (min 2, max 5; exceptions catered
deliberately, not by default).

## Design

- **Grammar:** `^(\d{2,5})[_-]` — 2 to 5 leading digits, then `_` (docs) / `_`-or-`-`
  (issues), then the slug. One shared `parseOrderPrefix` helper defines it.
- **Order:** by `parseInt` value (already how it works). Widths coexist.
- **URL/title:** strip the full `^\d{2,5}[_-]` regardless of width (so `010_overview`
  → `/overview`).
- **Validator:** accept 2–5 digits; reject 1 and >5; detect collisions on the **numeric
  value**, not the prefix string.
- **Gap numbering** (already documented in `docs-layout.md` / `issue-layout.md`): space
  prefixes so inserts don't renumber. With 3 digits, the leading digit can also carry a
  group (the grouping affordance above).
- **No migrations.** Existing 2-digit content is left exactly as-is.

## Implementation outcome

Shipped as one shared definition with the separator as the only knob:

- **One module, two variants.** `parsers/core/order-prefix.ts` (mirrored in the plugin's
  `scripts/_order-prefix.mjs`) builds both families from a single `makeOrderPrefix(sep)`
  factory — same `\d{2,5}` width, same numeric-value sort:
  - `parseOrderPrefix*` (strict `_`) — docs. The docs validator keeps requiring `_`.
  - `parseOrderPrefixLoose*` (`[_-]`) — the issue tracker, so historical hyphen folders
    keep parsing.
- **Why the loose variant is needed (the audit finding).** Tightening issues to `_`-only
  would *not* have been backward-compatible: three existing note folders use a `-`
  separator — `2026-06-09-astro-6-upgrade/notes/{00-astro-update, 01-astro-update-impact,
  03-astro-upgrade-benefits}`. The loose separator class preserves them (verified: they
  parse to positions 0/1/3 with the prefix stripped from the label) while docs stay
  strict `_` (so a stray docs file like `2024-report.md` can never reparse).
- **Wired the issues side onto the shared parser:** `loaders/issues.ts` (agent-log
  sequence, `slugToLabel`, subtask file + group folder) and the layout
  `SubdocTree.astro` (agent-log leaf label) in the framework; `scripts/issues/_lib.mjs`
  (subtask, subtask-group, agent-log) and `scripts/docs/check.mjs` (strict constants) in
  the plugin. The auto-increment counter `nextNumericPrefix` deliberately stays permissive
  (`\d+`) — it's a max-finder, not the ordering grammar.
- **Verified:** framework build green (295 pages); the hyphen-note issue loads correctly;
  `docs-check-section` accepts mixed widths + groups, rejects 1-digit / 6+-digit, and
  catches numeric collisions (`02_` ≡ `002_`).
