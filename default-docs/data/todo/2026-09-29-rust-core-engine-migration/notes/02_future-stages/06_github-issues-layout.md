---
title: "Later stage: GitHub issues layout"
---

A new built-in layout that **shows the issues of a linked GitHub repository** inside the site. The project names the repository by its URL in config. agentks signs in to GitHub **once per machine**, stores the credentials in `~/.agentks/`, and uses that access for every project the user links. This is a later stage, after phase 2.

# 03 References

- [Layouts](../01_initial_discussion/11_layouts.md) — built-in layouts are added on demand. This is one such demand.
- [The ~/.agentks home](../01_initial_discussion/07_agentks-home-and-build-cache.md) — where the credentials file would live.
- [Server, WebSockets and editing](../01_initial_discussion/09_server-websockets-and-editing.md) — the local server that would talk to GitHub.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): add a GitHub issues layout as a future stage.
- Decided (sidhantha, 2026-09-29): the project links its repository by URL.
- Decided (sidhantha, 2026-09-29): agentks authenticates at machine level, with credentials under `~/.agentks/` (working name `credentials.json`). Signing in opens a GitHub login in the browser and asks for access.

# 05 Notes & Analysis

## 01 What the user described

- A layout that just shows the issues of a linked GitHub repository.
- The tool is authenticated at the main (machine) level, something like `~/.agentks/credentials.json`.
- Signing in opens a GitHub login and asks for access. The token then gives access to the GitHub issues of the projects the user links.
- The project adds the repository URL.

## 02 How sign-in could work (claude, proposed)

- **GitHub's device flow**, the way the `gh` CLI signs in: `agentks auth login github` prints a short code and opens github.com in the browser; the user approves; agentks receives a token. No password ever touches agentks.
- **Ask for the least access.** Read-only access to issues. Private repositories need more, so ask for that only when a linked repository is private.
- **Store the token in the OS keychain where one exists**, and fall back to `~/.agentks/credentials.json` readable by the user only (file mode 600). `gh` does the same.
- **Option to reuse `gh`.** If the user already runs the GitHub CLI, agentks could use its token instead of a second login.

## 03 Config (claude, proposed)

In the project's `site.yaml`, something like:

```yaml
github:
  repo: "https://github.com/owner/repo"
```

The layout is then placed like any other section, with its own route and navbar entry.

## 04 The token must never reach the built site (claude)

The built site is static and public. A token embedded in it, or sent to the browser, would leak access to anyone who opens the page. So:

| Where the site runs | How issues are fetched |
|---|---|
| Local server (`agentks start`) | The Rust server calls GitHub with the stored token and passes the results to the page. The browser never sees the token |
| Static build, public repository | Either a snapshot fetched at build time and rendered as static pages (stale until the next build), or the browser calls GitHub's public API with no token (limited to 60 requests an hour per visitor) |
| Static build, private repository | A build-time snapshot only, and only if the site itself is private. Otherwise private issues would be published |

## 05 Questions for that stage

- Read-only, or also create and comment on GitHub issues from the site? Writing to GitHub publishes on the user's behalf, so it would need its own decision.
- Live data in the local server, a build-time snapshot, or both?
- One repository per project, or several?
- Does the layout reuse the tracker's issue UI (filters, statuses, labels), mapping GitHub's labels and open/closed states onto it, or stay a plain list?
- Keychain first, or the credentials file only?
