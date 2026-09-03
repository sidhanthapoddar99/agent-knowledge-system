---
title: "Harvest artifacts"
status: done
agent: claude
---

# Goal

Builder report: harvest-artifacts

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)

# Expected Outcome

The change, and what it touched.

# Outcome

Harvest table first. Files second. Constraint evidence, self-check, dropped rules, decisions and open questions follow.

## Harvest table

Old paths are relative to `plugins/agent-ks/skills/agent-ks-artifacts/`. New homes are relative to `plugins/agent-ks-temp/skills/agent-ks-artifacts/`.

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Trigger coverage: build HTML artifacts here; not claude.ai Artifacts; docs pages go to agent-ks-docs; tracker structure to agent-ks-issues | `SKILL.md:3` | `SKILL.md#frontmatter` | kept |
| An artifact is an `.html` file served at `/artifacts/<path>`; this skill wins over claude.ai habits | `SKILL.md:14-19` | `SKILL.md` intro | kept |
| A prefixed `.html` in a docs section is a sidebar page; an `.html` in a tracker folder is a thinking-artifact | `SKILL.md:23-25`, `references/publishing.md:11-20` | `references/publishing.md#Where an artifact lives` | merged |
| Author the complete document (doctype, head, style, script, body); nothing is wrapped around it | `SKILL.md:26-29`, `references/publishing.md:35-39` | `SKILL.md#Never`, `references/publishing.md#A complete document` | merged |
| Embed fills the content column, sidebar stays, outline rail hides; full-page link to the route; the route is the primitive | `SKILL.md:30-34`, `references/publishing.md:45-57` | `references/publishing.md#The route and the embed` | merged |
| Optional same-name `.meta.json` / `.meta.jsonc` sidecar; read before editing, update in the same change | `SKILL.md:35-42`, `references/publishing.md:243-251` | `SKILL.md#Never`, `references/publishing.md#The sidecar` | merged |
| Triage table: which reference to read per task | `SKILL.md:44-55` | `SKILL.md#Triage` | kept |
| Read only the reference the task needs; the references are independent | `SKILL.md:46` | `SKILL.md#Triage` | merged: the Read column names what to read; the independence claim is dropped because dataviz.md, dataviz-color.md and palette.md link to each other |
| The four governing sections are not optional reading | `SKILL.md:57-58` | `SKILL.md` (the sections are in the always-loaded file) | kept |
| Calibrate the treatment first: utilitarian is the default | `SKILL.md:60-71` | `SKILL.md#Calibrate the treatment`, `references/design-fundamentals.md#Calibrate the treatment` | merged |
| Editorial treatment: a standalone showcase; ask purpose, tone, differentiation; commit to a stance | `SKILL.md:72-79` | `references/design-fundamentals.md#Calibrate the treatment` | kept |
| Decision tooling: options are editorial, chrome stays utilitarian; the governor does not apply to options | `SKILL.md:80-85`, `references/design-systems.md:106-110` | `references/design-fundamentals.md#Calibrate the treatment` | merged |
| When unsure, choose utilitarian; the editorial process runs only on an editorial read | `SKILL.md:87-90` | `references/design-fundamentals.md#Calibrate the treatment` | kept |
| Precedence: the user's words, then the host theme contract, then your own choices | `SKILL.md:92-95` | `SKILL.md#Theme mode` | kept |
| Each later precedence tier fills gaps the earlier one left; it never overrides | `SKILL.md:95` | `SKILL.md#Theme mode` | merged into the precedence line |
| The contract is `theme.yaml` → `required_variables`, realised in `color.css` and `font.css`; every artifact declares a mode | `SKILL.md:96-102` | `SKILL.md#Theme mode`, `SKILL.md#The inline variable contract` | kept |
| `site` mode: the route injects the resolved theme CSS; consume tokens; define no palette; re-themes live | `SKILL.md:104-112`, `references/publishing.md:81-92` | `SKILL.md#Theme mode`, `references/publishing.md#Site mode` | merged |
| `self` mode: served untouched; carry a complete theme system, light and dark | `SKILL.md:113-117`, `references/publishing.md:93-96` | `SKILL.md#Theme mode`, `references/publishing.md#Self mode` | merged |
| Set `artifact.theme` in the sidecar; default `self`; unknown values read as `self`; `site` is the opt-in | `SKILL.md:119-122` | `SKILL.md#Theme mode`, `references/publishing.md#The sidecar` | kept |
| Decide the mode by subject: data representation → `site`; UI/UX deliberation → always `self`, even when the target theme matches the site | `SKILL.md:124-141`, `references/design-systems.md:11-15` | `SKILL.md#Theme mode` | merged; the why sentence is cut |
| The token names are listed inline on purpose; values come from `agent-ks theme tokens --json` | `SKILL.md:143-154` | `SKILL.md#The inline variable contract` | merged: the names and the CLI verb are kept; the three reasons for listing inline are cut as argument; the coupling note holds the maintenance duty |
| The token name list | `SKILL.md:156-177` | `SKILL.md#The inline variable contract` | kept, names unchanged (50 of 50) |
| Coupling: the list mirrors `theme.yaml`; change both in the same edit, repo source and installed cache | `SKILL.md:179-181` | `SKILL.md#The inline variable contract` | kept |
| Self-mode naming: reuse the contract's names for covered roles; add a name only for a role beyond the contract | `SKILL.md:183-192`, `references/publishing.md:118-123`, `references/design-systems.md:112-114` | `SKILL.md#The inline variable contract` | merged |
| Validate every token you name; an unknown name with a hex fallback freezes and kills dark mode | `SKILL.md:194-197`, `references/publishing.md:152-160` | `SKILL.md#Never` | merged |
| Site mode: no ambient palette; a minimal neutral fallback per token for the no-host case; not the layouts no-fallback violation | `SKILL.md:205-212`, `references/publishing.md:98-104` | `references/publishing.md#Site mode` | merged |
| Site mode: local elemental colors for diagram content are the one exception; they hold on both surfaces and go in the sidecar | `SKILL.md:212-215`, `references/publishing.md:106-116` | `references/publishing.md#Site mode` | merged |
| Self mode: design both themes; define on `:root`, under the media query, and under both `data-theme` attributes; style through tokens | `SKILL.md:216-220`, `references/publishing.md:118-150` | `references/publishing.md#Self mode` | merged |
| The framework never applies `invert()`; `data-theme` is stamped (full page reads storage then OS; embed mirrors the parent on load and toggle) | `SKILL.md:221-224`, `references/publishing.md:77-79, 88-90` | `references/publishing.md#Theme modes` | merged |
| A single-theme artifact is legal only as a deliberate `self` commitment | `SKILL.md:225` | `SKILL.md#Never` | kept |
| Self-contained: CSS and JS inline; images as repo assets or data URIs; fonts as `.woff2` in repo assets; never an external script, stylesheet or font | `SKILL.md:226-234`, `references/publishing.md:168-177` | `SKILL.md#Never`, `references/publishing.md#Self-contained` | merged |
| Wide content scrolls inside its own `overflow-x: auto` box; the body never scrolls sideways | `SKILL.md:234-235`, `references/design-fundamentals.md:24-26`, `references/publishing.md:61-63` | `SKILL.md#Never`; pointers in `references/publishing.md#Sizing` and `references/design-fundamentals.md#Fundamentals` | merged |
| Gate 1: run the site; check full page and embed, both themes, both viewports; site mode re-themes in both surfaces | `SKILL.md:241-247`, `references/design-systems.md:186-187` | `references/publishing.md#Verify before you publish` | merged |
| Gate 2: Styled — every token resolves to its computed value; the font is the computed font | `SKILL.md:248-252`, `references/design-systems.md:176-178` | `references/publishing.md#Verify before you publish` | merged |
| Gate 3: Complete — nothing collapsed or overflowing; focus visible; reduced motion; charts pass; every declared state shown | `SKILL.md:253-255`, `references/design-systems.md:179-181` | `references/publishing.md#Verify before you publish` | merged |
| Gate 4: Plausible — real content; canonical example, variant sweep, static states | `SKILL.md:256-258`, `references/design-systems.md:182-184` | `references/publishing.md#Verify before you publish` | merged |
| Gate 5: Operable — exercise every interaction in the rendered page | `SKILL.md:259-262`, `references/design-systems.md:87-91` | `references/publishing.md#Verify before you publish` | merged |
| Gate 6: Sidecar honesty — every declared value appears in the HTML; the declared mode matches | `SKILL.md:263-268`, `references/publishing.md:237-241` | `references/publishing.md#Verify before you publish` | merged |
| The verify gate runs before an artifact is called done | `SKILL.md:239-240` | `SKILL.md#Never` | kept |
| Provenance: four upstream skills rewritten; `validate_palette.js` is the verbatim exception | `SKILL.md:270-277` | `SKILL.md` intro pointer, `references/PROVENANCE.md` | merged: the verbatim-copy statement lives in PROVENANCE.md |
| Fundamentals apply to every artifact after the treatment call; decide for this subject, never by default | `references/design-fundamentals.md:3-7` | `references/design-fundamentals.md#Fundamentals` | kept |
| Anchor to the subject: name the subject, the reader and the job; build from the subject's own territory | `references/design-fundamentals.md:11-15` | `references/design-fundamentals.md#Fundamentals` | kept |
| Neutrals are decisions; mid-grey by default is unchosen; white and near-black are fine when chosen; concerns `self` mode | `references/design-fundamentals.md:16-22` | `references/design-fundamentals.md#Fundamentals` | kept |
| Space with flex or grid plus `gap`, not per-element margins | `references/design-fundamentals.md:23-25` | `references/design-fundamentals.md#Fundamentals` | kept |
| Tabular figures for digit columns, not for big standalone numbers | `references/design-fundamentals.md:26-28`, `references/dataviz/marks-and-anatomy.md:83-86`, `references/dataviz/palette.md:186-188` | `references/dataviz.md#Figures` | merged |
| Output matches source: close every element, double-quote attributes, visible focus, reduced motion; Canvas or WebGL for generative graphics | `references/design-fundamentals.md:29-34` | `references/design-fundamentals.md#Fundamentals` | kept |
| Watch selector specificity so no rule cancels another rule's spacing | `references/design-fundamentals.md:35-38` | `references/design-fundamentals.md#Fundamentals` | kept |
| Copy: name things by what people do; active voice; a control states its effect; an error states what broke and what to do | `references/design-fundamentals.md:39-45` | `references/design-fundamentals.md#Copy` | kept |
| Structure tells the truth: a numbering or divider encodes a real property of the content | `references/design-fundamentals.md:46-50` | `references/design-fundamentals.md#Fundamentals` | kept |
| The user's named direction outranks every anti-generic rule | `references/design-fundamentals.md:54-57` | `references/design-fundamentals.md#The anti-generic rules` | kept |
| The nine default looks to avoid | `references/design-fundamentals.md:59-67` | `references/design-fundamentals.md#The anti-generic rules` | kept |
| No default look is banned; a subject that calls for one gets it deliberately | `references/design-fundamentals.md:69-70` | `references/design-fundamentals.md#The anti-generic rules` | kept |
| Scale execution to the vision; boldness at one point; pull a fighting accent toward an analogous hue, do not swap it | `references/design-fundamentals.md:72-77` | `references/design-fundamentals.md#The anti-generic rules` | kept |
| The editorial branch applies only on an editorial read, under the governor | `references/design-fundamentals.md:81-84, 106` | `references/design-fundamentals.md#Editorial branch` | kept |
| Commit to a tone; the tone menu; design a tone for this subject | `references/design-fundamentals.md:86-90` | `references/design-fundamentals.md#Editorial branch` | kept |
| Diverge between generations; never the same display face every time | `references/design-fundamentals.md:91-94` | `references/design-fundamentals.md#Editorial branch` | kept |
| A background can be atmosphere; texture only while it serves the tone; obey reduced motion | `references/design-fundamentals.md:95-99` | `references/design-fundamentals.md#Editorial branch` | kept |
| Open with a thesis; choreograph motion into one reveal; over-animation is a tell | `references/design-fundamentals.md:100-104` | `references/design-fundamentals.md#Editorial branch` | kept |
| Measure about 65 characters; commit to one type scale; semantic tokens in `site` mode, an own scale in `self` mode | `references/design-fundamentals.md:112-115` | `references/design-fundamentals.md#Typography` | kept |
| Pairing: a display face used sparingly, a body face, a utility face for data; balanced headings; spaced uppercase labels | `references/design-fundamentals.md:116-119` | `references/design-fundamentals.md#Typography` | kept |
| Font delivery: `.woff2` in repo assets, relative URL, no CDN; check the computed font | `references/design-fundamentals.md:120-124`, `references/publishing.md:186-191` | `references/publishing.md#Fonts` | merged |
| A UI is scanned, not read: summary before detail; form carries state; semantic color apart from the accent; interactive parts announce it | `references/design-fundamentals.md:128-136` | `references/design-fundamentals.md#When the artifact is a UI` | kept |
| Any chart, stat tile or meter routes into the dataviz procedure | `references/design-fundamentals.md:138-141` | `references/design-fundamentals.md#When the artifact is a UI` | kept |
| Process: no code before a plan of color, type and layout | `references/design-fundamentals.md:145-151` | `references/design-fundamentals.md#Process` | kept |
| Build from the plan; editorial addendum: revise any generic part before code | `references/design-fundamentals.md:153-158` | `references/design-fundamentals.md#Process` | kept |
| Real content only; curate before inventing; label fabricated values; canonical example, variant sweep, static states | `references/design-fundamentals.md:162-169` | `references/design-fundamentals.md#Realistic content` | kept |
| A design system is authored as artifact pages plus commentary that states explicit values | `references/design-systems.md:3-7` | `references/design-systems.md` intro | kept |
| Upstream doctrine origin note | `references/design-systems.md:8-9` | — | dropped: history; `PROVENANCE.md` holds it |
| A design-system artifact is always `self`; read the contract to start from its values, never to inherit | `references/design-systems.md:11-15` | `references/design-systems.md` intro | kept |
| The six parts of a consumable design system | `references/design-systems.md:19-30` | `references/design-systems.md#What a design system is` | kept |
| A Home B section is complete when it holds all six parts; the rubric gates done | `references/design-systems.md:32-33` | `references/design-systems.md#What a design system is` | kept |
| In flux → Home A; settled → Home B; graduate when the deliberation closes | `references/design-systems.md:37-39` | `references/design-systems.md#The two homes` | kept |
| Home A: thinking-artifacts in `brainstorm/` or `notes/`; several options with commentary and a recommendation; competing systems get separate artifacts; declare each option's sidecar; promote only when settled | `references/design-systems.md:41-56` | `references/design-systems.md#The two homes` | kept |
| Home B: an own `NN_` docs section; artifact pages interleaved with commentary pages; an agent reads the commentary, not the HTML; base URL outside the reserved set | `references/design-systems.md:58-67` | `references/design-systems.md#The two homes` | kept |
| A variation set is one artifact with 4–10 labeled options of one element; never one file per option | `references/design-systems.md:71-77` | `references/design-systems.md#Variation sets` | kept |
| Options carry decision furniture: real names, identity line, trade-offs; layout by count (2–3 visible, 4–6 switcher, 7–10 switcher with persisted selection) | `references/design-systems.md:81-86` | `references/design-systems.md#Variation sets` | kept |
| Options are operable, not mocked | `references/design-systems.md:87-91` | `references/design-systems.md#Variation sets` | kept |
| One shared realistic fixture; no greeked placeholders | `references/design-systems.md:92-98` | `references/design-systems.md#Variation sets` | kept |
| Built for the pick: comparison table, recommendation, optional vote with rationale; the decision graduates to notes or comments | `references/design-systems.md:99-104` | `references/design-systems.md#Variation sets` | kept |
| Variation-set sidecar keys: `type: "variation-set"`, `options`, `recommendation`, `decision` | `references/design-systems.md:115-117`, `references/publishing.md:231-235` | `references/publishing.md#The sidecar` | merged |
| The variation-set skeleton | `references/design-systems.md:119-135` | `references/design-systems.md#Variation sets` | kept |
| Conventions are written for an agent that cannot follow guidance that is absent | `references/design-systems.md:139-143` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Every sentence lets the reader act with zero guesswork; name the token | `references/design-systems.md:145-148` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Teach the system's own idiom with its real vocabulary; do not graft a foreign idiom | `references/design-systems.md:149-154` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Name where the truth lives: the source files to read before styling | `references/design-systems.md:155-158` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Include one idiomatic build snippet adapted from rendered code | `references/design-systems.md:159-160` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Validate every named token and component against what ships; fix or cut | `references/design-systems.md:161-167` | `references/design-systems.md#Conventions an agent can act on` | kept |
| Render and look; the validator checks color math, not layout | `references/design-systems.md:171-174` | `references/publishing.md#Verify before you publish` | merged |
| A Home B section passes the gate per page and as a whole: commentary declares every value, pointers resolve, inventory complete | `references/design-systems.md:188-190` | `references/design-systems.md#Verify a section` | kept |
| A short Playwright snippet against the route beats a heavier harness; no component-library sync pipeline | `references/design-systems.md:190-193` | `references/design-systems.md#Verify a section` | kept |
| This file teaches the authoring side; the loader and route belong to the framework | `references/publishing.md:3-7` | `references/publishing.md` intro | kept |
| Prefix policy: a missing `NN_` prefix is a warning, not an error; `assets/` is never scanned; the title derives from the filename | `references/publishing.md:22-27` | `references/publishing.md#Where an artifact lives` | kept |
| Update = edit the file and rebuild; history lives in git | `references/publishing.md:29-31` | `references/publishing.md#Where an artifact lives` | kept |
| The embed `src` is the route with a `?v=<mtime>` cache-buster | `references/publishing.md:49-53` | `references/publishing.md#The route and the embed` | kept |
| Affordances: the full-page link always ships; expand is secondary | `references/publishing.md:54-57` | `references/publishing.md#The route and the embed` | kept |
| Design for the embed width first (700–900px); test both sizes | `references/publishing.md:59-63` | `references/publishing.md#Sizing` | kept |
| Embed height: content height by default; top-level `embed_height` opts into a fixed box; full page is always full viewport; `vh` floors are neutralized in the embed | `references/publishing.md:65-73` | `references/publishing.md#Sizing` | kept |
| Query live values with `agent-ks theme tokens --json` | `references/publishing.md:90-92`, `references/dataviz/palette.md:32` | `references/publishing.md#Site mode`, `SKILL.md#The inline variable contract` | merged |
| Self mode: derive values from the contract where you want kinship; commit to your own world where that is the point | `references/publishing.md:93-96` | `references/palette.md#Two rules`, `references/design-systems.md` intro | merged |
| Self-containment is a policy, not a CSP; repo-relative references are allowed; the network boundary is hard | `references/publishing.md:164-177` | `references/publishing.md#Self-contained`, `SKILL.md#Never` | merged |
| CDN fonts are a documented, discouraged opt-out; a CSP header on the route is the enforcement option | `references/publishing.md:179-181` | `references/publishing.md#Self-contained` | kept |
| Trust: never paste untrusted third-party HTML into a section | `references/publishing.md:181-182` | `SKILL.md#Never` | kept |
| Fonts: `@font-face` with a relative URL; a fallen-back font is silent; prefer a system stack over a CDN | `references/publishing.md:186-191` | `references/publishing.md#Fonts`; the CDN ban is in `SKILL.md#Never` | merged |
| The sidecar is a same-name JSON file, never frontmatter in the HTML | `references/publishing.md:195-198` | `references/publishing.md#The sidecar` | kept |
| The sidecar mirrors the diagram sidecar's rendering fields and adds the artifact block | `references/publishing.md:197-198` | — | dropped: a cross-reference, not a rule; the docs skill's docs-layout.md owns diagram pages |
| Rendering fields: `title`, `description`, `sidebar_label`, `sidebar_position`, `draft`, `embed_height` | `references/publishing.md:200-209` | `references/publishing.md#The sidecar` | kept |
| The `artifact:` block is opaque passthrough except `artifact.theme`; this skill owns its keys | `references/publishing.md:211-215` | `references/publishing.md#The sidecar` | kept |
| Standard keys: `purpose`, `type`, `theme`, `palette`, `data`, `interactions`, `sources` | `references/publishing.md:217-225` | `references/publishing.md#The sidecar` | kept |
| The block is open for extra declared values; keep the standard keys | `references/publishing.md:227-229` | `references/publishing.md#The sidecar` | kept |
| A sidecar is encouraged for every artifact and mandatory for a design-system artifact | `references/publishing.md:237-239` | `references/publishing.md#The sidecar` | kept |
| Reuse a family's declared palette and typography for a companion artifact | `references/publishing.md:243-247` | `references/publishing.md#The sidecar` | kept |
| The canonical sidecar example | `references/publishing.md:253-271` | `references/publishing.md#The sidecar` | kept, shortened to the standard keys |
| Two live examples in the framework docs | `references/publishing.md:273-276` | `references/publishing.md#The sidecar` | kept, paths corrected to `20_examples/03_…` and `04_…` |
| `artifacts` is a reserved base URL; the guard is a hard config error | `references/publishing.md:280-285` | `references/publishing.md#Where an artifact lives`; full set in `agent-ks-docs/references/settings-layout.md` | merged |
| Open the dataviz procedure when plotted data appears; the procedure replaces taste with machine checks | `references/dataviz/00_overview.md:3-7` | `references/dataviz.md` intro | kept |
| The method is system-agnostic; a design system supplies parameters; `palette.md` is the filled-in file | `references/dataviz/00_overview.md:8-14, 85-103` | `references/dataviz-color.md#What a design system plugs in` | merged |
| Palette safety is arithmetic; the validator decides CVD safety | `references/dataviz/00_overview.md:16-20`, `references/dataviz/anti-patterns.md:25-27` | `SKILL.md#Never`, `references/dataviz.md#The procedure` | merged |
| Color comes last | `references/dataviz/00_overview.md:22-24` | `references/dataviz.md#The procedure` | kept |
| The seven steps in order | `references/dataviz/00_overview.md:26-55` | `references/dataviz.md#The procedure` | kept |
| Finish with the audit; a match means the chart is wrong | `references/dataviz/00_overview.md:57-58`, `references/dataviz/anti-patterns.md:3-5` | `references/dataviz.md#The procedure`, step 7 | merged |
| Each anti-pattern was caught in a shipping dashboard | `references/dataviz/anti-patterns.md:4-5` | — | dropped: argument, not a rule |
| Categorical hues keep a frozen order; never wrap; a ninth series goes to Other, small multiples or a second channel | `references/dataviz/00_overview.md:62-64`, `references/dataviz/choosing-a-form.md:65-67`, `references/dataviz/anti-patterns.md:20-23` | `references/dataviz-color.md#The color jobs`, `#Pick the job`, `#Series ladder` | merged |
| One axis per plot; no dual y-scale; use two charts, small multiples or an index | `references/dataviz/00_overview.md:65-67`, `references/dataviz/anti-patterns.md:9-13` | `references/dataviz.md#The procedure` | merged |
| A hue belongs to its entity, not its position; a filter leaves survivors' colors | `references/dataviz/00_overview.md:68-69`, `references/dataviz/anti-patterns.md:15-18` | `references/dataviz-color.md#Pick the job` | merged; written in this session |
| Magnitude is one hue light to dark; polarity is two opposing hues with a neutral middle; no rainbow; the middle is never a hue | `references/dataviz/00_overview.md:70-72`, `references/dataviz/anti-patterns.md:36-43` | `references/dataviz-color.md#The color jobs`, `#Pick the job` | merged |
| A multi-hue sequential is allowed only for analogous neighbours or a semantic heat scale, with a scale legend | `references/dataviz/anti-patterns.md:37-38` | `references/dataviz-color.md#Pick the job` | kept; written in this session |
| No categorical palette ships unvalidated; CVD ≥ 12; 8–12 only with a secondary encoding; a contrast WARN forces labels or the table view | `references/dataviz/00_overview.md:73-75`, `references/dataviz/color-formula.md:72-75` | `references/dataviz-color.md#The six checks`, `#Run the validator` | merged |
| Slim marks; a legend at two or more series, never for one; rationed labels; quiet grid | `references/dataviz/00_overview.md:76-77`, `references/dataviz/marks-and-anatomy.md:34-38` | `references/dataviz.md#Marks`, `#Labels and legend` | merged |
| Text is inked with text tokens, never a series hue; the colored mark beside the text identifies; a label inside a fill flips by luminance | `references/dataviz/00_overview.md:78-80`, `references/dataviz/marks-and-anatomy.md:57-63` | `references/dataviz-color.md#Ink` | merged |
| The status scale is off-limits to ordinary series; status always travels with an icon and a label | `references/dataviz/00_overview.md:81-83`, `references/dataviz/color-formula.md:106-114`, `references/dataviz/anti-patterns.md:45-47`, `references/dataviz/palette.md:119-122` | `references/dataviz-color.md#Status` | merged |
| The reference-file index | `references/dataviz/00_overview.md:105-117` | — | dropped: the files are merged; the section headings replace the index |
| Form first; the job picks the type; "not a chart" is always an option | `references/dataviz/choosing-a-form.md:3-6` | `references/dataviz.md#Choose the form` | kept |
| First gate: stat tile, KPI row, hero number, meter, table | `references/dataviz/choosing-a-form.md:13-19`, `references/dataviz/anti-patterns.md:55-56, 62-63` | `references/dataviz.md#Choose the form` | merged |
| Second gate: reader task → form → color job | `references/dataviz/choosing-a-form.md:27-36` | `references/dataviz.md#Choose the form` | kept |
| Default to sequential; step off only for identity or polarity | `references/dataviz/choosing-a-form.md:40-42` | `references/dataviz-color.md#Pick the job` | kept |
| Categorical only when the series are the story; "this series climbed" is emphasis | `references/dataviz/choosing-a-form.md:43-46`, `references/dataviz/anti-patterns.md:51-53` | `references/dataviz-color.md#Pick the job` | merged |
| Emphasis: one series in the accent, the rest in gray | `references/dataviz/choosing-a-form.md:47-49` | `references/dataviz.md#Choose the form`, `references/dataviz-color.md#Pick the job` | kept |
| Texture is opt-in for CVD, print and forced-colors; never a starting form | `references/dataviz/choosing-a-form.md:50-52`, `references/dataviz/marks-and-anatomy.md:90-97`, `references/dataviz/palette.md:140-145`, `references/dataviz/anti-patterns.md:101-104` | `references/dataviz-color.md#Texture` | merged |
| The series ladder: 1–3, 4, 5–6, 7–8 | `references/dataviz/choosing-a-form.md:58-63` | `references/dataviz-color.md#Series ladder` | kept |
| No hand-picked chart color; each color holds one job; no palette is legal before the checks | `references/dataviz/color-formula.md:3-6` | `references/dataviz-color.md` intro | kept |
| The five jobs table: categorical, ordinal, sequential, diverging, status | `references/dataviz/color-formula.md:10-16` | `references/dataviz-color.md#The color jobs` | kept |
| Categorical versus ordinal: reorder changes meaning → ordinal ramp; nominal → slot-1 hue for one series, slots 1..N for N; never shade nominal bars by value | `references/dataviz/color-formula.md:18-25`, `references/dataviz/anti-patterns.md:29-34` | `references/dataviz-color.md#The color jobs` | merged |
| The six checks with their thresholds | `references/dataviz/color-formula.md:29-49` | `references/dataviz-color.md#The six checks` | kept |
| Run the validator: the command, the flags, the in-page module mode | `references/dataviz/color-formula.md:53-62`, `references/dataviz/00_overview.md:34-39` | `references/dataviz-color.md#Run the validator` | merged |
| Results: PASS, WARN, FAIL; exit codes; one run per mode; `--pairs all`; `--ordinal` ramp checks | `references/dataviz/color-formula.md:64-70` | `references/dataviz-color.md#Run the validator` | kept |
| The validator names the worst CVD pair in its output | `references/dataviz/color-formula.md:64-65` | — | dropped: describes the tool's output, not a rule |
| Scope: categorical only; status or text color → WCAG text contrast via `contrast()`; a ramp → monotone lightness; the categorical checks fail a ramp on purpose | `references/dataviz/color-formula.md:77-85` | `references/dataviz-color.md#Scope of the checks` | kept |
| Snap to passing: three steps | `references/dataviz/color-formula.md:89-96` | `references/dataviz-color.md#Snap to passing` | kept |
| Slot order is a named theme; one per surface, locked; find it by scoring candidate orderings | `references/dataviz/color-formula.md:100-104`, `references/dataviz/palette.md:79-82` | `references/dataviz-color.md#Slot order` | merged |
| Mark specs table | `references/dataviz/marks-and-anatomy.md:8-14`, `references/dataviz/anti-patterns.md:67-74` | `references/dataviz.md#Marks` | merged |
| The two spacers: 2px surface gap, 2px surface ring; no borders | `references/dataviz/marks-and-anatomy.md:18-30`, `references/dataviz/anti-patterns.md:81-82` | `references/dataviz.md#Marks` | merged |
| Ration labels; order of resort; measure before placing; never clip | `references/dataviz/marks-and-anatomy.md:40-51`, `references/dataviz/interaction.md:39-42`, `references/dataviz/anti-patterns.md:76-79, 84-87` | `references/dataviz.md#Labels and legend` | merged |
| Value placement: tip, cap, end; tidy y ticks with separators | `references/dataviz/marks-and-anatomy.md:52-56` | `references/dataviz.md#Labels and legend` | kept |
| Colliding end labels: leader lines, small multiples, or legend plus tooltip | `references/dataviz/marks-and-anatomy.md:64-67` | `references/dataviz.md#Labels and legend` | kept |
| Stat tile fields: label, value, delta, trend | `references/dataviz/marks-and-anatomy.md:71-76` | `references/dataviz.md#Figures` | kept |
| Meter: severity in the fill; the empty track is a paler step of the same ramp | `references/dataviz/marks-and-anatomy.md:77-79`, `references/dataviz/components.md:34-35` | `references/dataviz.md#Figures` | merged |
| Hero figure: ≥ 48px, the body sans, one per view | `references/dataviz/marks-and-anatomy.md:80-82`, `references/dataviz/anti-patterns.md:93-94`, `references/dataviz/palette.md:183-185` | `references/dataviz.md#Figures` | merged |
| Tier 0 parts: color roles as custom properties, texture, container with table-view toggle, legend, tooltip, axis, label | `references/dataviz/components.md:11-25` | `references/dataviz.md#Components` | kept |
| A fixed container height must include the axis band | `references/dataviz/components.md:20-23`, `references/dataviz/anti-patterns.md:89-91` | `references/dataviz.md#Components` | merged |
| Tier 1 and Tier 2 parts | `references/dataviz/components.md:29-42` | `references/dataviz.md#Components` | kept |
| System tier: validator, snapping, form heuristic, table-view generator | `references/dataviz/components.md:46-52` | — | dropped: these are the sections of `dataviz.md` and `dataviz-color.md`; the table-view rule is in `dataviz.md#The procedure` |
| Scatter earns a Tier 2 seat only when scatter-heavy surfaces arrive | `references/dataviz/components.md:56-57` | — | dropped: a backlog note, not a rule |
| Every chart has a table-view twin | `references/dataviz/components.md:52`, `references/dataviz/anti-patterns.md:122-123` | `references/dataviz.md#The procedure` | merged |
| Stacked bar owns part-to-whole; donut is last; small multiples is layout; pie only at a glance and up to six segments | `references/dataviz/components.md:54-57`, `references/dataviz/anti-patterns.md:58-60` | `references/dataviz.md#Components` | merged |
| Hover ships with the chart; the bare stat tile is the exception | `references/dataviz/interaction.md:3-5`, `references/dataviz/00_overview.md:44-47` | `references/dataviz.md#Tooltips and hover` | merged |
| A tooltip supplements, never gates; keyboard focus reveals what hover does | `references/dataviz/interaction.md:9-11`, `references/dataviz/anti-patterns.md:108-110` | `references/dataviz.md#Tooltips and hover` | merged |
| Crosshair on X for line and area; per-mark tooltip for bars and cells; one tooltip lists every series | `references/dataviz/interaction.md:13-22` | `references/dataviz.md#Tooltips and hover` | kept |
| Names are untrusted input; write them with `textContent`, never `innerHTML` | `references/dataviz/interaction.md:23-26` | `SKILL.md#Never`, `references/dataviz.md#Tooltips and hover` | kept |
| Tooltip row: value first, name second; a stroke marks the series; legends echo the mark | `references/dataviz/interaction.md:27-33` | `references/dataviz.md#Tooltips and hover` | kept |
| Targets outsize marks: 24px minimum; nearest-point layer for crowded scatter | `references/dataviz/interaction.md:34-38`, `references/dataviz/anti-patterns.md:112-114` | `references/dataviz.md#Tooltips and hover` | merged |
| Filters are UI furniture; one left-aligned row above every chart; date range first with presets; everything below shares the slice; a refetch dims, never a skeleton | `references/dataviz/interaction.md:46-58`, `references/dataviz/anti-patterns.md:116-120` | `references/dataviz.md#Filters` | merged |
| Date picker spec: presets as rows, a 16px check, a faint hover wash, custom range under a hairline; a dimension filter is a combobox | `references/dataviz/interaction.md:60-63`, `references/dataviz/palette.md:174-179` | `references/palette.md#Other parameters` | merged |
| Surfaces and ink come from the theme contract; never re-declare them as fresh hex | `references/dataviz/palette.md:6-12` | `references/palette.md#Two rules` | kept |
| Only the categorical, sequential and diverging slots are own values, validated on the framework's surfaces | `references/dataviz/palette.md:13-18` | `references/palette.md#Two rules` | kept, origin note dropped as history |
| Retarget a theme by editing this file and re-running the validator | `references/dataviz/palette.md:20-22` | `references/palette.md#Two rules` | kept |
| Consume the values as CSS variables in the chart's style block; the body references roles | `references/dataviz/palette.md:26-50`, `references/dataviz/components.md:11-15` | `references/palette.md#Consume the values` | merged |
| The categorical table; dark re-steps the same hues | `references/dataviz/palette.md:54-66` | `references/palette.md#Categorical palette` | kept |
| Results on this framework's surfaces (light 24.2, four relief slots; dark 10.3) | `references/dataviz/palette.md:68-77` | `references/palette.md#Categorical palette` | kept, re-verified with the validator in this session |
| Sequential: blue ramp; a second sequential context takes the next slot's hue | `references/dataviz/palette.md:86-88` | `references/palette.md#Sequential ramp` | kept |
| The ramp table 100–700 | `references/dataviz/palette.md:90-96` | `references/palette.md#Sequential ramp` | kept |
| Sequential uses the whole span; ordinal floors: step 300 on light, step 600 on dark; ΔL ≥ 0.06 | `references/dataviz/palette.md:98-107` | `references/palette.md#Sequential ramp` | kept, plus the verified fact that 50-steps are about 0.05 apart |
| Diverging blue↔red; the middle is `--color-bg-tertiary`; equal arms; blue↔aqua fails | `references/dataviz/palette.md:111-115` | `references/palette.md#Diverging pair` | kept |
| The status table with contrast figures; warning is under 3:1 on light by design; no serious tier token | `references/dataviz/palette.md:124-136` | `references/palette.md#Status palette` | kept |
| Surfaces: `#f5f5f5` and `#171717` from `--color-bg-secondary`; validate against the surface the chart sits on | `references/dataviz/palette.md:149-156` | `references/palette.md#Chart chrome and ink` | kept |
| Chart chrome and ink table | `references/dataviz/palette.md:160-170` | `references/palette.md#Chart chrome and ink` | kept |
| Chart text is `--font-family-base` | `references/dataviz/palette.md:183-185` | `references/palette.md#Other parameters` | kept |
| The "Lines" texture fill parameter | `references/dataviz/palette.md:140-141` | `references/palette.md#Other parameters` | kept |
| Provenance record | `references/PROVENANCE.md` | `references/PROVENANCE.md` | kept, byte copy |
| The palette validator | `scripts/validate_palette.js` | `scripts/validate_palette.js` | kept, byte copy |

## Files

All under `plugins/agent-ks-temp/skills/agent-ks-artifacts/`. Counts are `wc -l` and `wc -w`. Limits: `SKILL.md` 600 words; a reference 150 lines and 1,500 words.

| File | Lines | Words | Limit check |
|---|---|---|---|
| `SKILL.md` | 63 | 596 | pass |
| `references/design-fundamentals.md` | 110 | 1,290 | pass |
| `references/design-systems.md` | 90 | 1,165 | pass |
| `references/dataviz.md` | 107 | 1,488 | pass |
| `references/dataviz-color.md` | 118 | 1,457 | pass |
| `references/palette.md` | 117 | 1,227 | pass |
| `references/publishing.md` | 138 | 1,485 | pass |
| `references/PROVENANCE.md` | 27 | 279 | byte copy |
| `scripts/validate_palette.js` | — | — | byte copy |

The dataviz split is `dataviz.md` (procedure, form, marks, labels, figures, components, tooltips, filters) plus `dataviz-color.md` (color jobs, checks, validator, snapping, slot order, series ladder, status, ink, texture, design-system parameters). The spec allows this split. `palette.md` stays its own file because section 3 lists it.

## Constraint evidence

Inline variable contract. A script extracted every backticked token from the contract section of both `SKILL.md` files (old: "The inline variable contract" to "Self-mode naming preference"; new: the whole section). Old: 50 names. New: 50 names. Only in old: none. Only in new: none. The list is unchanged: the 14 colors, the 8 issue-status tokens, the 3 `--ui-text-*`, the 9 `--content-*`, `--display-sm`/`-md`, the 2 font families, `--line-height-base`, `--font-weight-normal`, the 7 spacing steps, the 4 radii, the 4 shadows, the 2 transitions, the 5 layout dimensions.

`PROVENANCE.md`. `sha256sum` of both files: `4704c9f0964a1de2c478db6a4aaf296626520c24a5f99dc43b89bfaa6c69bf71`. Identical.

`validate_palette.js`. `sha256sum` of both files: `a0c88cf554efc782b481d24f6933565d5909fcd817711377ca4422e2db819791`. Identical.

Palette figures re-run with the copied validator from `references/`. Light categorical: worst adjacent ΔE 24.2, four slots under 3:1 (aqua 2.58, yellow 1.99, magenta 2.47, orange 2.94), exit 0. Dark categorical: worst adjacent ΔE 10.3, all eight over 3:1, exit 0. Ordinal ramp at every 50-step: adjacent ΔL 0.046–0.049, FAIL, so every second step is the rule. Ordinal ramp from step 300 at every second step: all four checks PASS, light end 2.30:1.

Framework facts added to `publishing.md` that the old files lack, each verified in code: the slug-collision error and the `allow_artifact_pages: false` opt-out (`astro-doc-code/src/loaders/artifact-pages.ts:34-37, 209-210`); the reserved base URL set (`astro-doc-code/src/loaders/config.ts:413`).

## Self-check

| Check | Method | Result |
|---|---|---|
| STE sentence length | Script: split prose and table cells on sentence ends, flag over 20 words | 0 flagged after 19 fixes |
| Lists and headings | Script: no list over 7 items, no heading deeper than `###` | 0 flagged |
| Size limits | `wc -l`, `wc -w` against the section 5 table | all pass; see Files |
| Links | Script: resolve every relative link and every `#anchor` against the target's headings | 0 broken across 7 files, including the cross-builder links to `agent-ks-cli`, `agent-ks-docs`, `agent-ks-issues` |
| History words | `grep -i` for used to, earlier, retired, no longer, now, previously, formerly, legacy | none in any `.md` |
| Harvest | Every row has a home or a reason | 6 rows added this session; 14 homes corrected (the previous session's `dataviz.md#Invariants` and `#Audit` sections do not exist) |

## Dropped rules

| Rule | Reason |
|---|---|
| Upstream doctrine origin note in design-systems.md | history; PROVENANCE.md holds it |
| The dataviz reference-file index | the files are merged; headings replace it |
| The System tier of components.md | those are the sections of the two dataviz files |
| Scatter earns a Tier 2 seat only when scatter-heavy surfaces arrive | a backlog note, not a rule |
| The sidecar mirrors the diagram sidecar | a cross-reference; docs-layout.md owns diagram pages |
| Each anti-pattern was caught in a shipping dashboard | argument |
| The validator names the worst CVD pair | tool output, not a rule |
| "The references are independent" | false after the merge; the three dataviz files link to each other |

## Decisions

- Decided (artifacts builder, 2026-09-03): two-fact tables in `dataviz.md` and `publishing.md` became bold-lead lists. Reason: `wc -w` counts every table pipe as a word, and the spec reserves tables for rows with three or more facts. Three-fact tables stay tables.
- Decided (artifacts builder, 2026-09-03): the two live-example paths in `publishing.md` stay backticked, not linked. A relative link from the plugin folder into `default-docs/` is false in a consumer install, where the plugin lives in the plugin cache.
- Decided (artifacts builder, 2026-09-03): the SKILL.md Provenance section became a one-link pointer in the intro. The verbatim-copy statement lives in `PROVENANCE.md`.
- Decided (artifacts builder, 2026-09-03): argument sentences were cut to meet the limits; every rule kept its home. Cut examples: the three reasons for listing the token names inline, the "why" behind `self` for design artifacts, the second CDN why (dead CDN on a mirror), the "a lying sidecar is worse than none" line.

## Open questions

- Spec section 3 says `dataviz.md` is "the eight dataviz files merged" and also lists `palette.md` as its own file. The tree wins here: `palette.md` stays separate. Confirm.
- Word limits were measured with `wc -w`, which counts table pipes. `SKILL.md` is at 596 of 600. A reviewer who counts differently gets a different margin.
- `design-fundamentals.md`, `design-systems.md`, `palette.md` and `dataviz-color.md` still hold two-column rule tables. They are inside their limits, so they were left as the previous session wrote them. Say if they should become lists for consistency.
