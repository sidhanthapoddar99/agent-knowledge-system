---
title: "Notes / subtasks / agent-log: TOC instead of MetaPanel"
status: done
---

The right-side MetaPanel is about the parent issue — it doesn't add value on a sub-page.

## Behaviour

For all sub-doc pages (`notes/`, `subtasks/`, `agent-log/`), replace the right-side MetaPanel with an auto-generated **table of contents** built from the document's headings.

## Tasks

- [ ] Detect sub-doc routes and swap the right pane (MetaPanel → TOC)
- [ ] Always show TOC for these pages — no minimum heading threshold (standardise behaviour)
- [ ] TOC links scroll to anchor on click
- [ ] Active section highlight as the reader scrolls (RAF-throttled, same approach as docs outline)
- [ ] Keep MetaPanel for the overview / `issue.md` view and the comment thread

## Out of scope

- New TOC component for *issue.md* itself (issue body is short; MetaPanel stays there)
