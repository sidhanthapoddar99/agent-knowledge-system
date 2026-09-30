---
title: "The theme compiler"
description: "How agentks-render turns the theme named in site.yaml into one checked stylesheet per project, with cascade layers and the theme contract."
---

The theme compiler, in `agentks-render`'s `theme` module, turns the theme a project names into one stylesheet. It follows the theme's `extends` chain, merges the files, checks the theme contract and orders everything with CSS cascade layers. The server serves the result, and `agentks theme css` prints the same bytes from the same function, so an agent always sees the CSS the installed version uses.

## Input and output

```rust
pub fn compile_theme(config: &ProjectConfig, files: &dyn FileSource)
    -> Result<CompiledTheme, RenderError>;
```

| `CompiledTheme` field | Holds |
|---|---|
| `css` | The whole stylesheet |
| `hash` | Its hash. The server serves it at `/theme.<hash>.css`, so the browser can cache it for good |
| `supports_dark_mode` | Whether the theme defines a dark mode; sent to the client in the manifest |
| `inputs` | The hash of every input file, in merge order: part of the theme's cache key |

`compile_theme_named` does the same for a theme name and a list of theme folders, without a whole config.

## The built-in theme

The built-in theme lives in `apps/agentks-engine/themes/default/`, outside any crate. The render crate embeds it in the binary with `include_dir`. Its `theme.yaml` holds four things:

| Key | Holds |
|---|---|
| `files` | The CSS files, in order. The compiler reads exactly these |
| `layers` | The cascade layer of each file. Only the built-in theme has this key |
| `required_variables` | The theme contract: every CSS variable a theme must define |
| `supports_dark_mode` | `true` |

`apps/agentks-engine/themes/examples/` holds two user themes that serve as compiler test inputs. `apps/agentks-engine/themes/check-contract.ts` is a quick check of the built-in files, and `ctl test` runs it.

## The steps

1. **Resolve the theme.** `theme:` in `site.yaml` names `default` or a theme folder found through `theme_paths`. `default` is reserved: a user folder named `default` is an error, because `@theme/default` must always mean the built-in theme.
2. **Follow `extends`.** Each theme may name a parent as `@theme/<name>`. The chain ends at `default`. A cycle, an unknown parent, a missing `theme.yaml` or a listed file that does not exist is a fatal error that names the theme.
3. **Read only the listed files**, in `files` order. The compiler does not follow `@import`, so the `files` list is the only source of CSS.
4. **Merge by `override_mode`.** Each theme says how it meets its parent.
5. **Check the contract.** Every name in `required_variables` must be declared by the merged files. Comments are stripped first, so a name in a comment does not count.
6. **Apply the cascade layers**, then append the code-highlighting colours.
7. **Hash the result**, which names its URL.

| `override_mode` | The merged file list |
|---|---|
| `merge`, the default | The parent's files, then the child's |
| `override` | The parent's files, skipping any whose name the child also lists, then the child's |
| `replace` | The child's files only |

## Cascade layers

The stylesheet starts by declaring the layer order, lowest first:

```css
@layer reset, theme, elements, components, user;
```

- Each built-in file is wrapped in the layer its `layers` entry gives: `reset.css` in `reset`; the colour, font, element and breakpoint files in `theme`; the markdown, navbar, footer, docs and blog files in `elements`.
- Every file of a user theme is wrapped in `user`.
- The highlight colours from `highlight_css` go in `elements`.

So a user rule beats a built-in rule of the same specificity without `!important`. Layers reverse `!important`: an `!important` declaration in a lower layer beats one in a higher layer.

## The theme contract

`required_variables` names exactly the variables the shipped layouts read. A variable is on the list if and only if a layout reads it. That matters most for a `replace` theme, which drops its parent and keeps only what it defines: anything the layouts need must be on the list, or it silently disappears.

A theme that leaves a contract variable undefined is a `theme-variable-missing` error naming the variable and the theme. It is never a silent fallback. Why the contract has the variables it has, and how layouts must consume them, belongs to the [frontend section](../25_frontend/01_overview.md).

## Errors

Every theme problem is fatal at load: the server does not start until it is fixed.

| Kind | When |
|---|---|
| `theme-not-found` | The named theme is neither built in nor found through `theme_paths` |
| `theme-invalid` | A `theme.yaml` or a listed CSS file is missing or does not parse |
| `theme-extends-cycle` | An `extends` chain loops back on itself |
| `theme-variable-missing` | A contract variable is undefined after the merge |

## Caching and live changes

The compiled CSS is cached by the theme key: the engine build, the CSS format version, the theme settings and the hash of every input file. A change to `theme` or `theme_paths` in `site.yaml`, or to any file in a theme folder, carries the `theme` tag. It recompiles the CSS and changes its URL in the manifest, and no page body is re-rendered. See [keys and invalidation](../20_caching/05_keys-and-invalidation.md).

## Related

- [Render: the markdown pipeline](./35_render.md): the markup hooks themes style.
- [Config](./20_config.md): `theme`, `theme_paths` and the `theme` tag.
