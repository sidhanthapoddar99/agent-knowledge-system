---
title: agent-ks-docs — re-audit
---

# agent-ks-docs

**Verdict:** needs fixes. Every ruled fix landed and none of them broke what it touched, but a fresh sweep found four more false engine claims — three of them the same failure-model and ordering class the first round only half-cleared — plus the validate step still never reaches the agent that adds a page.

**Measured:** SKILL.md 594 body words, frontmatter excluded (713 with it; was 504 body) · references: `writing.md` 138 lines, `docs-layout.md` 129 lines, `images.md` 80 lines. All inside decision I. SKILL.md has six words of headroom, so any addition needs a matching cut.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `docs-layout.md:106-107` now matches `artifact-pages.ts:19-24` and `pages/artifacts/[...path].ts:179-181`; the `publishing.md#theme-modes` anchor resolves |
| 2 | closed | `writing.md:11` matches `base-parser.ts:308-326` (warn + filename fallback) and `docs/check.mjs:161` (errors) |
| 3 | closed | Verified: `diagram-embed.ts:74-81` error box, `asset-embed.ts:93-101` keeps the text, both `asset-missing`; nothing consumes `getErrors()`, so the build passes |
| 4 | closed | Scoped to a structure task, "create it" gone, the config skill named as the owner |
| 5 | closed | `doc list`, `doc show`, `doc search` all exist and run (`agent-ks-dev help doc list`) |
| 6 | closed | |
| 7 | closed | Matches `docs/check.mjs:90` (`dir !== ROOT`) |
| 8 | closed | The "Two modes" paragraph is one sentence now |
| 9 | closed | Count dropped, `#delegate-bulk-reads` resolves |
| 10 | closed | Three reasons added and all three are true |
| 11 | closed | Proposed description adopted |
| 12 | closed | |
| 13 | closed | |
| blog 5 | partly | The `description` row at `writing.md:12` is fixed and the new `:17` paragraph is correct, but the file's own YAML example at `:24` still says the field is "for meta tags and tooltips" (N6), and `docs-layout.md:72` still says "Meta tag summary" (N4) |
| artifacts 14 | closed | Same edit as finding 1 |
| add ("run `check section` after adding a page") | partly | It landed in `docs-layout.md:124` only. SKILL.md and `writing.md` never name the gate, so a page-write task routed to `writing.md` still never runs it (N5) |

No regressions. Every changed passage holds together, keeps its reason, and stays inside the caps. `check skill-links` passes; no `check links`, no site-absolute link and no history aside survives anywhere in the skill.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `references/docs-layout.md:25` | "Widths coexist, so one folder can widen alone" is false for files. `data.ts:46-54` builds the sort tuple from each *folder* segment's numeric prefix but ends it with `sidebar_position ?? 999` — the file's own prefix is never read. Two unpositioned files tie at 999 and fall to `relativePath.localeCompare`, so `010_x.md` sorts **before** `05_y.md` (verified). `useSidebar.ts:226,277` uses the same `?? 999`. | The skill licenses exactly the move that misorders the sidebar, and the failure is silent — nothing warns and the build passes. | State it: only folder segments sort by numeric value; a file sorts on `sidebar_position`, else a string compare of its path, so widths must stay uniform inside one folder. The likely real home is the engine — `pathPositionTuple` should read the file's own prefix — so this may be an `engine` verdict with one skill line either way. |
| N2 | major | `references/docs-layout.md:58`, and the example tree at `:9-20` | The skill never says what actually orders a file. A subfolder sorts at its prefix value (`useSidebar.ts:176,190`) while an unpositioned file sits at 999, so **every subfolder outranks every unpositioned file in the same folder**. The bundled content confirms it: 115 of 161 docs pages carry an explicit `sidebar_position`, including all eight files of `15_writing-content/`, which is what keeps them above `10_naming-and-sidebar/`. | An agent adds `09_faq.md` beside a `20_examples/` folder, sets no `sidebar_position` because the skill says the prefix is the signal, and the page lands under the folder. | Add a row: a file with no `sidebar_position` sorts after every subfolder in its folder; set `sidebar_position` on a page that must sit among folders. Same engine caveat as N1. |
| N3 | major | `references/docs-layout.md:91`, inherited at `:110` | "A slug collision is a build error" is false. `first-class-page.ts:43-51` logs a collected error, replaces the **first** entry's body with an error box, clears its headings, and **drops every other colliding entry**. Nothing consumes `getErrors()`, so the build passes. | This is the same false failure model as first-round findings 2 and 3, in the file those fixes did not reach. The agent trusts the build to catch it, ships a page replaced by an error box, and loses the other file from the site with no signal. | Say: a collision replaces the first page with an error box and drops the others from the site; the build still passes, so rename one and open the page. |
| N4 | major | `references/docs-layout.md:69-75` | The `description` row says "Meta tag summary". False: no content page passes `description` to `BaseLayout` (`pages/[...slug].astro:101`), so `<meta name="description">` always carries the site description (`BaseLayout.astro:76,96`), and docs `Body.astro:7` accepts but does not render it. The whole table also re-states the frontmatter table `writing.md` owns. | The fix round just corrected this exact claim in `writing.md`; the second copy now contradicts it, and one-home means it will drift again. | Delete the table at `:69-75` and link `writing.md#frontmatter`. Keep the routing paragraph at `:77`. |
| N5 | major | `SKILL.md` (no line), `references/writing.md` (no line) | `agent-ks check section` is named only in `docs-layout.md:124`. A "write markdown" task is routed by the Triage table to `writing.md` alone, which never mentions it, and SKILL.md's CLI section lists only the read verbs. | The skill's own text says this gate is the only thing that errors on a missing `title`. An agent that adds one page therefore never runs the only check that would catch its worst mistake. | Add one line to SKILL.md's CLI section: "After adding or renaming a page, run `agent-ks check section <folder>` — it is the only gate that errors on a missing `title`." Cut the `data/` map paragraph to one sentence to stay under 600 words. |
| N6 | minor | `references/writing.md:24` | The YAML example comment reads "One or two sentences for meta tags and tooltips" — contradicting `:17` (no per-page meta tag) seven lines above and `:12` (no tooltip anywhere). | A leftover of the blog-5 fix. The example is the part an agent copies. | Rewrite the comment: "The lede on a blog card, the subtitle on an issue." |
| N7 | minor | `references/writing.md:68` | "so re-read it yourself after a move" contradicts `:67` two rows above, which says `agent-ks move` recomputes the label (true — `docs/move.mjs:340`). The drift case is a hand renumber or a plain `mv`, not `move`. | The pair leaves the agent unsure whether `move` can be trusted. | Change to "after a hand renumber". |
| N8 | minor | `references/writing.md:92` | "A missing **or malformed** one renders an error box in place and logs an `asset-missing` error to the dev toolbar" over-reaches on the malformed case: the file exists, so no `asset-missing` is logged; the box comes from the client (`scripts/diagrams.ts:146-148`, `scripts/drawio.ts:221-223`) and the message goes to the browser console. | The file's error model was just corrected; this is the one channel still stated wrong. | Split it: a missing file logs `asset-missing`; a malformed one fails in the browser and logs to the console. Both render a box and both pass the build. |
| N9 | minor | `SKILL.md:36`, `:40`, `:41` | Three Never rows still carry no reason: "Skip the `NN_` prefix, a folder's `settings.json`, or a page's `title`", "Commit a raw screenshot", and "Put a page's image in the site `assets/` folder". Decision H asks for the reason when the pair does not imply it, and these pairs do not. | `:41` is the one an agent most readily argues its way around, and its reason is one clause long. | Give `:41` its reason — the asset moves with the page and stays true on disk. The other two point at a reference that carries the reason; leaving them is defensible, and the word cap is tight. |

## The dry run, second time

Prompt, as before: "Add a page to the user guide's themes section explaining the typography token tiers, and link it from the themes overview."

1. Better: the Triage table routed in one read, and the "Two modes" noise is gone.
2. Better: `data/README.md` is now scoped to a structure task, so a single page add skips it. That is the ~700-token orientation read the first run wasted.
3. Better: `agent-ks-dev doc list user-guide` gave every sibling under `25_themes/` with its prefix and title. The first run fell back to `ls` here.
4. `docs-layout.md` gave gap numbering, the folder-settings fields and the URL rule, as before.
5. Still wrong: to slot a page into `25_themes/04_tokens/` I read "widths coexist, one folder can widen alone" and would have used `035_`. That misorders the page (N1), and the eight sibling files there all carry `sidebar_position` while the skill never says why (N2).
6. Still wrong: nothing in SKILL.md or `writing.md` told me to validate. I only found `check section` because I opened `docs-layout.md` for the prefix rules (N5).
7. `writing.md` gave the link form and the ordering label cleanly, but its `description` example told me the field feeds a meta tag while the paragraph above said it does not (N6).
