---
title: "Harvest docs"
status: done
agent: claude
---

# Goal

Builder report: harvest-docs

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)
- `plugins/agent-ks/skills/agent-ks-docs/SKILL.md` and `references/` (all files except `cli-toolkit.md`)
- Framework code under `astro-doc-code/src/`, the bundled user guide, and the new CLI manifest (`help --json`), read to verify facts

# Expected Outcome

The change, and what it touched.

# Outcome

Six files written under `plugins/agent-ks-temp/skills/agent-ks-docs/`. Every file is inside its size limit. Every rule in the old files has a row below with a home or a reason. Twelve facts in the old files contradict the framework code; they are dropped or corrected, each with the code location.

## Files

| File | Lines | Words | Limit |
|---|---|---|---|
| `SKILL.md` | 63 | 597 | 600 words |
| `references/writing.md` | 133 | 1136 | 150 lines, 1500 words |
| `references/docs-layout.md` | 144 | 1431 | 150 lines, 1500 words |
| `references/settings-layout.md` | 148 | 1270 | 150 lines, 1500 words |
| `references/images.md` | 80 | 711 | 150 lines, 1500 words |
| `references/doc-migration.md` | 64 | 653 | 150 lines, 1500 words |

Scratch: `plugins/agent-ks-temp/.scratch/docs-builder/check.mjs` (the self-check script) and `inbound.txt`.

## Harvest table

Old paths are relative to `plugins/agent-ks/skills/agent-ks-docs/`. New homes are relative to `plugins/agent-ks-temp/skills/agent-ks-docs/` unless they name another skill.

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Trigger coverage: non-tracker content work, docs, frontmatter, settings.json, blog, data folder, themes; tracker goes to issues; skip pure src work | `SKILL.md:3` | `SKILL.md` frontmatter | kept, shorter |
| Content lives under `data/` and `config/`; the framework folder renders it | `SKILL.md:8` | `SKILL.md` description; `settings-layout.md#project-structure` | merged |
| The bundled user guide is the source of truth; when the skill is unclear the guide wins; update the skill and tell the user | `SKILL.md:10` | `SKILL.md#documentation-skill` | kept |
| Two modes, one code path; the CLI reads `CONFIG_DIR` from `.env`; the skill says `data/` | `SKILL.md:12` | `SKILL.md#documentation-skill` | kept |
| Sibling skills: issues owns the tracker and the execution verbs; artifacts owns HTML artifacts | `SKILL.md:14` | `SKILL.md#triage` (two rows) | merged |
| Read only the reference you need; they are independent | `SKILL.md:18` | `SKILL.md#triage` | kept |
| Triage table: writing, docs, blog, settings, images, cli, migration, tracker, artifacts | `SKILL.md:20-30` | `SKILL.md#triage` | kept; blog row points at `docs-layout.md#blog`; cli row at `agent-ks-cli/references/cli-toolkit.md` |
| Cross-cutting tasks read more than one file | `SKILL.md:32` | `SKILL.md#triage` | kept; the example cut |
| Artifact page placement is docs-layout; building is the artifacts skill | `SKILL.md:34` | `docs-layout.md#artifact-pages` | kept |
| Migrations rewrite in place: detect and confirm first; never bump `engine_version` past the gate | `SKILL.md:36` | `SKILL.md#never`; `doc-migration.md#when-to-use-this-file` | kept |
| `data/README.md`: read first, create if missing, update when a top-level folder changes | `SKILL.md:40` | `SKILL.md#read-datareadmemd-first` | kept |
| `NN_` prefix 2 to 5 digits, numeric sort, gap-spaced; blog has none; the tracker is looser | `SKILL.md:46` | `SKILL.md#never`; `docs-layout.md#folder-structure` | kept |
| `settings.json` in every docs folder; `.jsonc` allowed and wins | `SKILL.md:47` | `docs-layout.md#folder-settings` | kept |
| Links are relative, a link, never backticked or leading `/`; assets included | `SKILL.md:48` | `SKILL.md#never`; `writing.md#linking` | kept |
| Frontmatter `title` on every markdown file | `SKILL.md:49` | `SKILL.md#never`; `writing.md#frontmatter` | kept |
| Theme variables only in layout CSS; never hardcode or invent names | `SKILL.md:50` | `SKILL.md#never`; `settings-layout.md#themes` | kept |
| Edit, do not rewrite; keep JSON key order | `SKILL.md:51` | `SKILL.md#never` | kept |
| `./start` is the entrypoint: dev, build, preview, doctor | `SKILL.md:52` | `SKILL.md#the-cli` | kept |
| `bun run dev`, `build`, `preview` inside `astro-doc-code/` | `SKILL.md:52` | none | dropped: a duplicate of `./start`; framework-dev detail that lives in the repo `CLAUDE.md` |
| Never commit a raw screenshot; run `agent-ks img` | `SKILL.md:53` | `SKILL.md#never`; `images.md#the-rule` | kept |
| One CLI entrypoint; discover with `help`, `help <cmd>`, `help --json` | `SKILL.md:57-60` | `SKILL.md#the-cli` | kept; `help --json` goes to `agent-ks-cli/SKILL.md` |
| Uniform contract: `--help`, `--json`, exit codes 0, 1, 2 | `SKILL.md:61` | `agent-ks-cli/SKILL.md` | merged: spec section 10, cli item 10 |
| Every command and flag lives in cli-toolkit | `SKILL.md:62` | `SKILL.md#triage` | kept, link to `agent-ks-cli/references/cli-toolkit.md` |
| Inside a git worktree the `.env` search stops at the worktree root; write a local `.env` or pass paths | `SKILL.md:63` | `agent-ks-cli/SKILL.md`, linked from `SKILL.md#the-cli` | merged: spec section 10, cli item 10 |
| Search content with `agent-ks find`, not `Grep`; tracker search is `issue list` | `SKILL.md:65` | `SKILL.md#never` | kept; the tracker half goes to the issues skill |
| Slash commands init and add-section, and the routing rule | `SKILL.md:69-74` | `SKILL.md#command-skills` | kept; procedures live in `agent-ks-init/SKILL.md` and `agent-ks-add-section/SKILL.md` |
| The tracker commands are documented in the issues skill | `SKILL.md:74` | none | dropped: the root builder owns the command skills; the issues skill links them |
| Subagents: ten or more files go to Haiku with a report under 200 words; patterns in the searching reference | `SKILL.md:78` | `SKILL.md#subagents` | kept; link to `agent-ks-issues/references/09_operations.md` |
| Update the skill instead of working around it; keep the catalogue page in sync | `SKILL.md:82` | `SKILL.md#keep-the-skill-current` | kept |
| One home for the link rule and the mechanics; the issues writing page links here | `references/writing.md:3` | `writing.md` intro | kept |
| Canonical user guide `15_writing-content/` | `references/writing.md:5` | `writing.md` intro | kept |
| `title` required; docs and blog fail; the tracker falls back to the slug | `references/writing.md:11` | `writing.md#frontmatter` | kept |
| `description` optional, recommended | `references/writing.md:12` | `writing.md#frontmatter` | kept |
| `draft: true` hides from production on docs, blog, issues | `references/writing.md:13` | `writing.md#frontmatter` | kept |
| Do not write MDX; GFM extensions | `references/writing.md:14` | `writing.md#frontmatter`; `SKILL.md#never` | kept |
| Standard frontmatter example | `references/writing.md:18-24` | `writing.md#frontmatter` | kept |
| Per-type extras: docs sidebar fields; blog date, author, tags, featured; issues in `settings.json` | `references/writing.md:27-29` | `writing.md#frontmatter` | kept; `featured` dropped (below); `image` added from `blog.ts` |
| Every reference is a relative link with text that names the target | `references/writing.md:33` | `writing.md#linking` | kept |
| Form table: `./`, `/`, `https://` | `references/writing.md:39-43` | `writing.md#linking` | kept |
| Why: filesystem-first; `move` skips `/` | `references/writing.md:45` | `writing.md#linking` | kept, one sentence of why |
| Write the source path, not the URL; the renderer strips prefixes and `.md` | `references/writing.md:47` | `writing.md#linking` | kept |
| Assets are not an exception; `/assets/` is the framework's route | `references/writing.md:49` | `writing.md#linking` | kept |
| A link, never a backticked path; three costs; the text must name the thing | `references/writing.md:51` | `writing.md#linking` | kept |
| Exception: non-document targets and paths discussed as values | `references/writing.md:53` | `writing.md#linking` | kept; the clause "not served is not the test" cut as argument |
| Convert a backticked path when found; text from `title`; a sweep is detect, check, convert, then the gates | `references/writing.md:55` | `writing.md#linking` | kept |
| A relative link that 404s is a renderer bug; do not convert; file it | `references/writing.md:57-58` | `writing.md#linking` | kept |
| The ordering label: format, derived, optional, `move` recomputes, the validator warns | `references/writing.md:60-75` | `writing.md#the-ordering-label` | kept |
| Callouts: five GFM types | `references/writing.md:79-84` | `writing.md#rich-content` | kept |
| `<details>` and `<summary>` | `references/writing.md:86-95` | `writing.md#rich-content` | kept |
| Mermaid and graphviz fences; keep the source in `.mmd` or `.dot` and embed | `references/writing.md:97-106` | `writing.md#rich-content` | kept |
| Excalidraw and draw.io: image syntax embeds, a plain link stays; never inline; missing fails the build; malformed shows a box | `references/writing.md:108-116` | `writing.md#rich-content` | kept |
| Dark mode differs per format; pick colours; save uncompressed; stencils are not bundled | `references/writing.md:118` | `writing.md#rich-content` | kept |
| Asset embedding: colocated `assets/` beside the page; rewritten to `/content-assets/`; not indexed; blog `assets/<slug>/` | `references/writing.md:122-132` | `writing.md#asset-embedding` | kept |
| `check link-form` rejects site-absolute targets; colocate, never loosen | `references/writing.md:134` | `writing.md#asset-embedding` | kept |
| Run `agent-ks img`; figures near 60 to 100 KB | `references/writing.md:136` | `writing.md#asset-embedding` | kept |
| `[[path]]`: raw text, fenced, per-type resolution, the `./` rule inside fences, escape | `references/writing.md:140-152` | `writing.md#content-embedding-with-path` | kept |
| Code blocks: a language tag; wrap a long one in `<details>` | `references/writing.md:156` | `writing.md#rich-content` | merged |
| Cross-references | `references/writing.md:160-163` | `writing.md#related` | kept |
| Scope and user guide `17_docs/` | `references/layouts/docs-layout.md:3-5` | `docs-layout.md` intro | kept |
| Folder tree; a prefix on files and folders | `references/layouts/docs-layout.md:11-28` | `docs-layout.md#folder-structure` | kept |
| Width 2 to 5, numeric sort, `_` strict, the tracker accepts `-`, widths coexist | `references/layouts/docs-layout.md:30` | `docs-layout.md#folder-structure` | kept |
| One shared parser (`order-prefix.ts`, `_order-prefix.mjs`) | `references/layouts/docs-layout.md:30` | none | dropped: implementation detail, not an authoring rule |
| Width tiers `NN_`, `NNN_`, `NNNN_` | `references/layouts/docs-layout.md:32-38` | `docs-layout.md#folder-structure` | kept |
| Gap numbering: step 5 default, 3 and 2 denser; pick by expected siblings | `references/layouts/docs-layout.md:42-46` | `docs-layout.md#gap-numbering` | kept |
| No gap left: re-prefix with `agent-ks move`; a free slot needs no move | `references/layouts/docs-layout.md:48` | `docs-layout.md#gap-numbering` | kept |
| Order override: `settings.json` `position` for folders, `sidebar_position` for pages; prefer prefixes | `references/layouts/docs-layout.md:50` | `docs-layout.md#gap-numbering` | pages kept; folder `position` dropped (below) |
| Grouping by the leading digit with 3 digits | `references/layouts/docs-layout.md:52` | `docs-layout.md#folder-structure` | kept |
| `settings.json` minimal shape | `references/layouts/docs-layout.md:56-67` | `docs-layout.md#folder-settings` | kept |
| Fields: label, position, collapsible, collapsed, nav_hide, allow_diagram_pages, allow_artifact_pages | `references/layouts/docs-layout.md:69-77` | `docs-layout.md#folder-settings` | kept, except `position` and `nav_hide` (below); `isCollapsible` alias added from `useSidebar.ts` |
| Depth-based collapse defaults; set explicitly; deviate freely | `references/layouts/docs-layout.md:79-88` | `docs-layout.md#folder-settings` | kept |
| Page frontmatter fields | `references/layouts/docs-layout.md:92-100` | `docs-layout.md#page-frontmatter-and-routing` | kept |
| URL is the base plus the path without prefixes | `references/layouts/docs-layout.md:104-109` | `docs-layout.md#page-frontmatter-and-routing` | kept |
| Diagram pages: extensions, title, sidecar, collision, no prefix, `assets/`, opt-out, viewer, dark mode, embed or page | `references/layouts/docs-layout.md:113-145` | `docs-layout.md#diagram-pages` | kept |
| User guide page pointers for diagrams | `references/layouts/docs-layout.md:146-148` | none | dropped: the section pointer in the intro covers it |
| Artifact pages: title, sidecar with `embed_height` and `artifact:`, nothing injected, full-page route, reserved `artifacts`, collision, no prefix, opt-out, trust, building is the artifacts skill | `references/layouts/docs-layout.md:152-196` | `docs-layout.md#artifact-pages` | kept |
| The outline lists `##` and `###`; `#` only for the title | `references/layouts/docs-layout.md:200` | `docs-layout.md#page-frontmatter-and-routing` | kept |
| Cross-linking: relative across sections; `base_url` must match the folder name; the renderer strips | `references/layouts/docs-layout.md:204-209` | `docs-layout.md#page-frontmatter-and-routing` | kept |
| `check section`: what it checks, exit codes, when to run | `references/layouts/docs-layout.md:213-227` | `docs-layout.md#validate-and-move` | kept |
| `mv` breaks links silently; use `agent-ks move` | `references/layouts/docs-layout.md:231-233` | `docs-layout.md#validate-and-move` | kept |
| `move` takes a file or a folder; `<to>` must not exist; parents are created | `references/layouts/docs-layout.md:239-240` | `docs-layout.md#validate-and-move` | kept |
| `move` rewrites inbound, outbound and text-mirror links; skips external, site-absolute and anchor links; resolves real paths | `references/layouts/docs-layout.md:242-248` | `docs-layout.md#validate-and-move` | kept |
| `move` flags `--dry-run`, `--no-git` (git mv by default), `--root` | `references/layouts/docs-layout.md:250-254` | `docs-layout.md#validate-and-move` for dry-run and git mv; `agent-ks-cli/references/cli-toolkit.md` for the flags | merged |
| `move` examples and the success message | `references/layouts/docs-layout.md:256-265` | none | dropped: CLI output detail; `agent-ks help move` shows usage |
| Cross-references | `references/layouts/docs-layout.md:267-271` | `docs-layout.md` intro and links | kept |
| Flat files, `YYYY-MM-DD-<slug>.md`; the date sorts newest first and is the post date | `references/layouts/blog-layout.md:11-22` | `docs-layout.md#blog` | kept |
| Blog frontmatter: title, description, date, author, tags, draft, featured | `references/layouts/blog-layout.md:26-35` | `docs-layout.md#blog` | kept; `featured` dropped (below) |
| Index: featured pinned, reverse-chronological, tag facet | `references/layouts/blog-layout.md:39-43` | `docs-layout.md#blog` | reverse-chronological kept; featured and tag facet dropped (below) |
| Assets colocated in `assets/<slug>/` | `references/layouts/blog-layout.md:47-53` | `docs-layout.md#blog`, `writing.md#asset-embedding` | kept |
| The URL strips the date | `references/layouts/blog-layout.md:57` | `docs-layout.md#blog` | kept |
| `check blog`: what it checks, exit codes, when | `references/layouts/blog-layout.md:61-76` | `docs-layout.md#validate-and-move` | kept |
| Cross-reference to `site.yaml` blog config (`per_page`, `sort`) | `references/layouts/blog-layout.md:82` | none | dropped (below) |
| Scope and user guide sections | `references/settings-layout.md:3-5` | `settings-layout.md` intro | kept |
| Contents jump list | `references/settings-layout.md:7-9` | none | dropped: a navigation aid for a 442-line file; the new file is 148 lines |
| Consumer tree; dogfood mode; only `CONFIG_DIR` differs | `references/settings-layout.md:15-33` | `settings-layout.md#project-structure` | kept |
| Clone command | `references/settings-layout.md:35-41` | `settings-layout.md#project-structure` | kept |
| `.env` holds only `CONFIG_DIR`; lives in the framework folder; relative to it; absolute works | `references/settings-layout.md:47,61` | `settings-layout.md#env` | kept |
| `.env` variables `CONFIG_DIR`, `LAYOUT_EXT_DIR`, `PORT`, `HOST` | `references/settings-layout.md:49-59` | `settings-layout.md#env` | kept |
| `site.yaml` schema: site, engine_version, server, paths, theme, theme_paths, logo, editor, pages | `references/settings-layout.md:67-129` | `settings-layout.md#siteyaml` | kept, compressed |
| Field cheatsheet | `references/settings-layout.md:131-142` | `settings-layout.md#siteyaml` | kept |
| `pages` is an object keyed by id | `references/settings-layout.md:148` | `settings-layout.md#pages-routing` | kept |
| Per-type page examples | `references/settings-layout.md:150-185` | `settings-layout.md#pages-routing` | kept |
| Required fields `base_url`, `type`, `layout`, `data` | `references/settings-layout.md:187-194` | `settings-layout.md#pages-routing` | kept |
| Reserved base URLs; hard fail at config load; `artifacts` backs the route | `references/settings-layout.md:196-197` | `settings-layout.md#pages-routing` | kept |
| Layout styles per type | `references/settings-layout.md:199-206` | `settings-layout.md#pages-routing`, the `layout` row | merged |
| User layouts at `layouts/<type>/<style>/` with `LAYOUT_EXT_DIR`; override by name | `references/settings-layout.md:208` | `settings-layout.md#env` | kept |
| navbar: layout default or minimal; items label and href; external links open a new tab | `references/settings-layout.md:214-238` | `settings-layout.md#navbaryaml` | kept |
| navbar grouping: check the layout source; some layouts support `children` | `references/settings-layout.md:236` | `settings-layout.md#navbaryaml` | kept, corrected: nested `items` in `@navbar/default` (`navbar/default/index.astro` reads `item.items`) |
| The logo lives in `site.yaml` | `references/settings-layout.md:240` | `settings-layout.md#navbaryaml` | kept |
| footer: layout, copyright `{year}`, columns, `href` or `page`, social | `references/settings-layout.md:246-285` | `settings-layout.md#footeryaml` | kept; platforms enumerated from `footer/default/index.astro` |
| Prefer `page:` for your own routes | `references/settings-layout.md:287` | `settings-layout.md#footeryaml` | kept |
| Three or four columns at most | `references/settings-layout.md:289` | `settings-layout.md#footeryaml` | kept |
| Built-in aliases, `@root` semantics | `references/settings-layout.md:297-307` | `settings-layout.md#path-aliases` | kept |
| User aliases: relative, absolute or `@root`; user-to-user and system aliases rejected; resolved at load | `references/settings-layout.md:309-323` | `settings-layout.md#path-aliases` | kept; reserved keys added from `paths.ts` |
| Themes: the contract, read the guide first, never invent or hardcode, the where table | `references/settings-layout.md:329-341` | `settings-layout.md#themes` | kept; `agent-ks theme tokens` added |
| Worked example: add a section (folder, settings, page, route, navbar, README row, restart) | `references/settings-layout.md:347-397` | `settings-layout.md#add-a-section`, `agent-ks-add-section/SKILL.md` | merged |
| Patterns: several trackers; one layout, different data; no per-section theme | `references/settings-layout.md:403-405` | `settings-layout.md#add-a-section`, `settings-layout.md#themes` | kept |
| Subpath deployment with `base:` | `references/settings-layout.md:406` | none | dropped (below) |
| `check config`: what it checks; regex based; exit codes | `references/settings-layout.md:412-429` | `settings-layout.md#validate` | kept |
| Cross-references | `references/settings-layout.md:435-443` | `settings-layout.md` intro | kept |
| Why images matter: git keeps binaries; 1 to 2 GB cap; 1 MB against 100 KB budgets; LFS is overkill | `references/images.md:8-12` | `images.md#the-rule` | kept |
| Never commit a raw screenshot | `references/images.md:14` | `images.md#the-rule`; `SKILL.md#never` | kept |
| The tool optimizes and does not capture; ImageMagick `magick`; install hint | `references/images.md:18-23` | `images.md#what-agent-ks-img-does` | kept |
| Capture with Playwright separately | `references/images.md:27-30` | `images.md#what-agent-ks-img-does` | kept |
| Decision table by image kind | `references/images.md:34-38` | `images.md#choose-a-recipe` | kept |
| Default recipe, what each flag does, the typical result | `references/images.md:42-55` | `images.md#choose-a-recipe` | kept |
| Budget mode `--target-size`; fall back to trim, max-dim, scale | `references/images.md:59-65` | `images.md#budget-mode` | kept |
| Format cheat sheet | `references/images.md:69-74` | `images.md#formats` | kept |
| Gotchas: colors, resolution lever, no upscale, strip by default, rewrite-links in place only, backups | `references/images.md:78-91` | `images.md#pitfalls` | kept |
| Full flag list | `references/images.md:95-99` | `images.md#pitfalls`, pointer to `--help` and cli-toolkit | merged |
| SVG: do not trace; capture as vector | `references/images.md:103-109` | `images.md#svg` | kept |
| Migrations are rare, not normal authoring | `references/doc-migration.md:3` | `doc-migration.md` intro | kept |
| Trigger: the version gate; the contract fields; missing counts as `0.0.0`; a bump is never the answer | `references/doc-migration.md:9` | `doc-migration.md#when-to-use-this-file` | kept |
| Trigger: the user asks | `references/doc-migration.md:10` | `doc-migration.md#when-to-use-this-file` | kept |
| Trigger: a legacy-field warning; surface and confirm | `references/doc-migration.md:11` | `doc-migration.md#when-to-use-this-file` | kept |
| Trigger: "does X need migrating" | `references/doc-migration.md:12` | `doc-migration.md#when-to-use-this-file` | kept |
| None apply: author in the current format | `references/doc-migration.md:14` | `doc-migration.md#when-to-use-this-file` | kept |
| Always confirm before applying; the one exception | `references/doc-migration.md:16` | `doc-migration.md#when-to-use-this-file` | kept |
| Location, naming, version order, Python stdlib, self-documenting, the README | `references/doc-migration.md:20-24` | `doc-migration.md#where-migrations-live` | kept |
| Never bump past the gate, whatever the user asks; explain and run detect | `references/doc-migration.md:28` | `doc-migration.md#the-upgrade-flow` | kept |
| The chain, steps 1 to 5 | `references/doc-migration.md:32-36` | `doc-migration.md#the-upgrade-flow` | kept |
| Subcommands detect, locate, migrate, verify | `references/doc-migration.md:42` | `doc-migration.md#script-structure` | kept |
| Two function families; verify reuses detection | `references/doc-migration.md:43` | `doc-migration.md#script-structure` | kept |
| The docstring carries the manual steps | `references/doc-migration.md:44` | `doc-migration.md#script-structure` | kept |
| New migrations are framework maintenance; dev-docs pointer | `references/doc-migration.md:46` | `doc-migration.md#writing-a-new-migration` | kept |
| `check legacy-tags` is part of the migration toolkit | `references/cli-toolkit.md:71` | `doc-migration.md#script-structure` | kept |

## Self-check

| Check (spec section 12) | Result |
|---|---|
| 1. Section 5 style: sentences at most 20 words, active voice, no argument paragraphs, headings at most `###`, lists at most 7 items | pass. The scratch checker found 0 sentences over 20 words and 0 headings deeper than `###`; 10 passive sentences found and rewritten |
| 2. Every relative link resolves | pass. All in-folder links and anchors resolve. Four links into `agent-ks-cli/` (`SKILL.md`, `references/cli-toolkit.md`) match section 3 and wait for the cli builder. `check skill-links` on the folder reports only those |
| 3. Sizes | pass. `SKILL.md` 597 of 600 words; the largest reference is 148 of 150 lines and 1431 of 1500 words |
| 4. History words `used to`, `earlier`, `retired`, `no longer`, `now` | pass. 0 hits, case-insensitive |
| 5. Every harvest row has a home or a reason | pass. 145 rows; 8 rows dropped whole and 5 rows dropped in part; the 12 dropped items are listed below with reasons |
| 6. Report written | this file |

Inbound links from the other new skills into this folder (README, artifacts `publishing.md`, issues `SKILL.md`, `01_anatomy.md`, `03_writing.md`): 7 of 7 resolve.

## Dropped rules, with reasons

| Dropped | Reason |
|---|---|
| Folder `settings.json` `position` overrides prefix order | `astro-doc-code/src/hooks/useSidebar.ts` `FolderSettings` reads only `label`, `isCollapsible`, `collapsible`, `collapsed`; the file states "Sorting is based ONLY on XX_ prefix" |
| `nav_hide` folder field | no occurrence anywhere under `astro-doc-code/src` |
| Blog `featured` frontmatter and "featured posts pinned to top" | no occurrence under `astro-doc-code/src`; `blog.ts` optional fields are description, date, author, tags, draft, image |
| Blog index "tag facet, click to filter" | `layouts/blogs/default/PostBody.astro:77` says tags are plain spans because clickable tags 404'd; `IndexBody.astro` has no filter |
| `site.yaml` blog config `per_page`, `sort` | `PageConfig` in `loaders/config.ts` has only `base_url`, `type`, `layout`, `data` |
| Subpath deployment with `base:` | no `base` in `SiteConfig` or `astro.config.mjs` |
| `bun run dev` inside `astro-doc-code/` | duplicate of `./start`; framework-dev detail in the repo `CLAUDE.md` |
| Pointer to the tracker slash commands | the root builder owns the command skills; the issues skill links them |
| Shared prefix parser file names | implementation detail |
| Diagram user guide page pointers | the intro names the user guide section |
| `move` examples and success message | CLI output; `agent-ks help move` |
| Contents jump list in settings-layout | navigation aid; the file is short |

Corrections made from the code, not drops: navbar dropdowns use nested `items` (not `children`) and only in `@navbar/default`; footer icons exist for `github`, `twitter`, `linkedin`, `youtube`, `discord`; `isCollapsible` is an accepted alias of `collapsible`; `paths:` reserved keys added; blog `image` field added; `agent-ks theme tokens` named in the themes section; the engine range constants named in doc-migration.

## Decisions

- User guide pointers are written as `@root/default-docs/data/user-guide/<section>/` in backticks, as a path discussed as a value. The plugin ships to consumers, where no relative path from the plugin folder to the framework's bundled docs exists. `check skill-links` skips `@` targets by design.
- The rules that were in an "Always" table in `SKILL.md` moved into the never-table, one row each, with a link to the home. That kept `SKILL.md` under 600 words with no rule lost.
- The `.env` row for `LAYOUT_EXT_DIR` carries the custom-layout tree shape; `layout-registry.ts` globs `@ext-layouts/<type>/<style>/`.

## Open questions

- The user guide's `17_docs/03_folder-settings.md` and `data/README.md` are stale against the code (`position` in folder settings, `source:` and `base:` keys in `data/README.md`). Outside this builder's folder; a follow-up for the docs tree.
- The old `blog-layout.md` claims (`featured`, tag facet) may describe intended features. If so they belong in a tracker issue, not the skill.
- `move` flags, the `img` flag list, the worktree note and the CLI contract are delegated to the cli builder's files. The reviewer should confirm `cli-toolkit.md` carries `--dry-run`, `--no-git`, `--root` for `move` and the full `img` list, or those rows lose their home.
- Term alignment with the issues skill's glossary (`01_anatomy.md`): this folder uses "framework folder", "project root", "content root", "docs section", "page", "post". Cross-check at integration.
