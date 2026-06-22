---
title: "Category 0b — add the `help` / discovery command"
state: review
---

The keystone for agent discoverability. An agent must learn the whole toolkit in ONE call, not by reading 14 inconsistent `--help`s. Backed by the manifest (subtask 03).

## Tasks

- [ ] `docs help` — list every command grouped by domain/category with one-line summaries
- [ ] `docs help <command>` — show that command's flags (generated from the manifest)
- [ ] **`docs help --json`** — full machine-readable manifest dump (the highest-value feature for an AI end user)
- [ ] `cli.mjs --help` / no-command → route to the same discovery output (currently it only errors)
- [ ] Wire as a command (manifest entry + shim pair, or top-level verb if naming model B)
- [ ] Verify on Windows (`.cmd` twin) — pure JS, should be parity
