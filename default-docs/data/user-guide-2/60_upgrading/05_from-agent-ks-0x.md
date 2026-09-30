---
title: "Upgrade a project from agent-ks 0.x"
description: "Install agentks, then convert one 0.x project with agentks migrate: prepare, dry run, migrate and read the report."
---

This page converts one agent-ks 0.x project to agentks 1.0 with `agentks migrate`. Repeat it for each project. When it is done, [Finish the move](./07_finish-the-move.md) covers the checks and the clean-up.

## Before you start

**Check whether you publish.** If you publish your site with agent-ks 0.x, read [Staying on agent-ks 0.x](./20_staying-on-0x.md) first.

**Know what your project looks like.** A typical 0.x project is a folder that holds your content and a copy of the framework:

```
my-project/                      becomes the agentks project root
├── config/                      site.yaml, navbar.yaml, footer.yaml
├── data/                        your sections
├── assets/
├── themes/                      your themes, if any
└── agent-knowledge-system/      the 0.x framework folder
    ├── .env                     CONFIG_DIR=../config, PORT, HOST
    └── …                        the engine, node_modules, the start wrappers
```

agentks treats the folder that holds `config/` as the project. Your content folders stay where they are; `site.yaml` still names them. The framework folder is not used any more.

## 1. Install agentks

Install it once on the machine, as [Install and update agentks](../05_getting-started/05_install.md) shows:

```sh
curl -fsSL https://agentks.neuralabs.org/install.sh | sh
```

`agent-ks` stays installed and keeps working for projects you have not moved yet. The two commands have different names, so they do not clash.

## 2. Commit the project

`agentks migrate` refuses to run on a folder that is not in git, or that has uncommitted changes. That rule is what lets you review every change and undo it.

```sh
cd my-project
git status          # must show nothing to commit
```

If the project is not in git yet, run `git init`, then add and commit everything.

## 3. Preview the migration

Run this in the project root, the folder that holds `config/`:

```sh
agentks migrate --dry-run
```

`migrate` works out what your project needs and shows every change before it makes one:

1. It reads your content version from `engine_version` in `site.yaml`. A 0.x `site.yaml` without one counts as `0.0.0`.
2. It downloads the migration scripts for every version between yours and 1.0.0. It fetches them only from the official agentks repository, at the tag of your agentks release. This needs the network once; the scripts are then kept in `~/.agentks/migrations/`.
3. It checks that `uv` is installed, because the scripts are Python. If `uv` is missing, it prints how to install it and stops.
4. It runs each script's detect and dry-run steps, and prints one combined report of what would change, file by file.

`--dry-run` stops there and changes nothing.

The combined preview can miss a few changes. A later script cannot see what an earlier script will write, so the preview shows the project as it is now. The check after the real run is the one to trust.

## 4. Migrate

```sh
agentks migrate
```

`migrate` shows the same preview, then asks whether to go on. `--yes` skips the question; without a terminal and without `--yes`, it stops after the preview. Then it:

1. runs the scripts in version order;
2. runs every script's check again, and treats anything left as an error;
3. checks that each library pinned in `dep.lock` supports this agentks;
4. sets `engine_version` to `1.0.0` in `site.yaml`, keeping the file's comments and layout. This is always the last step.

## What the migration changes

| In your 0.x project | After the migration |
|---|---|
| No `config/dep.yaml` | `config/dep.yaml` holding `libraries: {}` |
| `CONFIG_DIR`, `PORT` and `HOST` in the framework `.env` | The port in `server.port` in `site.yaml`. `CONFIG_DIR` and `HOST` have no counterpart in agentks |
| `server.allowedHosts` and the `editor:` block in `site.yaml` | Removed |
| `LAYOUT_EXT_DIR`, `@ext-layouts` and your own layout folders | Reported, section by section, so each section ends up on a built-in layout. Your layout files are never deleted |
| Older 0.x format changes your content never had | Made, in order, so a project several 0.x releases behind converts in one run |
| `engine_version: "0.x.y"` | `engine_version: "1.0.0"` |

## 5. Read the report

The report sorts what is left into two kinds:

- **Blocking items** need a person. The run fails until you deal with them, and each one names the file, the line and what to do.
- **Reports** are for your information and do not fail the run. For example, a link that was already broken before the migration is left exactly as it was and listed, because the migration never guesses a link's target.

After you act on blocking items, commit the work so far and run `agentks migrate` again. Each script is safe to run twice, and the downloaded scripts are reused.

## Next

[Finish the move](./07_finish-the-move.md): replace custom layouts, check the result, and remove the old framework.
