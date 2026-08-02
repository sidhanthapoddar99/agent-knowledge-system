---
title: "Framework — a section registry, so eleven files stop agreeing by hand"
status: open
---

# Overview

Adding one top-level issue section requires editing **eleven** framework files
that each hard-code the same string. Replace that with one registry the loader,
routes and layouts all read.

**Done when** adding a section is a single registry entry plus its reader, and
removing one leaves no orphan reference — proven by adding a throwaway section in
a test and deleting it again.

# References

- The eleven sites, counted: [Code the plans section](./010_code-the-plans-section.md)
  → *The framework surface*
- Why it is sequenced after plans, not merged into it:
  [the plans spec](../../notes/50_plans-section-spec.md) → *The section registry*

# Todo list

- [ ] List the eleven sites and what each needs from a section (reader, route,
      prefix, sidebar label, icon, panel key)
- [ ] Design the registry entry — the minimum a section must declare
- [ ] Migrate the existing sections one at a time, building green after each
- [ ] Prove it: add a throwaway section via one entry, render it, delete it,
      confirm no orphan reference remains
- [ ] `./start build` clean, demo fixture renders every section

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why this is after the plans section, not part of it

Doing both at once means that when a section fails to render you cannot tell
which change broke it — the new section, or the new mechanism carrying it. Land
plans the existing way, then refactor the mechanism with a known-good set of
sections to migrate.

**This is sequencing, not deferral.** The standing tie-breaker favours the
structural fix; it does not favour two structural changes entangled in one diff.

## The trigger, so this does not sit open forever

Do it when either happens: a **twelfth** section is proposed, or a bug is traced
to a site someone missed. Both are evidence the by-hand approach has stopped
paying.
