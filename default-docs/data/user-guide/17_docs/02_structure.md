---
title: File Structure
description: File and folder naming conventions for documentation
sidebar_position: 2
---

# File & Folder Structure

All documentation files and folders must follow a specific naming convention to ensure proper ordering and URL generation.

## The `NN_` Prefix Rule

**Every file and folder MUST start with a numeric ordering prefix of 2 to 5 digits** — `NN_` through `NNNNN_` (e.g. `05_`, `010_`, `00100_`). Order is by **numeric value**, not string, so different widths coexist within one folder: `05_` (= 5), `010_` (= 10), and `110_` (= 110) all sort correctly. The prefix is stripped from the URL.

Treat the width as a tier, not a free choice:

| Width | When to use it |
|-------|----------------|
| `NN_` (2-digit) | **The convention** — use it almost always (`05_`, `10_`, `15_`). |
| `NNN_` (3-digit) | Only when there's a **special requirement** — a folder with many entries that needs the headroom, or grouping via the leading digit (see below). |
| `NNNN_` / `NNNNN_` (4–5 digit) | **Very rare** — only when explicitly required or a genuinely exceptional case demands it. |

> **Tip:** Leave gaps in numbering to make inserting new pages easier later. Choose your increment based on how many folders you expect — multiples of **5** (05, 10, 15...) for smaller sets, or **3** (03, 06, 09...) or even **2** (02, 04, 06...) for larger ones. This lets you slot new pages between existing ones without renaming everything. Because sort is by value, you can also widen a single page's prefix (`05_` → `055_`) to drop it between neighbours without touching its siblings.

> **Grouping (3+ digits):** the leading digit can annotate a group inside a flat folder — `110_`, `120_` read as group 1; `210_` as group 2. Handy when a folder has logical clusters but you don't want subfolders.

```
docs/
├── 05_getting-started/
│   ├── settings.json
│   ├── 03_overview.md
│   ├── 06_installation.md
│   └── 09_configuration.md
│
├── 10_guides/
│   ├── settings.json
│   ├── 03_basics.md
│   ├── 06_advanced.md
│   └── 09_troubleshooting.md
│
└── 15_api/
    ├── settings.json
    ├── 03_overview.md
    └── 06_endpoints.md
```

## Naming Rules

| Rule | Example | Description |
|------|---------|-------------|
| **Prefix required** | `01_overview.md` | Files must start with a 2–5 digit prefix (`01_` … `99999_`) |
| **Folders need prefix** | `01_getting-started/` | Subfolders also need prefix |
| **Root folders exempt** | `docs/` | Doc root folders (defined in `site.yaml`) don't need prefix |
| **Position = order** | `01_` before `02_` | Lower numbers appear first in sidebar |
| **Clean URLs** | `01_overview.md` → `/overview` | Prefix is stripped from URL |

## URL Generation

The prefix is automatically stripped when generating URLs:

| File Path | Generated URL |
|-----------|---------------|
| `docs/01_getting-started/01_overview.md` | `/docs/getting-started/overview` |
| `docs/02_guides/05_deployment.md` | `/docs/guides/deployment` |
| `docs/03_api/01_endpoints.md` | `/docs/api/endpoints` |

## Sidebar Ordering

Files and folders are sorted by the **numeric value** of their prefix (so widths can mix freely):

```
05_overview.md       → Position 5 (first)
010_installation.md  → Position 10
020_configuration.md → Position 20
110_advanced.md      → Position 110
99999_appendix.md    → Position 99999 (last)
```

## Build Errors

If you forget the prefix, the build will fail with an error:

```
[DOCS ERROR] Files missing required NN_ position prefix:
  - overview.md
  - installation.md

Docs files must be named with a 2–5 digit position prefix.
Examples:
  01_getting-started.md
  02_installation.md
```

## Special Files

Some files don't need the `NN_` prefix:

| File | Purpose |
|------|---------|
| `settings.json` | Folder configuration |
| `assets/` | Asset folder (excluded from indexing) |

## Best Practices

1. **Use descriptive names** - `01_getting-started.md` not `01_gs.md`
2. **Keep names lowercase** - Use hyphens for spaces: `02_api-reference.md`
3. **Leave number gaps** - Start with 01, 05, 10 to allow insertions
4. **Match folder and content** - Folder name should reflect its contents
