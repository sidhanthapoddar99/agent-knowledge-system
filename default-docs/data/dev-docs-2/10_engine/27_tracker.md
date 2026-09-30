---
title: "The tracker model"
description: "The tracker module of agentks-content: the vocabulary, the issue folder, the seven anatomy sections and their readers, derived values, checks and writers."
---

The issue tracker is a folder with one subfolder per issue. The `tracker` module of `agentks-content` is its one model. The issues pages, the `agentks issue …` commands and `agentks check issues` all read it, so a rule about issues exists once. Like the rest of the content crate, it is pure: it reads files through a `FileSource` and never touches the disk itself.

## The tracker on disk

```
todo/                          the tracker section
  settings.json                the vocabulary
  2026-09-29-some-issue/       one issue: YYYY-MM-DD-<slug>
    settings.json              the issue's metadata
    issue.md                   the problem and its scope
    glossary.md                optional
    comments/  brainstorm/  notes/  plans/  subtasks/  agent-log/  agent-memory/
```

`parse_issue_folder` takes a folder name apart. A folder whose name is not `YYYY-MM-DD-<slug>` is not an issue. The date becomes the issue's `created` date.

## The vocabulary

`parse_vocabulary` reads the tracker's root settings file into a `TrackerVocabulary`:

| Field | Holds |
|---|---|
| `priorities` | The priorities, highest first |
| `components`, `labels` | The allowed values |
| `log_kinds` | Agent-log kinds, code and name. The built-in defaults, with an issue's own `agentLogKinds` merged on top |
| `label` | The tracker's display name |
| `draft` | Leave the whole tracker out of a published build |
| `template` | Make `check issues` also check the template sections |
| `authors` | The known authors |
| `views` | Preset views for the issue list, passed on as written |

**Statuses are not in the vocabulary.** The eight statuses and their four categories are fixed in `agentks-core`, so no project can add or rename one. A status value outside the list is a `status-unknown` error, never mapped to something close.

An issue's own `settings.json` may carry `title`, `description`, `status`, `priority`, `component`, `labels`, `author`, `assignees`, `draft` and `agentLogKinds`.

## The seven sections

The `SECTIONS` registry is the one declaration of each anatomy section: its label, the line shown when it is empty, the reader that loads it, whether it nests, and whether HTML artifacts render in it. The folder name and the URL segment are the section's wire name.

| Section | Reader | Nests | Artifacts |
|---|---|---|---|
| `comments/` | Flat files | No | No |
| `brainstorm/` | Free-form tree of markdown, diagram and artifact documents | Yes | Yes |
| `notes/` | Free-form tree | Yes | Yes |
| `plans/` | Plan folders, each with `settings.json`, `overview.md` and flat stage files | Two fixed levels | No |
| `subtasks/` | Nested groups; every leaf `.md` is a subtask with a status | Yes | No |
| `agent-log/` | Run folders, each with a kind and a status, their slots and child runs | Yes | No |
| `agent-memory/` | Free-form tree | Yes | No |

Folders nest at most five deep. A folder past the cap is ignored and reported as `depth-exceeded`.

Inside a section, the tree sorts by the prefix value (unprefixed entries last), then by name. In `agent-memory/`, `memory.md` is pinned first. Comments are named `NNN_YYYY-MM-DD_<slug>.md` and sort by their number. The slug is the author by default. A plan stage's heading anchor comes from its title.

## Loading an issue

`load_issue` reads `settings.json`, then every section with its own reader. While it reads, it reports what it meets: bad settings or frontmatter, unknown statuses, folders past the depth cap, two files claiming one URL.

An issue whose settings file is missing or unreadable, or whose status is unknown, cannot be shown. `load_issue` reports why and returns an error. `read_issue` returns nothing instead, with the reason in the sink, so a caller walking the whole tracker skips that issue and carries on.

## Derived values

The browser computes none of these. The engine sends them with the data.

- **An index leaf's status.** A subtask folder's `00_…` file takes its status from its siblings: `done` when every sibling is closed, `open` when every sibling is open, `in-progress` otherwise. When a sibling's status is unknown, there is no derived status: the engine does not guess. A declared `superseded` index leaf agrees with a derived `done`, because both are closed.
- **Subtask counts.** The total, the closed ones and the ones in review.
- **The review queue.** An issue is in the queue when its own status is in the review category, or when it is not closed and at least one subtask is in review.

The `updated` date is not a content rule. It comes from git, through the site crate. See [the git dates cache](../20_caching/30_git-dates.md).

## Checks

`check_issue` applies the rules of `agentks check issues` that reading alone does not: unknown settings keys, vocabulary values, the index-leaf status, the form of agent-log runs, and, for a tracker marked `template` or a run with `--template`, the template sections of subtasks, stages and plan overviews. `check_tracker_root` checks the tracker folder itself: every folder in it must be an issue folder, apart from hidden folders and `assets/`. The page for an issue shows both the reading problems and the check problems.

## Writers

The writers are pure functions that return the new text of a file. The caller writes it atomically.

- **`with_status`** sets the status of a subtask file or an issue's `settings.json` and keeps every other byte, JSONC comments and formatting included. In markdown it replaces the `status:` line of the frontmatter, or adds one before the closing `---`. In a settings file it needs exactly one top-level `"status"`, and refuses anything else rather than guess. **It refuses `done` and `dropped` unless the caller says a person asked for it**, because only a person closes work.
- **`new_comment`** returns the file name and text of a new comment: numbered after the highest existing comment, with `author` and `date` in its frontmatter. A date that is not `YYYY-MM-DD` is refused.

## Related

- [Content: the format rules](./25_content.md): the rules the tracker shares with every section.
- [The site index](./30_index.md): how tracker files get their URLs.
- [The error model](./15_error-model.md): `status-unknown`, `tracker-invalid` and the other records.
