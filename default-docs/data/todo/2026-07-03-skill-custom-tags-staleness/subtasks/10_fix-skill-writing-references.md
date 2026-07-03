---
title: "Replace ::: directive snippets with the real tag form in both skills"
status: open
---

Correct the "Custom tags" section in both writing references so agents stop
producing markup the framework has never parsed. This is the load-bearing fix; the
audit (`agent-log/010_au_stale-syntax-audit/`) pinned the exact locations.

- [ ] `plugins/documentation-guide/skills/documentation-guide/references/writing.md`
      (~lines 36–56): replace the `:::callout` / `:::collapsible` / `:::tabs`
      snippets with the HTML-tag form from `astro-doc-code/src/custom-tags/`
      (`<callout type="info" title="…">`, `<collapsible title="…">`,
      `<tabs>`/`<tab label="…">`), each with the not-yet-wired caveat — or drop the
      section until wiring lands, matching the user-guide's April decision.
- [ ] Same edit in
      `plugins/documentation-guide/skills/doc-issues/references/10_writing/10_writing.md`
      (~lines 60–80), including softening the "work in issue content" claim.
- [ ] Fix `writing.md`'s pointer to `user-guide/15_writing-content/` for custom-tag
      syntax — that page was removed 2026-04-20; point at
      `2026-04-20-custom-tags/notes/01_original-user-doc.md` or drop the pointer.
- [ ] Mirror every edit to the installed cache
      (`~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.5.1/`)
      — verified identical to the repo source today; keep it that way.
