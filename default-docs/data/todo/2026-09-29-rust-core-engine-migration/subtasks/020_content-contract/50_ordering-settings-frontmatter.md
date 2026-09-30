---
title: "Ordering, settings and frontmatter — the NN_ grammar, settings.json, page kinds, slugs"
status: review
---

Order, labels and page kinds come from file names, `settings.json` and frontmatter. Today the ordering grammar has one TypeScript implementation mirrored in the CLI, and the frontmatter rules are split between the engine and the CLI's validators. This leaf writes each once in `agentks-content`, so the sidebar, the URLs and `agentks check` agree by construction.

# 01 To Do
- [ ] **The ordering grammar** ([02/01](../../notes/02_engine/01_content-format.md) section 04, today's [order-prefix.ts](../../../../../../agent-ks-engine/src/parsers/core/order-prefix.ts)):
    - [ ] A prefix is 2 to 5 digits then `_`; siblings sort by the prefix's numeric value, then by name; widths coexist.
    - [ ] The prefix is stripped from the URL segment.
    - [ ] In docs sections the prefix is required on every file and folder except `assets/`, which never appears in the sidebar.
    - [ ] The tracker's loose form also accepts a legacy `-` separator in subtask, agent-log and group folders.
    - [ ] One constant `MAX_SUBFOLDER_DEPTH = 5`: a hard cap for tracker sections, the sidebar draw depth for docs.
- [ ] **Folder settings**: `settings.json` or `settings.jsonc` (JSONC wins when both exist); `label` required outside the section root; `isCollapsible` default `true`; `collapsed` default `false`; `allow_diagram_pages` at the section root only; `kind`, whose only value is `video`: the folder is one video page, `label` is not required, and `label`, `isCollapsible` and `collapsed` are refused; any other value is an error. Tracker settings files (root vocabulary, issue metadata, plan and log settings) keep today's schemas, read by the tracker loader ([030/60](../030_rust-engine/60_tracker-loader.md)).
- [ ] **Frontmatter**: YAML between `---` lines; record its line count so body errors report real lines.
    - [ ] Docs page: `title` required; `description`, `sidebar_label`, `sidebar_position`, `draft`, `tags` optional.
    - [ ] Blog post: `title` required; `description`, `date` (overrides the file name's), `author`, `tags`, `image`, `draft`.
    - [ ] Tracker files: per file kind, as the issues skill and today's CLI define; `color` on notes, brainstorm, memory and log files.
    - [ ] Unknown keys: a drift warning from `agentks check`, never a render failure.
- [ ] **Page kinds** ([02/01](../../notes/02_engine/01_content-format.md) section 03): markdown, video (`NN_*.video.yaml`, or an `NN_` folder whose settings file says `"kind": "video"`), diagram (`.mmd .mermaid .dot .gv .excalidraw .drawio` with an `NN_` prefix, outside `assets/`, unless the section root sets `allow_diagram_pages: false`), artifact (`NN_*.html` in docs sections and tracker `notes/`/`brainstorm/`). Sidecars: `<name>.meta.json` or `.meta.jsonc`.
- [ ] **Derived values** ([02/01](../../notes/02_engine/01_content-format.md) section 08): slug, sidebar label (`sidebar_label`, else `title`; folders from `label`), order, heading IDs (the rule is implemented in [030/50](../030_rust-engine/50_markdown-pipeline.md), tested here).
- [ ] **Slug collisions**: a `.md`, a diagram and an `.html` that claim one URL are resolved against one shared pool, as today ([first-class-page.ts](../../../../../../agent-ks-engine/src/loaders/first-class-page.ts)): the first keeps the URL and shows the collision error; the rest are dropped and reported. A `.video.yaml` file and a video folder share the same pool.
- [ ] **The error record** used by every rule: `{ file, line, type, severity, message, key, suggestion }`, shared with the CLI and the page ([02/03](../../notes/02_engine/03_rust-engine.md) section 08). `line`, `key` and `suggestion` are optional; `key` is the config key path (such as `pages.todo.layout`) for config problems. It is `agentks_core::ErrorRecord`, built in [030/20](../030_rust-engine/20_error-model.md).

## Guardrails
- One implementation; the CLI's `content.rs` and `checks.rs` copies are replaced by calls into `agentks-content`.
- The legacy `-` separator keeps parsing in 1.0.0. Retiring it is a migration decision, not this leaf's.

## Done when
- Every ordering, settings, frontmatter, page-kind and collision spec fixture passes.
- On the corpus, every sidebar tree (labels, order, URLs) equals the golden snapshot.
- `agentks check` on today's docs reports the same frontmatter and prefix findings as `agent-ks check` does today (compare the two outputs; differences listed with reasons).

# 02 Status and Result
Built in `agentks-content` on branch `wave2/content`; ready for review. The corpus sidebar comparison waits for the golden snapshot (stage 38), and heading IDs are tested with the markdown pipeline ([030/50](../030_rust-engine/50_markdown-pipeline.md)).

## Result
- **Where:** `apps/agentks-engine/crates/content/src/` in the main repository: `names.rs` (grammar), `settings.rs`, `frontmatter.rs`, `kinds.rs` (page kinds, sidecars, slug collisions), `sections.rs` (`check_docs_section`, `check_blog`), `jsonc.rs`.
- **The grammar:** `split_prefix`, `parse_name`, `parse_folder_name`, `order_key`, `section_slug`, `UNPREFIXED_POSITION` (999), and today's three fallback labels (`folder_label_fallback`, `page_title_fallback`, `tracker_label`).
- **Settings:** `parse_folder_settings` and `load_folder_settings` (`.jsonc` wins; `isCollapsible` also reads the older `collapsible`).
- **Frontmatter:** `split_frontmatter` (body start line, YAML errors at the file's line), `check_frontmatter`, `split_and_check`, `known_keys`.
- **Page kinds and collisions:** `classify`, `parse_sidecar`, `sidecar_paths`, `resolve_slug_collisions` with `SlugClaim` and `SlugOutcome`.
- **Tests:** 42 unit tests and 5 spec fixtures, 0.02 s. `cargo test -p agentks-content spec_` runs the fixtures. `./ctl gate` green (8 s).
- **Parity with today's CLI:** a one-off run over this repository gives the same findings as `agent-ks check section` on `user-guide` and `dev-docs` (2 errors: `30_deployment` and `35_plugins` have no `settings.json`) and as `agent-ks check blog` (none). Known differences, each on purpose:
    - Unknown frontmatter keys on docs pages and blog posts are now drift warnings; `check section` did not report them. The design note asks for them.
    - A docs folder whose settings have no `label` is now an error; today's CLI only checked that the file exists. The design note makes `label` required.
    - `index.md` is exempt from the prefix rule, as in today's engine; today's CLI reported it.
    - When YAML frontmatter does not parse, only that is reported, not the missing `title` that follows from it (the CLI did the same).

## Agent log
none

## Agent log
none

# 03 References
- **Where:** crate `agentks-content`.
- **Read first:** [02/01 Content format](../../notes/02_engine/01_content-format.md) sections 02 to 05 and 08; today's [order-prefix.ts](../../../../../../agent-ks-engine/src/parsers/core/order-prefix.ts), [settings-file.ts](../../../../../../agent-ks-engine/src/loaders/settings-file.ts), [diagram-pages.ts](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts), [artifact-pages.ts](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts), [first-class-page.ts](../../../../../../agent-ks-engine/src/loaders/first-class-page.ts); the CLI's [content.rs](../../../../../../agent-ks-cli/src/content.rs) and [checks.rs](../../../../../../agent-ks-cli/src/checks.rs); the user guide's [folder settings](../../../../user-guide/17_docs/03_folder-settings.md) and [docs frontmatter](../../../../user-guide/17_docs/04_frontmatter.md).
- **Depends on:** [10](./10_golden-fixtures.md).
- **Unblocks:** [030/40 site index](../030_rust-engine/40_site-index.md), [30](./30_links-and-urls.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): first-class diagram and artifact pages, with their sidecars, keep appearing in sidebars and routes as today.
- Decided (sidhantha, 2026-09-29): routes and text match today's engine exactly.
- Decided (claude, 2026-10-01): an unprefixed entry sorts as position 999, and frontmatter `sidebar_position` overrides the prefix, because today's sidebar and content sort do exactly that. `order_key` builds `OrderKey` this way; `OrderKey.prefix` now means the sort position.
- Decided (claude, 2026-10-01): `sidebar_position` stays a known docs frontmatter key, because today's engine reads it. The design note's list leaves it out.
- Decided (claude, 2026-10-01): YAML is parsed by `serde-saphyr` 1.3.0 (deserialize only), because it never panics and reports error lines. JSONC is read by a small string-aware stripper ported from today's `settings-file.ts`, not `json5`, because the engine reads settings that way today. The stripper keeps every newline, so errors keep the author's line.
- Decided (claude, 2026-10-01): `allow_artifact_pages` is not carried into `FolderSettings`, because no content uses it and the design note lists only `allow_diagram_pages`. Adding a field would also break other crates that build `FolderSettings`.
- Decided (claude, 2026-10-01): markdown under `assets/` is an asset, never a page, because the design says `assets/` never appears in the sidebar. Today's engine globbed it as a page; no content has such a file.
- Decided (claude, 2026-10-01): in a slug collision the first claimant is chosen by kind (markdown, then diagram, then artifact) and then by path, because today's order depended on glob order, which is not stable. Each dropped file gets its own `slug-collision` record.
- Decided (claude, 2026-10-01): today's `check section` rules keep their `ErrorKind`s: two siblings sharing a prefix value and a non-page file outside `assets/` use `section-invalid`, because no kind names them exactly. See api_change_requests in the wave-2 report.
- Decided (claude, 2026-10-01): the spec fixtures live in `crates/content/tests/spec/<rule>/`, one small project and one `expected.json` each, because the task scoped this crate's fixtures to its own tests folder.

# 05 Notes & Analysis
## Watch out
- Sort by numeric value, not by string: `05_` (5) comes before `010_` (10), although `"010" < "05"` as strings. Test it.
