---
title: "Templates and agentks init"
---

`agentks init --template <template id or url> <path>` creates a new agentks project from a **template**, a ready-made project folder. The template defaults to `agentks-default` and the path to `docs`. The path can be `.`, `..` or any folder. Templates live in the library repository, `neuralabshq/agent-knowledge-system-library`, and are listed in its `library.json`. A template can also come from any git URL or a local folder. It is copied into the project once. It is not a dependency and is never listed in `dep.yaml`. A template holds everything a project needs to run and to publish: the `config/` folder with `site.yaml`, an empty `dep.yaml` and `.env.example`, starter pages, and a basic **Dockerfile** that the user owns and can change. `init` never overwrites anything. It refuses a folder that already holds a project or any file the template would replace.

# 03 References

- [Libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md), section 10: templates and `agentks init`.
- [Phase 3: publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md), section 06: the Dockerfile.
- [The repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md): where templates live.
- [Config folder and .env](../../brainstorm/01_initial-discussion/06_config-folder-and-env.md): what `config/` holds.
- Today's starter template, inside the config skill: [the template folder](../../../../../../plugins/agent-ks/skills/agent-ks-config/assets/template) and [the new-project steps](../../../../../../plugins/agent-ks/skills/agent-ks-config/references/01_new-project.md).
- Today's `init`, which prints shell integration: the `init` function in [update.rs](../../../../../../agent-ks-cli/src/update.rs).
- Sibling notes: [library system](./01_library-system.md) (sources, the catalog, the cache), [project config](../02_engine/02_project-config.md), [Rust CLI](../02_engine/05_rust-cli.md), [publishing](../05_delivery/02_publishing-ssg.md), [deployment and hosting](../05_delivery/06_deployment-and-hosting.md), [versioning and migrations](../05_delivery/03_versioning-and-migrations.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-30): `agentks init --template <template id or url> <path>` creates a project from a template. The template defaults to `agentks-default` and the path to `docs`; the path can be `.`, `..` or any folder.
- Decided (sidhantha, 2026-09-30): templates live in the library repository, `neuralabshq/agent-knowledge-system-library`, and are listed in `library.json`.
- Decided (sidhantha, 2026-09-30): no Docker image is published. A basic Dockerfile ships with the docs and the template, for users to change: it installs agentks, runs `agentks build`, and serves the output with nginx.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required in every project, even when empty.
- Decided (sidhantha, 2026-09-30), on claude's proposal: a template id is looked up in the catalog; a URL is a git source, optionally with a subfolder and a version.
- Decided (sidhantha, 2026-09-30), on claude's proposal: `init` refuses a folder that already holds a `config/`, so it never overwrites a project.
- Decided (sidhantha, 2026-09-30), on claude's proposal: a template is copied into the project once. It is not a dependency and is not listed in `dep.yaml`.
- Decided (claude, 2026-09-30): `init` refuses any file collision, not only an existing `config/`, and lists the files. Today's skill keeps the user's copy and skips the template's; a silent skip leaves a project half from the template and half not, so `init` stops instead.
- Decided (claude, 2026-09-30): a template carries no placeholder language. `init` sets the site's identity by writing known `site.yaml` keys from flags, so a template stays a valid, runnable project on its own.
- Decided (claude, 2026-09-30): a template states its engine version the way every project does, through `engine_version` in `site.yaml`. `init` checks it against the running binary with the same version gate. No second template manifest is needed.
- Decided (claude, 2026-09-30): a template from the catalog follows the library repository's version series, because it lives in that repository.

# 05 Notes & Analysis

## 01 The command

```
agentks init [--template <source>] [<path>]
             [--subdir <folder>] [--tag <version> | --commit <hash> | --branch <name>]
             [--title <text>] [--description <text>] [--repo <url>]
             [--json]
```

| Argument | Default | Meaning |
|---|---|---|
| `<path>` | `docs` | Where the project goes. `.` means the current folder, `..` the parent, anything else a folder that is created if missing |
| `--template <source>` | `agentks-default` | A catalog id (`agentks-default`), `owner/repo` on GitHub, any git URL, or a local folder |
| `--subdir <folder>` | the catalog entry's path, or the repository root | The template's folder inside the repository |
| `--tag` · `--commit` · `--branch` | the newest version tag | Which version of a git template, with the same rules as `dep.yaml` selectors ([library system](./01_library-system.md)) |
| `--title` · `--description` · `--repo` | the template's own values | Written into `site.yaml`, so the site is named from the start |

Examples:

```bash
agentks init                                  # agentks-default into ./docs
agentks init .                                # agentks-default into the current folder
agentks init --template acme/docs-kit handbook --tag ^2.0
agentks init --template https://git.example.com/team/templates.git --subdir api-docs docs
```

## 02 What init does

1. **Resolve the source.** A catalog id is looked up in `library.json`, whose address is built into the binary. The entry gives the git source and the folder. A git source is resolved to a commit with the same selector rules as a library, and fetched into the machine cache (`~/.agentks/libraries/`), keyed by commit. A second `init` from the same commit then works offline.
2. **Check the target.** Create `<path>` if it is missing. Refuse if `<path>/config/` exists. Refuse if any file the template carries already exists in `<path>`, and list every one.
3. **Check the version.** Read `engine_version` from the template's `config/site.yaml`. If it is outside the range the running binary supports, stop and name the template's version and the binary's range. A template older than the floor needs its owner to migrate it; a template newer than the binary needs `agentks update`.
4. **Copy** every file of the template folder into `<path>`, except the version-control folder.
5. **Apply the identity flags** to `site.yaml`.
6. **Sync the libraries.** Run the same sync as `agentks install`, which writes `config/dep.lock` ([library system](./01_library-system.md)).
7. **Report** what was created and the next step: `cd <path> && agentks start`.

Every failure happens before step 4, apart from the library sync. A failed sync leaves a complete project without a lock, and the error names `agentks install`.

## 03 What a template contains

A template is an ordinary agentks project. It runs with `agentks start` straight from its own folder, which is also how its owner tests it.

```
agentks-default/
  config/
    site.yaml          site identity, sections, theme, engine_version
    navbar.yaml
    footer.yaml
    dep.yaml           libraries: {}
    .env.example       every overridable key, documented (mostly ports)
  <sections>/          starter pages for each section the template offers
  assets/              logos and favicon the config names
  Dockerfile           publishing: install agentks, agentks build, serve with nginx
  .gitignore           dist/, config/.env
```

| File | Rule |
|---|---|
| `config/` | Required. Valid for the template's `engine_version`, checked with `agentks check config` |
| `config/dep.yaml` | Required. The default template's is empty. A template may list libraries, and `init` installs them |
| `config/dep.lock` | Not shipped. `init` writes it at step 6 |
| `config/.env` | Never shipped. It holds local overrides and, later, secrets |
| `Dockerfile` | Shipped by the default template. The user owns it after `init` |
| `.gitignore` | Ignores the build output and `config/.env` |

The exact folder layout of a project (section folders, where themes go) follows [project config](../02_engine/02_project-config.md) and [theming and layouts](../03_frontend/04_theming-and-layouts.md). A template holds no layout code, because custom layouts are gone.

## 04 The Dockerfile

The Dockerfile sits at the project's root, beside `config/`: with the default path that is `docs/Dockerfile`. agentks's own docs use the same one. It is a starting point the user owns, not a published image.

```dockerfile
# Build stage: install agentks, build the site
FROM debian:stable-slim AS build
RUN <install agentks with the official install script>
RUN <install Bun, which agentks build needs to run the static renderer>
COPY . /site
WORKDIR /site
RUN agentks build --out /out

# Serve stage: nginx and the files, nothing else
FROM nginx:alpine
COPY --from=build /out /usr/share/nginx/html
```

- Production runs only the nginx stage, so the running image holds nothing but nginx and static files.
- `agentks build` installs exactly the commits in `dep.lock`, so the build is repeatable. A build-cache mount for `~/.agentks/libraries/` avoids fetching the same commits on every build.
- The Dockerfile is a placeholder until Phase 3 ships `agentks build`. Its final shape belongs to [publishing](../05_delivery/02_publishing-ssg.md) and [deployment and hosting](../05_delivery/06_deployment-and-hosting.md).

## 05 Where templates live, and who maintains them

- **Official templates** start with `agentks-default`: a docs site with a guide, a blog and an issue tracker, an empty `dep.yaml` and the Dockerfile. They are folders in `neuralabshq/agent-knowledge-system-library` under `templates/`, each with an entry in `library.json` ([library system](./01_library-system.md)). They share the library repository's version series and are tested end to end with the engine in step 1 of the launch.
- **Third-party templates** are any git repository or subfolder. No catalog entry is needed.
- **A breaking engine release** means the template's owner migrates it with the docs migrations, like any project, and tags a new version. Projects already created from it are the users' own content and migrate through `agentks migrate`.

## 06 Open

Tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md):

- Today's `agent-ks init <shell>` prints shell integration for silent updates ([update.rs](../../../../../../agent-ks-cli/src/update.rs)). `agentks init bash` would be ambiguous: a shell, or a project folder named `bash`. So shell integration moves to `agentks shell-init <shell>`, as the [Rust CLI](../02_engine/05_rust-cli.md) proposes.
- Whether the default template should list the default library in its `dep.yaml`, so agents find elements from the first day.
