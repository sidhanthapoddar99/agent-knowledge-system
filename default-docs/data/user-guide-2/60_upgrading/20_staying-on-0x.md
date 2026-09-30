---
title: "Staying on agent-ks 0.x"
description: "Who should keep a project on agent-ks 0.x for now, and how to keep it working while other projects move to agentks."
---

You do not have to move every project at once. agent-ks 0.x keeps working under its own name, and each project moves when you run `agentks migrate` in it. This page says who should wait, and how to keep a 0.x project running beside agentks projects.

## Who should wait

**Publishers.** agentks 1.0.0 runs your project locally, with reading, editing and libraries, but it cannot publish a static site. `agentks build`, the command that writes a site for a web server, arrives in a later release, and the 1.0.0 release note says so. If you publish your site with agent-ks 0.x today, keep that project on the last 0.x release, pinned with mise, until your agentks release can build it. Check the release notes of the version you install; [Publishing](../55_publishing/01_overview.md) describes `agentks build`.

**Anyone mid-way through work.** `agentks migrate` needs a clean git tree, so finish or commit what you are doing first. There is no deadline.

## Keep a 0.x project working

A 0.x project needs nothing from agentks. Keep using it exactly as before:

- Run it with its framework folder's `./start`, and use `agent-ks` for its commands.
- Do not run `agentks migrate` in it until you are ready.
- Keep the `agent-ks` binary and its shell set-up installed.

agentks leaves a 0.x project alone. If you run `agentks start` in it by mistake, the version gate stops it with a message naming `agentks migrate`, and nothing in the project changes.

`agent-ks` and `agentks` are different commands, so both can be installed on one machine. Each project uses the one that matches it.

## Stop agent-ks 0.x from changing under you

agent-ks 0.x updates itself, and its framework folder can pull a newer framework. To keep a 0.x project exactly as it is:

| To hold | Do |
|---|---|
| The `agent-ks` binary | `agent-ks update --pin X.Y.Z` with the version you have, or `agent-ks update --disable` |
| The framework folder | Do not run `./start update`. The framework only changes when you pull it |

The last 0.x release of agent-ks never installs agentks for you. Its updater prints the command that installs agentks instead, so your 0.x projects never switch without you.

## Where the 0.x docs are

The documentation for agent-ks 0.x stays in the 0.x repository you installed it from, and inside each project's framework folder. These docs describe agentks only.

## When you are ready

Follow [Upgrade a project from agent-ks 0.x](./05_from-agent-ks-0x.md). You can move one project and leave the others on 0.x for as long as you need.
