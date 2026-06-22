---
title: "Update docs when feature ships"
state: open
---

Placeholder doc already exists at **`dynamic_data/data/user-guide/10_configuration/06_dev-mode.md`** — created on 2026-04-21 (merged from the now-deleted `15_writing-content/06_dev-mode.md`) with a "Planned — not implemented yet" banner pointing back to this issue. When the feature lands, update the doc to describe actual behaviour rather than intended behaviour.

## Tasks on ship

- [ ] Drop the "Planned — not implemented yet" banner from the "Whole section" subsection of `10_configuration/06_dev-mode.md`.
- [ ] Update the summary status table — every `❌ Planned` row flips to `✅ Implemented` once shipped.
- [ ] Add `hideInProd: true` documentation to `10_configuration/03_site/08_page.md` (under page entry fields).
- [ ] Add `hideInProd: true` documentation to `10_configuration/04_navbar.md` (under item / dropdown fields).
- [ ] If `devOnly: true` frontmatter ships as a distinct flag from `draft`, update `15_writing-content/05_drafts.md` to document both and clarify when to use which.
- [ ] Update the Claude skill `docs-settings` to teach the new config fields.
- [ ] Tick the "Document the feature with examples" item in this issue's `issue.md`.

## Visual-indicator work

- [ ] Dev-mode sidebar badge for hidden pages (design + implementation).
- [ ] Dev-mode navbar badge for hidden items.
- [ ] Document indicators in `10_configuration/06_dev-mode.md` once they exist.

## Cross-references to update

- `06_dev-mode.md` currently links to `/user-guide/configuration/site/page` and `/user-guide/configuration/navbar` — verify those links still resolve after any IA changes.
- `15_writing-content/05_drafts.md` references this page — keep the cross-link current.
- `15_writing-content/01_overview.md` links to the Dev Mode page — keep the cross-link current.
