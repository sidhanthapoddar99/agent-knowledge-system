---
title: "The script contract"
description: "How a migration script is named, scoped, called and tested, what it prints, and how to write a new one."
---

This page is the contract every migration script keeps, and the way to write a new one. The full text lives beside the scripts, in `apps/agentks-engine/migrations/README.md`. This page summarises it and explains the reasons.

## Where scripts live

```
apps/agentks-engine/migrations/
  README.md            the contract
  docs/                scripts users run on their own content, through agentks migrate
    README.md          the chain, one row per script
  library/             scripts library owners run on their library
    README.md
  tests/
    test_docs_chain.py the chain test
```

Scripts live with the engine because the engine owns the content format. They are code in git, never compiled into the binary.

## The rules

| Rule | Detail |
|---|---|
| Name | `<to-version>_<statement>.py`. The version is the engine version the script brings content to, and the statement says what it does |
| Order | Version order is run order. Scripts that share a version run in file-name order, but must not depend on each other: each walks the tree itself. A change that needs an earlier one to have run takes the next version |
| Real versions only | A script's version is one agentks is actually released at, so no content can declare a version no engine ever had |
| One file | Python, run with `uv run`. Dependencies are declared inside the file as PEP 723 inline metadata, so the file runs alone. The only dependency today is PyYAML. The runner can also run a `.ts` or `.js` script with `bun`, but the shared block and the chain test are Python |
| Frozen | A released script never changes. A fix is a new script at a new version |
| Covers syntax | A release that retires markup owes a script, because old markup renders wrong without any error |

The runner refuses a script file whose name does not parse, rather than guessing its place in the order.

## Scope

`--root` is the project folder, the one that holds `config/site.yaml`. A docs script reads `site.yaml` to find the section folders (each `pages.*.data`, through the `paths:` aliases) and the trackers among them (the pages with `type: issues`). It touches nothing outside those folders, because a project folder can be a whole code repository whose own markdown is not content. If a script cannot tell which folders are content, it exits 2 instead of guessing.

## The five steps

```
uv run <script> <step> --root <project> [--json]
```

| Step | Does | Writes |
|---|---|---|
| `detect` | Finds what the script would change, with file and line. Prints a count per kind | Nothing |
| `locate` | The same hits as `detect`, each one printed. For a person running a script by hand; the runner never calls it | Nothing |
| `dry-run` | Lists every change `migrate` would make. `migrate --dry-run` is the same | Nothing |
| `migrate` | Makes the changes. Running it again changes nothing | Content |
| `verify` | Runs `detect` again. Exits 1 when anything is left | Nothing |

| Exit code | Means |
|---|---|
| 0 | The step ran. For `verify`: nothing is left |
| 1 | `verify` only: something is left, or something waits for a person |
| 2 | Bad arguments, or the script cannot tell which folders are content |

Any other exit is a crash. The runner stops on it and shows the script's stderr.

## The JSON document

With `--json`, a script prints one document on stdout:

```json
{
  "script": "0.2.3_slug-form-links",
  "to_version": "0.2.3",
  "step": "detect",
  "root": "/abs/path/to/project",
  "scope": { "content": ["data/guide", "data/todo"], "trackers": ["data/todo"] },
  "hits":    [{ "file": "data/guide/01_intro.md", "line": 9, "kind": "slug-link", "detail": "./page-two -> ./02_page-two.md", "blocking": false }],
  "changes": [],
  "manual":  [],
  "clean": false
}
```

| Field | Holds |
|---|---|
| `hits` | What `detect`, `locate` and `verify` found. Empty for `dry-run` and `migrate` |
| `changes` | What `dry-run` would change, or what `migrate` changed |
| `manual` | What needs a person. `blocking: true` keeps `verify` failing until a person acts. `false` is a report, such as a colour to re-declare in CSS |
| `clean` | No hits, and nothing blocking |

Every item is `{file, line, kind, detail, blocking}`, with `file` relative to `--root`. The runner reads findings from this document, never from the exit code, which is why every step but `verify` exits 0 whatever it found.

## The shared block

Every docs script repeats one identical block of shared code, marked `SHARED SHELL`: the argument parsing, the scope reading and the output. It is copied, not imported, because the contract is one runnable file per script and a released script never changes. The chain test fails when any copy differs. To change the block, change it in a new script and copy the new block into every script written after it. Library scripts carry their own block, which reads `manifest.json` instead of `site.yaml`.

## The chain test

```bash
uv run apps/agentks-engine/migrations/tests/test_docs_chain.py
```

It builds one small project at version 0.0.0 with a leftover for every script. It checks that each `detect` finds its leftover, runs the whole chain in version order, checks that every `verify` passes, checks that a second run changes nothing, and checks that the shared block is identical in every file. It takes about two seconds. `ctl test` runs it, so the gate does too.

## Writing a new script

1. Name it for the release that changes the format: `<that version>_<what it does>.py`.
2. Copy the shared block from the newest script.
3. Write `detect` first. Every other step builds on it, and `verify` is `detect` again.
4. Make `migrate` idempotent. A second run must change nothing.
5. Never guess. When the script cannot decide a change, it leaves the content as it is and reports a `manual` item, blocking if the content is wrong without a person's decision.
6. Add a leftover for the new script to the chain test's fixture.
7. Try it on agentks's own `docs/` and on the tracker fixture before the release.
8. Update `docs/README.md`'s chain table.

## Related

- [agentks migrate](./10_migrate-runner.md): how the runner calls these steps.
- [Releases](./25_releases.md): the checklist that decides when a release owes a script.
