---
title: "The error model"
description: "One record shape for every problem, the stable list of error kinds, fatal versus content errors, the sink, and request failures."
---

Every problem the engine finds takes one shape, the `ErrorRecord`, so the terminal, the page and the dev toolbar all show the same thing. This page explains that record, the list of kinds, the two classes of error and how each travels. The types live in `agentks-core`, in `apps/agentks-engine/crates/core/src/error/`.

## The rule behind it

**When the engine cannot be sure of an answer, it returns an error. It never renders a guess.** A link whose target is missing is marked broken, not pointed at the nearest match. A status value outside the vocabulary is reported, not mapped to something close. A wrong answer that looks right is worse than an error, because nothing later can tell it apart from a right one.

## The record

| Field (Rust) | On the wire | Meaning |
|---|---|---|
| `file` | `file` | The file the problem is in, relative to the project root |
| `line` | `line` | The 1-based line in that file. Optional |
| `kind` | `type` | What kind of problem, from `ErrorKind` |
| `severity` | `severity` | `error` or `warning` |
| `message` | `message` | One sentence in plain English |
| `key` | `key` | The config key path, such as `pages.todo.layout`, for config problems. Optional |
| `suggestion` | `suggestion` | How to fix it, when the engine knows. Optional |

On the wire, empty optional fields are left out:

```json
{
  "file": "data/docs/01_a.md",
  "line": 42,
  "type": "link-missing",
  "severity": "error",
  "message": "No file ./02_x.md",
  "suggestion": "Did you mean ./02_y.md?"
}
```

People read the same record as one line, with the fix on the next:

```
data/docs/01_a.md:42: link-missing: No file ./02_x.md
  fix: Did you mean ./02_y.md?
```

`line` always points at the source file, never at rendered output. A problem inside text that a page embeds with `[[path]]` names the embedded file and its line. The renderer keeps a source map from its output back to each file for this.

An `error` makes `agentks check` exit non-zero. A `warning` does not.

## The kinds

`ErrorKind` is one enum for the whole engine. Each kind has a stable kebab-case name, and skills, CI jobs and the dev toolbar match on those names. A test pins the full list, so a rename cannot slip through. Adding a kind is safe. Renaming or removing one needs a migration note, and the pinned list changes in the same commit.

| Group | Kinds |
|---|---|
| Config | `config-missing`, `config-invalid`, `config-key-removed`, `config-key-unknown`, `env-key-unknown`, `alias-unknown`, `alias-invalid`, `section-invalid`, `layout-unknown`, `base-url-duplicate`, `url-reserved`, `engine-version-invalid`, `engine-version-unsupported` |
| Themes | `theme-not-found`, `theme-invalid`, `theme-extends-cycle`, `theme-variable-missing` |
| Libraries | `library-invalid`, `library-lock-invalid`, `library-manifest-invalid`, `library-engine-mismatch`, `library-fetch-failed`, `library-element-unknown` |
| Content | `link-missing`, `link-form`, `path-escapes-project`, `anchor-missing`, `embed-missing`, `slug-collision`, `prefix-missing`, `depth-exceeded`, `frontmatter-invalid`, `frontmatter-field-missing`, `frontmatter-key-unknown`, `settings-missing`, `settings-invalid`, `sidecar-invalid`, `status-unknown`, `tracker-invalid` |
| The engine itself | `internal` (a bug to report), `not-implemented` (a part that is not built yet) |

## Two classes: fatal and content

| Class | Examples | What happens |
|---|---|---|
| **Fatal** | Config missing or invalid, the version gate, an unknown alias or layout, a broken theme, a library outside its engine range | Loading returns `Err`. The server does not start, or the command exits non-zero. Nothing is served until it is fixed |
| **Content** | A missing link target or embed, a slug collision, bad frontmatter, an unknown status | The record goes to an `ErrorSink` and the work goes on. The page still renders and shows the problem. `agentks check` reports it |

The class is decided by where a record is reported, not by its kind alone.

**A fatal error carries every problem one load found.** `ErrorList` is a list that can never be empty: `ErrorList::new` returns nothing for an empty list, because an empty fatal error would be a lie. So a user with three config mistakes sees all three at once and fixes them in one pass.

**A content error travels with its data.** Each page's data has an `errors` array holding the records of its file. `agentks check` and the page call the same functions, so they report the same problems.

## The sink

`ErrorSink` is a plain collector, passed through loading and rendering. A stage that finds a problem calls `report` and carries on.

- `has_errors` says whether any record is an `error` rather than a warning.
- `into_by_file` groups the records by file.

The site keeps the current records per file and replaces a file's set whenever it reads that file again, so a problem disappears as soon as it is fixed. When a batch of changes re-reads a file, the server pushes that file's new list to every client. An empty list means the file is clean now.

## Error types per crate

Each crate returns its own error type, built with `thiserror`: `ConfigError`, `ContentError`, `IndexError`, `RenderError`, `CacheError`, `GitError`, `LibraryError`, `MigrateError`, `SiteError` and so on. An `Err` means the crate could not do its job, not that the content has a problem. `ConfigError::Invalid` and `LibraryError::Invalid` carry an `ErrorList` with every record found.

A part of a crate that is not built yet returns that crate's `NotImplemented` variant, never a panic or a made-up value. A type whose constructor is not built holds an `Infallible` field, so no value of it can exist and its methods are provably unreachable.

## Request failures

A failed request to the server is not a problem in the project, so it has its own closed list, `ReplyErrorKind` in `agentks-api`:

| Kind | Meaning |
|---|---|
| `not-found` | Nothing exists under that URL, section or id |
| `invalid-request` | The request is malformed or names an unknown data kind |
| `forbidden` | The connection's role does not allow this request |
| `conflict` | The file changed on disk since the client read it |
| `busy` | Too many requests in flight on this connection |
| `fatal` | The project's config is broken; nothing can be answered until it is fixed |
| `internal` | A bug in the engine |
| `not-implemented` | This request is not built yet |

**A content problem never fails a request.** It travels in the data's `errors`.

`SiteError::to_reply` is the one mapping from an engine failure to a reply, used for every request:

| `SiteError` | Reply kind |
|---|---|
| `NotFound` | `not-found` |
| `Conflict` | `conflict` |
| `Config`, `Library` | `fatal`, with the records of an invalid config or `dep.yaml` |
| `NotImplemented` | `not-implemented` |
| `Render`, `Index`, `Content`, `Cache`, `Git` | `internal` |

The server produces `invalid-request`, `forbidden` and `busy` itself, before a request reaches the site.

## How the CLI shows errors

The CLI is the only crate that prints. Diagnostics go to stderr as `agentks: message`, then each record in the one-line form above. With `--json`, a failed command writes one JSON document to stdout:

```json
{ "error": { "kind": "...", "message": "...", "records": [ ... ] } }
```

`records` is present when the failure carries error records.

## Related

- [The core crate](./10_core.md): the other shared types.
- [Site: the engine as one object](./45_site.md): where per-file records are kept and pushed.
- [Server and protocol](../15_server-and-protocol/01_overview.md): how replies and pushes carry these records.
