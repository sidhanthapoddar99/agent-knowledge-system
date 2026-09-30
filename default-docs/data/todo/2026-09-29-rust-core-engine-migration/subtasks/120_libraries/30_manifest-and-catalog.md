---
title: "manifest.json, local libraries and the library.json catalog"
status: review
---

Each library describes itself in a `manifest.json` at its root: a name, one x.y.z version, the engine versions it supports, and its **elements** (the files it offers, each with a description and tags). A local library may skip the manifest, and then each child of its folder is an element. `library.json` is the catalog of libraries and templates agentks offers for quick install. This leaf builds the types, loaders and checks for all three, and the element lookup (`alias:element` → a file) that pages and the `/_lib/` route use.

# 01 To Do
- [ ] **Manifest types and loader.** Parse `manifest.json` at the library's root (the entry's `path` inside the pinned commit, or the local folder).
    - [ ] Required: `name`, `version` (x.y.z), `description`, `engine` (a semver range), `elements` (may be `{}`).
    - [ ] Each element: `file` (required, relative to the manifest), `description` (required), `tags` (optional list of strings).
    - [ ] Element names: `^[a-z][a-z0-9-]*$`, unique, no slashes.
    - [ ] `file` must exist and stay inside the library folder after canonicalising (no `..` escape, no symlink out).
    - [ ] A version tag that disagrees with `version` → warning naming both.
    - [ ] `engine` range excludes the running version → error naming the library, its range and this version, and suggesting `agentks install --update`, a narrower selector, or a mise pin.
- [ ] **Local libraries.**
    - [ ] With a manifest: same as a git library, read in place, no pin, no cache. Watch the folder like content, so edits show live ([050/30 watcher](../050_server/30_watcher-and-push.md)).
    - [ ] Without a manifest: each direct child is one element named after it without its extension (`checkout-flow.html` → `team:checkout-flow`). A child folder is an element whose entry is `index.html`, and its other files are served beside it. Two children with the same stem (`logo.svg`, `logo.png`) → error.
- [ ] **Element lookup.** One function: `resolve(alias, element) -> Result<ElementFile>` returning the absolute file path, the content type from the extension, and whether it is a folder element. Unknown alias or element → error naming the page and line when called from a page.
- [ ] **`library.json` types and loader.** Fetch the catalog from the library repository at its default branch (address built into the binary as a constant in one place). Cache it in memory for the process; the TUI and `library search` read it.
    - [ ] `libraries.<id>`: `description`, `git`, `path`, `latest` (display only), `tags`.
    - [ ] `templates.<id>`: `description`, `git`, `path`.
    - [ ] The catalog is read, never trusted for content: adding a catalog library writes an ordinary `dep.yaml` entry and resolves it from git.
- [ ] **Offline catalog.** When the catalog cannot be fetched, `library search` and the TUI say so; nothing else depends on it.
- [ ] **Library index for search.** Build an in-memory index over every installed library's element names, descriptions and tags, for `library find` ([120/40](./40_library-commands-and-tui.md)) and for [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md).
- [ ] **Tests.** Fixture libraries: valid, each missing field, a `file` escape, duplicate names, a bad engine range, a manifest-less folder with a folder element and a stem clash. A fixture `library.json`.

## Guardrails
- agentks never interprets `tags` or infers a kind from them. Tags are search words only.
- How a file is shown follows only its type: SVG or image → image; `.html` → sandboxed artifact frame; a script → the contract of the page using it.
- Elements are self-contained single files; an `.html` element inlines its CSS, scripts and images. Only folder elements of manifest-less local libraries get sibling files.

## Done when
- `cargo test` passes the fixture tests.
- `agentks library show icons --json` on a project using the default library prints every element with its description and tags.
- A page naming `icons:does-not-exist` fails the check with the page, line and name.

# 02 Status and Result
Review. Manifests, local libraries, the element lookup, the catalog and find are built in `agentks-library`; the CLI "Done when" checks run once 120/40 wires the commands.

## Result
- **Code:** `crates/library/src/manifest.rs` (`parse_manifest`, file containment, engine range, tag warning), `src/libraries.rs` (`Libraries::load`, `load_with`, `resolve`, `resolve_sibling`, `find`, `manifests`, `elements`), `src/local_lib.rs` (manifest-less folders), `src/elements.rs` (`ElementRef`, `ElementFile`), `src/catalog.rs` (`parse_catalog`, `Catalog::search`, `fetch_catalog`, `fetch_catalog_from`), `src/search.rs` (the one ranking: name 3, tag 2, description 1).
- Unknown alias or element → `LibraryError::ElementUnknown` naming `agentks library list` or `agentks library show <alias>`.
- **Tests:** manifest unit tests (a good manifest, every broken field at once, file escapes), a manifest-less folder with a folder element, a stem clash, a skipped README and a folder without `index.html`, catalog parse and search, and the lookup tests in `tests/sync.rs`.
- **Left:** `agentks library show icons --json` and the page-line error in `check libraries` come with the CLI (120/40).

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
- Decided (claude, 2026-10-01): In a manifest-less local folder, a child whose name breaks the element rule (such as `README.md`) or a folder without `index.html` is skipped with a warning, not an error, because such folders hold stray files; asking for one still fails as an unknown element.
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
    "server": { "file": "icons/server.svg", "description": "A rack server", "tags": ["icon", "infrastructure"] }
  }
}
```

## Watch out
- The catalog address and the main repository address are the only official addresses in the binary. Keep them in one constants module shared with [140/20 migrate command](../140_versioning-and-migrations/20_migrate-command.md) and [160/20 update channel](../160_distribution/20_update-channel.md).
- Open: whether a company can add its own catalog ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)). Do not build it; keep the catalog loader taking the address as a parameter so it could.
