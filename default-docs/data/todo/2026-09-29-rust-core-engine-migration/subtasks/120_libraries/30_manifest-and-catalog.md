---
title: "manifest.json, local libraries and the library.json catalog"
status: review
---

Each library describes itself in a `manifest.json` at its root: a name, one x.y.z version, the engine versions it supports, and its **elements** (the files it offers, each with a category, a description and tags). Every library keeps its elements in `components/<category>/`, one folder for each of fifteen fixed categories. A local library may skip the manifest, and then each file under `components/<category>/` is an element. `library.json` is the catalog of libraries and templates agentks offers for quick install. This leaf builds the types, loaders and checks for all three, and the element lookup (`alias:element` → a file) that pages and the `/_lib/` route use.

# 01 To Do
- [ ] **Manifest types and loader.** Parse `manifest.json` at the library's root (the entry's `path` inside the pinned commit, or the local folder).
    - [ ] Required: `name`, `version` (x.y.z), `description`, `engine` (a semver range), `elements` (may be `{}`).
    - [ ] Each element: `category` (required, one of the fifteen), `file` (required, relative to the manifest), `description` (required), `tags` (optional list of strings).
    - [ ] `file` must be `components/<category>/<name>.<ext>`, with an extension the category allows. A missing or unknown category, or a file outside its category folder, is an error naming the element and its line in `manifest.json`.
    - [ ] Element names: `^[a-z][a-z0-9-]*$`, unique, no slashes.
    - [ ] `file` must exist and stay inside the library folder after canonicalising (no `..` escape, no symlink out).
    - [ ] A version tag that disagrees with `version` → warning naming both.
    - [ ] `engine` range excludes the running version → error naming the library, its range and this version, and suggesting `agentks install --update`, a narrower selector, or a mise pin.
- [ ] **Local libraries.**
    - [ ] With a manifest: same as a git library, read in place, no pin, no cache. Watch the folder like content, so edits show live ([050/30 watcher](../050_server/30_watcher-and-push.md)).
    - [ ] Without a manifest: each file in `components/<category>/` is one element. Its category is its folder, and its name is its file name without the extension (`components/widgets/checkout-flow.html` → `team:checkout-flow`). A folder inside a category folder is an element whose entry is `index.html`, and its other files are served beside it. Two elements with the same name anywhere in the library (`icons/phone.svg`, `frames/phone.svg`) → error. Anything else in `components/` or a category folder, other than a `README.md`, → error.
- [ ] **Element lookup.** One function: `resolve(alias, element) -> Result<ElementFile>` returning the absolute file path, the content type from the extension, and whether it is a folder element. Unknown alias or element → error naming the page and line when called from a page.
- [ ] **`library.json` types and loader.** Fetch the catalog from the library repository at its default branch (address built into the binary as a constant in one place). Cache it in memory for the process; the TUI and `library search` read it.
    - [ ] `libraries.<id>`: `description`, `git`, `path`, `latest` (display only), `tags`.
    - [ ] `templates.<id>`: `description`, `git`, `path`.
    - [ ] The catalog is read, never trusted for content: adding a catalog library writes an ordinary `dep.yaml` entry and resolves it from git.
- [ ] **Offline catalog.** When the catalog cannot be fetched, `library search` and the TUI say so; nothing else depends on it.
- [ ] **Library index for search.** Build an in-memory index over every installed library's element names, descriptions and tags, for `library find` ([120/40](./40_library-commands-and-tui.md)) and for [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md).
- [ ] **Tests.** Fixture libraries: valid, each missing field, a missing and an unknown category, a `file` outside its category folder, a `file` escape, duplicate names, a bad engine range, a manifest-less folder with a folder element, a name clash across categories and each structure error. A fixture `library.json`.

## Guardrails
- agentks never interprets `tags` or infers a kind from them. Tags are search words only.
- How a file is shown follows only its type: SVG or image → image; `.html` → sandboxed artifact frame; a script → the contract of the page using it.
- Elements are self-contained single files; an `.html` element inlines its CSS, scripts and images. Only folder elements of manifest-less local libraries get sibling files.

## Done when
- `cargo test` passes the fixture tests.
- `agentks library show icons --json` on a project using the default library prints every element with its description and tags.
- A page naming `icons:does-not-exist` fails the check with the page, line and name.

# 02 Status and Result
Review. Manifests, local libraries, the element lookup, the catalog and find are built in `agentks-library`, and they follow the `components/<category>/` structure the library repository moved to on 2026-10-01. The real default library (1,906 elements) now loads with no error. Before this fix, every one of its elements failed on the unknown key `category`. The CLI "Done when" checks run once 120/40 wires the commands.

## Result
- **Code:** `crates/library/src/category.rs` (`Category`: the fifteen categories and each one's file types), `src/manifest/` (`parse_manifest` with the required `category` and the file-place rule, file containment, engine range, tag warning; `key_lines.rs` finds each element's line and any key written twice), `src/libraries.rs` (`Libraries::load`, `load_with`, `resolve`, `resolve_sibling`, `find(words, category)`, `manifests`, `elements`), `src/local_lib.rs` (manifest-less folders read from `components/<category>/`), `src/elements.rs` (`ElementInfo` now carries `category`; `ElementRef`, `ElementFile`), `src/commands.rs` (`ElementRow` carries `category`; `show(libraries, alias, category)` filters), `src/catalog.rs` (`parse_catalog`, `Catalog::search`, `fetch_catalog`, `fetch_catalog_from`), `src/search.rs` (the one ranking: name 3, tag 2, description 1).
- `Libraries::warnings()` is gone. The only warnings it held were skipped children of a manifest-less folder, and those are now errors. The sync still reports the tag warning.
- Unknown alias or element → `LibraryError::ElementUnknown` naming `agentks library list` or `agentks library show <alias>`.
- **Tests (the crate's suite runs in well under a second):** manifest unit tests (a good manifest, every broken field at once, a missing and an unknown category with the element's line, five wrong file places, an element written twice with both lines, the line scan ignoring text inside strings, file escapes), manifest-less listing (four elements across three categories with a folder element, no `components/`, eight structure errors, a name clash across categories), the category table, and in `tests/sync.rs` the lookup, `find` and `show` with a category filter, a local folder with two structure errors, and a manifest whose file sits in the wrong category folder failing the sync before the lock is written.
- **One-off check, not in the gate:** `tests/real_library.rs` is ignored by default and reads the checkout from `AGENTKS_LIBRARY_CHECKOUT`. On `agent-knowledge-system-library` at `ff3c325` it loaded 1,906 elements (1,897 icons, 9 widgets) with no error, in 39 ms in a debug build and 13 ms in release. A copy of that checkout's `components/` with no manifest listed the same 1,906 elements in 15 ms.
- `./ctl gate -q` is green in the worktree `wave3/library-category`.
- **Left:** `agentks library show icons --json`, a `--category` flag on `library find` and `library show`, and the page-line error in `check libraries` come with the CLI (120/40).

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, library crate under `apps/agentks-engine/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06 (manifest), 07 (local libraries), 08 (catalog), 13 (where elements are used).
- [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md), section 02 (how `init` reads the catalog).
- Today's trust boundary for artifacts: [the artifacts route](../../../../../../agent-ks-engine/src/pages/artifacts) and [artifact-pages.ts](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts).

**Depends on:** [120/20 fetch and resolve](./20_fetch-and-resolve.md).
**Unblocks:** [120/40 commands](./40_library-commands-and-tui.md), [120/50 /_lib/ route](./50_lib-route-and-sandbox.md), [120/60 default library scaffold](./60_default-library-scaffold.md), [100/40 video pages](../100_layouts/40_video-pages.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): each library has a `manifest.json` at its root, with a required version; no kinds of library or element; one version series per library; every library states its engine range ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30): `library.json` lists what agentks offers for quick install and never moves.
- Decided (claude, 2026-09-30): elements are self-contained single files, except folder children of a manifest-less local library (same note).
- Decided (claude, 2026-10-01): Unknown keys in `manifest.json` are errors, because agentks owns the format and a typo like `descripton` would otherwise hide an element from `find`.
- Decided (claude, 2026-10-01): Unknown keys in `library.json` are ignored, because the catalog never moves and older binaries must keep reading it after it gains a field.
- Decided (claude, 2026-10-01): In a manifest-less local library, anything in `components/` or a category folder that is not an element or a `README.md` is an error, not a skipped file, because a skipped file looks like a missing element and nothing tells the author why. Names that start with a dot are still skipped, as everywhere in the index.
- Decided (claude, 2026-10-01): The category list and each category's file types live in one Rust type, `Category`, matching the library repository's `scripts/check.py`, because the manifest parser and the manifest-less lister must apply the same rule. Size caps and content rules stay out of the loader; they belong to `check libraries`.
- Decided (claude, 2026-10-01): A manifest element's `file` must be exactly `components/<category>/<name>.<ext>` with an extension its category allows, not only somewhere under `components/<category>/`, because that is the library's own rule and it makes a library with a manifest and one without name every file the same way.
- Decided (claude, 2026-10-01): A manifest error gives the element's line as "manifest.json line N" inside the message, not in the record's `line` field, because the record's file is `dep.yaml` for a cached library and a manifest line there would point at the wrong file.
- Decided (claude, 2026-10-01): The lines come from a small scan of the manifest's text that follows JSON structure (strings, escapes, nesting). `serde_json` gives no positions, and a plain text search could match an element name inside a description and report a wrong line. The same scan reports a key written twice as an error, because `serde_json` silently keeps only the last one and an element would vanish.
- Decided (claude, 2026-10-01): In a manifest-less library the root must hold `components/`; anything beside it is left alone, because the library repository keeps `templates/`, `scripts/`, `preview/` and `LICENSES/` there and a video folder keeps its scenes there. Missing category folders are fine, because a team's folder or a video's own `components/` holds only the categories it uses. Requiring all fifteen is the library repository's own check.
- Decided (claude, 2026-10-01): A folder element must hold an `index.html`, so it is allowed only in `widgets`, the one HTML category. This is the same file-type rule every other element follows.
- Decided (claude, 2026-10-01): The category filter is a parameter of `Libraries::find` and `commands::show`, and `find` still needs at least one word, because listing a whole category is what `show` with a category does.
- Decided (claude, 2026-10-01): `Libraries::warnings()` is removed, because its only source (skipped children) is now an error and an always-empty method would mislead a caller.
- Decided (claude, 2026-10-01): The catalog is read from the `main` branch of the library repository (`CATALOG_BRANCH`), because the git API lists branches but not the remote `HEAD`; the address and branch are one constant each, and `fetch_catalog_from` takes both as parameters.
- Decided (claude, 2026-10-01): `find` and `search` share one ranking (a word in the name 3, a tag 2, the description 1; every word must match), because two copies would drift.

# 05 Notes & Analysis
## 01 Manifest example
```json
{
  "name": "agentks-default",
  "version": "1.0.0",
  "description": "The default agentks library: a technical-docs icon set, device and window frames, and small data widgets",
  "engine": ">=1.0.0 <2.0.0",
  "elements": {
    "server": { "category": "icons", "file": "components/icons/server.svg", "description": "A rack server", "tags": ["icon", "infrastructure"] }
  }
}
```

## Watch out
- The catalog address and the main repository address are the only official addresses in the binary. Keep them in one constants module shared with [140/20 migrate command](../140_versioning-and-migrations/20_migrate-command.md) and [160/20 update channel](../160_distribution/20_update-channel.md).
- Open: whether a company can add its own catalog ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)). Do not build it; keep the catalog loader taking the address as a parameter so it could.
