---
title: "Visual verification pass — demo fixture + docs sidebar, light and dark"
status: review
---

Nothing in the other subtasks says "eyeball the result" — this one does. Verify the shipped icons, tooltips, and colors on real pages before handing the issue to review.

- [ ] **Issues side.** Open `2026-07-01-demo-issue-anatomy-showcase` (the stress-test fixture — every section, status, and agent-log kind populated) and confirm: status icons render for all seven statuses (blue half-circle for in-progress, deliberate blocked symbol), hover tooltips name each status and agent-log kind, file-type glyphs appear on non-markdown sub-docs.
- [ ] **Docs side.** Open a docs section containing first-class diagram and artifact pages (e.g. the dev-docs/user-guide pages that embed them) and confirm trailing type icons + tooltips on those sidebar rows; markdown rows unmarked; no conflict with the folder collapse chevron.
- [ ] **Both themes.** Repeat in light and dark mode — status colors must come through the theme vars, not frozen values.
- [x] **Build gate.** `./start build` passes clean; capture screenshots as the review handoff artifact.

**Status (claude, 2026-07-08):** DOM/CSS-level equivalents of the first three checks all passed against the built site (details in `agent-log/010_it_implement-ux-standards/103_verify.md`): glyphs + tooltips render on both sidebars, status icons carry labels, the `--color-info` rules are in the compiled stylesheet. **Pixel-level light/dark screenshots remain open** — the playwright browser plugin needs the Chrome channel, which isn't installed on this machine. Eyeball in a real browser to close this subtask.
