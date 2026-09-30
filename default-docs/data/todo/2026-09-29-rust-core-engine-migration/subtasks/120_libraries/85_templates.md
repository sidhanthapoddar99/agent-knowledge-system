---
title: "Templates: agentks-default and its catalog entry"
status: open
---

`agentks init` creates a project from a **template**: a ready-made project folder that runs on its own. Templates live in the library repository under `templates/`, and `library.json` lists them. This leaf builds the `agentks-default` template (a docs site with a guide, a blog and an issue tracker, an empty `dep.yaml`, and a Dockerfile the user owns), adds its catalog entry, and tests it end to end. The `init` command itself is [070/40](../070_cli/40_init-template.md); this leaf owns what `init` copies.

# 01 To Do
- [ ] **Start from today's starter template**, [the config skill's template folder](../../../../../../plugins/agent-ks/skills/agent-ks-config/assets/template), and convert it to the 1.0.0 layout.
- [ ] **Template layout** in `templates/agentks-default/`:
    - [ ] `config/site.yaml` — site identity, `engine_version: "1.0.0"`, `server.port`, sections for a guide (`docs`), a blog and a tracker (`issues`), the default theme.
    - [ ] `config/navbar.yaml`, `config/footer.yaml`.
    - [ ] `config/dep.yaml` — `libraries: {}` (see Questions).
    - [ ] `config/.env.example` — every overridable key, documented.
    - [ ] Starter pages for each section: a guide with two pages (`NN_` prefixes, `settings.json`, `title` frontmatter), one blog post, one tracker issue that shows the anatomy.
    - [ ] `assets/` — logo per colour mode and favicon, as `site.yaml` names them.
    - [ ] `Dockerfile` — the one from [150/70](../150_publishing/70_dockerfile.md). Until Phase 3 ships `agentks build`, ship it with a comment saying it needs Phase 3, or leave it out and add it in 150/70; record which.
    - [ ] `.gitignore` — `dist/`, `config/.env`.
- [ ] **No placeholder language.** The template is a valid, runnable project. `init` writes identity from `--title`, `--description`, `--repo` into known `site.yaml` keys.
- [ ] **Catalog entry** in `library.json`: `templates.agentks-default` with `description`, `git`, `path: templates/agentks-default`.
- [ ] **Checks in the library repository's CI:** `agentks check config`, `agentks check section` for each section, `agentks check issues`, and `agentks start` smoke test (start, request `/`, stop) on the template folder.
- [ ] **End-to-end:** `agentks init` (defaults) in an empty folder → `cd docs && agentks start` → the site renders. Include this in [170/30](../170_testing/30_end-to-end.md).
- [ ] **Bump the library version** and tag; templates follow the library repository's version series.

## Guardrails
- A template holds no layout code; custom layouts are gone.
- Never ship `config/dep.lock` or `config/.env`.
- The template's content must pass every check the engine has, because it is the first thing new users see.

## Done when
- `agentks init /tmp/t && cd /tmp/t/docs && agentks start --detach && curl -fsS localhost:<port>/` returns the home page.
- CI in the library repository is green with the template checks.
- `agentks library search default --json` lists the template.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folder `templates/agentks-default/`.

**Read first**
- [Templates and agentks init](../../notes/04_ecosystem/04_templates-and-init.md) — what a template contains and what `init` does.
- [Project config](../../notes/02_engine/02_project-config.md) — the 1.0.0 config files.
- Today's template: [the template folder](../../../../../../plugins/agent-ks/skills/agent-ks-config/assets/template) and [the new-project steps](../../../../../../plugins/agent-ks/skills/agent-ks-config/references/01_new-project.md).

**Depends on:** [120/60](./60_default-library-scaffold.md), [070/40 init](../070_cli/40_init-template.md), [020/20 config folder](../020_content-contract/20_config-folder.md).
**Unblocks:** [170/30 end to end](../170_testing/30_end-to-end.md), [180/10 getting started docs](../180_documentation/10_getting-started.md).

# 04 Decisions
- Decided (claude, under sidhantha's delegation, 2026-09-30): the default template lists the default library in its `config/dep.yaml`, so agents find elements from day one. `init` already runs the sync, and reuse is the point of libraries.
- Decided (sidhantha, 2026-09-30): templates live in the library repository and are listed in `library.json`; `init` defaults to `agentks-default` and the path `docs` ([templates and init](../../notes/04_ecosystem/04_templates-and-init.md)).
- Decided (sidhantha, 2026-09-30): a basic Dockerfile ships with the template for users to change; no Docker image is published.
- Decided (claude, 2026-09-30): a template carries no placeholder language; a catalog template follows the library repository's version series (same note).

# 05 Notes & Analysis
## Watch out
- The notes say "defaults (agentks-default, docs)": `agentks-default` is the template and `docs` is the target path. There is no template called `docs`.
