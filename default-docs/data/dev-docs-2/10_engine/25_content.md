---
title: "Content: the format rules"
description: "agentks-content: the NN_ grammar, folder settings, frontmatter, page kinds, sidecars and slug collisions, written once and shared by the index and every check."
---

`agentks-content` (layer 2) holds the content format rules, written once. The site index, the tracker pages and every `agentks check` command call these same functions, so a rule cannot drift between the CLI and the browser. This page explains what the crate owns and how it stays pure.

## A pure crate

The crate reads only text and paths it is handed. When a rule needs another file, such as a folder's `settings.json`, it asks through the `FileSource` trait, which it defines:

```rust
pub trait FileSource: Send + Sync {
    fn read_text(&self, path: &RelPath) -> Result<Arc<str>, ContentError>;
    fn read_bytes(&self, path: &RelPath) -> Result<Arc<[u8]>, ContentError>;
    fn exists(&self, path: &RelPath) -> Result<bool, ContentError>;
    fn list_dir(&self, folder: &RelPath) -> Result<Vec<DirEntry>, ContentError>;
}
```

The index implements it over the disk as `ProjectFiles`. Tests implement it over a map with `MemoryFiles`. A missing file is an `Err`, never an empty string.

The crate computes no URL, because the index owns URLs. It renders nothing. A content problem goes to the `ErrorSink` and the work goes on. An `Err` means a rule could not run at all.

## The ordering grammar

| Rule | Detail |
|---|---|
| A prefix is 2 to 5 digits, then `_` | `05_`, `010_`, `12345_` |
| Siblings sort by the prefix's numeric value | Widths coexist: `05_`, `010_` and `110_` sort as 5, 10, 110 |
| The prefix leaves the URL | `05_getting-started` serves as `getting-started` |
| The sort key, `OrderKey` | `agentks_content::order_key` takes frontmatter `sidebar_position` when set, else the prefix value, else 999; then the full name breaks ties. The index does not call it: it sorts siblings by prefix, then name, in `apps/agentks-engine/crates/index/src/walk/places.rs`, so `sidebar_position` does not change the sidebar |

Each folder follows a `NameRule`:

| Rule | Where | What it requires |
|---|---|---|
| `Docs` | Docs sections | A prefix on every file and folder, except under `assets/` |
| `TrackerLoose` | Tracker subtask, agent-log and group folders | A prefix, whose separator may also be `-` |
| `Blog` | Blog sections | `YYYY-MM-DD-<slug>.md`, no prefix |
| `Optional` | Everywhere else | A prefix if the author wants one |

`parse_name` reports a docs markdown page without a prefix as a `prefix-missing` error. A diagram or `.html` file without one is only a warning, because it is simply not a page. `index.md`, `README.md`, settings files, sidecars and hidden files are exempt. Folders nest at most `MAX_SUBFOLDER_DEPTH`, 5, deep: a hard cap in tracker sections, and the depth the sidebar draws in docs.

## Folder settings

A folder's `settings.json`, or `settings.jsonc` when both exist, is read as JSON with comments and trailing commas allowed.

| Field | Default | Rule |
|---|---|---|
| `label` | none | Required everywhere below the section root |
| `collapsible` (or `isCollapsible`) | `true` | |
| `collapsed` | `false` | |
| `allow_diagram_pages` | `true` | Read at the section root only; anywhere else it is a warning |

A settings file that does not parse, or breaks its schema, is a `settings-invalid` error with its line.

## Frontmatter

`split_frontmatter` splits the YAML between the opening and closing `---` from the body. It records the line where the body starts, so every later error in the body can report the real line of the file. YAML that does not parse is a `frontmatter-invalid` error, and the page still renders with empty frontmatter.

`check_frontmatter` checks the values against the schema of the file's role:

| Role | Required | Also known |
|---|---|---|
| A docs page | `title` | `description`, `sidebar_label`, `sidebar_position`, `draft`, `tags` |
| A blog post | `title` | `description`, `date`, `author`, `tags`, `image`, `draft` |
| A tracker file | depends on its kind | the tracker's own fields |

A missing required field is `frontmatter-field-missing`. An unknown key is a `frontmatter-key-unknown` warning, a sign of drift rather than a failure.

## Page kinds, sidecars and slug collisions

`classify` decides what each file in a section is:

| Class | What makes it |
|---|---|
| Markdown | A `.md` file outside `assets/` |
| Diagram | In a docs section: a prefixed `.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw` or `.drawio` file, outside `assets/`, when the section root allows diagram pages. In a tracker: any diagram file in `notes/`, `brainstorm/`, `agent-memory/` or `agent-log/`, prefixed or not |
| Artifact | A prefixed `.html` file in a docs section, or an `.html` file in a tracker's `notes/` or `brainstorm/` |
| Sidecar | `<name>.meta.json` or `<name>.meta.jsonc` beside a diagram or artifact page. The `.jsonc` wins |
| Settings | A folder or tracker settings file |
| Asset | Anything else, served at `/content-assets/<path>` when something links to it |

Everything under an `assets/` folder is an asset, markdown included.

`parse_sidecar` reads a sidecar. One that does not parse is a `sidecar-invalid` error with its line, and the page renders with default options.

Two files can claim one URL, for example `15_flow.md` and `16_flow.mmd`. `resolve_slug_collisions` settles every claim in a section against one shared pool. The first claimant, by kind (markdown, then diagram, then artifact) and then by path, keeps the URL and shows the `slug-collision` error. Every other claimant gets no URL and is reported.

## Whole-section checks

`check_docs_section` and `check_blog` walk a whole section through the `FileSource` and apply the same rules the index applies one file at a time. They are what `agentks check section` and `agentks check blog` report: settings files, prefixes, prefix clashes between siblings (`02_` and `002_` clash, because both are 2), frontmatter, sidecars, and files that belong in `assets/`.

## The tracker

The crate's `tracker` module models the issue tracker: its vocabulary, the issue folder, the seven anatomy sections, derived values such as the review queue, the `check issues` rules and the status writer. It has its own page: [the tracker model](./27_tracker.md).

## Tests

Spec fixtures live in `apps/agentks-engine/crates/content/tests/spec/<rule>/`, one folder per rule family: ordering, settings, frontmatter, collisions and tracker. Each case holds its input and the expected records.

```bash
cargo test -p agentks-content spec_                  # run the spec fixtures
AGENTKS_BLESS=1 cargo test -p agentks-content spec_  # rewrite the expected answers
```

Rewrite the answers only after a deliberate rule change, and read the diff before you keep it.

## Related

- [The site index](./30_index.md): the walk that calls these rules for every file.
- [The error model](./15_error-model.md): the records these rules report.
