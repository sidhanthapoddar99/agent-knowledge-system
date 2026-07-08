---
title: "GitHub URLs + branding sweep"
status: done
---

Once the new repo exists ([60](60_new-repo.md)): every URL and brand string
that points at `sidhanthapoddar99/documentation-template` moves to the new
repo — `plugin.json` `homepage`/`repository`, root README badges/links,
user-guide installation pages, dev-docs marketplace pages, `/agent-ks-init`'s
printed clone command, and any `site.yaml`/footer links.

## Tasks

- [x] Grep live surfaces for `documentation-template` GitHub URLs; replaced
      with the new repo URL (2026-07-08) — README (banner now points old
      checkouts at `git remote set-url`), navbar.yaml GitHub link, user-guide
      installation / init-and-template / storage pages (consumer clone
      commands also gained `--depth 1` per [90](90_install-script-links.md)),
      settings-layout reference, plugin README, `/agent-ks-init` printed clone
      command. Submodule example URL included.
- [x] `plugin.json` homepage/repository fields → new repo (cache re-mirrored,
      identity pin kept).
- [x] README + docs branding strings, **plus the folder-name literal sweep**:
      the clone directory is now `agent-knowledge-system/`, so every
      instructional `cd documentation-template` / layout diagram / mode
      description moved to the new name. Functional pieces made
      back-compatible: `_env.mjs` consumer-convention probe checks
      `agent-knowledge-system/` first, then legacy `documentation-template/`
      spots; `/agent-ks-init` pre-flight tests both folder names. The
      `agent-ks-issues` skill description now says "agent-knowledge-system
      issue tracker".
- [x] **Update the scripts as well** — `start` / `start.ps1` / `start.cmd`
      carry no repo-name strings (verified by grep; the update check works
      off the git remote, not a hardcoded URL). CLI scripts: `_env.mjs` was
      the only one naming the folder — updated with legacy fallback.
- [x] **npm-fallback replication warning in `start`** (done 2026-07-08 in
      `start` + `start.ps1`; `start.cmd` just launches the ps1 port). Fires
      only when npm is about to actually *install* (no nagging on every dev
      launch once node_modules exists); interactive runs get the Y/n confirm
      (decline aborts with the bun pointer), non-interactive stdin or
      `START_SKIP_UPDATE_CHECK=1` degrade to warning-only. Sandbox-tested both
      paths; bun runs stay silent. installation.md + storage page cross-link
      the behavior. Original spec: when bun is NOT on PATH and the script is about to fall back to
      npm, print a **red warning** that npm gives every project its own full
      `node_modules` (~420 MB each — no cross-project dedup; bun hardlinks
      from a global cache so N projects cost ~one copy), recommend installing
      bun as the fix, and ask a Y/n confirmation before proceeding with the
      npm install. Non-interactive shells and `START_SKIP_UPDATE_CHECK=1`-style
      scripted runs must not hang — degrade to warning-only, no prompt.
      Consumer-facing background lives in user-guide
      `05_getting-started/07_storage-and-footprint.md`; keep the wording
      consistent with it.
