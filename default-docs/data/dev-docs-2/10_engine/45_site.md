---
title: "Site: the engine as one object"
description: "agentks-site: opening a project, answering every data request, applying file changes, and the snapshot model that keeps reads lock-free."
---

`agentks-site` (layer 5) assembles the engine into one object, `Site`. The server and `agentks build` both need the same sequence: load the config, run the gate, check libraries, build the index, render with the caches, answer by URL. Written twice, the two would drift. So the site crate does it once, and both call it. It depends on every engine crate below it and knows nothing of HTTP, sockets or the terminal.

## Opening a site

```rust
let site = Site::open(SiteOptions {
    location,                 // the found project
    home,                     // the machine home: caches and the library store
    base_path: None,          // the hosting prefix; the server always uses "/"
    memory_budget_bytes,      // from the machine setting cache.memory_mb
    mode: SiteMode::Serve,
})?;
```

| `SiteMode` | Used by | Behaviour |
|---|---|---|
| `Serve` | `agentks start` | Pre-warms, keeps caches, accepts changes |
| `Build` | `agentks build` | Renders every route once; leaves drafts out |
| `Check` | `agentks check` and other one-shot commands | Loads, answers, exits |

`Site::open` runs these steps, in order:

1. Load the config and run the version gate.
2. Check libraries: install any locked commit the machine's store lacks. It never moves a pin.
3. Build the site index.
4. Warm the tracker's git dates from the build cache, walking git only for what is new.
5. Compile the theme.

A problem in any of these is fatal: `open` returns `SiteError::Config`, `SiteError::Library` or a render error for a broken theme, and nothing is served.

## Answering requests

Every data request goes through the site. `Site::answer` is the one dispatch that the server and the build share. There is also one method per kind of data:

| Method | Returns |
|---|---|
| `manifest` | The site identity, theme, navbar, footer, sections and route table |
| `page` | One page's data, by URL |
| `sidebar` | A docs section's tree |
| `issues_index`, `issue` | A tracker's issue list with its filter options; one issue with its anatomy |
| `blog_index` | A blog's post list |
| `custom` | A custom page's data |
| `render_preview` | The body of unsaved markdown, for the live preview |
| `routes` | Every route with its data key and hash: what `agentks build` writes |
| `theme_css` | The compiled theme, which `/theme.<hash>.css` and `agentks theme css` both return |
| `file_for` | The file behind a file route (`/content-assets/`, `/artifacts/`, `/assets/`), canonical and inside an allowed root |
| `current_hash` | The current hash of a data key, so the server can answer "unchanged" to a client that already holds it |
| `errors` | The current content problems, by file |

The return types come from `agentks-api`. Their shapes are described in the [server and protocol section](../15_server-and-protocol/01_overview.md).

`answer` returns an `Answer`: the compact JSON of one result, and its hash. The server writes the reply envelope around that JSON without parsing it again, and `agentks build` hands it to the static renderer. The JSON is exactly what the caches hold.

## Where answers come from

For each request the site:

1. computes the value's cache key from the index hashes and the settings that shape it;
2. looks in the memory cache;
3. on a miss, looks in the build cache on disk;
4. on a second miss, produces the value, then stores it in both.

Two requests for the same missing key wait for one render, not two. The [caching section](../20_caching/01_overview.md) describes each layer.

## Applying changes

The server's watcher hands the site one debounced batch of file changes at a time: content, config, theme files or git refs. `Site::apply_changes` applies the batch and returns a `ChangeSet`:

| Field | Holds |
|---|---|
| `hashes` | The new hash of every affected data key: changed pages, pages that embed a changed file, section sidebars, tracker indexes, the manifest when config changed |
| `removed` | Keys that no longer exist |
| `moved` | For a removed page whose file moved, its new URL |
| `errors` | The new content problems of every file read again. An empty list means the file is clean now |
| `fatal` | Every problem of a config change that does not load |
| `restart_needed` | A `server` setting changed and takes effect on the next start |

`ChangeSet::pushes` turns this into the pushes the server sends, in the order a client should apply them: `fatal` first, then `changed`, then one `errors` push per file.

**A config change that does not load keeps the last good config serving.** Its problems go to `fatal`, and the client shows them until the config is fixed. A config change that does load is diffed against the old one. The `Affects` tags of the changed settings decide the work: recompile the CSS, resend the manifest, rebuild the index, re-render the pages whose settings fingerprint moved, or re-check libraries.

## Saving a file

`Site::save(path, content, base_hash)` writes an existing file inside a content section, but only if its hash on disk is still `base_hash`, the hash the editor started from. Otherwise it returns `SiteError::Conflict` and writes nothing. The write is atomic, and the method returns the new hash. It refuses config files, anything under `.git`, sidecars, `settings.json` and new files.

## Errors per file

The site keeps the current content problems of every file, and replaces a file's set each time it reads that file again. `agentks check` and the dev toolbar both read `Site::errors`. `SiteError::to_reply` is the one mapping from a site failure to a reply; the [error model](./15_error-model.md) lists it.

## The runtime model

- **An immutable snapshot.** The current state, meaning the config, the index and the derived trees, is one snapshot behind an atomic swap. A request takes the current snapshot and works on it with no lock. A reader in the middle of a request keeps a consistent view even while a change lands.
- **One writer.** File changes are applied by a single writer, in order. It builds the next snapshot from the current one, sharing every unchanged part, then swaps it in.
- **CPU work off the async threads.** Rendering, hashing a large tree and highlighting run on a bounded pool of blocking threads, so the WebSocket stays responsive.
- **No global mutable state.** State lives in the site object. No lock is held across an `.await` or across a render.
- **Correctness over memory.** An evicted page is rendered again, never served stale.

## Related

- [How a request flows](../05_overview/15_request-flow.md): the site in the middle of a request.
- [The site index](./30_index.md): the snapshot's largest part.
- [Server and protocol](../15_server-and-protocol/01_overview.md): the server that calls the site.
