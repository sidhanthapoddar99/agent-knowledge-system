# Documentation Project — starter template

This is the scaffold copied into a user's project by `init`. It boots a working
documentation site with five top-level sections: **Home**, **Docs**, **Issues**,
**Blog**, and **User Guide**.

## What `init` does with this template

1. Copies the contents of `template/` into the user's chosen target directory.
2. Substitutes placeholder values (site name, description, repo URL) into
   `config/site.yaml` based on prompts.
3. Leaves the rest as-is for the user to customise.

## Layout once copied

`/docs-init` rsyncs everything in this template to the user's chosen root **except the template's own README.md** (this file — it's documentation about the template itself, not part of the scaffold).

```
<user-project>/
├── .gitignore
├── config/
│   ├── site.yaml        # site name, paths, theme, page sections
│   ├── navbar.yaml
│   └── footer.yaml
├── data/
│   ├── docs/            # the user's "Docs" section (NN_-prefixed)
│   ├── blog/            # YYYY-MM-DD-slug.md
│   ├── issues/          # folder-per-issue tracker (vocabulary in root settings.json)
│   └── pages/           # custom-page data (home.yaml, etc.)
├── assets/              # logos, images (served at /assets/)
└── themes/              # user-authored themes (framework themes auto-available
                          # via @root/default-docs/themes — see site.yaml theme_paths)
```

**`.env` is NOT written by init** — it lives inside the framework folder (`<user-project>/documentation-template/.env`) which doesn't exist yet at this point. The init flow's printed next-step instructions tell the user to clone the framework next, then `echo "CONFIG_DIR=../config" > documentation-template/.env`. That's why `.env.example` in this template is for reference only — the post-clone step writes the *real* `.env` directly, with the consumer-mode value (`CONFIG_DIR=../config`).

## Sections explained

| Section     | URL                | Source                                    |
|-------------|--------------------|-------------------------------------------|
| Home        | `/`                | `data/pages/home.yaml`                    |
| Docs        | `/docs`            | `data/docs/**`                            |
| Issues      | `/issues`          | `data/issues/**`                          |
| Blog        | `/blog`            | `data/blog/**`                            |
| User Guide  | `/user-guide`      | `@root/default-docs/data/user-guide/**`   |

The **User Guide** section points at the framework's bundled docs (shipped under
`default-docs/`), so users see the framework's own user-guide alongside their
content with zero setup.

## Customising

- **Site name / description / repo URL** — edit `config/site.yaml`.
- **Branding (logo, favicon)** — drop replacements into `assets/`, then update
  paths in `site.yaml → logo:`.
- **Add a section** — see the User Guide page on adding sections (or run
  `/docs-add-section`).
- **Custom theme** — create a folder under `themes/<name>/` with a `theme.yaml`
  (typically `extends: "@theme/default"`) and any CSS overrides; switch via
  `theme: "<name>"` in `site.yaml`.
