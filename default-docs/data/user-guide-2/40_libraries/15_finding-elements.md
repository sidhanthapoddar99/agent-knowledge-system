---
title: "Finding elements"
---

Before you draw an icon or write a widget, search the libraries you already have. agentks reads each library's manifest, so you can find an element by what it is, not by its file name. You can also search the catalog for libraries you do not have yet.

## Search your libraries

`agentks library find` searches every library in your project's `dep.yaml`:

```bash
agentks library find database
agentks library find load balancer --json
```

Each result is an element named as `alias:element`, with its description and tags. That name is what you use in a video artifact, and its two halves make up the `/_lib/<alias>/<element>` address an artifact page loads.

How matching works:

- Every word you give must match the element's name, one of its tags, or its description.
- A match in the name ranks first, then a match in a tag, then a match in the description.
- Case does not matter.

The manifest's descriptions and tags are what make an element findable. A local library without a manifest has neither, so `library find` can match only its element names.

## Look at one library

```bash
agentks library list            # every library: alias, source, pin, version, element count
agentks library show default    # one library's manifest and every element
```

`library show` prints the library's name, version, description and the agentks versions it supports, then every element with its description and tags. A large library, such as the default one with its full icon set, prints a long list. Use `library find` to narrow it, or `--json` to process it.

## Search the catalog

The **catalog** lists the libraries and templates that the agentks team offers for quick install.

```bash
agentks library search icons
agentks library search docs site --json
```

Each result is a library or a template, with its catalog name and description. Add a library by its catalog name:

```bash
agentks library add agentks-default --as default
```

`library search` reads the catalog over the network. Offline, it says so. Nothing else in agentks needs the catalog: your installed libraries keep working without it.

## Browse in the terminal

Run `agentks library` with no command in a terminal to open an interactive browser. It shows the catalog, your project's libraries, and what the machine has already cached, and it adds or installs a library with one key.

The browser is a convenience for people. Every action in it has a plain command, and an AI agent uses those commands instead.

## The catalog file

The catalog is `library.json`, at the root of the `NeuraLabsHQ/agent-knowledge-system-library` repository. agentks knows its address, and the file never moves.

```json
{
  "libraries": {
    "agentks-default": {
      "description": "The default library: curated icons for technical docs, the full Lucide icon set, device views and small data widgets",
      "git": "https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git",
      "path": ".",
      "latest": "1.0.0",
      "tags": ["icons", "lucide", "widgets", "device-views"]
    }
  },
  "templates": {
    "agentks-default": {
      "description": "A docs site with a guide, a blog and an issue tracker",
      "git": "https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git",
      "path": "templates/agentks-default"
    }
  }
}
```

| Field | Meaning |
|---|---|
| the key | The catalog name you pass to `library add` or to `agentks init --template` |
| `description` | What it is |
| `git` · `path` | Where it lives: the repository and the folder inside it |
| `latest` | The newest version, for display only. Installing always reads the versions from git |
| `tags` | Search words |

agentks reads the catalog but never trusts it for content. Adding a catalog library writes an ordinary `dep.yaml` entry, which then resolves from git like any other. A library that is not in the catalog works exactly the same way: add it by its `owner/repo` or git URL.

## Tips for AI agents

- Run `agentks library find <words> --json` before creating an icon, a frame or a widget. Reuse beats a new drawing.
- Read an element's description before you use it. The description says what the element is for and which inputs it takes.
- Name elements only in artifact pages and video artifacts, never in markdown: see [using elements in artifacts](./20_using-elements.md).
