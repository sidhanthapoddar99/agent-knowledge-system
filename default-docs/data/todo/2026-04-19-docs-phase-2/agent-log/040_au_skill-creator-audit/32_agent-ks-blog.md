---
title: agent-ks-blog — re-audit
---

# agent-ks-blog

**Verdict:** needs fixes — every first-round ruling landed and the blocker is gone; one verified false claim about the index remains, plus six minors.

**Measured:** SKILL.md 941 body words (description 99, 112 lines) · references: none of its own. It links three siblings: `agent-ks-docs/references/writing.md` 138 lines, `agent-ks-docs/references/images.md` 80 lines, `agent-ks-cli/references/cli-toolkit.md` 116 lines. All three are under the 150-line rule. Decision I exempts a single-file skill with no references from the 600-word cap, so 941 is inside the rule.

**On the growth.** 718 → 941 body words. The added lines earn it: the source-of-truth line (10), the content-root line (12), the two renderer-gap sentences, the h1 rule (75), the tag-vocabulary command (69), the two Never reasons, and the complete post example are each a closed finding. The five-step sequence (33–39) is the weakest add — four of its five steps restate a table above it — but it is the only ordered spine in the file and the guide asks for one. See N7 for the two facts that are now stated twice.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | The wrong bullet is deleted. Line 83 links `writing.md#content-embedding-with-path`; the anchor and the heading both exist. See N4 for the residual wording. |
| 2 | closed | Line 12 names `agent-ks resolve-context`. Ran it: it prints `DATA_DIR=…/default-docs/data`. |
| 3 | closed | Line 75 states the rule and its reason. `PostBody.astro:58` renders `<h1 class="blog-post__title">{title}</h1>`, so the reason is true. |
| 4 | closed | Line 69 carries `agent-ks find "<tag>" --type blog --meta` and `agent-ks blog show <slug>`. Ran both; `--meta` is a real flag and returns the tag line with its file and line. |
| 5 | closed | Line 66 now says the description does not reach `<meta name="description">`. Verified: `[...slug].astro:101` passes only `title`, `contentType`, `editorPath`; `BaseLayout.astro:76` falls back to `siteConfig.site.description`. `writing.md:17` carries the same correction on the docs side. |
| 6 | closed | Both Never rows carry their reason (106, 108). Decision H satisfied. |
| 7 | closed | The shipped description is the proposed one, verbatim apart from punctuation. Decision F satisfied. |
| 8 | closed | Line 10 ends "`@root` is the framework folder". |
| 9 | closed | "Write plain markdown. No MDX." is gone. The `agent-ks img` sentence is folded into the bullet list at line 84 as a link with a when-to-open. |
| 10 | closed | Lines 33–39 are the ordered sequence; lines 45–61 are a complete short post. |
| 11 | n/a | Deferred to the user-guide sync. Not checked. |
| add | closed | Source-of-truth line at 10, per decision A. "File it" now points at the tracker: line 73 links `agent-ks-issues`. Line 112 carries the update-the-skill half. |

11 closed · 0 partly · 0 open · 1 deferred, not checked.

**Regressions:** none found. Every changed passage holds together, every claim in it is true against the engine, and `agent-ks-dev check skill-links` passes on all five outbound links (`[repo source tree]`, 10 skills, 61 files).

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `SKILL.md:31` | "`/blog/` lists every post as a card: title, description, date, author, tags, cover image." Two over-claims. The index hard-caps at ten posts (`IndexBody.astro:12` `postsPerPage = 10`, `:35` `posts.slice(0, postsPerPage)`); nothing supplies `postsPerPage` (`route-match.ts:352` sets `layoutProps` to `{ dataPath, baseUrl }` for `blog-index`), there is no pagination component in `layouts/blogs/default/`, and no `site.yaml` key sets it. A card also shows only the first two tags (`PostCard.astro:42` `tags.slice(0, 2)`). | The eleventh post never reaches the index. The agent writes it, `check blog` passes, and it tells the user the post is live. That is exactly the silent failure the skill's own two renderer-gap notes exist to prevent. | Change the row to "the ten newest posts as a card … the first two tags". Add "Post eleven and older drop off; there is no pagination — that is a renderer gap, so file it" and reuse the pointer on line 73. |
| N2 | minor | `SKILL.md:94` | The "Does" cell for `agent-ks find <regex> --type blog` reads "Search the blog with everything else". `--type <list>` restricts scope (CLI help: "restrict scope: docs,blog,issues,config"), so the flag shown does the opposite of the sentence. | The agent reads the row as "this searches everything" and drops the flag, or keeps the flag and misreports the scope. | Rewrite the cell: "Search posts together with docs, issues and config. Drop `--type blog` to widen; add `--meta` to match frontmatter only." |
| N3 | minor | `SKILL.md:105` | The move row promises `agent-ks move` "rewrites every link into and out of the post" and stops there. `move` has no blog-assets handling (`docs/move.mjs` contains neither `assets` nor `blog`), so a rename leaves `assets/<old-slug>/` under the old name. Verified with a dry run on `2024-01-15-hello-world.md`: it rewrote the one inbound link and touched nothing else. | The skill's own rule is "one folder per post, named after the file" (line 21, 30). After a rename that is silently false, and any bare-name `[[file]]` embed breaks, because `createBlogAssetResolver` (`asset-embed.ts:224-237`) resolves from the *new* filename. `check blog` does not catch it. | Add to the "Do instead" cell: "Then move `assets/<old-slug>/` to `assets/<new-slug>/` with a second `agent-ks move`. `move` does not rename it for you." |
| N4 | minor | `SKILL.md:83` | "To inline a file's text into a fenced block, follow content embedding with `[[path]]`. Its table carries the blog row." The blog row of that table (`writing.md:126`) is bare-name resolution, which is the one behaviour that does **not** work inside a fence (`asset-embed.ts:158-164` skips any path not starting with `./` or `../`). | The pointer names a fenced block and then singles out the row that only holds outside one. `writing.md:129` corrects it four lines below the table, so the reader is caught — but the sentence still points at the old trap. | Drop the second sentence, or replace it with the rule itself: "Inside a fence the path starts with `./` or `../`." |
| N5 | minor | `SKILL.md:66` | The `description` row says "Keep it under 160 characters" and, in the same row, that the value never reaches `<meta name="description">`. The 160 figure is an SEO meta-description convention whose reason the row has just removed. | Check 3 — a rule with no reason cannot be applied to a case the row did not name. The agent cannot tell whether 200 characters is wrong or merely long. | Give it the reason it actually has: "Two lines on the card before it clips — keep it near 160 characters." |
| N6 | minor | `SKILL.md:39`, `SKILL.md:86-97` | Line 81 states the relative-link rule, and no command in the file verifies it. Step 5 and the commands table name `check blog` only, which checks the filename, a `title`, and no nested folder (`blog/check.mjs:49,68,74,54-58`) — never a link. `agent-ks check link-form` is not mentioned anywhere in the skill. | The skill's one stated writing rule has no gate, while the sibling docs skill pairs its rule with `agent-ks check section`. A broken relative link ships with a clean `check blog`. | Add `agent-ks check link-form` to the commands table and to step 5: "Run `agent-ks check blog` and `agent-ks check link-form`." |
| N7 | minor | `SKILL.md:38` + `:75`, `SKILL.md:60` + `:82` | Two facts are now stated twice inside one file. "Start its headings at `##`" (38) and the same rule with its reason (75). The example image path `./assets/2026-04-19-introducing-issues/flow.png` at 60 and again at 82 — and a third time at `writing.md:106`. | One home per fact. Both duplicates arrived with the round-one adds, so this is the cost of the growth from 718 to 941 words. | Cut the second half of step 4 (line 38) and let line 75 own the rule. Cut the bullet at line 82; the post example at line 60 already shows the form. |

## The dry run, second time

Prompt, unchanged: "Write a blog post announcing the new agent-log format, embed the flow diagram source, and add a cover image."

**Better, in order.** (1) Line 12 gave me the content root immediately; `agent-ks-dev resolve-context` printed `DATA_DIR`, and I was never lost — round one's step 2 is gone. (2) Lines 33–39 gave the whole sequence before I read a table. (3) The complete post at 45–61 was copy-ready; I wrote frontmatter and the first heading without a second pass. (4) Line 75 settled the `#`-versus-`##` question in one sentence; round one needed `PostBody.astro`. (5) Line 69 handed me the tag command; I ran `agent-ks-dev find "announcement" --type blog --meta`, got the spelling in use, and invented nothing. (6) I read `writing.md` once and skipped `images.md` and `cli-toolkit.md` — the tables were enough. (7) `agent-ks-dev check blog` ran clean, exit 0.

**Still wrong.** (8) The cover image stopped me again. The `image` row tells me a relative path is not rewritten and to file a gap, but names no value that works, so I read `asset-src.ts` and found one — `/content-assets/blog/assets/<slug>/cover.png` — which the skill never mentions and the project's link rule discourages. The row should say what to do meanwhile: leave `image` unset, or use an external URL. (9) Line 83 pointed me at the blog row of the embedding table, and I would have written `[[flow.mmd]]` inside a ```` ```mermaid ```` fence had `writing.md:129` not sat four lines under it (N4). (10) Nothing told me to check the post's links, so I stopped at `check blog` (N6).
