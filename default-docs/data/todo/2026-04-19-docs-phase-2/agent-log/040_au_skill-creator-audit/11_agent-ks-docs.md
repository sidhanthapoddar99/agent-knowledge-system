---
title: agent-ks-docs — Opus review
---

# agent-ks-docs

**Verdict:** needs fixes. The shape is right — a lean router plus three single-topic references — but four statements about engine behaviour are false, and one of them contradicts a sibling skill.

**Measured:** SKILL.md 592 words with frontmatter, 504 words body · references: `writing.md` 134 lines, `docs-layout.md` 129 lines, `images.md` 80 lines. All inside the house limits.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `references/docs-layout.md:106-107` | "The framework passes it through untouched" and "The framework injects nothing into the `.html`" are false for `artifact.theme: "site"` — the `/artifacts` route rewrites the served HTML to insert the site theme CSS before `</head>` (`src/pages/artifacts/[...path].ts:109-127`, `src/loaders/artifact-pages.ts:19-24`), and the skill's own example on line 115 is exactly that case. | It states the opposite of the engine and of `agent-ks-artifacts/SKILL.md:31` ("The route injects the site theme") and `publishing.md:96`. Two skills give opposite instructions and the agent cannot tell which is right. | Replace both rows with the sibling's wording: the loader passes the block through untouched **except** `artifact.theme`, which the route reads; `site` injects the host theme CSS, `self` (the default, and any unknown value) is served byte-untouched. |
| 2 | major | `references/writing.md:11` | "Docs and blog builds fail without it" (`title`) is false. `validateFrontmatter` calls `addWarning` and prints a console warning; its own comment says a page with no title "silently shipped titled after its own filename" (`src/parsers/core/base-parser.ts:300-327`). Only a missing `NN_` prefix throws (`src/loaders/data.ts:250-265`). | The agent believes the build is the gate, so it never runs the check that actually errors. The page ships with a filename-derived title and nothing says so. | Say: a missing `title` warns at build and the page ships titled from its filename; `agent-ks check section` is the check that errors on it. |
| 3 | major | `references/writing.md:90` | "A missing file fails the build (`asset-missing`)" is false. `diagram-embed.ts:74-81` logs a collected error and renders an error box; `asset-embed.ts:93-101` logs and keeps the original text. Nothing consumes `getErrors()` except the dev-toolbar API, so the build completes. | Same wrong failure model as #2, on the loudest-looking case. A broken diagram embed is silent in a production build. | Say both cases render an error box and log a dev-toolbar error; the build still passes, so check the page. |
| 4 | major | `SKILL.md:29-31` | "Read it first on every task; create it if it is missing" — no reason given, it contradicts the Triage rule "Read only the file the task needs" two lines above, the config skill scopes the same fact to "a structure task" (`agent-ks-config/references/03_site-config.md:25`), and the starter template ships no `data/` README (`agent-ks-config/assets/template/data/` holds only `blog/ docs/ issues/ pages/`). | Every first docs task on a fresh project turns into a write task for a file with no stated shape, and every later task pays ~700 tokens for an orientation the Triage table already gives. | Scope it to a structure task and drop the create instruction, or point at the config skill which already owns it. One home, one rule. |
| 5 | major | `SKILL.md:48-50` | The DOC command group is never named anywhere in the skill: `agent-ks doc list [section]`, `doc show`, `doc search` (verified working: `agent-ks-dev doc list user-guide`). The skill names only `find`, `move`, `img`, `check section`, `check link-form`, `check issues`. | These are the three read verbs a docs task uses most. Told "never Grep" and given no docs verb, the agent falls back to `ls` and `Read`. | Add one line to "The CLI": read with `doc list [section]`, `doc show <path>`, `doc search <regex> [section]`; search across every content type with `find`. |
| 6 | minor | `references/writing.md:66` | "`agent-ks check issues` warns on drift" is true but tracker-only — ordering-label drift is checked in `agent-ks-cli/scripts/issues/check.mjs:373`, and no docs checker looks at it. | A docs reader takes it as a safety net that will never run on their files. | Add "in the tracker only; nothing checks the label inside a docs section". |
| 7 | minor | `references/docs-layout.md:124` | "A `settings.json` in every folder" overstates the check: `docs/check.mjs:90` exempts the section root (`dir !== ROOT`). | Small, but the skill is the contract for what the gate catches. | Say "in every folder below the section root". |
| 8 | minor | `SKILL.md:12` | "Two modes, one code path" is 45 words of config background, needed only when the agent must resolve `data/` by hand — which the CLI already does — and the config skill is linked in the same sentence. | Sometimes-only content in the always-loaded layer. | Cut the first two sentences; keep the pointer. |
| 9 | minor | `SKILL.md:54` | Asks for "a report under 200 words"; the linked patterns ask for 300 (`agent-ks-issues/references/09_operations.md:35-45`). The link has no anchor, so it lands on a tracker-operations file. | Two homes for one number, already drifting. | Drop the word count and link `09_operations.md#delegate-bulk-reads`. |
| 10 | minor | `SKILL.md:40`, `:44`, `:45` | Three "Never" rows carry no reason and the pair does not imply one: Grep vs `agent-ks find`, "Write MDX", "Rewrite an existing file with `Write`". | The guide asks for the why so the agent can judge a case the row does not name — e.g. whether Grep is wrong for framework source too (it is not). | Add a half-clause each: `find` knows the content root and every type; the renderer is `marked`, so MDX renders as literal text; `Write` drops what it did not read. |
| 11 | minor | `SKILL.md:3` | The description omits the words a user actually types for the image path ("screenshot", "shrink", "compress", "optimize"), for diagram authoring ("mermaid", "excalidraw", "draw.io") and for the sidebar; and it says "moving or renaming a page" where `move` handles folders too. | `images.md` is a third of the skill's reference weight and the trigger for it is one word, "images". | See "Proposed description". |
| 12 | minor | `references/docs-layout.md:24` | "The tracker also accepts `-` as the separator" is a tracker fact, and `order-prefix.ts:17-20` calls it a legacy tolerance. | Breaks one-home and history-free in the same clause; a docs author cannot use it anyway. | Delete the sentence. |
| 13 | minor | `references/writing.md:13` | `draft: true` is listed under content types "docs, blog, issues" in a **frontmatter** table, but the tracker reads `draft` from `settings.json` (`src/loaders/issues.ts:120` per-issue meta, `:427` root vocabulary), never from frontmatter. | The row contradicts line 17 of the same file four lines later. | Drop `issues` from that row. |

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "add a page under user-guide/25_themes explaining the typography token tiers and link it from the overview" | yes | yes — "pages inside a docs section", "links" |
| "the screenshots i dropped into dev-docs/20_development are like 2MB each, can you sort them out before i commit" | yes | unsure — "images" is the only hook; no "screenshot", "shrink" or "commit". Adding those words would settle it |
| "rename 15_content to 15_writing-content across the user guide and fix everything pointing at it" | yes | yes — "moving or renaming a page", though the description says "page" and this is a folder |
| "add a new top-level section called runbooks and wire up its route in site.yaml" | no | no — explicitly routed to agent-ks-config |

## Proposed description

Use this skill for pages inside a docs section of an agent-knowledge-system project: markdown pages, `NN_` prefixes, a folder's `settings.json`, frontmatter, relative links, callouts, mermaid, graphviz, excalidraw and draw.io diagram pages, artifact pages, the sidebar and the outline, screenshots and image optimization, and moving or renaming a page or a folder. Trigger it for any file under a docs section of `data/`, for "add a doc", "write documentation", "fix this link", "shrink these screenshots", and for a question about how a docs section is built. Not for a blog post (agent-ks-blog), the tracker under `data/todo/` (agent-ks-issues), site config, a new section, themes or layouts (agent-ks-config), or building the HTML inside an artifact (agent-ks-artifacts).

## The dry run

Prompt: "Add a page to the user guide's themes section explaining the typography token tiers, and link it from the themes overview."

1. SKILL.md read. The Triage table routed cleanly; the "Two modes" paragraph was noise for this task.
2. Obeyed "Read `data/README.md` first". 469 words. It told me nothing the Triage table had not, and one of its rows names a `data/docs/` folder that does not exist in this repo — so the orientation read cost context and carried a stale fact.
3. `docs-layout.md` gave gap numbering, the folder-settings fields and the URL rule. Everything I needed, no guessing.
4. Lost here: to pick a prefix I needed the section's siblings, and the skill names no command for that. I fell back to `ls`. `agent-ks doc list user-guide` exists and works.
5. `writing.md` gave the link form and the ordering label. Clean.
6. Missing at the end: nothing told me to validate. `docs-layout.md:124` scopes `agent-ks check section` to "after a restructure, before a batch commit", so a single page add runs no gate — and since a missing `title` only warns (finding #2), that gate is the only thing that would catch it.

## Cut and add

**Cut**

- `SKILL.md:12` — the "Two modes" background. The config skill owns it and is linked in the same line.
- `SKILL.md:31` — "create it if it is missing", and "on every task" (finding #4).
- `SKILL.md:54` — the "under 200 words" figure; the linked file states its own.
- `references/docs-layout.md:24` — "The tracker also accepts `-` as the separator".
- `references/docs-layout.md:106-107` — the two false artifact rows, replaced per finding #1.

**Add**

- The DOC read verbs (`doc list`, `doc show`, `doc search`) to `SKILL.md`'s CLI section.
- The real failure modes: a missing `title` warns and falls back to the filename; a missing embedded asset renders an error box and the build still passes.
- "Run `agent-ks check section <folder>` after adding or renaming a page" — not only after a restructure. It is the only gate that errors on a missing `title`.
- A reason on each of the three bare "Never" rows (finding #10).

## Note outside scope

`default-docs/data/README.md` carries the same false claim as finding #2 ("Astro builds fail without it") and lists a `data/docs/` folder this repo does not have. Both belong to the content fix round, not to the skill.
