---
title: "Tracker live edits and attribution"
---

This page explains two things that make shared work traceable. First, how a person changes an issue's status or labels, or adds a comment, straight from the issue page, with everyone seeing it at once. Second, how agentks records who edited which file through the server, so a commit can name them.

## Tracker changes are operations, not text edits

An issue's status, priority and labels live in structured files: the issue's `settings.json`, or a subtask's frontmatter. A comment is a new file in the issue's `comments/` folder. A free-text editor on those files could break their structure, so they are never opened as text in the browser. Instead, the socket offers a small set of **tracker operations**:

| Operation | Changes |
|---|---|
| Set a status | The issue's `settings.json`, or a subtask's or stage's frontmatter |
| Set the labels | The issue's `settings.json` |
| Set the priority | The issue's `settings.json` |
| Add a comment | A new file in `comments/`, numbered by the core |

**One implementation.** These operations call the same writers the CLI uses for `agentks issue set-state` and `agentks issue add-comment`. The writers live in the core, and both the CLI and the server call them. They keep the files' comments and formatting as they are. So a change from the page writes byte for byte what the equivalent command writes.

**Values come from the vocabulary.** The core checks every value against the tracker's vocabulary. An unknown status or label is refused, never added.

**The one file a person creates.** Adding a comment is the only human action in the browser that creates a file. It creates only comment files, only through the core's scaffolder. No other file is created over the socket.

**Roles.** The operations need `edit` or `owner`. The tracker's rule that only the owner signs work off is a rule for AI agents; a person on the page may set any status their role allows.

## How everyone sees the change

1. The operation carries the hash of the file it changes. If the file changed since, the reply is `conflict`, and the page refreshes and asks again.
2. The writer writes atomically, through the same path as every save, and records the write in the echo table ([file writes](../15_server-and-protocol/30_file-writes.md)).
3. The watcher sees the change and pushes `changed` for the issue's page and the tracker's index ([pushes](../15_server-and-protocol/20_pushes-and-back-pressure.md)).
4. Every open tab showing the issue or the index redraws, filters and counts included, with no extra code.

The status and label pickers and the comment box belong to the issues layout. This part of the system provides only the operations and a typed helper for the client.

**Authorship of a comment.** A comment's author is the session's display name together with the key's label. The owner on localhost uses the name in the machine's settings.

## Who edited what: the edit journal

agentks never commits, pushes or amends on its own. The owner, or the owner's AI, commits. So agentks keeps a journal of who changed which file through the server, and adds that to the commit when asked.

The journal is `~/.agentks/share/<project key>.edits.jsonl`: one JSON line per event, append-only, owner-readable only, in the machine home and never in the project. The type is `EditJournal` in `apps/agentks-engine/crates/sync/src/keys.rs`. Each line records the file, the key that made the edit, the display name and the operation. An edit by the owner carries no key, so it is recorded as the owner's.

| Counts as an edit | Attributed to |
|---|---|
| A successful `save` | The connection that saved |
| A live document's write-back | Every connection that changed the document since the last write-back |
| A tracker operation | The connection that ran it |

A write-back that two people contributed to is attributed to both. That is coarse, but honest. Authorship by character is not worth its cost.

The journal never holds a key's secret or a file's contents.

## From the journal to a commit

- **`agentks share log`** reads the journal and lists who edited which files through the server. `--since` limits the list to edits since a git revision.
- **`agentks git commit`** adds `Edited-by:` trailers to the commit. They name the people the journal records as editors of the committed paths. A person is named by the display name and the key's label, because there is no identity beyond the key. A trailer never invents an e-mail address.
- **The skills** tell an AI that commits shared work to read `agentks share log` and add the same trailers.
