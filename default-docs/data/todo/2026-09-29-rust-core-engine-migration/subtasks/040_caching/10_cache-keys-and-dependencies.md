---
title: "Cache keys and dependencies — one key function for every derived value"
status: open
---

Every cached value needs a key that changes exactly when the value would change. Today's engine got this wrong for `[[path]]` embeds: a page that inlined a file did not know it depended on that file, so the page went stale until a restart ([2026-08-07](../../../2026-08-07-content-embed-cache-dependencies/issue.md)). This leaf builds **one key function**, in the shared core, that every cache layer and the browser use. The key covers the engine version, the page's own bytes, the hashes of every file it embeds, and a fingerprint of only the settings that shape it.

# 01 To Do
- [ ] **A `Hash` type.** BLAKE3 over bytes, displayed as `b3:<hex>`. One type for file hashes, folder hashes and render hashes, so they cannot be mixed up with other strings.
- [ ] **File and folder hashes in the index.** Each index entry stores its file's hash. Each folder's hash rolls up its children's names and hashes, Merkle style (a hash built from the hashes below it), so a change re-hashes only its chain of parents. Coordinate the index side with [030/40](../030_rust-engine/40_site-index.md); this leaf owns the hash rules.
- [ ] **The dependency record.** The render pipeline's embed stage ([030/50](../030_rust-engine/50_markdown-pipeline.md)) reports every file it inlines, at **both** embed sites: plain `[[path]]` and `[[path]]` inside fenced code blocks. The fenced case is the common one for diagram source.
    - [ ] Store the page's dependencies in the index entry, so the reverse question "which pages depend on this file?" is a lookup, not a scan.
    - [ ] Treat diagram and artifact sidecars (`<name>.meta.json`) and first-class diagram sources as dependencies the same way.
- [ ] **The render key function.** `render_key(page) = H(engine_version, format_version, page_hash, sorted(dep_path, dep_hash)…, settings_fingerprint(page))`. Sorted so the order of embeds does not change the key.
- [ ] **Settings fingerprint.** A hash of only the config values that shape this page, as declared by [040/20](./20_settings-invalidation.md). A navbar edit must not change a page body's key.
- [ ] **Keys for non-page values.** Sidebar (section folder hash + ordering settings), issues index (tracker folder hash + vocabulary + git-dates generation), manifest (config hash + every section's hash), theme CSS (hash of every theme input file + theme settings). Write each as a named function next to `render_key`.
- [ ] **Change propagation.** When the watcher reports changed files, compute the set of affected keys: the file's own page, every page that depends on it (reverse lookup), the section's sidebar when order or titles changed, the tracker index for tracker files, the manifest for config. Return that set to the server, which pushes it ([050/30](../050_server/30_watcher-and-push.md)).
- [ ] **Tests.** A table-driven test per dependency kind, below.

## Guardrails
- One key function in the core. No layer builds its own key by hand.
- Never key by modification time or file size.
- A newly added `[[…]]` needs no special case: adding it edits the page, whose own hash changes. Do not add a directory sweep of `assets/` to catch it; the 2026-08-07 issue ruled that out as a symptom fix.

## Done when
- `cargo test` covers, and passes, each case: edit the page → its key changes; edit a file it embeds (plain and fenced) → its key changes; edit an unrelated file → its key does not; edit a navbar item → no page body key changes; edit a theme file → only the CSS key changes; edit a sidecar → the diagram or artifact page's key changes.
- A manual probe with the server running reproduces the 2026-08-07 case: edit an embedded `.mmd`, and the open page updates with no reload and no restart.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the core crate (hashing, keys) with the cache crate using it. Crate names are fixed by [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md).

**Read first:**
- [The Rust engine, sections 03 and 06](../../notes/02_engine/03_rust-engine.md) — hashes, the render hash, the caching layers.
- [Machine home, section 02](../../notes/02_engine/06_machine-home-and-build-cache.md) — "a page's render hash covers everything it inlines".
- [2026-08-07 issue](../../../2026-08-07-content-embed-cache-dependencies/issue.md) and [its subtask](../../../2026-08-07-content-embed-cache-dependencies/subtasks/010_embedded-files-as-cache-dependencies.md) — the measured bug, why each loader missed it, the fix shape.
- Today's code: [asset-embed.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts) (both embed sites), [diagram-pages.ts](../../../../../../agent-ks-engine/src/loaders/diagram-pages.ts) (the `dependencyFiles` contract), [cache-manager.ts](../../../../../../agent-ks-engine/src/loaders/cache-manager.ts).

**Depends on:** [030/40 site index](../030_rust-engine/40_site-index.md), [030/50 markdown pipeline](../030_rust-engine/50_markdown-pipeline.md), [020/40 embeds and dependencies](../020_content-contract/40_embeds-and-dependencies.md).
**Unblocks:** every other leaf in this group; [050/30 watcher and push](../050_server/30_watcher-and-push.md); the browser cache in [080/40](../080_ui-and-client/40_websocket-client.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned by hash ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Proposed (claude, 2026-09-30), adopted here: BLAKE3 content hashes; a page hash includes the hashes of its embedded files ([Rust engine](../../notes/02_engine/03_rust-engine.md)).
- Decided (claude, 2026-09-30): the key also carries a settings fingerprint limited to the settings that shape the value, so a config edit invalidates only what it affects.

# 05 Notes & Analysis

## 01 Absorbed from 2026-08-07
Its subtask `010_embedded-files-as-cache-dependencies` is built for 0.x and in review. Its **lesson** is carried here, not its code: "one fact — this page inlined that file — produced once by the embed stage and consumed by every cache". The Rust version is simpler because keys are hashes, so there is no signature-before-parse problem.

## 02 Why sorted dependency pairs
Two embeds in a different order must give the same key, and a dependency that moved to another path must give a different key. Hashing sorted `(path, hash)` pairs gives both.

## Watch out
- An embed of a missing file is a content error on the page. Its key must still change when the file appears, so record the missing path with a sentinel "absent" hash.
- An embed inside an embedded file (nested) — decide with [020/40](../020_content-contract/40_embeds-and-dependencies.md) whether nesting is allowed. If it is, dependencies are transitive and the record must hold the full closure.
