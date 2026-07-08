---
title: "GitHub URLs + branding sweep"
status: open
---

Once the new repo exists ([60](60_new-repo.md)): every URL and brand string
that points at `sidhanthapoddar99/documentation-template` moves to the new
repo — `plugin.json` `homepage`/`repository`, root README badges/links,
user-guide installation pages, dev-docs marketplace pages, `/docs-init`'s
printed clone command, and any `site.yaml`/footer links.

## Tasks

- [ ] Grep live surfaces for `documentation-template` GitHub URLs; replace with
      the new repo URL.
- [ ] `plugin.json` homepage/repository fields.
- [ ] README + docs branding strings (titles, descriptions) consistent with
      the agent-knowledge-system positioning (overlaps
      [20](20_project-and-docs-update.md) — coordinate, don't duplicate).
- [ ] **Update the scripts as well** — `start` / `start.ps1` / `start.cmd`
      (the update check's upstream remote assumptions, any echoed URLs or
      old-name strings), `/docs-init` and `/docs-add-section` command bodies,
      and CLI script strings under `skills/agent-ks-docs/scripts/` that name
      the repo.
- [ ] **npm-fallback replication warning in `start`** (behavioral, all three
      ports): when bun is NOT on PATH and the script is about to fall back to
      npm, print a **red warning** that npm gives every project its own full
      `node_modules` (~420 MB each — no cross-project dedup; bun hardlinks
      from a global cache so N projects cost ~one copy), recommend installing
      bun as the fix, and ask a Y/n confirmation before proceeding with the
      npm install. Non-interactive shells and `START_SKIP_UPDATE_CHECK=1`-style
      scripted runs must not hang — degrade to warning-only, no prompt.
      Consumer-facing background lives in user-guide
      `05_getting-started/07_storage-and-footprint.md`; keep the wording
      consistent with it.
