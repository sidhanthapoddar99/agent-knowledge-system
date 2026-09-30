---
title: "Finish the move"
description: "After agentks migrate: replace custom layouts, check the result, commit, remove the 0.x framework folder, and swap the AI plugin."
---

`agentks migrate` converts the content and the config. This page covers what is left after it: sections that had custom layouts, a check of the result, and removing what agent-ks 0.x left behind.

## Replace custom layouts

agentks has no custom layouts. Each section names one of the built-in layouts, and you change the look with CSS. The migration lists every section that used a layout of your own, and it never deletes your layout files. For each one, choose what replaces it:

| Your custom layout was for | Use instead |
|---|---|
| Branding: colours, fonts, spacing, a different header | The closest built-in layout of the same type, plus CSS in a theme. `agentks theme css` prints the compiled CSS and the class hooks you can target, and `agentks theme eject` copies a theme into `config/themes/` for you to edit. See [Themes and layouts](../45_themes-and-layouts/01_overview.md) |
| A one-off page with its own design | An HTML artifact page: a self-contained `.html` page inside a docs section. See [Writing content](../10_writing-content/01_overview.md) |

The built-in layouts are listed in [Sections](../35_configuration/10_sections.md). Once no section needs your layout folders, delete them yourself.

## Check paths that use @root

If `paths:` in your `site.yaml` uses `@root`, read each such value again. In 0.x, `@root` meant the framework folder. In agentks, it means the project root: the folder that holds `config/`. A section whose data lived inside the framework folder, such as the framework's bundled docs, has nothing to point at once that folder is gone. Copy what you need into your project first, or remove the section.

## Check the result

Run the checks from the project root:

```sh
agentks check config
agentks check section data/guide      # once for each docs section
agentks check blog                    # if the project has a blog
agentks check issues                  # if the project has a tracker
agentks check link-form
```

Then start the site and look through it:

```sh
agentks start
```

Pages, addresses, heading links and the tracker should look as they did under 0.x. [Run the local server](../05_getting-started/20_local-server.md) covers the start-up errors you might meet.

## Review and commit

The migration changes files in place and commits nothing. Read the changes, then commit them:

```sh
git diff
git add -A
git commit -m "Migrate to agentks 1.0"
```

## Remove the 0.x framework folder

The migration leaves the framework folder, `agent-knowledge-system/` in a typical project, where it is and names it in its report. Once the site looks right under agentks, delete it. It holds the old engine, its `node_modules`, the old `.env` and the `start` wrappers, and agentks uses none of them.

If the project used a git submodule for the framework folder, remove the submodule with git instead of deleting the folder by hand.

## Swap the AI plugin

The `agent-ks` plugin teaches an agent the 0.x commands. Replace it with the `agentks` plugin, which teaches the new ones. In Claude Code, uninstall `agent-ks` from the `/plugin` menu, then install the new plugin from the Neuralabs marketplace:

```
/plugin marketplace add NeuraLabsHQ/neuralabs-plugin-marketplace
/plugin install agentks@neuralabs-plugin-marketplace
```

[Use agentks with AI agents](../05_getting-started/25_using-with-ai.md) explains the plugin and its skills.

## Remove agent-ks from the machine

When no project needs agent-ks 0.x any more, remove it:

- **The binary.** The 0.x installer put `agent-ks` in `~/.local/bin` unless you chose another folder. On Windows it used `%LOCALAPPDATA%\Programs\agent-ks`.
- **The shell set-up.** The 0.x installer added a block to your shell's startup file, such as `~/.zshrc` or `~/.bashrc`, between the lines `# >>> agent-ks >>>` and `# <<< agent-ks <<<`. Delete that block.

Keep both while any project still runs on 0.x.
