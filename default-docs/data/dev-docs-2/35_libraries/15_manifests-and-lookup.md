---
title: "Manifests and element lookup"
description: "How the engine reads manifest.json, treats local libraries, finds an element by alias:element, and checks a project's libraries."
---

This page explains how the engine knows what a library offers and how it turns a name such as `icons:server` into a file on disk. The code is in `apps/agentks-engine/crates/library/src/manifest.rs`, `libraries.rs`, `local_lib.rs` and `elements.rs`.

## manifest.json

Every library describes itself in a `manifest.json` at its root, the folder its `dep.yaml` entry points at.

```json
{
  "name": "acme-design-kit",
  "version": "1.4.0",
  "description": "Device frames and product icons for Acme's docs",
  "engine": ">=1.0.0 <2.0.0",
  "elements": {
    "server": {
      "category": "icons",
      "file": "components/icons/server.svg",
      "description": "A rack server",
      "tags": ["icon", "infrastructure"]
    }
  }
}
```

| Field | Rule the engine checks |
|---|---|
| `name`, `description` | Non-empty strings. Artifacts never use `name`; they use the alias |
| `version` | An x.y.z version. One version for the whole library |
| `engine` | A version range. The running agentks must fall inside it |
| `elements` | An object from element name to entry. It may be empty |
| `elements.<name>.category` | One of the fifteen categories, matching the folder the file sits in |
| `elements.<name>.file` | A path relative to the manifest, under `components/<category>/`. It must exist and stay inside the library after following symlinks |
| `elements.<name>.description` | A non-empty string. It is what makes the element findable |
| `elements.<name>.tags` | Optional. A list of strings the engine only searches, never interprets |

`parse_manifest` reports every problem at once, each naming the library and the fix. Unknown keys are errors, because agentks owns this format and a typo such as `descripton` would otherwise hide an element from search. An element name matches `^[a-z][a-z0-9-]*$`, has no slashes, and is unique within its library.

Two checks run after parsing. `check_engine` fails when the manifest's `engine` range excludes the running version, and suggests `agentks install --update`, a narrower selector, or pinning the older engine with mise. `check_tag` warns when the version tag a pin came from disagrees with the manifest's `version`.

## The fixed structure

agentks defines no kinds of library, but every library keeps its elements in the same folders, `components/<category>/`, one folder per category.

| Categories | Element type |
|---|---|
| `icons`, `illustrations`, `backgrounds`, `frames`, `annotations` | SVG |
| `images` | WebP, AVIF, PNG or JPEG |
| `widgets` | HTML |
| `charts`, `layouts`, `slides`, `animations`, `transitions`, `styles` | JSON |
| `scripts` | JavaScript module |
| `fonts` | WOFF2 |

The engine owns two things about elements: how to show a file, which follows from its type, and each category's contract. The contracts live once, in Rust, and `agentks check libraries` applies them. A library's own CI calls that command instead of copying the rules. Image elements and HTML widgets are served over `/_lib/`. JSON components are read by the video compiler and never served.

## Local libraries

A local entry points at a folder in the project, such as the team's own artifacts. It is never pinned or stored. The engine reads it in place.

- **With a manifest**, a local library works exactly like a git library.
- **Without a manifest**, the folder keeps the same `components/<category>/` structure. Each file is one element: its category is its folder, and its name is its file name without the extension. A child folder inside a category folder is also an element; its entry is its `index.html`, and its other files are served beside it. Hidden files are ignored. A child whose name breaks the element-name rule, or a folder without `index.html`, is skipped with a warning. Two children that give the same name, such as `logo.svg` and `logo.png`, are an error.

## Finding an element

`Libraries` holds every loaded library of one project, by alias. `Libraries::load_with` loads git libraries from the store at their pins and local libraries in place. A git library whose pin is missing from the store is an error that names `agentks install`.

| Method | Returns |
|---|---|
| `resolve(&ElementRef)` | The element's `ElementFile`: its canonical path, and whether it is a folder element |
| `resolve_sibling(&ElementRef, file)` | A file beside a folder element's `index.html`. A single-file element has no siblings, and the file must stay inside the element's folder |
| `find(words)` | Elements that match the words, best first |
| `manifests()`, `elements(alias)`, `root(alias)`, `pin(alias)` | What `library list`, `library show` and the build read |

`ElementRef` is the parsed `alias:element`. Both halves must match the name rule. An unknown alias or element is `LibraryError::ElementUnknown`, which names `agentks library list` or `agentks library show <alias>`. Nothing ever renders a blank in place of a missing element.

## Checking a project

`agentks check libraries` reads files only. It reports a missing or malformed manifest, a missing field, a file that does not exist or leaves the library, an `engine` range that excludes the running version, a category that does not match the file's folder, an element that breaks its category's contract, and every `alias:element` a page names that does not resolve, with the page and line.

## Related

- [Resolution and the sync](./10_resolution-and-sync.md): where manifests are loaded during a sync.
- [Search and the catalog](./18_search-and-catalog.md): how `library find` ranks elements, and where quick-install libraries come from.
- [The /_lib/ route and the sandbox](./20_lib-route-and-sandbox.md): how a resolved element reaches the browser.
