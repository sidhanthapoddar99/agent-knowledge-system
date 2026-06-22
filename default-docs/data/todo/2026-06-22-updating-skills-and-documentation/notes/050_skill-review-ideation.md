---
title: "050 — skill review & optimization (ideation, not yet scoped for build)"
---

# Rethinking checking & skill optimizations — ideation

Scoping pass for [subtask 050](../subtasks/050_rethinking-checking-and-skill-optimizations.md), reviewed through the `skill-creator` lens (progressive disclosure, lean bodies, scripts-for-repeated-work, description-triggering) plus a correctness/redundancy pass over the four validators. **Nothing here is implemented** — it's the menu to discuss before building.

## Snapshot (measured 2026-06-22)

| Always-loaded (skill bodies) | lines | Load-on-demand (references) | lines |
|---|---|---|---|
| `documentation-guide/SKILL.md` | 135 | `settings-layout.md` | **429** |
| `doc-agent/SKILL.md` | 48 | `layouts/issues/` (16 files) | 1010 total, ~60–150 each |
| | | `images.md` / `docs-layout.md` / `blog-layout.md` / `writing.md` | 109 / 184 / 79 / 95 |

| Validator | lines | uses shared `_order-prefix.mjs`? |
|---|---|---|
| `scripts/docs/check.mjs` | 144 | ✅ (2 refs) |
| `scripts/issues/check.mjs` | 289 | ❌ reimplements inline |
| `scripts/blog/check.mjs` | 95 | n/a (no prefix) |
| `scripts/config/check.mjs` | 187 | n/a |

Verdict on token-efficiency: **the skill is in good shape post-030.** Bodies are well under the 500-line ceiling; the issues split means an agent loads ~one 100-line file instead of the old 586. The remaining wins are in the validators and a couple of reference-hygiene items, not the hot path.

## Candidate optimizations (proposals — pick before building)

### A. Validators — kill duplication & drift risk *(highest value)*

1. **Route `issues/check.mjs` through `_order-prefix.mjs`.** That file is the canonical grammar (an intentional mirror of `src/parsers/core/order-prefix.ts`), but the issues validator reimplements prefix parsing inline. Two copies of the same grammar in one plugin = drift risk; the issues validator is exactly where the `NN_`/`NNN_` + legacy-`-` (`*Loose`) rules matter most. Make it import the shared helper.
2. **Extract a tiny shared `scripts/_check-lib.mjs`.** All four validators independently `readFileSync` + parse frontmatter + read `settings.json` + assert `title:`. `issues/_lib.mjs` already has `readJson` and a frontmatter parser, but it's issues-only and not imported cross-domain. Pull the 3–4 truly common primitives (`readJson`, `hasFrontmatterTitle`, `validateOrderPrefix`, settings-presence) into one `_check-lib.mjs`; each `check.mjs` keeps only its domain-specific rules. Shrinks all four and removes the "fix the title check in 4 places" tax.

### B. Validator correctness gaps to audit *(needs a read-through, not yet confirmed)*

- Does `docs/check.mjs` validate that `settings.json` *parses*, or only that it *exists*? (Presence ≠ valid JSON.)
- Does `issues/check.mjs` actually accept the legacy `-` separator via the `*Loose` family, or silently warn on valid existing folders?
- Is there any check that the agent-log typed-workspace numbering (040: `001`–`004` meta then `1xx`) is *advisory only* — i.e. the validator must NOT error on a flat `agent-log/`? Confirm 040 stayed Part-A (no new hard rules).
- Cross-cutting: a `--strict` parity audit — do all four validators treat unknown-key warnings the same way?

### C. Skill / reference hygiene

3. **Add a TOC to `settings-layout.md` (429 lines).** It's the only reference over the skill-creator 300-line guideline without one. Either a TOC, or split it the way 030 split issues (e.g. `settings/` → site / navbar-footer / env-aliases / themes).
4. **Skill-internal link check.** The 030 split relied on hand-verification that sibling links resolve. A ~30-line `scripts/check-skill-links.mjs` (or folding it into a validator) would catch a broken `[..](24_agent-logs.md)` automatically — cheap insurance as references keep moving.
5. **Run the `skill-creator` description optimizer on both skills.** `doc-agent`'s triggering description is brand-new and untested; `documentation-guide`'s was hand-edited during 030. The optimizer (`run_loop.py`, 20 should/should-not-trigger queries, 60/40 train/test) would validate that `doc-agent` fires mid-execution without `documentation-guide` stealing the trigger, and that the two don't double-fire. This is the one item that genuinely needs eval runs rather than a code edit.

### D. Considered & probably *not* worth it

- **Bundling the duplicate-check (Pattern C) as a `docs-dupe-check` wrapper.** It's inherently judgment-driven (which keywords to stem, warm-context skip) — prose in the reference fits better than a script. Skip unless it proves a repeated pain point.
- **Moving the CLI table out of `SKILL.md` body into a reference.** It's high-value and always-relevant; the body is only 135 lines. Leave it.

## Suggested ordering if/when we build

`A1 → A2` (mechanical, high value, removes drift) → `B` (read-through audit, may surface real bugs) → `C3/C4` (hygiene) → `C5` (description optimizer — separate eval session, do last so it tests the final descriptions). `D` items: decline for now.
