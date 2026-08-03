---
title: "Damage inventory — what the wrong diagnosis wrote into code, skills and docs"
status: in-progress
---

# Overview

**A wrong diagnosis does not stay in the report that carried it.** It gets
written into gate comments, skill rules and shipped code, where it keeps
instructing people after the report is retracted. This subtask is the sweep:
everything the tracker-404 belief touched, and whether it survives the
retraction in [`110`](./110_live-check.md).

**Done when** every surface is either corrected or confirmed still-correct, with
the reason stated — and nothing still tells an author or an agent to compensate
for a renderer defect.

# The inventory

| # | Surface | What it says | Verdict |
|---|---|---|---|
| 1 | `internal-links.ts` — the docs depth shift | one-level shift when `contentType === 'docs'` | 🔴 **Damage, shipped.** Right for the built site, wrong in dev. Superseded by render-time absolute resolution |
| 2 | `check-link-form.mjs` header | trackers excluded because *"converting a tracker link to relative could swap a working link for a broken one"* | 🔴 **Damage.** The premise is false — tracker relative links work. The exclusion may still be right, but not for this reason |
| 3 | `check-content-links.mjs` header | trackers excluded, justified by 1,372 measured failures | 🔴 **Damage.** The 1,372 is the dev/build gap, not link rot |
| 4 | The link rule in both skills | relative always, never a leading `/` | 🟢 **Correct, and now better founded.** It was defended as a `move` requirement; it is actually a consequence of the filesystem-first principle |
| 5 | The ordering-label form, `[19/04/02 name](…)` | live in `agent-ks-docs/SKILL.md:74`, `agent-ks-issues/SKILL.md:394`, `10_writing.md:86` | 🟢 **Kept, unaffected.** Verified 2026-08-03 |
| 6 | `10_writing.md:133` | *"ordering prefixes are stripped from URL slugs"* | 🔴 **False for the tracker**, which keeps them — and that fact is now load-bearing, because it is *why* tracker relative links resolve |
| 7 | The two asset kinds | `move` advises rewriting `/assets/logo.png`; `check link-form` fails it | 🔴 **Damage**, carried on [`090`](./090_tools-must-say-what-they-skip.md). Now stated in the project `CLAUDE.md` |
| 8 | 129 content links converted absolute → relative | `73ea791` | 🟢 **Correct and worth keeping.** Independent of the diagnosis: it moved links back into `move`'s maintenance |
| 9 | `releases/0.2.1.md` | already carries two dated corrections | 🟡 Needs a third — the tracker claim |

# Todo list

- [ ] **1 — the shipped regression.** Do not simply revert: that moves the
      breakage back to production. It goes when render-time absolute resolution
      lands ([`120`](./120_dev-and-build-disagree-on-the-base.md))
- [ ] **2 and 3 — rewrite both gate headers.** The honest reason for excluding
      trackers is now: *the gate reads `dist/`, and `dist/` is the one
      environment where this question cannot be asked*
- [ ] **6 — correct the slug-stripping claim** in `10_writing.md`, and say why it
      matters rather than just fixing the sentence
- [ ] **9 — third correction block in `0.2.1`**
- [ ] Re-read the rest of both reviews. Their headline finding was wrong; the
      other rows used different methods and are probably unaffected, but **none
      has been checked against a live URL**

# The rule this is worth turning into

**Two independent reviews agreeing is not evidence if both used the same
method.** Opus read the source, Codex executed against `dist/` — genuinely
different tools, and it felt like triangulation. It was not: both took the built
tree as the definition of what a URL means, and neither made a request. The
disagreement between `dist/` and a running server was invisible to both.

The cheap check that settled it was **opening one URL**. That is the same ratio
as the 341-link lesson in the global instructions — one HTTP request against an
edit that touched hundreds of files — and it was available the whole time.

Concretely, for the next review of anything user-facing: **name the environment a
finding was measured in, and require one observation from the other one.**

# References

- The retraction: [`110`](./110_live-check.md)
- The diagnosis that replaces it: [`120`](./120_dev-and-build-disagree-on-the-base.md)
- The reviews: [`040/02/050 independent reviews`](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/050_independent-reviews.md)
- The principle now in the project `CLAUDE.md`: *the filesystem is the document;
  the app renders it*
