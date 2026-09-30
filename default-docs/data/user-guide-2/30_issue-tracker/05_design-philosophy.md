---
title: "Why the tracker is shaped this way"
description: "The team the tracker is built for, and the design choices that follow from it."
---

This page explains the choices behind the tracker. Read it to decide whether the tracker fits your team, and to see why the rules on the other pages exist.

## The team it is built for

The tracker is deliberately narrow. It serves a team like this:

- One to four people do the development.
- AI agents do most of the implementation. The people steer and review.
- Long autonomous runs are normal. An agent may work for hours and leave a record behind.
- Plans change often, because an agent ships something new every few hours.
- Coordination is one chat message away, so the team needs no ceremony.

For this team, a general tracker has too much process for its size and too little support for agents. The bottleneck is not how much work the team can do. It is how much work the people can review.

## Priority and status are the only ordering signals

The issue list sorts by priority, then by the date of the last change. That is the whole ordering. There are no sprints, release buckets, due dates or issue types. Under continuous shipping those fields go stale quickly, and they repeat what priority and labels already say.

## Dates come from the files, never from you

You never type a date into an issue. agentks reads it:

- `created` is the date in the folder name.
- `updated` is the date of the last git commit that touched anything in the folder.

A date that someone types in drifts the first time they forget to change it. A date read from git cannot drift.

## Progress is a status, not a guess

"Work has started" is the `in-progress` status, which you set. agentks never infers it from other fields. An assignee does not mean work has started, and work often starts with nobody assigned. So `assignees` only says who is involved.

## The statuses are fixed

Every issue and subtask uses the same eight statuses, in four categories. They are fixed in agentks. A tracker cannot add, rename or remove one.

This is a deliberate exception to "you decide". When an AI agent is the main operator, the app, the CLI, the skills and every agent must speak exactly the same lifecycle. If each tracker could invent its own status names, agents would guess, and the guesses would drift.

The set is fixed. The moves between statuses are not: any change from one status to another is allowed. [Statuses, categories and review](./15_statuses-and-review.md) lists them.

## Review is where agent work meets a person

The Review category is the key idea. It holds two statuses:

- `review` says "I think this is done. Please confirm or reject it."
- `input-needed` says "I am stuck on a question. The question is written in the item."

Without this category you have two bad options. You trust the agent and let it close its own work, so mistakes ship unseen. Or you watch every change, and lose the point of delegating. Review is the third option. An agent hands work to Review, and a person signs it off.

So an agent never sets `done` or `dropped` on an issue or a subtask. Only a person does, after looking at the result.

## Labels describe the work, links connect it

Real work is rarely one kind. A performance fix may be a bug and a refactor at once. So `labels` is a list, and an issue carries every label that applies. Status says where the work stands; labels say what kind of work it is.

Related issues link to each other in their text. A set of issues that needs a field to group them usually wants to be one issue with subtasks.

## The record is the product

An agent log keeps the attempts that failed as well as the ones that worked. A note keeps a decision together with its reason. A reviewer reads the record instead of asking the agent what it tried.

## When the tracker fits

| Good fit | Poor fit |
|---|---|
| A solo developer or a small team working with agents | Public issue tracking, where outside contributors file bugs |
| Work that lives next to its documentation | Many binary files per issue, such as video bug reports |
| Text files: diagrams, notes, references | One board across many repositories |
| Projects that gain from history an agent can read | Large teams that need access control per issue |
| Offline work, with history kept in git | |

## Trade-offs

| Gains | Costs |
|---|---|
| Every issue is plain text an agent can read | Two branches that edit the same file can conflict when they merge |
| No database and no server to run | Anyone with access to the repository sees every issue |
| Every status change is a commit you can inspect | An outside contributor needs access to the repository |
| Issues can live on a branch and merge with the work | Large files in issues make the repository heavy for everyone |
| Markdown outlasts any database schema | |
