---
title: "Assets and images"
description: "Keep every file a page uses in an assets/ folder beside it, link to it with a relative path, and shrink images before you commit them."
---

# Assets and images

Every file a page uses, such as an image, a PDF, a data file or a diagram, lives in an `assets/` folder beside that page. The file then moves with the page, the link to it is true on disk, and anyone reading the folder can see what belongs to what. There is no exception to this rule.

## Where assets go

Put an `assets/` folder next to the pages that use it, at any depth:

```
data/guide/
├── 05_setup/
│   ├── settings.json
│   ├── 10_install.md          uses ./assets/installer.png
│   └── assets/
│       └── installer.png
└── 10_concepts/
    ├── settings.json
    ├── 05_links.md            uses ./assets/api-v1.pdf
    └── assets/
        └── api-v1.pdf
```

| Fact | Detail |
|---|---|
| `assets/` needs no prefix | It is the one folder in a docs section without an `NN_` prefix |
| It never shows in the sidebar | Nothing under `assets/` is a page, not even a `.md` or a diagram file |
| It can have subfolders | `assets/screens/`, `assets/data/`, as you like |
| Each folder can have its own | Share one only between pages in the same folder |

A blog is one flat folder of posts, so a blog keeps its assets in `assets/<post file name>/`. The [blog section](../20_blog/01_overview.md) shows the layout. An issue keeps its own assets inside its folder; see the [issue tracker](../30_issue-tracker/01_overview.md).

## Linking to an asset

Use markdown syntax with a relative path, exactly as for a page:

```markdown
![The installer's first screen](./assets/installer.png)

Download [the API specification](./assets/api-v1.pdf).
```

agentks serves the file and writes its address into the page. An image shows in place. A link to any other file opens or downloads it.

Use the markdown forms, not HTML tags. agentks resolves the paths in markdown links and images. HTML you write by hand passes through unchanged, so a relative path inside an `<img>` tag is not turned into a working address.

Give every image alt text that says what it shows. The alt text is what a screen reader reads aloud, and what an AI agent reads instead of the picture.

## The project's own assets are not a page's

A project may also have a folder of files that the whole site uses, such as the logo and the favicon. Those files are named from `config/site.yaml`, never from a page. A page never links into that folder, and never writes a link that starts with `/assets/`. If a page needs the logo, copy it into the page's own `assets/` folder. The [configuration section](../35_configuration/01_overview.md) covers the logo and favicon.

## Shrink images before you commit them

Screenshots straight from a screen are often large. Large images slow the page and grow the repository forever. `agentks img` resizes and re-encodes images in place. It uses ImageMagick, so the `magick` command must be installed.

```bash
# Convert to WebP, cap the long side at 1600 px, and fix the links that name the old file
agentks img data/guide/05_setup/assets/installer.png --format webp --max-dim 1600 --rewrite-links

# A screenshot from a high-density screen: halve it first
agentks img data/guide/05_setup/assets/installer.png --dpr 2

# Keep lowering the quality until the file fits
agentks img data/guide/05_setup/assets/installer.png --target-size 100KB

# See the plan without changing anything
agentks img data/guide/05_setup/assets --recursive --dry-run
```

A good target for a figure is about 60 to 100 KB. Some useful options:

| Option | Does |
|---|---|
| `--format webp` | Converts the file. Also `avif`, `png` and `jpg` |
| `--max-dim 1600` | Caps the longer side, in pixels |
| `--dpr 2` | Undoes a high-density capture by that ratio |
| `--target-size 100KB` | Lowers the quality step by step until the file fits |
| `--lossless` | Keeps every pixel, for art people zoom into |
| `--rewrite-links` | Changes image links in markdown when the extension changes |
| `--dry-run` | Shows what would happen and changes nothing |

By default `agentks img` overwrites the file and keeps the original in a temporary folder. Use `--backup <folder>` to keep the originals somewhere you choose, or `--out <folder>` to write the results elsewhere. `agentks help img` lists every option.

## When an asset is missing

A link or an image whose file does not exist is a content error, reported with the page and the line. The image or link is marked as broken on the page. `agentks check link-form` finds them all:

```bash
agentks check link-form data/guide
```
