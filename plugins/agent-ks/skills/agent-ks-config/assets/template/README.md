# Documentation Project — starter template

The `agent-ks-config` skill copies this folder into a user's project when the
user runs `/agent-ks-config`. The copy is a working documentation site with five
top-level sections: **Home**, **Docs**, **Issues**, **Blog**, and **User Guide**.

## What the skill does with this template

1. Copies the contents of `template/` into the user's chosen target directory.
2. Asks the user for the site name, the description and the repo URL. Writes
   those answers over the placeholder values in `config/site.yaml`.
3. Leaves every other file as it is. The user changes them later.

## Layout once copied

`/agent-ks-config` copies every file in this template to the root the user chose, with `rsync`. It skips one file: **this README**. This file describes the template. It is not part of the site.

```
<user-project>/
├── .gitignore
├── config/
│   ├── site.yaml        # site name, paths, theme, page sections
│   ├── navbar.yaml
│   └── footer.yaml
├── data/
│   ├── README.md        # the folder map: one row per top-level data/ folder
│   ├── docs/            # the user's "Docs" section (NN_-prefixed)
│   ├── blog/            # YYYY-MM-DD-slug.md
│   ├── issues/          # folder-per-issue tracker (vocabulary in root settings.json)
│   └── pages/           # custom-page data (home.yaml, etc.)
├── assets/              # logos, images (served at /assets/)
└── themes/              # user-authored themes (framework themes auto-available
                          # via @root/default-docs/themes — see site.yaml theme_paths)
```

**The skill does not write `.env`.** That file lives inside the framework folder, at `<user-project>/agent-knowledge-system/.env`. That folder does not exist yet when the skill runs. The next-step instructions the skill prints tell the user to clone the framework, then run `echo "CONFIG_DIR=../config" > agent-knowledge-system/.env`. So `.env.example` in this template is a reference copy only. The step after the clone writes the real `.env`, with the consumer-mode value `CONFIG_DIR=../config`.

## Sections explained

| Section     | URL                | Source                                    |
|-------------|--------------------|-------------------------------------------|
| Home        | `/`                | `data/pages/home.yaml`                    |
| Docs        | `/docs`            | `data/docs/**`                            |
| Issues      | `/issues`          | `data/issues/**`                          |
| Blog        | `/blog`            | `data/blog/**`                            |
| User Guide  | `/user-guide`      | `@root/default-docs/data/user-guide/**`   |

The **User Guide** section points at the docs bundled with the framework, under
`default-docs/`. So the user sees the framework's own user guide beside their
content, with no setup.

## Customising

- **Site name, description, repo URL.** Edit `config/site.yaml`.
- **Logo and favicon.** Put your own files into `assets/`. Then update the paths
  under `logo:` in `site.yaml`.
- **Add a section.** Run `/agent-ks-config section <name>`. The User Guide also
  has a page on adding sections.
- **Custom theme.** Create a folder `themes/<name>/`. Put a `theme.yaml` in it.
  Most themes set `extends: "@theme/default"`. Add the CSS files that change.
  Then set `theme: "<name>"` in `site.yaml` to switch to it.
