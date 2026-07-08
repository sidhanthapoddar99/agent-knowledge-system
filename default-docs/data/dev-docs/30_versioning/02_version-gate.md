---
title: The Version Gate
description: Where the gate runs, both failure directions, and the exact error messages
sidebar_position: 2
---

# The Version Gate

The gate is `assertContentVersionSupported()` in
`src/loaders/engine-version.ts`, called from `loadSiteConfig()`
(`src/loaders/config.ts`) **before any resolution work** — the same hard-throw
path as the `theme`-required rule.

## It prevents startup — it doesn't just error

`loadSiteConfig()` runs from the dev-toolbar integration's config-setup hook
(`src/dev-tools/integration.ts`), which executes **before the dev server binds
a port**. A tree that fails the gate:

- `dev` — the process exits (code 1) without ever listening; no `localhost`
  URL is printed.
- `build` — the build aborts before rendering a single page.
- `preview` — same path, same stop.

Verified empirically: with `engine_version` removed from `site.yaml`,
`bun run dev` exits immediately naming `0.0.0`, with zero server-listening
lines in the log.

## The check

```
declared  = site.yaml engine_version  (missing → "0.0.0")

declared < MIN_CONTENT_VERSION  → throw (content too old — migrate)
declared > ENGINE_VERSION       → throw (content too new — upgrade engine)
otherwise                       → proceed silently
```

Malformed declarations (anything not `N.N.N`) also throw, with a hint showing
the correct form. Only major.minor are compared — patch never gates.

## The messages, verbatim

**Content too old:**

```
This content targets engine 0.0.5, but this engine is 0.1.2 and supports content
0.1.2 or newer. The content must be migrated from 0.0.5 to 0.1.2 — ask your AI to
do it: the migration scripts live in migration/ at the repo root, named by the
version they bring content to. Run each script between 0.0.5 and 0.1.2 in version
order (detect pass, then --dry-run, then migrate), verify with agent-ks check,
then set engine_version: "0.1.2" in site.yaml.
```

**Content too new:**

```
This content targets engine 0.2.0, but this engine is only 0.1.2. Update the
framework to 0.2.0 or newer (./start offers the update when the upstream is
ahead), or check upgrade options for your install.
```

> [!IMPORTANT]
> The too-old message is deliberately a complete runbook — its primary reader
> is an AI assistant. If you change the gate, keep the message self-sufficient:
> both versions, the script location, the chain rule, the verification step,
> and the final bump. Update the user-guide page and this page verbatim when
> the wording changes — these docs quote, never paraphrase.

## No warnings-only mode

There is deliberately no "warn and continue" escape hatch. A warning would be
scrolled past; the stop is the feature. The recovery cost is minutes (the
detect passes are read-only), while the cost of running unmigrated content is
silent corruption discovered much later.
