---
title: "Run the local server"
description: "Start, stop and list agentks servers, choose a port, read the log, and fix a server that will not start."
---

`agentks start` serves a project as a site on your machine, at an address such as `http://localhost:20412/`. The site updates by itself when a file changes on disk. This page covers starting and stopping servers, ports, logs and the usual start-up errors.

## Start

Run `start` in the project root, the folder that holds `config/`:

```sh
agentks start
```

To serve a project from somewhere else, name its config folder:

```sh
agentks start --config-dir ~/work/handbook/config
```

Before it serves anything, `start` does three things:

1. It checks the project's config and the [version gate](../35_configuration/35_version-gate.md). A problem stops the start with an error that names the file, the key and the fix.
2. It installs any library listed in `config/dep.lock` that is missing from the machine.
3. It reads the project and builds its index of pages.

Then it prints the address. Open it in your browser, or start with `--open` to have agentks open it for you.

A server started this way runs in your terminal. Press Ctrl-C to stop it.

| Option | Effect |
|---|---|
| `--detach` | Run in the background and give the terminal back |
| `--open` | Open the site in your browser once the server listens |
| `--port N` | Use this port for this run only |
| `--share` | Let other machines in, with an access key. See [Editing and sharing](../50_editing-and-sharing/01_overview.md) |

If this project's server is already running, `start` does not start a second one. It prints `Already running at` and the address.

## While it runs

When you save a file in your editor, or an agent writes one, the server notices and the open page updates. You do not reload by hand.

The server listens only on this machine. Nobody else on your network can reach it unless you start it with `--share` and give them an access key.

## Ports

Each project keeps **the same port every time**, so your browser keeps that project's settings and cache between runs. agentks takes the first of these that is set:

| Source | Set by |
|---|---|
| `--port N` | The command line, for this run only |
| `AGENTKS_PORT` in `config/.env` | You, for your machine only |
| `server.port` in `config/site.yaml` | You, for everyone who runs the project |
| A port agentks picked for the project | agentks, on the first start: a number from 20000 to 29999, recorded in `~/.agentks/ports.json` |

If that port is taken, `start` stops with an error that names what holds it: another agentks project, or another program. It never moves to a different port on its own, because a new port would lose the browser settings tied to the old one. Free the port, or set `server.port` for one of the two projects.

## See every server

```sh
agentks ps
```

`ps` lists every agentks server on the machine, whichever project it serves: its port, process id, agentks version, start time and project folder. Add `--json` for one JSON document instead of a table.

## Stop

```sh
agentks stop                          # this project's server
agentks stop --project ~/work/handbook   # another project's server
agentks stop --all                    # every agentks server on the machine
```

When no server was running, `stop` prints `No agentks server was running.` and exits with code 1.

## Read the log

Each server writes a log, which matters most for a server started with `--detach`:

```sh
agentks logs            # print this project's log
agentks logs --follow   # keep printing new lines until you press Ctrl-C
```

## When the server will not start

Start with `agentks doctor`. It checks the config, the version gate, the libraries, the port and the programs some commands need, and reports what it finds. It changes nothing.

| Error | Fix |
|---|---|
| `no agentks project found: … is not a folder` | Run from the folder that holds `config/`, or pass `--config-dir`. agentks does not search parent folders |
| The content version is outside the range this agentks reads | See [the version gate](../35_configuration/35_version-gate.md) |
| A required file is missing, such as `config/dep.yaml` | The error names the smallest valid file. For `dep.yaml` it is `libraries: {}` |
| The port is held by another project or program | Stop that server with `agentks stop`, or set `server.port` in `site.yaml` |

## Next

[Use agentks with AI agents](./25_using-with-ai.md).
