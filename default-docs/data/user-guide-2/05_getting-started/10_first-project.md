---
title: "Create your first project"
description: "Create a project from a template with agentks init, open it in the browser, and put it under git."
---

`agentks init` creates a complete, runnable project from a **template**: a ready-made project folder that agentks copies into place. This page creates one, starts it, and puts it under git.

## Create a project

Run `init` in the folder where the project should go:

```sh
agentks init
```

With no arguments, `init` copies the default template, `agentks-default`, into a new folder called `docs`. The default template is a docs site with a guide, a blog and an issue tracker.

Give a path to put the project somewhere else:

```sh
agentks init handbook     # a new folder called handbook
agentks init .            # the current folder
```

Name the site as you create it. `init` writes these values into `config/site.yaml`:

```sh
agentks init handbook --title "Team Handbook" --description "How we build and ship" --repo https://github.com/acme/handbook
```

## Start it

```sh
cd docs
agentks start
```

`agentks start` checks the project, then serves it on localhost and prints the address. Open that address in your browser. Add `--open` to have agentks open the browser for you. Press Ctrl-C to stop the server.

[Run the local server](./20_local-server.md) covers starting in the background, ports, and stopping servers.

Run `agentks` with no command inside the project for a short overview: its sections and its issue counts.

## Put it under git

Commit the new project straight away:

```sh
git init
git add .
git commit -m "Create the project"
```

Git is part of how agentks works. The issue tracker reads each issue's last-updated date from git history. `agentks migrate` runs only on a project inside git with no uncommitted changes, so every change it makes can be reviewed and undone. The template's `.gitignore` already keeps out what does not belong in git.

## Use another template

`--template` takes a template id from the agentks catalog, or a git URL:

```sh
agentks init --template https://git.example.com/team/templates.git --subdir api-docs docs
```

| Option | Default | Meaning |
|---|---|---|
| `[PATH]` | `docs` | The folder to create the project in. `.` is the current folder. A missing folder is created |
| `--template ID\|URL` | `agentks-default` | A template id from the catalog, or a git URL |
| `--subdir FOLDER` | The catalog entry's folder, or the repository root | The template's folder inside its repository |
| `--tag VERSION` · `--commit HASH` · `--branch NAME` | The newest version tag | Which version of a git template to use. Give at most one |
| `--title` · `--description` · `--repo` | The template's own values | Written into `site.yaml` |

A template is copied once. It is not a dependency: nothing links the project back to it, and later changes to the template do not reach your project.

## What init does, step by step

1. **Finds the template.** A catalog id is looked up in the agentks catalog. A git template is fetched into the machine home, `~/.agentks/`, so a second `init` from the same commit works offline.
2. **Checks the target folder.** It refuses a folder that already holds a `config/` folder, so it never overwrites a project. It also refuses when any file the template carries already exists there, and lists every such file.
3. **Checks the template's version.** It reads the template's `engine_version` and applies the same version gate as `agentks start`. A template made for a newer agentks needs `agentks update`. A template older than your agentks can read needs its owner to migrate it.
4. **Copies** every file of the template into the folder.
5. **Writes your title, description and repository** into `site.yaml`.
6. **Installs the template's libraries**, if its `config/dep.yaml` lists any, and writes `config/dep.lock`.
7. **Reports** what it created and the next step.

Every check happens before anything is copied, so a refused `init` leaves the folder as it was. The one exception is step 6: if the library install fails, you still have a complete project, without a lock file. Run `agentks install` inside it once the problem is fixed.

## Read the docs from the terminal

`agentks docs` opens the agentks documentation in your browser. Give it a page name to open one page, or add `--print` to print the address instead:

```sh
agentks docs
agentks docs start --print
```

## Next

[The project folder](./15_project-folder.md) explains what `init` created.
