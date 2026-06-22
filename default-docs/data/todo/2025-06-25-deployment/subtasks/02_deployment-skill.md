---
title: "Deployment skill (Docker Compose + nginx + content-type skills)"
state: open
---

A Claude skill that walks the user through deploying the framework in the common hosting topologies, plus skills for spinning up the canonical content types.

## Hosting topologies

- [ ] **Subpath, single nginx** — `app.com/docs` served by one nginx container that fronts both the main app and the static docs build
- [ ] **Subpath, multiple nginx** — `app.com/docs` with a routing nginx in front of separate per-app nginx containers
- [ ] **Subdomain** — `docs.app.com` runs its own nginx independently

## Docker Compose

- [ ] Reference `docker-compose.yml` for each topology
- [ ] nginx config snippets per topology (subpath rewrite, root, upstream)
- [ ] Static-build mount strategy (read-only volume of `dist/`)

## The skill itself

- [ ] Skill prompts the user for topology + chosen path
- [ ] Generates the right `docker-compose.yml` + `nginx.conf`
- [ ] Documents how to add nginx config manually (no Docker)
- [ ] Verification checklist (request paths, asset URLs, base path)

## Content-type creation skills

Skills that scaffold the canonical content shapes the framework supports:

- [ ] Issue docs (folder-per-item, `settings.json`, `issue.md`, `subtasks/`, `notes/`, `agent-log/`)
- [ ] Tech docs (markdown under `data/<section>/` with `XX_` prefix and `settings.json`)
- [ ] Temp docs (short-lived; flagged with `draft: true` or similar)
- [ ] Todos (now superseded by the issues content type — point users at it)
- [ ] Blogs (`YYYY-MM-DD-<slug>.md` flat layout)
- [ ] Custom pages (YAML data + custom layout)
- [ ] Countdowns (custom layout)
- [ ] Home pages (custom layout)
- [ ] Docs for AI & Ralph-loop (issues with `agent-log/` populated by AI)
- [ ] Idea-dump docs (low-friction capture format)
