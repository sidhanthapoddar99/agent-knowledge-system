---
name: agent-ks-quick-idea-note
description: Park a half-formed idea in an agent-knowledge-system tracker's issue dump — one subtask, no issue folder. Use it whenever the user wants a thought captured rather than worked on — "park this", "note this down for later", "add it to the backlog", "before I forget", "we should probably do X someday" — or when an idea has no home and no component named yet. For structural tracker work (creating an issue, plans, agent logs, editing an existing subtask) use agent-ks-issues instead. Invoke it with the idea as the argument.
argument-hint: [the idea, in a phrase or a sentence]
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-quick-idea-note

Capture a half-formed thought into the issue dump: one subtask in a dump issue, no new issue folder. Speed matters: four cheap lookups at most, one file, one confirmation line. Open [the issues operations reference](../agent-ks-issues/references/09_operations.md) for the create branch in step 3, or when the user pushes back on the routing call in step 2. The threshold and the graduation rule are both inline below.

## 1 Get the idea

Use `$ARGUMENTS` when it is not empty. Otherwise ask:

> What is the idea? A phrase or a sentence is enough.

## 2 Route it

Two cheap lookups, one judgement. Use the dump only when nothing else fits.

Breadth first. `--search` takes a POSIX ERE regex, not a phrase. A dictated phrase matches nothing, because those words never sit in that order on disk. Join two or three word roots with `|`. Never escape it as `\|`: in ERE that is a literal pipe, and the call returns almost nothing. Put `.*` between the common root and the rest, so the common root alone does not return the whole tracker. `--count` returns one line per matching issue instead of a wall of excerpts:

```
agent-ks issue list --search "sidebar.*(expand|collaps|persist)" --count --quiet-tips
```

When the idea names a surface that plausibly exists already, widen the scope to the closed issues too. A shipped feature is the strongest reason not to dump:

```
agent-ks issue list --path "<slug root>" --include-closed --count --quiet-tips
```

A strong match is an issue whose **title or slug** names the same surface, not one whose prose happens to mention it. Its status decides the branch:

| Result | Do |
|---|---|
| A strong match that is open, blocked, in progress, input-needed or in review | Do not dump it. Offer to add it to `<id>` as a subtask, written to the [work-order standard](../agent-ks-issues/references/06_subtasks.md), because a subtask on a live issue is an AI handoff anchor. On yes, use `agent-ks issue new-subtask` and stop |
| A strong match that is closed: `done`, `dropped` or `superseded` | Say the surface already shipped and name the issue. Ask the user which this is: a regression, a follow-up, or already covered. Wait for the answer. A closed issue takes no new subtask, and the answer decides between a bug report, a fresh issue and nothing at all. Do not dump and do not scaffold before it |
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

Then read the entries it already holds. Their shape picks the branch you take in step 4:

```
agent-ks issue subtasks <dump-issue-id> --quiet-tips
```

| Shape | Branch |
|---|---|
| One-idea leaves. Each title names a single thought | **Scaffold** a new leaf |
| Category buckets. A handful of broad titles, such as "Navigation & discovery" | **Append** a bullet to the bucket that fits |

The first dump issue is an ordinary issue. Follow the six-step [new issue](../agent-ks-issues/references/09_operations.md#a-new-issue) list. Give it component `["issue-dump"]` and priority `low`. Write a short `issue.md` that states the contract from [the dump](../agent-ks-issues/references/09_operations.md#the-dump). When the vocabulary lacks `issue-dump`, add it to the tracker-root `settings.json` or `settings.jsonc` first: the value in `fields.component.values` **and** a matching entry in `fields.component.descriptions`. A component value with no description is a hard startup error, so the site refuses to build without it. In a `.jsonc` file, add a `//` comment beside the value. It marks the deliberate exception to the stack-layer axis.

## 4 Write the entry

### Scaffold branch

Scaffold with the CLI. It picks the next gap-spaced prefix and writes the body template. `--overview` writes the lead paragraph: why this exists.

```
agent-ks issue new-subtask <dump-issue-id> --name <kebab-slug> --title "<Short imperative title>" \
  --overview "<Two or three sentences: the idea, what prompted it, where the related code or docs live.>"
```

Then replace the template's `- [ ] item` / `- [ ] sub-item` placeholders under `# 01 To Do` with the one real item. Delete the `##` sub-heads a dump entry has nothing to say about, which is the issues skill's rule: drop a sub-head you do not need. Keep `## Agent log` and write `none` under it, because `agent-ks check issues` warns on a `# 02` section that has no `## Agent log`. Keep all five `#` sections.

```markdown
---
title: "Remember the expanded sidebar section"
status: open
---

The sidebar forgets which section was expanded when you come back to a page. Sid raised it while reading the docs. The tree is built in `@root/astro-doc-code/src/layouts/docs/default/Sidebar.astro`.

# 01 To Do
- [ ] Promote to a real issue when it can name its component and its first subtask. Then delete this entry.

# 02 Status and Result
Parked.

## Agent log
none

# 03 References

# 04 Decisions

# 05 Notes & Analysis
```

### Append branch

Edit the bucket file `<dump-issue-id>/subtasks/NN_<bucket>.md` with Edit. Do not scaffold. A bucket file holds `##` headings, each over a bullet list. Add one bullet under the heading that fits the idea. Add a new `##` heading only when no heading fits. Leave the frontmatter and the other headings alone, because the bucket is a shared file and the other bullets are other people's entries.

```markdown
## Keyboard navigation

- Arrow keys for prev / next page
- Remember which sidebar section was expanded when you come back
```

A reader with no context, three months later, must understand the entry. Keep the user's words where they carry meaning. Add context around them; do not rewrite them away.

## 5 Confirm

Reply with one line. The scaffold branch names the file:

```
Captured → <dump-issue-id>/subtasks/NN_<slug>.md
```

The append branch names the file and the heading, because the file alone does not locate the bullet:

```
Captured → <dump-issue-id>/subtasks/NN_<bucket>.md § <heading>
```

One subtask write needs no validation. Run `agent-ks check issues` only when you touched a settings file in step 3.

## Never

| Never | Do instead |
|---|---|
| Create an issue folder for the idea itself | One subtask in a dump issue. A half-formed idea cannot name its component or its first subtask, so the folder would stand empty. The first dump issue is the only folder this skill creates |
| Tick off or delete an existing dump entry here | Leave it. Graduation is a separate act |
| Ask about priority, labels or component | Write the entry. The dump defers those decisions |
