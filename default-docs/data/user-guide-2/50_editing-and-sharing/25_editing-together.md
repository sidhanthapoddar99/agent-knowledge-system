---
title: "Editing together"
---

When several people work in one project, each of them sees who else is on a page and where they are typing, and every change lands in the same file. This page explains what you see, how edits merge, and how git credits each person. To invite someone first, see [Sharing a project](./20_sharing-a-project.md).

## Who is here

- Each visitor types a **display name** on their first visit, and the local app gives each person a colour.
- The local app lists the people on the same page as you.
- While you edit, you see other people's **cursors and selections** in their colour, labelled with their name.
- A visitor with a `read` key appears in the list but has no cursor in the text.
- When someone closes their tab, they leave the list within about 30 seconds.

Presence shares display names and cursor positions only. The list of people never shows a key's label or id. Labels do appear where a change is recorded: in comments added from the page and in commit lines, both described below.

## How edits merge

Everyone who edits a file edits one shared copy of it, live:

- Two people typing in the same page both keep their text. Nobody's typing overwrites anyone else's.
- agentks writes the shared copy to the file on disk about a second after typing pauses. The file on disk stays the source of truth.
- A change made on disk, for example by an AI agent or a `git pull`, merges into everyone's editor, just as it does for one person ([Editing a page](./10_editing-a-page.md#when-the-file-changes-on-disk-while-you-edit)).

You do not need to take turns or lock a page.

## Diagrams together

| Format | Editing together |
|---|---|
| **Mermaid**, **Graphviz** | Edited together like text. The drawing updates for everyone as the source changes |
| **Excalidraw** | Edited together shape by shape. If two people move different shapes at the same moment, both moves stay. Each person sees the others' pointers and selections |
| **draw.io** | One change at a time. You see who else has the diagram open. If two people save at the same moment, the second person gets a notice, and the diagram reloads with the saved version |

The draw.io editor can only load and save a whole file, which is why it cannot merge two people's changes the way Excalidraw can.

## Tracker changes from the page

On an issue page, the owner and anyone with an `edit` key can:

- change the issue's status, labels or priority, or a subtask's status;
- add a comment.

Each change writes the same files that `agentks issue set-state` and `agentks issue add-comment` write. Only values from the tracker's own list of statuses, labels and priorities are accepted. Everyone who has the issue or the issues index open sees the change at once, filters and counts included. A comment added from the page is signed with the writer's display name and their key's label. More about the tracker is in [the issue tracker section](../30_issue-tracker/01_overview.md).

## Who edited what: credit in git

agentks never commits on its own. You, or your AI agent, commit. To make commits honest about who changed what, agentks keeps a journal of every edit made through the server: which file, and which person.

See it with `agentks share log`:

```bash
agentks share log                   # who edited which files
agentks share log --since HEAD~5    # only edits since this git revision
agentks share log --json            # the same, for scripts and agents
```

When you commit with agentks's guarded commit, it adds `Edited-by:` lines to the commit message. They name the people who edited the committed files:

```bash
agentks git commit --scope data/guide --message "Tidy the installation guide"
```

There is no identity beyond a key, so a person is named by the display name they typed and their key's label. agentks never invents an e-mail address.

> [!TIP]
> Give each person their own key, with their name as the label. Then `agentks share log` and the commit lines name the right person, and you can revoke one person's access without affecting anyone else.
