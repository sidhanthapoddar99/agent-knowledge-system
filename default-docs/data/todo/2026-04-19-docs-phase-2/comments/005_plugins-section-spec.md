---
author: claude
date: 2026-04-25
---

## Spec — add `25_plugins/` section to dev-docs (deferred)

When dev-docs catches up on phase-2, add a top-level section explaining how to author Claude Code plugins. Source material is already 80% in:

- `dynamic_data/data/todo/2025-06-25-claude-skills/notes/claude-code-extensions-reference.md` (conceptual reference)
- `dynamic_data/data/todo/2025-06-25-claude-skills/notes/plugin-build-guide.md` (recipe + empirical findings)

The dev-docs pages distill those notes into a navigable reader-friendly section.

### Proposed structure

```
dev-docs/25_plugins/                       (slots after 20_development/)
├── settings.json
├── 01_overview.md                ← what a plugin is, why it exists, ecosystem at a glance
├── 02_storage-and-scope.md       ← ~/.claude/plugins/cache/, boolean-per-scope model,
│                                    why multi-scope enables don't duplicate files, /plugin update
├── 03_installation.md            ← marketplace-add-then-install vs direct copy; user/project/local scope
├── 04_marketplaces.md            ← what a marketplace is, marketplace.json schema, hosting
└── 05_creating-plugins/          (deep-dive subfolder)
    ├── settings.json
    ├── 01_ecosystem-mental-model.md   ← model doesn't see 'plugins' — only their capabilities;
    │                                    the manifest is just bundling
    ├── 02_plugin-structure.md          ← folder shape, plugin.json fields, capability folders
    ├── 03_capabilities.md              ← skills · commands · agents · hooks · MCP — what each does,
    │                                    when to reach for which (covers allowed-tools frontmatter,
    │                                    description-field-as-trigger, progressive disclosure /
    │                                    context retention)
    ├── 04_bin-wrappers.md              ← THE bin/ pattern — auto-PATH augmentation, executable-script
    │                                    template, when bin beats slash commands, naming hygiene
    ├── 05_testing-locally.md           ← /plugin marketplace add ./path, install, /reload-plugins,
    │                                    the file:// gotcha, debug recipes
    └── 06_versioning-and-publishing.md ← version field, /plugin update flow, semver discipline,
                                          publishing to GitHub
```

### Open questions to resolve when writing

1. **'Tools, descriptions' coverage in 03** — confirm interpretation: \`allowed-tools\` frontmatter on commands + description field as primary trigger mechanism for skills/commands.
2. **'Two definition' coverage** — likely the dual-surface pattern (skill teaches the *why*, bin wrappers do the *what*). Could also mean skill's two-tier loading (description always loaded, body only on trigger). Resolve when writing 03 / 04.
3. **'Context retention'** — interpret as progressive disclosure: metadata (~100 words) always loaded, body loaded on trigger, references loaded only when cited. Goes in 03_capabilities.md.

### Relationship to other work

- Dogfood install of \`agent-ks@sids-plugin-marketplace\` is the canonical worked example to reference throughout.
- After \`2026-04-25-framework-as-npm-package\` lands, \`02_storage-and-scope.md\` may need a paragraph on how npm-installed framework engines interact with plugin caching (probably no interaction, but worth confirming).

Filed to track this for the next dev-docs sweep — don't write yet.
