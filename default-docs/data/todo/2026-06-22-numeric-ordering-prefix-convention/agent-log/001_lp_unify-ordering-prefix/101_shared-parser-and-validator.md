---
iteration: 1
agent: claude
status: success
date: 2026-06-22
---

Implemented the unified 2–5 digit ordering-prefix convention.

**Code**
- New shared helper `astro-doc-code/src/parsers/core/order-prefix.ts` — `parseOrderPrefix` / `hasOrderPrefix` / `stripOrderPrefix`, grammar `^(\d{2,5})_`, ordered by numeric value. Single source of truth.
- Rewired 5 framework spots onto it: `parsers/content-types/docs.ts` (parseFilename), `parsers/core/base-parser.ts` (hasPositionPrefix), `parsers/postprocessors/internal-links.ts` (URL strip), `hooks/useSidebar.ts` (extractPosition — found via exhaustive grep, not in the original 5-spot estimate), `loaders/data.ts` (sort tuple).
- Validator `scripts/docs/check.mjs`: accept `\d{2,5}`, reject 1-digit and 6+ with a targeted message, key collisions on the numeric value (so `02_` and `002_` clash).

**Docs** updated: `docs-layout.md` (2–5 width + numeric sort + grouping pattern), `issue-layout.md` (shared grammar; notes/agent-log optional numbering), `SKILL.md`, framework `CLAUDE.md`.

**Verified**
- `bun run build`: 295 pages, existing 2-digit content byte-identical (backward compatible).
- Render test (temp section, since removed): mixed-width + grouped pages built with prefix-stripped URLs (`010_beta`→`/beta`, `110_grp1-a`→`/grp1-a`) and **numeric** sidebar order (`05_alpha`=5 before `010_beta`=10 — a lexical bug would reverse them).
- Validator: accepts the good section; rejects 1-digit (`5_`), 6-digit (`123456_`), and the `02_`/`002_` numeric collision.

No migrations; existing files untouched. Lives uncommitted in the documentation-template clone.
