---
title: "engine_version and the version gate"
description: "What engine_version means, why agentks refuses a project it cannot read, and how to fix each case."
---

Every project states the content version it targets, in `engine_version` in `config/site.yaml`. Before agentks reads a project, it checks that version against the range it can read. This check is the **version gate**. A project outside the range does not start, and the error says how to fix it. This page explains the rules and each fix.

## engine_version

```yaml
engine_version: "1.0.0"
```

The value is the **content version**: the version of the agentks content format the project's files follow. It is not the version of the `agentks` binary you have installed, although the two use the same numbers.

- `agentks init` sets it when it creates a project.
- `agentks migrate` raises it after it has converted the content, as its very last step.
- A missing `engine_version` counts as `0.0.0`.

Do not raise it by hand to get past the gate. The gate exists because content in an older format can load and still show wrong pages without any error. Raising the number skips the conversion and hides the problem.

## The range agentks reads

Each agentks binary reads content from an oldest version, the **floor**, up to its own version. The floor rises only when a release changes the content format in a way older content cannot be read correctly. Most releases leave it where it is, so updating agentks usually needs nothing from you.

agentks 1.0.0 reads content version 1.0.0.

## When the gate runs

On `agentks start`, on `agentks build`, and on every command that reads the project's content. It works offline and needs nothing downloaded.

## The three cases

| The project's content version | What happens | The fix |
|---|---|---|
| Inside the range | agentks runs | None |
| Older than the floor | agentks stops | Run `agentks migrate` in the project, or keep an older agentks for this project with mise |
| Newer than this agentks | agentks stops | Run `agentks update`, or keep a newer agentks for this project with mise |

For example, agentks 1.0.0 stops a project whose content version is 0.3.10 with:

```
agentks: this project's content version is 0.3.10 (site.yaml engine_version), but this agentks 1.0.0 reads content 1.0.0 to 1.0.0. Fix: run `agentks migrate` to bring the content to 1.0.0. To stay on the old format instead, pin the agentks release that matches it with mise.
```

A project with no `engine_version` gets the same message with `0.0.0`, and says the key is missing.

## Fix: migrate the content

```sh
agentks migrate --dry-run   # show what would change
agentks migrate             # change it, after asking
```

`migrate` downloads the migration scripts for your version range, runs them, checks the result and raises `engine_version` last. It runs only on a project inside git with no uncommitted changes. [Upgrading](../60_upgrading/01_overview.md) walks through it.

## Fix: keep another version for one project

To leave a project's content as it is, keep the matching agentks for that project folder with mise, a tool that pins program versions per folder. [Upgrading between 1.x releases](../60_upgrading/25_within-1x.md) shows the pin.

## Commands that work outside the gate

`agentks migrate` reads `engine_version` without applying the gate, because its job is to fix a mismatch. `help`, `--version`, `update` and `shell-init` work without a project, so the gate never stops them.

When the content version is older than the floor, the gate is the only error you see, even if `site.yaml` also holds keys the new version removed. Migrating deals with those keys too.
