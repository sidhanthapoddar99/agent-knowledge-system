# Writing markdown inside issues

Self-contained writing reference for tracker content — every `.md` under an issue
folder. Duplicates the shared markdown mechanics on purpose (skills load one at a
time); the docs/blog flavour lives in the `agent-ks-docs` skill's
`references/writing.md`.

> **Sync note:** the *mechanics* sections here (callouts & collapsibles, assets, `[[path]]`
> embedding, code blocks) mirror `agent-ks-docs/references/writing.md` — when
> editing one, mirror the other.

## Frontmatter per subdoc type

**`title` is required by convention on every markdown file — but nothing enforces it.**
Measured 2026-08-03 with a titleless note and a full build: the build **succeeds**, the
page renders, and the title falls back to the file slug, shipping as
`_titleless-probe · <issue> | Agent KS`. So a missing `title` is not caught by any gate;
it is caught by someone noticing an ugly heading later. Beyond that, each subdoc has its
own small schema:

| File | Frontmatter |
|---|---|
| `issue.md` | `title` only — metadata lives in `settings.json` |
| `comments/NNN_*.md` | `author` + `date` (YYYY-MM-DD) only — no `title` needed by the loader, but harmless |
| `subtasks/**.md` | `title` + `status` (one of the 7 statuses) |
| `notes/**`, `brainstorm/**`, `agent-memory/**` | `title` (+ optional `color:`) |
| `plans/**/NN_<stage>.md` | `title` + `status`, plus `outcome`, `notes`, `who`, and `subtasks:` — **the only ref list**. `agent-logs:` is retired and now errors; link a run from the body instead ([plans](../20_sections/28_plans.md)) |
| `agent-log/**/02_working/*.md` | `title` + `status` + `agent` (+ optional `date`, `color:`) |
| any subdoc | optional `color:` — tints the sidebar label, issue-defined meaning |

- `draft: true` hides a file from the production build (works tracker-wide).
- **Preserve `color:` when editing** — it's user-defined; document meanings in the
  issue's `glossary.md`, and check that glossary before interpreting colours.
- Don't write MDX — pure markdown only; rich content comes from native GFM extensions
  (alert callouts, `<details>`, fenced diagrams).

## Body conventions — write for cold pickup

Tracker prose is read by the *next* agent or a human months later, without your
context:

- **Subtasks / issue.md**: short intro saying what and why; checkboxes with a
  **bolded lead** then the explanation (what/where/how, concrete paths); `##` groups
  when a flat list outgrows itself; spell out pointers (`<issue>/subtasks/05_x.md`)
  instead of shorthand.
- **Iteration files**: the four-section head — `# Goal / # Inputs / # Expected Outcome
  / # Outcome`, written by `agent-ks issue new-iteration`. Thin but complete: issues
  found get one line each plus a pointer, never the write-up in place.
- **Comments**: a couple of lines + a pointer (the two-paragraph tripwire — see
  [21_comments.md](../20_sections/21_comments.md)).
- **Decision markers**: date + author decided lines (`**Decided (sidhantha,
  2026-07-02):** …`) and graduation markers (`> **Resolved →** <target>`) keep
  provenance in-file.

## Linking

> **Reference by link, never by number.** This is the rule most often broken, and it
> is broken by files that are otherwise well written.

Another file is identified by a markdown link whose text says what the target *is* —
never by its ordering prefix:

```markdown
- [x] `010` — the plans section                                    ← WRONG
- [x] [The plans section](./010_code-the-plans-section.md) — framework,
      CLI and validator                                            ← RIGHT

Blocked by `050` until the version bump ships.                     ← WRONG
Blocked by [the version bump](../050_version-bump.md).             ← RIGHT
```

| Why | |
|---|---|
| **It breaks silently** | `agent-ks move` rewrites real markdown links when a file moves. A backticked `` `010` `` is prose to every tool that exists — the file moves, the text stays, nothing reports it |
| **A number is not a name** | *"`050` blocks `100`"* is unreadable to anyone who has not already opened both. Nothing in a body may require having read another file to parse the sentence |
| **Renumbering is normal** | Gap-spaced prefixes exist so `015` can be inserted later. A number quoted in another file makes the numbering immutable — the opposite of why it is spaced |

**A link reading `[010](./010_thing.md)` is still a number, just clickable.** The link
text has to name the thing. Where the number genuinely is the subject — *"the first two
digits are the iteration"* — it stays.

### The ordering label — how to keep the number too

The number is genuinely useful: **the sidebar lists entries by number**, so a link
carrying one can be matched against what a reader already has on screen. Keep it by
opening the link text with the target's **ordering path** — the numeric prefixes of its
folders and of its own name, joined by `/` — then the name:

```markdown
[040/100 the migration script](../../subtasks/040_execution/100_migration-script.md)
[70 reference by link](../../notes/70_reference-by-link-never-by-number.md)
[020/02/090 the summary-shape round](./02_working/090_summary-shape-and-links.md)
```

| | |
|---|---|
| **Optional** | A plain descriptive link is never wrong. This adds navigation, it does not replace naming — the name still has to be there |
| **Derived, never invented** | The label states only what the target's path already says. If they disagree, the label is what is wrong |
| **`agent-ks move` keeps it current** | It recomputes the label whenever it rewrites the target, so renumbering a group or moving a file between them fixes every label pointing at it |
| **The validator catches the rest** | `agent-ks check issues` **warns** on a label that disagrees with its target — a hand `git mv`, an editor rename, a typo. Warning rather than error because link text that legitimately opens with a bare number and a space would otherwise block the gate over wording |

**How the path is computed:** walk up from the file collecting numeric prefixes, and
stop at the first segment that has none. So `subtasks/040_execution/100_x.md` → `040/100`,
and `agent-log/020_wf_ship/02_working/090_x.md` → `020/02/090`, the walk ending at
`agent-log/` because that segment has no prefix. A target with no prefix at all takes no
label — there is no ordering identity to state.

**Numbering an agent log's slots lengthened these labels by one segment.** An unnumbered
`working/` used to end the walk, so an iteration file could only ever label as `090`;
now the whole path from the run down is stateable, and each segment matches something
the sidebar shows.

**A stale label is the failure mode to fear**, which is why it is checked rather than
just described: the link still resolves, so nothing looks wrong. It simply tells the
reader the target is somewhere it is not.

- **Every reference to a page in this tracker is a relative markdown link**
  (`[the migration script](../040_execution/100_migration-script.md)`). Not a
  site-absolute `/todo/…` link, and not a backticked path. **The reason is what a
  tracker is:** a folder of markdown that filesystem tools operate on — `agent-ks
  move`, `grep`, an editor, an agent walking the tree — and a relative link is the
  only form that is **true on disk**, so it is the only form all of those can
  follow. The rendered tracker is one consumer of those folders, not the thing
  being built, so its URLs are not the address space you write in.

  Three things a backticked path costs, all of them silent: `agent-ks move` cannot
  rewrite it, so it rots on the next file move; a reader cannot click it and gets
  no title, only a path; an agent has to run a find-and-search to resolve it. **A
  site-absolute link costs the first of those and hides it behind a link that
  renders perfectly** — `move` skips every target starting with `/`, correctly,
  because such a target was never a path to begin with.
- **A non-markdown sub-doc is marked for you.** A diagram or an artifact beside an
  issue's markdown carries a trailing **type glyph** in the sidebar, hover-named.
  Markdown is the default and stays unmarked — so never hand-label a file's type in its
  own title.
- **Link text is free — use it.** `[the execution group's overview](../040_execution/00_overview.md)`
  reads inside a sentence; `` `subtasks/040_execution/00_overview.md` `` interrupts
  one and tells the reader nothing they did not already have.
- **A repo file that is no document at all** — source code, config, a binary — has
  nothing to link *to*, so a backticked path is correct there:
  `` `src/loaders/issues.ts` ``. That is the exception, and it is about the target
  not being a document, not about convenience. The same applies to a path being
  discussed as a value rather than pointed at.

  **"Not served on the site" is not the test, and reading it that way gets this
  backwards.** A markdown file that belongs to a linked tree of documents takes a
  relative markdown link whether or not the site ever renders it — the skill files
  under `plugins/agent-ks/skills/` are the clearest case: they never appear on the
  site, they cross-link each other relatively, and `agent-ks check skill-links`
  verifies exactly that. Relative links are how the *filesystem* holds a document
  tree together; being published is a separate question.
- **Encounter a backticked document path while editing a file? Convert it.** Not
  as a project — as part of whatever you were already doing there. Take the link
  text from the target's own `title`, so the sentence gains a name instead of a
  path. **There is no tracked sweep for this**; if the user asks for one, run it
  as *detect → check → convert*: find backticked paths, keep only the ones that
  **resolve to a real document on disk** (that test is what separates a reference
  from a section name like `` `notes/` `` being discussed), then convert those and
  re-run the gates. Delegate it if it is large.
- **`Related:` lines** at the end of a body are the convention for soft references
  (duplicate-check hits, sibling subtasks, superseded issues).
- **A tracker URL keeps its ordering prefixes** — `subtasks/020_impl/010_backend.md`
  is served at `…/subtasks/020_impl/010_backend`, unchanged. So the path you write
  and the path a reader lands on are the same string, and a relative link written
  against the file tree resolves as written. (Docs and blog do strip prefixes,
  which is why a link *leaving* the tracker is the one case that needs care.)

## Callouts & collapsibles

Rich content in issue markdown is plain GFM — no project-specific tag syntax.

**Callouts** — GFM alert blockquotes, five types (`NOTE`, `TIP`, `IMPORTANT`,
`WARNING`, `CAUTION`). Handy for decision markers and gotchas the next agent must see:

```markdown
> [!WARNING]
> This subtask blocks the release — don't close it until
> [the sidebar tree](./020_sidebar-tree.md) and
> [link rewriting](./030_link-rewriting.md) land.
```

**Collapsible content** — native `<details>` / `<summary>` (fold long logs, dumps,
or embedded code so the issue stays scannable):

```markdown
<details>
<summary>Full stack trace</summary>

Hidden content — markdown inside renders normally.

</details>
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

Diagram source that shouldn't live inline belongs in the issue's `assets/` and is
embedded by reference — a `[[./…]]`/`[[../…]]` inside the fence (see "Content
embedding" below). `assets/` never appears in any sidebar — it's the home for
every diagram an issue embeds or links.

**The issue's own `assets/` is where an issue's files go — always, and any
subfolder can have one.** Referenced relatively (`./assets/x.png`,
`../assets/x.png`), so the file travels with the issue. The site-wide
`/assets/…` folder is a different route entirely — it holds what the site
**chrome** loads (favicon, logos, standard symbols) and is named from code, never
from a document body. **Nothing an issue produces belongs there, and no file an
issue writes may name it.** So a leading `/` is wrong in a tracker document with
no exception at all — assets included.

A diagram file can also **be a supporting doc itself**: drop a `.mmd` / `.dot` /
`.excalidraw` / `.drawio` file directly into `notes/`, `brainstorm/`, `agent-memory/`, or
`agent-log/` (no markdown wrapper) and it renders as a first-class entry — own
sidebar item, own URL, rendered client-side like any embed. Consistent with
first-class diagram pages in docs sections. Use this when the diagram *is* the
doc; keep embed-only diagrams in `assets/`. **Subtasks are the exception**:
a subtask is a status-bearing checklist item, so it stays markdown — embed a
diagram into a subtask body from `assets/` instead.

**Excalidraw and draw.io** — image syntax embeds the file read-only (fetched by
reference, rendered as SVG client-side); a plain link deliberately stays a link
to the raw file. Never inline scene JSON or mxGraph XML — the file is the source
of truth:

```markdown
![Architecture](./assets/arch.excalidraw)   ← embeds; alt = caption, click zooms
![Topology](./assets/topology.drawio)       ← same syntax, same behaviour
[Architecture](./assets/arch.excalidraw)    ← plain link, opens the raw file
```

Missing file → build error (`asset-missing`); malformed file → visible error box.

**Dark mode splits here.** Mermaid, Graphviz and Excalidraw are colour-inverted;
draw.io is not — its viewer resolves a real dark palette instead, because
`.drawio` files carry raster icons and screenshots that a filter turns into
negatives. Author-set colours are re-resolved for a dark canvas rather than left
untouched, so pick something whose meaning survives on both. Save uncompressed
so the file diffs and greps.

Live demo: `2026-04-10-editor-diagrams/notes/02_embed-verification.md`.

## Artifacts

Artifacts — self-contained `.html` pages (reports, dashboards, design-system
showcases) — are built with the **`agent-ks-artifacts` skill**; the tracker
concern is only *where they live and how they're referenced*. An artifact
authored to support an issue's thinking — a brand/design-system draft, a
dashboard behind a decision — can live right in the issue's `brainstorm/` or
`notes/` folder, versioned with the deliberation.

Reference it from prose by its **full-page URL**: the reserved
`/artifacts/<path-from-content-root>` route serves any `.html` under any content
folder — the tracker included — full-viewport and shareable, e.g.
`/artifacts/todo/<issue>/notes/20_brand-draft.html` (the path keeps the `NN_`
prefix and `.html`). Give it an optional companion same-name
`.meta.json` / `.meta.jsonc` sidecar declaring `purpose` / `type` / `palette` so
the trade-off discussion can cite those values without anyone parsing the HTML.

Unlike a first-class diagram file, an artifact is a **linked, full-page
document**, not an embedded sidebar entry. When a design system settles from
in-flux draft to canon, promote it outward to a **published docs section**,
where artifacts become first-class embedded pages (`agent-ks-docs` +
`agent-ks-artifacts` territory).

## Assets

- **Colocated, always** — there is no second option. `<issue>/assets/` next to the
  markdown, relative paths: `![Flow](./assets/flow.png)`. The build rewrites them to `/content-assets/…`
  (relative `<a href>` links to colocated non-page files are rewritten the same
  way, so `[raw file](./assets/x.excalidraw)` works at any page depth);
  colocated non-markdown files never appear in the sidebar.
- **Never commit raw screenshots** — run `agent-ks img` on any image you add
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

Issues path resolution: always relative to the markdown file itself; a bare name
resolves to `assets/` **next to that file** (issue-root `assets/` only from
`issue.md`) and works only *outside* fences. **Inside a fenced block the path must
start with `./` or `../`** — bare names are skipped there, so from `issue.md` write
`[[./assets/flow.mmd]]`, and from a file in `notes/` write `[[../assets/flow.mmd]]`.
Escape as `\[[...]]` for literal brackets. Full rules:
`@root/default-docs/data/user-guide/15_writing-content/03_asset-embedding.md`.

## Ordering prefixes in the tracker

Same shared grammar as everywhere (2–5 digits, sorted by numeric value, `_` canonical,
gap-spaced) — but in the tracker **both `NN_` and `NNN_` are conventional**, and the
prefix is **optional** for most subdocs:

| Where | Convention |
|---|---|
| `subtasks/` | `NN_` or `NNN_` freely (leading digit can annotate a group) — see [23_subtasks.md](../20_sections/23_subtasks.md) |
| `comments/` | `NNN_` **auto-numbered by the CLI** — the number is the comment id, never hand-gapped |
| `agent-log/` | `NNN_<code>_<name>/` per run; its slots are `01_summary.md` / `02_working/` / `03_debrief/` and a nested run is `≥ 100`; inside `02_working/`, `NNN_` where the first two digits are the iteration — see [24_agent-logs.md](../20_sections/24_agent-logs.md) |
| `plans/` | `NN_<name>/` per plan; `NN_<stage>.md` gap-spaced by ten — see [28_plans.md](../20_sections/28_plans.md) |
| `brainstorm/`, `notes/` | optional; gap-number only when reading order matters |
| `agent-memory/` | usually none — name by topic |
