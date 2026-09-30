---
title: "Requests and replies"
---

This page explains what the client can ask for on `/api`, how data is named and cached by hash, and the shapes of a reply and of a failure.

## Requests

Every request carries an `id` and an `op`. The client picks the `id`, and the reply echoes it. Replies may come back in any order, so several requests can be in flight on one connection.

| `op` | Kind | Job |
|---|---|---|
| `get` | A cacheable pull | Fetch data by name. It can carry the hash the client already holds |
| `render` | An action | Render unsaved markdown for the live preview, with the same pipeline as every page |
| `open` | An action | Read a file's text and hash, to edit it |
| `save` | An action | Write an edited file ([file writes](./30_file-writes.md)) |

An action has no hash to compare, so it is its own `op`, never a kind of `get`. The collaboration requests, such as joining a live document, travel the same way ([collaboration](../30_collaboration/01_overview.md)).

## get: what, params and have

```json
{ "id": 7, "op": "get", "what": "page", "params": { "url": "/dev-docs/architecture/overview" }, "have": "b3:5f1c..." }
{ "id": 9, "op": "render", "params": { "path": "data/dev-docs/01_intro.md", "markdown": "..." } }
```

`what` names the data, and `params` picks one item. `have` is optional: it is the hash of the copy the client already holds.

| `what` | `params` | Data key | Answer |
|---|---|---|---|
| `manifest` | none | `manifest` | Every route with its section, data key and hash; every section with its layout; the site identity, theme URL, navbar and footer |
| `page` | `url` | `page:/dev-docs/a` | One page's data |
| `sidebar` | `section` | `sidebar:dev-docs` | One docs section's sidebar tree, already in order |
| `issues-index` | `section` | `issues-index:todo` | One tracker's issue list with its filter options |
| `issue` | `section`, `id` | `issue:todo/2026-09-29-x` | One issue with its anatomy |
| `blog-index` | `section` | `blog-index:blog` | One blog's post list |
| `custom` | `page` | `custom:home` | A built-in custom page's data |

What each answer holds is set by [the engine](../10_engine/01_overview.md). The server does not look inside it.

## Data keys

Each `what` with its params is a **data key**: the string name of one cacheable answer, as in the table above. The type is `DataKey` in `apps/agentks-engine/crates/api/src/messages/client.rs`. It parses and prints this grammar, and the schema carries the same pattern. Pushes name changed data by these keys, and the browser caches by them. A string that does not fit the grammar is an error, never a guess.

## Replies

```json
{ "id": 7, "ok": true, "hash": "b3:5f1c...", "data": { } }
{ "id": 7, "ok": true, "hash": "b3:5f1c...", "unchanged": true }
{ "id": 8, "ok": false, "error": { "type": "not-found", "message": "No page at /dev-docs/x." } }
```

- **Data.** `hash` is the hash of the data, the same as the `hash` every payload carries inside it.
- **Unchanged.** When `have` equals the current hash, the reply says `"unchanged": true` and carries no data. The client keeps its copy.
- **Failed.** `ok` is `false`, and `error` says why.

## How a get is answered

1. The server checks the role ([the /api socket](./10_the-api-socket.md)) and the in-flight count. A refusal is answered at once.
2. It records the key for this connection, so later `changed` pushes about it reach this tab ([pushes](./20_pushes-and-back-pressure.md)).
3. It runs the rest on the blocking thread pool, because the engine may read files or render.
4. It asks the engine for the current hash of the key. When `have` matches, it replies `unchanged` and sends nothing else.
5. Otherwise it asks the engine for the answer, `Backend::answer`. The engine serves it from its in-memory cache ([caching](../20_caching/01_overview.md)), as the compact JSON the cache stores. If the answer's hash turns out to equal `have`, the reply is still `unchanged`.
6. `write_data_reply` in `agentks-api` writes the reply envelope around those bytes without parsing them again, byte for byte what serialising the reply type would give.

## Failures

A failed reply's `error` is `{ type, message, errors? }`.

- `type` comes from a closed list, `ReplyErrorKind` in `agentks-api`.
- `message` is one sentence in plain English.
- `errors` holds the error records behind a `fatal` failure: file, line, type, key and a suggested fix.

| `type` | Meaning | The client may |
|---|---|---|
| `not-found` | Nothing exists under that URL, section or id | Show its not-found view |
| `invalid-request` | The request is malformed or names an unknown `what` | Report a bug |
| `forbidden` | The connection's role does not allow this request | Say so |
| `conflict` | The file changed on disk since the client read it | Show the disk version ([file writes](./30_file-writes.md)) |
| `busy` | Too many requests in flight on this connection | Retry |
| `fatal` | The project's config is broken, so nothing can be answered | Show the error list |
| `internal` | A bug in the engine | Show the message |
| `not-implemented` | The request is not built | Show the message |

**A content problem never fails a request.** A broken link or a missing title travels inside the data's own `errors`, and the page still draws. Only a problem that stops the answer itself is a failure.

**One mapping.** Engine errors become reply errors through one function, `SiteError::to_reply`. No handler builds its own error.

**Malformed frames.** A frame that does not parse but has a readable `id` gets `invalid-request`. A frame with no readable `id` cannot be matched to a request, so the connection closes with `4400`.

**Panics.** The server catches a panic inside a request handler. It logs it as an internal error together with the request, but never the markdown of a `render`. It replies `internal`, and the connection stays up.
