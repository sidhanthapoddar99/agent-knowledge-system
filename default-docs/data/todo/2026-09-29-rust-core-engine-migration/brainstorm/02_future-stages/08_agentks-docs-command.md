---
title: "The agentks docs command"
---

`agentks docs` **opens the agentks documentation in the browser**, at `agentks.neuralabs.org/docs`. The docs are not bundled in the binary and not downloaded. They are one hosted site, and only the latest version is published.

Today the docs are on the machine because every install clones the framework, and the user guide sits in `default-docs/`. The skills link straight into it. After the migration there is no framework checkout on the machine, so the docs need a new home. The hosted site is that home.

# 03 References

- [Launch: order, hosting, retiring this repository](./10_launch-order-and-hosting.md) — the website, and when it goes live.
- [Phase 3: publishing](./07_phase-3-publishing.md) — `agentks build`, which builds `/docs`.
- [Single install](../01_initial-discussion/05_single-install-tool-engine-frontend.md) — why there is no framework checkout any more.
- [CLI rename and commands](../01_initial-discussion/08_cli-rename-and-commands.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): add an `agentks docs` command that shows the agentks documentation.
- Decided (sidhantha, 2026-09-29): the docs are not bundled with the binary.
- Decided (sidhantha, 2026-09-30): `agentks docs` opens `agentks.neuralabs.org/docs`. The docs are hosted, not downloaded, and only the latest version is published.
- Decided (sidhantha, 2026-09-30): until the new docs are fully migrated and usable, this repository's docs stay in use.
- Decided (claude, 2026-09-30): the command ships once the site is live (step 5 of the launch order). Before that it would open a page that does not exist. Recorded here; the user can move it.

# 05 Notes & Analysis

## 01 What the user described

- `agentks docs` opens the documentation. Before, the docs could be linked directly, so anyone wanting to learn agentks could open them.
- The docs are hosted at `agentks.neuralabs.org/docs`, built with the Rust engine. The rest of the domain is the agentks homepage.
- Only the latest docs are shipped. No older versions, to avoid that complication for now.

## 02 How it could work (claude, proposed)

- `agentks docs` opens the docs home. `agentks docs <page>` opens one page, such as `agentks docs issues`.
- **For agents**, the site publishes each page's raw markdown and an `llms.txt` index, so an agent can read a page without a browser ([launch](./10_launch-order-and-hosting.md)). The skills stay the agent's main manual and link to the hosted pages instead of the framework's `default-docs/`.
- **Offline**, the command prints the URL and says it could not be reached. It does not fail silently.
