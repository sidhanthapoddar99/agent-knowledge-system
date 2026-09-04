---
title: agent-ks-blog — Opus review
---

# agent-ks-blog

**Verdict:** needs fixes — the shape is right, but one asset-embed rule is wrong and will produce silently broken posts.

**Measured:** SKILL.md 792 words total (description 69, body 718) · 90 lines · references: none of its own. It links three sibling references: `agent-ks-docs/references/writing.md` 134 lines, `agent-ks-docs/references/images.md` 80 lines, `agent-ks-cli/references/cli-toolkit.md` 106 lines. All three are under the 150-line rule. The 600-word rule does not bind a single-file skill, so 718 body words is inside the house rule.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `SKILL.md:60` | "Inside a fenced block, `[[./assets/<post-slug>/file.py]]` inlines a file. A bare name resolves under `assets/<post-slug>/`." The second sentence is true only *outside* a fence; the preprocessor skips a bare name inside one (`asset-embed.ts:158-164` requires `./` or `../`). | An agent writes `[[flow.mmd]]` inside a ```` ```mermaid ```` fence, gets no error, and ships a post containing the literal text `[[flow.mmd]]`. The failure is silent. | Replace the bullet with the correct pair, already stated at `writing.md:127`: inside a fence the path must start with `./` or `../`; a bare name resolves under `assets/<post-slug>/` only outside a fence. Better: delete the bullet and link `writing.md#content-embedding-with-path`, which is its one home. |
| 2 | major | `SKILL.md:13`, `SKILL.md:23-27` | The skill writes `data/blog/` as if it were a literal path and never says how to find it. In this repo the folder is `default-docs/data/blog/`; in consumer mode it is under the user's own tree. | The skill calls itself "the whole manual", so an agent may load it alone. It then looks for `data/blog/` at cwd and finds nothing. Both sibling skills carry the fix (`agent-ks-docs/SKILL.md:12`, `agent-ks-config/SKILL.md:12`); this one does not. | Add one line after line 8: the CLI resolves the real `data/` path from `CONFIG_DIR` in `.env`; run `agent-ks resolve-context` to print it. |
| 3 | major | `SKILL.md:52` | "Use `#` only for the title, and prefer the frontmatter `title` over a body `<h1>`." The two clauses contradict each other and neither gives a reason. | `PostBody.astro:57` already renders `<h1 class="blog-post__title">{title}</h1>`. A body `# Title` produces a second h1; no postprocessor strips it. An agent reading clause one will write it. | Say the rule and the reason: "The layout renders the frontmatter `title` as the page `<h1>`. Start body headings at `##`, or the post ships two h1s." |
| 4 | major | `SKILL.md:48` | The `tags` row demands "the same spelling across posts" and names no way to read the existing spellings. `agent-ks blog list` prints only date, slug and title. | The agent cannot obey the rule without inventing a search. It will guess a tag, and the vocabulary drifts — the exact thing the rule exists to stop. | Add the command to the row or the commands table: `agent-ks find "tags" --type blog --meta` lists every post's tag line. Verified working. |
| 5 | minor | `SKILL.md:45` | "`description` … The lede on the card and the meta description." The second half is false. `[...slug].astro:101` passes only `title`, `contentType` and `editorPath` to `BaseLayout`; `BaseLayout.astro:76` then falls back to `siteConfig.site.description` for `<meta name="description">`. | The agent believes per-post SEO metadata is handled. It is not, for any content type. | Change the row to "The lede on the card and the subtitle on the post". The same false claim sits in `writing.md:12` ("Meta tag and sidebar tooltip") — fix both, and file the renderer gap the same way line 49 files the `image` gap. |
| 6 | minor | `SKILL.md:84`, `SKILL.md:86` | Two "Never" rows carry no reason: "Search posts with `Grep`" and "Commit a raw screenshot". The neighbouring `mv` row does carry one ("It rewrites every link into and out of the post") and reads much better. | The guide's rule: a bare NEVER cannot be generalised to a case the table did not name. | Add the reason in the "Do instead" cell. Grep: `blog search` scopes to posts and takes a regex over frontmatter and body together. Screenshot: a raw capture is megabytes; `agent-ks img` lands it near 60–100 KB. |
| 7 | minor | `SKILL.md:3` | The description offers "publish" as a trigger word. In this repo "publish" most often means publishing a release (`releases/<version>.md`, the tag workflow, `./start doctor` as "the pre-publish check"). It also misses the words a user reaches for when hiding a post: hide, unpublish, take down, not live yet. | One near-miss over-trigger, one real coverage hole on the `draft` field. | See "Proposed description". Name `draft`/hide explicitly and exclude a release note. |
| 8 | minor | `SKILL.md:8` | `@root` is used and never defined. `agent-ks-docs/SKILL.md:10` and `agent-ks-config/SKILL.md:12` both define it in the same sentence they use it. | A self-contained skill that names an alias its reader has not met sends the reader to another skill for one word. | Append "`@root` is the framework folder" to line 8. |
| 9 | minor | `SKILL.md:52`, `SKILL.md:62` | Two facts repeated from their one home. "Write plain markdown. No MDX." is `writing.md:7`. "Run `agent-ks img` on every image before a commit" is `writing.md:109`. | One home per fact. Both are already reachable through the link on line 56. | Cut both. Keep the `images.md` link inside the bullet list. |
| 10 | minor | `SKILL.md` (whole) | The skill is five tables and no procedure. There is no worked example of a finished post and no ordered "new post" sequence. | The order is guessable, so this is not blocking, but the guide asks for an example wherever the output has a shape, and a post has one. | Add a five-line ordered sequence (pick the date, name the file, write frontmatter, create `assets/<post-slug>/`, run `agent-ks check blog`) and extend the frontmatter block at lines 31-40 into a short complete post. |
| 11 | minor | not the skill — `default-docs/data/user-guide/18_blogs/04_frontmatter.md` | The user guide contradicts the skill on three points, and **the skill is right each time**. The guide lists `date` as required (engine: `blog.ts:86` has `required: ['title']` only); it documents `author_image` and `author_bio` (no match anywhere in `astro-doc-code/src`); `02_blogs-index.md` claims tag filtering, related posts and tag archive pages (`IndexBody.astro` only passes tags through to the card). | The house rule says the user guide wins over the skill. Applied literally here it would make three correct rows wrong. | Fix the user guide in the same round. Do not touch the skill's frontmatter table. |

Everything else checked clean. Verified true: the filename regex and the `check blog` positional `[folder]` and 0/1 exit (`blog/check.mjs:24,49,79`); the URL dropping the date (`blog.ts:102-119`); the frontmatter date overriding the filename date, with the filename date filled in when absent (`base-parser.ts:203`); `draft` visible in dev and dropped in production (`data.ts:145`); `image` passed into `<img src>` unchanged and therefore not rewritten (`PostCard.astro:35`, `IndexBody.astro:43`); the card fields (`PostCard.astro`); the `pages:` entry shape at line 85 (`default-docs/config/site.yaml:83-87` and the starter template); and every command and flag on lines 64-75 against `agent-ks-dev help`. `agent-ks check skill-links` passes on all four outbound links.

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "write a short post for the blog announcing the new agent-log format, and drop the flow diagram in it" | yes | yes — "post", "blog" and "a post's images" all match |
| "the cover image on the blog card for the 2026-04-19 post is broken, can you look" | yes | yes — "a post's images", "the blog index", "image" in the field list |
| "hide the typescript write-up until monday, i dont want it live yet" | yes | unsure, leaning no — the description says "draft post" but never "hide", "unpublish" or "not live". A model with no `data/blog/` path in the prompt has little to match on |
| "write the release note for 0.3.8 and publish the tag" | no | unsure — "publish" is an advertised trigger word and this repo publishes releases, so the description invites the wrong fire |

## Proposed description

Use this skill for blog posts in an agent-knowledge-system project: writing a new post, its `YYYY-MM-DD-` filename and date, frontmatter (title, description, date, author, tags, image, draft), a post's images and its assets folder, hiding or unpublishing a post with `draft`, and the generated blog index. Trigger it for any file under the project's `blog/` folder, and whenever the user says post, article, announcement, write-up, blog or draft, or asks to publish or hide one. Markdown mechanics come from agent-ks-docs; the blog route, layout and navbar item come from agent-ks-config. A release note is not a blog post.

## The dry run

Prompt: "Write a blog post announcing the new agent-log format, embed the flow diagram source, and add a cover image."

1. Read SKILL.md end to end. The Structure table gave me the filename in one pass: `2026-09-04-agent-log-format.md`.
2. Lost immediately after: the tree says `data/blog/`, and no such folder exists at the repo root. I ran `agent-ks-dev resolve-context`, a command this skill never names, to learn the folder is `default-docs/data/blog/`.
3. The frontmatter block at lines 31-40 was directly usable. The `image` row stopped me writing a relative cover path, which was the right save.
4. Read `writing.md` (134 lines) and `images.md` (80 lines). Both were needed. I did not read `cli-toolkit.md`; the command table on lines 64-75 was enough.
5. Wrong turn: line 60 sent me to write `[[flow.mmd]]` inside a ```` ```mermaid ```` fence. `writing.md:127` contradicted it and I checked `asset-embed.ts` to settle which was right. Without opening `writing.md` the post would have shipped broken.
6. Guessed: whether to open the body with `# Announcing…`. Line 52 argues both ways. I read `PostBody.astro` to settle it — the layout already emits the h1.
7. Guessed: which tags to use. The skill demands consistency and names no command, so I invented `agent-ks-dev find "tags" --type blog --meta`.
8. Ran `agent-ks-dev check blog`. Clean, exit 0. That last step is the clearest instruction in the file.

## Cut and add

**Cut**

- `SKILL.md:52`, first two sentences — "Write plain markdown. No MDX." Duplicate of `writing.md:7`, already linked four lines below.
- `SKILL.md:62` — "Run `agent-ks img` on every image before a commit". Duplicate of `writing.md:109`. Keep the `images.md` link by folding it into the bullet list above.
- `SKILL.md:60`, second sentence — wrong in the context it sits in (finding 1). Cut or correct; do not leave as is.
- `SKILL.md:85`, second sentence — "The route is a `pages:` entry with `type: blog` and `layout: \"@blog/default\"`." True, but it is the config skill's fact and the row already hands off to that skill.

**Add**

- The content-root sentence (finding 2). One line, and it is the difference between the skill working alone and not.
- "`@root` is the framework folder" on line 8 (finding 8).
- A source-of-truth line matching the siblings: the bundled user guide wins over this skill; when they disagree, follow the guide, fix the skill, and say so. Lines 88-90 say only "if this skill is wrong, update it" and never name the authority that decides.
- The tag-vocabulary command (finding 4).
- The reason on both reasonless "Never" rows (finding 6).
- A complete short post as an example, and a five-step new-post sequence (finding 10).
- Where "file it" points. Line 49 tells the agent to file the `image` renderer gap and never says where. Name the tracker, or link the issues skill.
