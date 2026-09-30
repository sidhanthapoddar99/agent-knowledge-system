---
title: "Init from a template — `agentks init [--template] [path]`"
status: open
---

A new user should get a working project with one command. `agentks init` copies a template into a folder: by default the `agentks-default` template into `./docs`. A template is a complete, runnable agentks project that lives in the library repository and is listed in its catalog, or any git source or local folder. This leaf builds the command. The template content itself (`agentks-default`) is [120/85](../120_libraries/85_templates.md); the shared fetch and cache are [120/20](../120_libraries/20_fetch-and-resolve.md) and [040/60](../040_caching/60_library-cache.md).

# 01 To Do
- [ ] **Command shape:**
      ```
      agentks init [--template <source>] [<path>]
                   [--subdir <folder>] [--tag <version> | --commit <hash> | --branch <name>]
                   [--title <text>] [--description <text>] [--repo <url>] [--json]
      ```
      Defaults: template `agentks-default`, path `docs`. `.` and `..` are allowed.
- [ ] **Resolve the source:** a catalog id is looked up in `library.json` (its address is built into the binary); `owner/repo` means GitHub; any git URL; or a local folder. Git sources resolve to a commit with the same selector rules as libraries and are fetched into the library cache, so a second `init` from the same commit works offline.
- [ ] **Check the target before copying anything:** create `<path>` if missing; refuse if `<path>/config/` exists; refuse if any file the template carries already exists in `<path>`, and list every such file.
- [ ] **Check the version:** read `engine_version` from the template's `config/site.yaml` and run the version gate. Too old → "the template's owner must migrate it"; too new → `agentks update`.
- [ ] **Copy** the template folder into `<path>`, without the version-control folder. Keep file modes.
- [ ] **Apply identity flags** to `site.yaml` through the config writer (keys: `site.title`, `site.description`, the repo link), keeping comments.
- [ ] **Sync libraries** as `agentks install` does, writing `config/dep.lock`. A failed sync leaves a complete project and names `agentks install`.
- [ ] **Report** created files and the next step: `cd <path> && agentks start`. `--json` returns the file list, the template source and commit.
- [ ] **Shell set-up moved:** today's `agent-ks init <shell>` is `agentks shell-init <shell>` ([070/70](./70_update-and-shell-init.md)). If the first argument is `bash`, `zsh`, `fish` or `powershell` and no such folder exists, print a hint pointing at `shell-init`, and exit `2`.

## Guardrails
- Every failure happens before the copy, except the library sync.
- A template is copied once. It is not a dependency and never appears in `dep.yaml`.
- No placeholder language inside templates; identity is written from flags.

## Done when
- `agentks init` in an empty folder creates `docs/` and `agentks start` serves it.
- `agentks init --template acme/docs-kit handbook --tag ^2.0` against a fixture git repository resolves the newest `2.x` tag.
- `init` into a folder with one colliding file refuses and lists it, and writes nothing.
- A template with `engine_version` outside the binary's range is refused with the right message.
- `agentks init bash` prints the `shell-init` hint and exits `2`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`, using `agentks-library` for fetching.

**Read first:**
- [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md) — the command, what it does, what a template contains, decisions.
- [Rust CLI, section 03](../../notes/02_engine/05_rust-cli.md).
- [Library system, sections 04 and 08](../../notes/04_ecosystem/01_library-system.md) — selectors, the catalog.
- Today's project bootstrap, which this replaces: the [agent-ks-config skill's new-project reference](../../../../../../plugins/agent-ks/skills/agent-ks-config/references/01_new-project.md).

**Depends on:** [070/20](./20_content-commands-port.md), [120/20](../120_libraries/20_fetch-and-resolve.md), [120/30 manifest and catalog](../120_libraries/30_manifest-and-catalog.md), [040/60](../040_caching/60_library-cache.md), [020/60](../020_content-contract/60_engine-version-gate.md).
**Unblocks:** [120/85](../120_libraries/85_templates.md) testing, [170/30](../170_testing/30_end-to-end.md), [180/00 getting started docs](../180_documentation/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `agentks init --template <id or url> <path>`; defaults `agentks-default` and `docs`.
- Decided (sidhantha, 2026-09-30), on claude's proposal: a template id is looked up in the catalog; a URL is a git source; `init` refuses a folder with `config/`; a template is copied once.
- Decided (claude, 2026-09-30): any file collision refuses; no placeholder language; the template's `engine_version` is checked by the version gate ([templates and init](../../notes/04_ecosystem/04_templates-and-init.md)).
- Proposed (claude, 2026-09-30), adopted here: shell set-up moves to `agentks shell-init`.

# 05 Notes & Analysis

## Watch out
- Whether the default template's `dep.yaml` lists the default library or stays empty is an open product question ([templates and init, section 06](../../notes/04_ecosystem/04_templates-and-init.md)). The command works either way.
