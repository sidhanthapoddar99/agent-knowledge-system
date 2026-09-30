---
title: "Templates and agentks init"
---

`agentks init` creates a new project from a **template**, a ready-made project folder. One command gives you the `config/` folder, starter pages for each section and a Dockerfile for publishing, all valid and ready to run. [Getting started](../05_getting-started/01_overview.md) walks through a first project; this page covers the command and the templates in full.

## Create a project

```bash
agentks init                    # the agentks-default template, into ./docs
agentks init .                  # the same template, into the current folder
agentks init handbook --title "Team handbook" --repo https://github.com/acme/handbook
agentks init --template https://github.com/acme/docs-kit.git --tag ^2.0 handbook
agentks init --template https://git.example.com/team/templates.git --subdir api-docs docs
```

When it finishes, `init` prints what it created and the next step: `cd <path> && agentks start`.

| Argument | Default | Meaning |
|---|---|---|
| `<path>` | `docs` | Where the project goes. `.` is the current folder and `..` its parent. Any other folder is created if it is missing |
| `--template <source>` | `agentks-default` | A template id from the catalog, or a git URL |
| `--subdir <folder>` | the catalog entry's folder, else the repository root | The template's folder inside its repository |
| `--tag` · `--commit` · `--branch` | the newest release | Which version of a git template. The rules are the same as for [library versions](./05_dep-yaml.md#choosing-a-version) |
| `--title` · `--description` · `--repo` | the template's own values | Written into `config/site.yaml`, so the site has its name from the start |

`agentks library search <words>` finds templates in the catalog, next to libraries.

## What init does

1. **Finds the template.** A template id is looked up in the catalog. A git source is resolved to one commit and fetched into the machine cache, so a second `init` from the same commit works offline.
2. **Checks the target folder.** It refuses a folder that already has a `config/` folder. It also refuses when any file the template carries already exists there, and lists every such file.
3. **Checks the version.** It reads `engine_version` from the template's `config/site.yaml`. If your agentks cannot run content of that version, it stops and names both versions. A template that is too new needs `agentks update`; one that is too old needs its owner to migrate it.
4. **Copies** every file of the template, except its version-control folder.
5. **Writes** `--title`, `--description` and `--repo` into `config/site.yaml`.
6. **Installs the libraries** the template's `dep.yaml` lists, and writes `config/dep.lock`.
7. **Reports** what it created.

Every check runs before anything is copied, so a refused `init` leaves your folder as it was. Only the library install can fail after the copy. You then have a complete project without a lock, and the error tells you to run `agentks install`.

## What a template holds

A template is an ordinary agentks project. The default template looks like this:

```text
agentks-default/
  config/
    site.yaml        site identity, sections, theme, engine_version
    navbar.yaml
    footer.yaml
    dep.yaml         the template's libraries
    .env.example     every setting .env may override, documented
  <sections>/        starter pages for a guide, a blog and an issue tracker
  assets/            the logos and favicon that site.yaml names
  Dockerfile         for publishing: install agentks, build, serve with nginx
  .gitignore         ignores dist/ and config/.env
```

A template never ships `config/dep.lock`, which `init` writes, or `config/.env`, which holds your local settings. The Dockerfile is yours to change after `init`; [publishing](../55_publishing/01_overview.md) explains it.

## Templates are copied once

`init` copies a template into your project one time. A template is not a dependency: it is never listed in `dep.yaml`, and a new version of the template does not change a project made from it. From then on, the project is simply your content.

## Make your own template

Any agentks project can serve as a template. To make a good one:

- **Keep it runnable.** Run `agentks start` in the template's own folder to test it. A template needs no placeholder text, because `init` writes the site's name and description from its flags.
- **State its version.** `engine_version` in `config/site.yaml` says which agentks it is for, as in any project.
- **List libraries if it needs them.** `init` installs whatever the template's `dep.yaml` lists.
- **Leave out** `config/dep.lock`, `config/.env` and build output.
- **Host it anywhere.** Any git repository works, or a folder inside one; users pass it with `--template` and `--subdir`.
- **Tag versions** as `x.y.z` or `vx.y.z`, so users can choose one with `--tag`.

When a new agentks release changes the content format, migrate the template like any project, with `agentks migrate` in its folder, then tag a new version. Projects already made from it are their owners' content, and they migrate on their own.

The templates in the catalog, starting with `agentks-default`, live in the `templates/` folder of the `NeuraLabsHQ/agent-knowledge-system-library` repository and share its version series.
