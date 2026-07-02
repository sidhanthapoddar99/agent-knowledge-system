# Writing markdown inside issues

Self-contained writing reference for tracker content — every `.md` under an issue
folder. Duplicates the shared markdown mechanics on purpose (skills load one at a
time); the docs/blog flavour lives in the `documentation-guide` skill's
`references/writing.md`.

> **Sync note:** the *mechanics* sections here (custom tags, assets, `[[path]]`
> embedding, code blocks) mirror `documentation-guide/references/writing.md` — when
> editing one, mirror the other.

## Frontmatter per subdoc type

**`title` is required on every markdown file** (builds fail without it). Beyond that,
each subdoc has its own small schema:

| File | Frontmatter |
|---|---|
| `issue.md` | `title` only — metadata lives in `settings.json` |
| `comments/NNN_*.md` | `author` + `date` (YYYY-MM-DD) only — no `title` needed by the loader, but harmless |
| `subtasks/**.md` | `title` + `status` (one of the 7 statuses) |
| `notes/**`, `brainstorm/**`, `agent-memory/**` | `title` (+ optional `color:`) |
| `agent-log/**` milestones | `iteration`, `agent`, `status`, `date` (+ optional `color:`) |
| any subdoc | optional `color:` — tints the sidebar label, issue-defined meaning |

- `draft: true` hides a file from the production build (works tracker-wide).
- **Preserve `color:` when editing** — it's user-defined; document meanings in the
  issue's `glossary.md`, and check that glossary before interpreting colours.
- Don't write MDX — pure markdown only; extensions come from custom tags.

## Body conventions — write for cold pickup

Tracker prose is read by the *next* agent or a human months later, without your
context:

- **Subtasks / issue.md**: short intro saying what and why; checkboxes with a
  **bolded lead** then the explanation (what/where/how, concrete paths); `##` groups
  when a flat list outgrows itself; spell out pointers (`<issue>/subtasks/05_x.md`)
  instead of shorthand.
- **Agent-log milestones**: real `## Goal / Approach / Result / Next` headings with
  evidence (commits, test counts, paths) — never one run-on paragraph.
- **Comments**: a couple of lines + a pointer (the two-paragraph tripwire — see
  [21_comments.md](../20_sections/21_comments.md)).
- **Decision markers**: date + author decided lines (`**Decided (sidhantha,
  2026-07-02):** …`) and graduation markers (`> **Resolved →** <target>`) keep
  provenance in-file.

## Linking

- **Cross-issue / cross-file links**: standard markdown relative links
  (`../2026-05-08-runtime-stack-migration/issue.md`) or backticked repo paths in
  prose. `docs-guide move` rewrites real markdown links when files move — prefer them
  over bare prose paths for anything load-bearing.
- **`Related:` lines** at the end of a body are the convention for soft references
  (duplicate-check hits, sibling subtasks, superseded issues).
- Ordering prefixes are **stripped from URL slugs** (`subtasks/020_impl/010_backend.md`
  → `…/subtasks/impl/backend`).

## Custom tags

Project markdown extensions (from `astro-doc-code/src/custom-tags/`) work in issue
content:

```markdown
:::callout{type="info"}
Body of the callout.
:::

:::collapsible{title="Click to expand"}
Hidden content.
:::

:::tabs
- tab: First
  content: ...
- tab: Second
  content: ...
:::
```

## Diagrams

Mermaid and Graphviz fenced blocks render across the tracker — use one whenever it
beats prose (architecture, flows, before/after):

````markdown
```mermaid
flowchart LR
  manifest --> dispatcher --> command
```
````

ASCII trees in plain fences are equally at home (folder shapes, layouts).

## Assets

- **Shared files**: project root `assets/`, served at `/assets/` — absolute paths:
  `![Flow](/assets/flow.png)`.
- **Colocated files**: `<issue>/assets/` next to the markdown — relative paths:
  `![Flow](./assets/flow.png)`. The build rewrites them to `/content-assets/…`;
  colocated non-markdown files never appear in the sidebar.
- **Never commit raw screenshots** — run `docs-guide img` on any image you add
  (resize, grayscale, webp, strip metadata) so figures stay ≈60–100 KB.

## Content embedding (`[[path]]`)

`[[path]]` inlines another file's **raw text** at build time (code, text, diagram
source — never images). Wrap it in a fenced block to get language treatment; the file
stays the single source of truth:

````markdown
```python
[[./assets/example.py]]
```

```mermaid
[[./assets/flow.mmd]]
```
````

Issues path resolution: relative to the file; a bare name resolves to
`<issue-folder>/assets/<name>`. Escape as `\[[...]]` for literal brackets. Full rules:
`@root/default-docs/data/user-guide/15_writing-content/03_asset-embedding.md`.

## Ordering prefixes in the tracker

Same shared grammar as everywhere (2–5 digits, sorted by numeric value, `_` canonical,
gap-spaced) — but in the tracker **both `NN_` and `NNN_` are conventional**, and the
prefix is **optional** for most subdocs:

| Where | Convention |
|---|---|
| `subtasks/` | `NN_` or `NNN_` freely (leading digit can annotate a group) — see [23_subtasks.md](../20_sections/23_subtasks.md) |
| `comments/` | `NNN_` **auto-numbered by the CLI** — the number is the comment id, never hand-gapped |
| `agent-log/` | `NNN_<code>_<name>/` activities; `0NN` meta; `MNN_` milestones — see [24_agent-logs.md](../20_sections/24_agent-logs.md) |
| `brainstorm/`, `notes/` | optional; gap-number only when reading order matters |
| `agent-memory/` | usually none — name by topic |
