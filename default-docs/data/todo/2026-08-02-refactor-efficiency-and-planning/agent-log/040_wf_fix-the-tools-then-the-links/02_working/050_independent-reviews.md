---
title: "Independent reviews"
status: done
agent: claude
---

# Goal

Get the run reviewed by agents that did not write it — **required, not optional**,
because the run edited standing instructions: both `SKILL.md` files, two skill
reference files, the bundled `guide.ts`, and the project `CLAUDE.md`.

The rule (`~/.claude/references/writing-claude-md.md`) is that a change to
standing instructions is not final until independently reviewed by more than one
agent, none of which wrote it, and that reviews merge as a **union, not a vote**.
**It did not fire during the run.** Sid asked for it afterwards.

# Inputs

- The run under review: commits `e969982..bf0099c`
- Two reviewers, on deliberately different lenses:
  - **Opus**, in-harness — do the instruction surfaces agree with each other and
    with the code
  - **Codex `gpt-5.6-sol`**, external, `xhigh`, read-only — link correctness and
    whether the 129 conversions preserved meaning. Chosen because it **executes**
    rather than reads, and reading does not catch off-by-one bugs

# Expected Outcome

Every finding recorded as the reviewer stated it, before any of it is argued
with or fixed. Merge as a union: one reviewer finding something is a finding.

# Outcome

**Opus: complete, and nothing was clean — all three concerns produced findings.**
**Codex: still running at the time of writing.**

Recorded below as reported. **Nothing has been fixed and nothing has been
disputed yet** — Sid asked to have both audits in hand before discussing them.

> [!CAUTION]
> **Retracted 2026-08-03 — the finding below is wrong, and both reviewers held
> it.** Sid clicked fifteen tracker links on the dev server; twelve opened the
> right page, including every within-tracker shape this section says is broken.
> Record: [`110`](../../../subtasks/100_link-integrity/110_live-check.md).
>
> **The tracker needs no shift, because its pages are served without a trailing
> slash** — the browser already resolves `./x` against the parent — **and its
> URLs keep their `NN_` prefixes**, so source path and URL path are the same
> string. The reproduction below reads the *built* site, which adds the trailing
> slash; the dev server does not. That gap is the real defect, written up as
> [`120`](../../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md),
> and it means the docs shift shipped in this run is wrong in dev.
>
> **The process lesson is sharper than the technical one.** This was the one
> finding both reviews reached independently, and that agreement is what made it
> feel settled. It should not have: both reasoned over the same `dist/` tree and
> the same `contentType` gate, and **neither opened a URL.** Two methods that
> share an assumption are one method. What settled it cost fifteen clicks.

## The finding that matters most

### 🔴 ~~The new tracker rule mandates a link form that 404s in the tracker today~~ — retracted, see above

`guide.ts:152` · `agent-ks-issues/SKILL.md:377-383` ·
`10_writing.md:117-124`

All three now state that every reference to a tracker page is a relative
markdown link, never a leading `/`, with no second option. **The issues pipeline
has the same off-by-one that was just fixed for docs, unfixed.**
`internal-links.ts` applies the depth shift only when `contentType === 'docs'`,
and `IssuesParser` constructs with `super('blog')`, so sub-doc pages get no
shift. Reproduced against the built site:

```
page  dist/todo/…/subtasks/100_link-integrity/010_renderer-drops-a-url-level/index.html
href  ./030_user-guide-relative-links-404
→     /todo/…/010_renderer-drops-a-url-level/030_user-guide-relative-links-404   ← no such directory
```

`issue-body-links.ts:12-14` carries a comment asserting the opposite — that
sub-doc relative links *"already resolve correctly"* — and it is false for the
same reason.

**And the gate written in the same run contradicts the rule outright.**
`check-link-form.mjs:25-30` says converting a tracker link to relative *"before
that is settled could swap a working link for a broken one."* The skills say
always; the tool says do not. An author following the skill produces a broken
link that no default gate reports, because both gates exclude `todo/`.

> This is the run's own named defect, committed inside the change that was
> supposed to remove it: **a rule that returns a plausible result when obeyed.**

### 🔴 The rule forbids the only correct form for shared-asset links

`docs-layout.md:207-211` (the form table: `/x` → "nothing internal") ·
`agent-ks-docs/SKILL.md:75`

`references/writing.md:82-85` — the same skill — **requires** the absolute form
for the shared `assets/` folder, and `_links.mjs:28` agrees in code
(`// site-absolute (incl. /assets/)`). Three things written this run do not:

| Where | What it does |
|---|---|
| `check-link-form.mjs:81` | skips images but **not** `[Download the spec](/assets/…)` — fails an author who followed `writing.md` |
| `move.mjs:246-253` | no `bang` filter, so `![Logo](/assets/logo.png)` is reported as unmaintained with **advice that breaks the link** |
| `docs-layout.md` table | says the absolute form is for "nothing internal", which is not true |

Latent today — **measured: 0 such links in `default-docs/data`**, which is why
both gates are green. It fires on the first consumer who follows `writing.md`.

## The rest, as reported

| | Finding | Where |
|---|---|---|
| 🟡 | A published page still recommends the forbidden form — *"cross-links are usually maintained at the URL level (`/todo/<id>#goal`)"*. Untouched by the run while 16 sibling pages were edited | `user-guide/19_issues/05_sub-docs/01_issue-md.md:70` |
| 🟡 | *"No cross-section exception"* was proven **within one content root** and generalised to cross-root. The 7 cross-root links created this run resolve only because every data folder here happens to be named like its `base_url`; a consumer with `base_url: "/internals"` gets a 404, and the rule forbids the fix. `move` handles them correctly — the claim is right about maintenance and unverified about rendering | `docs-layout.md:215`, `subtasks/…/020` |
| 🟡 | *"Ordering prefixes are stripped from URL slugs"* is **false for the tracker** — `issues.ts:1275` keeps the prefix, verified in `dist/`. Pre-existing, but it sits in the bullet list that was rewritten | `10_writing.md:135-136` |
| 🟡 | **Overclaim:** the plan says the backticked-path rule is "live on every surface". It is on the three *tracker* surfaces only. And the docs skill does not follow it — 12 backticked `references/…` paths against 1 markdown link | `plans/…/overview.md`, `agent-ks-docs/SKILL.md` |
| 🟡 | The 341-link incident is narrated **inside a skill**, which this project's `CLAUDE.md` forbids: *"skills are lean and history-free… delete the historical aside"*. The tracker already holds it in more detail | `docs-layout.md:220-222`, `:263-265` |
| 🟡 | One mechanical fact — `move` skips `/` targets — is now asserted in 11 places. `_links.mjs:28` is the one line that decides it; the prose copies cannot know when it changes | across the surfaces |
| 🟢 | `guide.ts` states the exception one clause narrower than the skill (omits "a path discussed as a value"). Otherwise the twins agree | `guide.ts:152-157` |

**Minor, and mine:** `subtasks/100_link-integrity/020_…` reads `status: review`
with an Outcomes section saying "Done", while **every box in its Todo list is
unticked**. Every sibling record ticked theirs.

**One boundary leak worth keeping:** the stated exception — *a file with nothing
to link to* — literally covers skill `.md` files, which are outside the site.
They must be relative links, which is what `agent-ks check skill-links` exists to
protect. Applying the exception literally there would be sanctioned and wrong.

## What the review confirmed rather than found

Stated because *nothing reported and nothing run means not reviewed* — and
because a review that only finds faults is not a measurement.

- **Every count independently reproduced.** 134 site-absolute occurrences removed
  across `data/`, 1 remaining outside the tracker (the fenced example), 2 real
  ones inside it — matching the record's 115→1 / 19→0 / 3→2 table and the
  129 + 5 + 2 + 1 = 137 accounting.
- **Both gates re-run and green** by the reviewer, not just by me: content-links
  173 pages / 15,585 links; link-form 568 links / 161 files.
- **The four "NOT DONE" items were read as honest** rather than smoothed over.
  Exactly one overclaim was found in the whole record.

---

# Codex `gpt-5.6-sol` — the executing review

**Complete after 18 minutes. Five findings, and it independently reproduced the
one Opus found first.**

**This is why an executing reviewer was required.** Four of its five findings are
things reading cannot reach — they came from running the renderer against a
matrix of link shapes, from parsing the built HTML with a real parser rather than
grep, and from synthetic fixtures fired at both new gates.

## What it ran, and the one limitation it declared

`./start build` **failed** in its sandbox — Astro hit `EROFS` writing
`.astro/content.d.ts`, so **it did not build fresh.** It used the existing
`dist/`, and checked that dist was generated ~20 seconds before the HEAD commit
— so the artefact it read does correspond to the code under review. Stated here
because a review whose build failed is a review with a bound on it.

Everything else it executed: both gates, both with `--all`; section-specific
runs; direct renderer matrices for docs, nested and root index pages, blog and
page contexts, assets, query strings, URI schemes, diagram pages and hypothetical
base URLs; a full before/after comparison of all 129 conversions; and false-pass
fixtures for both new reports. Final `git status` clean — no writes.

## 🔴 1 — Same critical finding, independently reproduced

Identical diagnosis to Opus, reached separately: `internal-links.ts` shifts only
`docs`; `IssuesParser` identifies as `blog`; the new tracker rule therefore
mandates links the tracker renderer breaks.

Its measurement: **`check-content-links.mjs --all --json` → 1,410 errors.** *"The
default gates hide this by excluding trackers."*

> **Two independent reviewers, two methods, one conclusion.** This is not a
> judgement call.

## 🔴 2 — The link-form gate passes 306 links it claims are maintainable

**The gate does not check what it says it checks.** It rejects a leading `/` and
nothing else. But `move.mjs` resolves link targets as **real filesystem paths**,
so an extensionless slug-form link is no more maintainable than an absolute one.

In the real non-tracker tree:

| Shape | Count | `move` can maintain it? |
|---|---:|---|
| resolves to a real `.md`/`.mdx` source file | 238 | yes |
| **extensionless URL-form (`./overview`)** | **306** | **no — no such filesystem target** |
| resolves to a real non-markdown file | 1 | n/a |

Control-tested: `[target](./target)` pointing at `02_target.md` →
`check-link-form` exits 0 *"all checks passed"*, and a dry-run move of
`02_target.md` reports *"No link edits needed."*

**So the rule as enforced is weaker than the rule as written.** `docs-layout.md`
does say *"write the path, not the URL — link the source file rather than its
published slug"*, and that half is correct and unenforced. The majority of
accepted page links violate it.

## 🔴 3 — "Broken in-body links: 0" is true only for path existence

The checker discards fragments (`.pathname`), so **anchors are never checked.**
Parsing the actual markdown-body containers found **four broken anchors**:

- `user-guide/20_custom-pages/01_overview.md:33` — `#home`, `#info`,
  `#countdown`; the built IDs are `customhome`, `custominfo`, `customcountdown`
- `user-guide/25_themes/04_tokens/05_layout-dimensions.md:156` —
  `#variables-the-framework-uses-but-doesnt-require`; the generated ID contains
  `doesn39t`

**And the headline count I quoted is inflated.** The extraction regex selects the
outer `<main>`, so repeated sidebars are counted. Real markdown-body anchors:
**569**, not 15,585. All 569 destination paths exist; four fragments do not.

> The direction of "418 → 0" holds. **The denominator I reported it against does
> not**, and "0 broken" means "0 broken paths", not "0 broken links".

## 🟡 4 — The renderer still fails several edge shapes

Found by running the processor directly, not by reading it. Correct: bare
`sibling.md`, `./sibling.md`, pure anchors, cross-folder links, `./folder/index.md`,
root-level `index.md`, `./asset.pdf`, `./asset.pdf#page=2`.

Wrong:

| Input | Produces | Should |
|---|---|---|
| nested bare `index.md` | `../index` | address the containing folder index |
| `./asset.pdf?download=1` | shifted to `../asset.pdf?…` | be skipped — the query defeated my extension test |
| `./page.md?x=1` | shifted, **keeps `.md`** | strip the extension |
| `mailto:guide.md` | rewritten as a page path | be left alone |
| blog sibling links | no shift, date prefix kept | resolve — a synthetic sibling resolved *underneath* the current post |
| **`./05_mermaid-full-page.mmd`** | left unchanged → 404 | be treated as a page — `diagram-pages.ts:95` declares these extensions **page types** |

The last one is mine directly: my non-markdown skip is too broad. Diagram files
are first-class pages in this framework, and I classified them as assets.

## 🟡 5 — Both new reports have false passes *and* a false failure

| Case | Behaviour |
|---|---|
| `[x](/missed "title")` — titled markdown link | **missed**, gate exits 0 |
| `<a href="/raw">` — raw HTML | **missed** |
| markdown link inside an HTML comment | **falsely reported** — the renderer emits no anchor |
| `[Download](/assets/spec.pdf)` — the form `writing.md` requires | **fails the gate** |
| `![Logo](/assets/logo.png)` | `move` calls it unmaintained and advises a rewrite that **breaks it** |

The last two are the same defect Opus found from the other direction.

## The conversion audit — the part that came back clean

**All 129 checked individually, not sampled:**

- every one resolves to the **same published pathname as before**
- every source target exists; every destination page exists in `dist`
- all six converted fragments exist
- 128 expected hrefs present in the source-page HTML; the 129th is deliberately
  inside a fenced example

**One correction to my wording:** the claim should say **129 converted**, not
137. 137 was the inventory; 129 was the conversion. Commit `73ea791` contains
exactly 129 target changes across 43 files.

**And it confirmed Opus's cross-root concern by testing it:** six conversions
cross between `user-guide` and `dev-docs`. A hypothetical `/internals` base-url
test still emitted `/user-guide/…` — *"these cross-section links are therefore
not portable to independently named section URLs."*

---

# Where the two reviews agree, and where only one saw it

| Finding | Opus (reads) | Codex (executes) |
|---|---|---|
| Tracker rule mandates a form that 404s | ✅ | ✅ **independently** |
| `/assets/` form forbidden by the new rule | ✅ | ✅ |
| Cross-root links not portable | ✅ (reasoned) | ✅ (tested with a fake base URL) |
| Gate passes 306 unmaintainable links | — | ✅ |
| Anchors never checked; count inflated | — | ✅ |
| Renderer edge shapes (queries, schemes, blog, diagram pages) | — | ✅ |
| Gates miss titled links and raw HTML | — | ✅ |
| Published page still teaches the old form | ✅ | — |
| Slug-stripping claim false for tracker | ✅ | — |
| Skill history / 11-way duplication | ✅ | — |
| My overclaim about "every surface" | ✅ | — |

**Four of Codex's five findings were invisible to reading.** That is the whole
argument for *at least one reviewer must execute*, and it is now measured rather
than asserted.

# Next

- [x] Both audits recorded, as reported, with nothing fixed or disputed
- [x] ~~**Discuss with Sid.** The tracker-renderer question is his~~ — done, and
      it dissolved the question: the tracker was never broken. What replaces it
      is the dev-vs-build split in
      [`120`](../../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md),
      which is still his call
- [ ] **Re-read the rest of both reviews with the retraction in mind.** The
      headline finding was wrong; the other rows were reached by different
      methods and are not affected by it, but none has been re-checked against a
      live URL either
