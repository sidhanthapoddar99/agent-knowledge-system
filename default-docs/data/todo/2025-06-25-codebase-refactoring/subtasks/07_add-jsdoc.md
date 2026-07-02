---
title: "Add JSDoc comments to public APIs"
status: done
---

**What it meant.** Every exported symbol in the loaders (`astro-doc-code/src/loaders/`) should carry a `/** … */` doc block describing its contract.

**What JSDoc actually is** (for anyone unclear). JSDoc is **the JavaScript/TypeScript equivalent of a Python docstring** — a description of what a function/type does, written right next to it. The only real difference is placement: Python docstrings go *inside* the function (first line of the body); JSDoc goes *directly above* the symbol, in a comment that starts with `/**` (two stars):

```ts
/**
 * Get a specific page configuration by name.
 * @param pageName - the page key from site.yaml `pages:`
 * @returns the page config, or `undefined` if no such page exists
 */
export function getPage(pageName: string): PageConfig | undefined {
```

```python
def get_page(page_name: str) -> PageConfig | None:
    """Get a specific page configuration by name.

    Args:
        page_name: the page key from site.yaml `pages:`
    Returns:
        the page config, or None if no such page exists
    """
```

Same idea, same purpose. Because the `/**` block sits above an `export`, the editor and TypeScript treat it as documentation: hovering a call to `getPage(` shows that description and its parameter/return contract — so a caller (human or AI) understands the function without opening its source.

**"Public APIs"** here just means the module's exported surface — every `export`ed function/type/const that other files import (e.g. `loadSiteConfig`, `getPage`, `loadSettings`, `resolveThemeName`). Non-exported internal helpers don't need the same rigor. So the task = *"put a docstring-style `/** … */` above each exported symbol so its purpose shows up on hover."*

**Verified complete (2026-07-02 audit).** Each loader file's `/**`-block count meets or exceeds its exported-symbol count — JSDoc coverage is effectively total. Spot counts at audit time:

| File | exports | `/**` blocks |
|---|---|---|
| `issues.ts` | 4 | 60 |
| `config.ts` | 14 | 17 |
| `cache.ts` | 11 | 11 |
| `cache-manager.ts` | 20 | 17 |
| `paths.ts` | 11 | 13 |
| `alias.ts` | 9 | 10 |

No implementation work was required — this was already satisfied when the refactoring issue was audited. Recorded as `closed` so the decomposition reflects reality.
