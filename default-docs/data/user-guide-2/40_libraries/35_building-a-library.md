---
title: "Building a library"
---

Build a library when a team reuses the same icons, frames or widgets across projects. You get one place to maintain them, one version for all of them, and a search that agents use before they draw something new. This page covers the folder layout, the manifest and a library without a manifest. [Testing a library](./37_testing-a-library.md) shows how to try it in a project, and [releasing a library](./40_releasing-a-library.md) covers versions and hosting.

## The layout

Every library, git or local, has the same shape: a `manifest.json` at its root and its elements in `components/<category>/`, one folder per category.

```text
acme-kit/
  manifest.json
  components/
    icons/
      rocket.svg
    widgets/
      price-table.html
```

The fifteen categories are fixed and the same in every library:

| Category | Holds | File type | Size cap |
|---|---|---|---|
| `icons` | Single-colour glyphs | SVG | 2 KB |
| `illustrations` | Multi-part artwork: people, devices, scenes | SVG | 30 KB |
| `images` | Photos, screenshots, textures | WebP, AVIF, PNG, JPEG | 250 KB, 1920 px on the long side |
| `backgrounds` | Slide backgrounds: gradients, dots, grids | SVG | 8 KB |
| `frames` | Anything with a screen slot: device and window chrome, cards, callouts | SVG | 12 KB |
| `annotations` | Marks drawn around, under or over an item: circles, underlines, arrows | SVG | 4 KB |
| `widgets` | Interactive HTML for artifact pages | HTML | 15 KB |
| `fonts` | Typefaces | WOFF2 | 80 KB |
| `charts`, `layouts`, `slides`, `animations`, `transitions`, `styles` | Data for video artifacts | JSON | set by the video format |
| `scripts` | Code components, not used yet | JavaScript module | 20 KB |

Other folders may sit beside `components/`, such as your own tooling or a preview page. They are not elements.

## The manifest

`manifest.json` describes the library and lists every element.

```json
{
  "name": "acme-kit",
  "version": "1.0.0",
  "description": "Acme's product icons and a pricing widget for our docs",
  "engine": ">=1.0.0 <2.0.0",
  "elements": {
    "rocket": {
      "category": "icons",
      "file": "components/icons/rocket.svg",
      "description": "A rocket. Use for a launch, a release or a deploy.",
      "tags": ["icon", "launch", "release", "deploy"]
    },
    "price-table": {
      "category": "widgets",
      "file": "components/widgets/price-table.html",
      "description": "A three-column pricing table. Pass ?plans= as a JSON array of { name, price, features }.",
      "tags": ["widget", "pricing", "plans", "table"]
    }
  }
}
```

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | The library's name, for people and the catalog. Pages use the alias instead |
| `version` | yes | `x.y.z`, one version for the whole library. Changing any element is a new version |
| `description` | yes | One sentence on what the library is for |
| `engine` | yes | The agentks versions the library works with, as a range. agentks refuses the library outside it |
| `elements` | yes | A map from element name to its entry. It may be empty |
| `elements.<name>.category` | yes | One of the fifteen categories. It must match the file's folder |
| `elements.<name>.file` | yes | The file, relative to the manifest: `components/<category>/<name>.<ext>`. It must stay inside the library |
| `elements.<name>.description` | yes | What the element is and when to use it. This is what makes it findable |
| `elements.<name>.tags` | no | Search words. agentks only searches them; it never reads meaning into them |

agentks treats an unknown key in the manifest as an error, so a typo such as `descripton` cannot quietly hide an element from search.

## Element rules

- **Names** use lower-case letters, digits and hyphens, and start with a letter. No slashes.
- **Names are unique across the whole library**, not per category, so the address `/_lib/<alias>/<name>` never needs the category. Where two categories want the same word, give one a suffix: the icon `phone` and the frame `phone-frame`.
- **One file is one element**, and it is self-contained. An HTML element inlines its CSS and scripts, because agentks serves it by name, not by path. [HTML elements](./25_html-elements.md) lists the rules for HTML.
- **Icons** use `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, a stroke width of 2 and round caps and joins. `currentColor` is their only colour. They carry no ids, no text, no scripts and no references to other files.
- **Write descriptions for search.** Say what the element is and when to use it. Put synonyms in the tags.

## A local library without a manifest

A local library, one that `dep.yaml` names with `path:`, may skip `manifest.json`. It still uses the `components/<category>/` layout, and agentks names each file for you:

- A file is one element. Its category is its folder, and its name is its file name without the extension. `components/widgets/checkout-flow.html` in the library `team` becomes `team:checkout-flow`.
- A folder inside a category folder is one element too. Its entry is its `index.html`, and agentks serves its other files beside it, at `/_lib/<alias>/<element>/<file>`.
- Two files that share a name without their extensions, such as `logo.svg` and `logo.png`, are an error.
- A file whose name breaks the name rule, and a folder without `index.html`, are skipped with a warning.

Without a manifest there are no descriptions or tags, so `agentks library find` matches only names. Add a manifest when you want your elements to be findable.
