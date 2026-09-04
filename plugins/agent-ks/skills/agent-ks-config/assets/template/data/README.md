# data/

This file lists every content folder in this project, one row each. It is the
map. Read it first when you need to know where something lives. Add a row
whenever you add a top-level folder. A folder becomes a route through a `pages:`
entry in `../config/site.yaml`.

| Folder | Holds | Route |
|---|---|---|
| [docs/](./docs/) | The documentation pages. Files and folders carry an `NN_` prefix, which sets the sidebar order. Every folder needs a `settings.json`. Every page needs `title:` in its frontmatter | `/docs` |
| [blog/](./blog/) | Blog posts, flat, named `YYYY-MM-DD-slug.md` | `/blog` |
| [issues/](./issues/) | The issue tracker, one folder per issue named `YYYY-MM-DD-slug/`. The root `settings.json` declares the vocabulary every issue picks from | `/issues` |
| [pages/](./pages/) | Custom pages, one YAML file each. `home.yaml` is the landing page | `/` for `home.yaml` |

The User Guide at `/user-guide` is not here. It reads the framework's own bundled
docs, so it needs no folder in this project.

## Adding a folder

Run `/agent-ks-config section <name>`. It creates the folder, its `settings.json`
and a starter page. It registers the route in `../config/site.yaml`. Then add the
row here.
