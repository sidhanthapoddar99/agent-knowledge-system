---
title: "Check, search and move"
description: "The agentks commands that keep a docs section in order: check a section and its links, list and search pages, and move pages without breaking links."
---

# Check, search and move

Three kinds of command keep a docs section healthy: checks find what is broken, queries find pages, and `agentks move` renames or moves pages without breaking a single link. They run straight on your files, in milliseconds, with no server running. Run them from the project folder, the one that holds `config/`.

Every command accepts `--json`, which prints one JSON document for a script or an AI agent to read. `agentks help <command>` shows every option of one command.

## Check a section

```bash
agentks check section data/guide
```

`check section` walks the section folder and reports:

| Check | Error or warning |
|---|---|
| A file or folder without an `NN_` prefix | Error for a markdown page or a folder. Warning for a diagram or `.html` file, which is then not a page |
| Two siblings with the same prefix number | Error |
| A folder below the root without a `settings.json`, or without a `label` | Error |
| A settings file or a sidecar that is not valid JSON | Error, with the line |
| A page without a `title` | Error |
| Frontmatter that is not valid YAML | Error, with the line |
| A frontmatter or sidecar key that is not known | Warning, with the list of valid keys |
| A file that is neither a page nor in `assets/` | Warning: it belongs in `assets/` |

Then check the links of the whole project, or of one folder:

```bash
agentks check link-form
agentks check link-form data/guide
```

`check link-form` reports every internal link that starts with `/`, climbs out of the project, or names a file that does not exist.

A command exits with `0` when it finds no errors and `1` when it finds at least one. Warnings alone do not fail it, so read the counts it prints, not only the exit code. A usage mistake, such as an unknown flag, exits with `2`.

## Find pages

```bash
agentks doc list                              # every docs page: path, section and title
agentks doc list guide                        # the pages of one section
agentks doc show 05_install.md                # one page's metadata and frontmatter
agentks doc search 'access key' guide         # search the text of one section
agentks find 'base_url' --fixed-strings       # search every content type and the config
```

`doc show` takes a page's path, its file name or its URL slug. The search commands take a regular expression, or plain text with `--fixed-strings`. They share a few options:

| Option | Does |
|---|---|
| `--fixed-strings` | Treats the pattern as plain text |
| `--case-sensitive` | Matches case exactly. The default ignores it |
| `--context 2` | Shows two lines around each match |
| `--limit 20` | Returns at most 20 results |
| `--paths-only` | Prints only the paths of the files that match |
| `--count` | Prints only the number of matches |

`agentks find` also takes `--type docs,blog,issues,config` to narrow the search, `--meta` to search only frontmatter and settings files, and `--path` to match file and folder names.

## Move and rename pages

Never move or rename a page with `mv` or a file manager: every link to it would still name the old path. Use `agentks move`, and look first:

```bash
agentks move data/guide/10_concepts/05_links.md data/guide/10_concepts/07_links.md --dry-run
agentks move data/guide/10_concepts/05_links.md data/guide/10_concepts/07_links.md
```

`--dry-run` lists every file move and every link it would rewrite, and changes nothing. Without it, `agentks move`:

- moves the file, or a whole folder with everything in it;
- rewrites every link and embed in the project that pointed into what moved;
- rewrites the relative links inside the moved files, so they still point at the same targets;
- updates ordering labels in link text, such as `[10/05 Links](...)`;
- uses `git mv` inside a git repository, so history follows the file. Add `--no-git` to move with plain file operations.

It does not commit anything.

## A routine for a new page

1. Create the file with a gap-numbered prefix, such as `07_` between `05_` and `10_`.
2. Give it a `title` and a `#` heading that repeats it.
3. Put its images in the folder's `assets/`, and shrink them with `agentks img`.
4. Run `agentks check section` on the section and `agentks check link-form` on its folder.
5. Open it in the local app with `agentks start --open`, or keep the app open: it shows each save.
