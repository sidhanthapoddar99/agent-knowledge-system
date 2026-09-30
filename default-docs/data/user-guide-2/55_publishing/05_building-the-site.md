---
title: "Building the site"
---

`agentks build` writes your whole site into one folder of static files. This page covers what the build needs, its flags, what it checks, and how to read its result. What ends up in the folder is on [What the build writes](./10_what-the-build-writes.md).

## Before you build

| Needs | Why | If it is missing |
|---|---|---|
| **Bun or Node** on the path | The build uses one of them to render the pages. It looks for `bun` first, then `node` | The build stops and tells you how to install Bun. It never downloads a runtime itself |
| **`config/dep.lock`**, when the project uses libraries | The build installs exactly the library versions the lock names, so a publish never picks up a version nobody reviewed | The build stops and names `agentks install`, which writes the lock |
| **The network, the first time** | To download the locked libraries into the machine's library cache | Once they are cached, builds run offline |
| **Content at this binary's version** | The same version check as `agentks start` | The build stops and says which version the content targets ([upgrading](../60_upgrading/01_overview.md)) |

On a new build machine, run `agentks doctor` first. It checks the config, the version, the libraries against the cache and the runtimes, and it changes nothing.

## Check the content first

The build stops on any error the local app would show. Catch those errors first with the checks, which run in seconds:

```bash
agentks check config                # site.yaml, navbar.yaml, footer.yaml
agentks check link-form             # every internal link is relative and its target exists
agentks check section data/guide    # one docs section: prefixes, settings.json, titles, links
agentks check issues                # the issue tracker
agentks check libraries             # library manifests and the elements your pages use
```

Or open the **Problems** tool in the dev toolbar, which lists the same problems for the whole project ([editing and sharing](../50_editing-and-sharing/01_overview.md)).

## Run the build

From the project folder, the one that contains `config/`:

```bash
agentks build
```

The site is written into `dist/`, beside `config/`. Keep `dist/` out of git; it is rebuilt from your files every time.

### Flags

| Flag | What it does | Default |
|---|---|---|
| `--out DIR` | Write the site into another folder | `dist/` beside `config/` |
| `--base PATH` | The path the site is served under, such as `/docs` ([Serving under a path](./15_serving-under-a-path.md)) | `base_path` in `config/site.yaml`, else `/` |
| `--site-url URL` | Your site's public address, such as `https://docs.example.com`. Used for canonical addresses and the sitemap | None. Without it, the build skips the sitemap and warns |
| `--json` | Print one JSON summary on stdout: pages, bytes, warnings and time | Human-readable output |
| `--config-dir PATH` | Build another project, by its config folder | `./config` |

A full example, for a site served at `https://example.com/docs/`:

```bash
agentks build --out /tmp/site --base /docs --site-url https://example.com --json
```

For every flag of the installed version, ask the binary: `agentks help build`.

## Why a build fails

A published site never ships with a known defect. So the build fails, and names the file and line, when it finds:

- a broken link;
- an embed whose file is missing;
- an unknown library element;
- a diagram that cannot be drawn;
- a published page that links to a page left out of the build, such as a draft ([Leaving content out](./20_leaving-content-out.md)).

Warnings do not stop the build. They are listed at the end, and in the `--json` summary.

A failed build never leaves half a site behind. agentks writes the new site into a temporary folder and swaps it into place only at the end, so the previous output stays untouched until a build succeeds.

| Exit code | Meaning |
|---|---|
| `0` | The site was written |
| `1` | The build failed; the messages say why |
| `2` | The command was used wrongly, for example an unknown flag |

## Build in CI

A CI job needs three things: agentks at a pinned version, Bun or Node, and the build command. Install agentks without touching shell start-up files, then build:

```bash
curl -fsSL https://agentks.neuralabs.org/install.sh | sh -s -- --version X.Y.Z --no-shell-setup
agentks build --site-url https://docs.example.com
```

Replace `X.Y.Z` with the release you build with, so every build uses the same one. Cache `~/.agentks/libraries/` between runs, so the job does not download the same library versions again. Then upload the output folder to your host ([Hosting](./25_hosting.md)).
