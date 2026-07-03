---
title: "Remove custom-tags sections from both skill writing references"
status: done
---

Per the native-markdown-only decision
(`brainstorm/01_discuss_native-markdown-only.md`), custom tags are not part of the
platform — the skills must not mention them at all, not even as a deprecated or
absent feature. This replaces the original plan of correcting the snippets to the
`<callout>` tag form. Last in execution order — runs after subtasks 20/30 so the
skills describe syntax that renders and can point at the updated user-guide.

- [ ] `plugins/documentation-guide/skills/documentation-guide/references/writing.md`:
      delete the "Custom tags" section (~lines 36–56) including the pointer to
      `user-guide/15_writing-content/` for tag syntax. In its place, ensure the
      native toolkit is covered: GFM alert callouts (`> [!NOTE]` etc., shipped by
      subtask 20), native `<details>` for collapsible content, fenced
      ```mermaid / ```graphviz diagrams, and the `[[path]]` embed syntax.
- [ ] Same removal in
      `plugins/documentation-guide/skills/doc-issues/references/10_writing/10_writing.md`
      (~lines 60–80) — keep its existing diagrams guidance, add the `[[path]]`
      embed mention if absent.
- [ ] Sweep both skill trees for any other `callout` / `custom-tag` / `:::`
      mentions (SKILL.md files, other references) and remove them.
- [ ] Mirror every edit to the installed cache
      (`~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.5.1/`)
      — verified byte-identical to the repo source today; keep it that way.
