---
name: agent-ks-quick-idea-note
description: Capture an ad-hoc idea or a half-formed issue into the issue dump of an agent-knowledge-system tracker. Writes one subtask into the right dump issue. Creates no issue folder. Invoke it with the idea as the argument, in a phrase or a sentence.
argument-hint: [the idea, in a phrase or a sentence]
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-quick-idea-note

Capture a half-formed thought into the issue dump: one subtask in a dump issue, no new issue folder. The dump contract, graduation included, lives in [the issues operations reference](../agent-ks-issues/references/09_operations.md). Speed matters: one search, one file, one confirmation line.

## 1 Get the idea

Use `$ARGUMENTS` when it is not empty. Otherwise ask:

> What is the idea? A phrase or a sentence is enough.

## 2 Route it

One search, one judgement. Use the dump only when nothing else fits:

```
agent-ks issue list --search "<two or three keyword roots>" --quiet-tips
```

| Result | Do |
|---|---|
| A strong match with an existing issue, or a bug with an obvious home | Do not dump it. Offer to add it to `<id>` as a subtask. On yes, use `agent-ks issue new-subtask` and stop |
| The idea already passes the creation threshold: it names its component and its first subtask | Say so. Offer a real issue, per the operations reference. Dump it only when the user prefers to park it |
| Neither | Dump material. Continue |

## 3 Pick the dump issue

```
agent-ks issue list --component issue-dump --quiet-tips
```

| Found | Do |
|---|---|
| One | Use it |
| Several | Pick by kind. Ask only when the choice is not clear |
| None | Tell the user. With consent, create the first one, as below |

The first dump issue is ordinary: component `["issue-dump"]`, priority `low`, a short `issue.md` that states the contract. The contract: capture here; promote and delete on graduation. When the vocabulary lacks `issue-dump`, add it to the tracker-root `settings.json` or `settings.jsonc` first, with a comment. The comment marks it as the deliberate exception to the stack-layer axis.

## 4 Write the entry

Scaffold with the CLI. It picks the next gap-spaced prefix and writes the body template. `--overview` writes the problem statement.

```
agent-ks issue new-subtask <dump-issue-id> --name <kebab-slug> --title "<Short imperative title>" \
  --overview "<Two or three sentences: the idea, what prompted it, where the related code or docs live.>"
```

Then write one item under `# 01 To Do`. Leave the other sections as the template writes them.

```
- [ ] Promote to a real issue when it can name its component and its first subtask. Then delete this entry.
```

A reader with no context, three months later, must understand the entry. Keep the user's words where they carry meaning. Add context around them; do not rewrite them away.

## 5 Confirm

Reply with one line:

```
Captured → <dump-issue-id>/subtasks/NN_<slug>.md
```

One subtask write needs no validation. Run `agent-ks check issues` only when you touched a settings file in step 3.

## Never

| Never | Do instead |
|---|---|
| Create an issue folder for the idea itself | One subtask in a dump issue. The first dump issue is the only folder this skill creates |
| Tick off or delete an existing dump entry here | Leave it. Graduation is a separate act |
| Ask about priority, labels or component | Write the entry. The dump defers those decisions |
