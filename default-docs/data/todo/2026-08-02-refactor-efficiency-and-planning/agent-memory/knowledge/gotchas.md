---
title: "Gotchas"
---

# Gotchas

Tooling traps hit while working this issue. Each one cost a retry.

## `agent-ks issue new-subtask --group` mangles the folder name

`--group 040_execution` sanitises the underscore to a dash and **silently creates
a second folder**, `040-execution/`, beside the real one. Same defect in
`new-agent-log --group`.

**Workaround:** scaffold without `--group`, then move. Tracked as a fix inside
[`010`](../../subtasks/040_execution/010_code-the-plans-section.md).

## `agent-ks issue set-state` — the argument form

`--subtask 020` is ambiguous when two subtasks share a prefix, and `--state` is
not a flag. The form that works:

```
agent-ks issue set-state <issue>/subtasks/<file>.md <status>
```

## `agent-ks move` defaults to `git mv`

Which **stages** the move. Pass `--no-git` when the commit is someone else's to
shape, or they open `git status` to changes they did not stage.

It is link-aware and worth using over `mv` — one move rewrote 8 links across 5
files, including ones inside frontmatter.

## `ls` is aliased to indent its output

So it hides files in some listings and corrupts any path built from it. Use
`find` when the result matters, and `printf` when resolving a glob.

## Writes into `neurasutra-docs` are rejected

This session refuses edits in that checkout without a git worktree. Reading is
fine. See [authority](./authority-and-scope.md) — the answer is not to open a
worktree.

## `zsh` rejects bare `--include` globs in `grep`

`grep -rn X --include=*.md` fails with *"no matches found"* before grep ever
runs. Quote it, or drop it and filter the results.
