---
title: "Damage inventory — what the wrong diagnosis wrote into code, skills and docs"
status: review
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

Re-checked 2026-08-04 — every row against the file as it stands today, not
against what was written about it.

| # | Surface | What it said | Where it stands now |
|---|---|---|---|
| 1 | `internal-links.ts` — the docs depth shift | one-level shift when `contentType === 'docs'` | 🟢 **Deleted 2026-08-04**, together with opening the issue that builds the replacement. The file's header now states the open defect instead of a mechanism |
| 2 | `check-link-form.mjs` | the gate skipped the whole tracker; the reason was wrong twice | 🟢 **Exclusion deleted 2026-08-04.** Coverage 569 → **1,857** links. The premise called false turned out true — see below |
| 3 | `check-content-links.mjs` header | trackers excluded, justified by 1,372 measured failures | 🟢 **Superseded — the file is being deleted**, not corrected. [Retire the plugin's rendering gate](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/060_retire-the-plugin-rendering-gate.md) |
| 4 | The link rule in both skills | relative always, never a leading `/` | 🟢 **Correct, and now better founded.** Defended as a `move` requirement; it is actually a consequence of the filesystem-first principle |
| 5 | The ordering-label form, `[19/04/02 name](…)` | live in both skills and `10_writing.md` | 🟢 **Kept, unaffected.** Verified 2026-08-03 |
| 6 | `10_writing.md` | *"ordering prefixes are stripped from URL slugs"* | 🟢 **Corrected.** It now states that a tracker URL keeps its prefixes, that docs and blog strip them, and that a link *leaving* the tracker is the one case needing care |
| 7 | The two asset kinds | `move` advised rewriting `/assets/logo.png`; `check link-form` fails it | 🟢 **Closed** on [`090`](./090_tools-must-say-what-they-skip.md); the rule is in the project `CLAUDE.md` and the stale exemption instruction was deleted |
| 8 | 129 content links converted absolute → relative | `73ea791` | 🟢 **Correct and worth keeping.** Independent of the diagnosis: it moved links back into `move`'s maintenance |
| 9 | `releases/0.2.1.md` | carried three dated corrections | 🟢 **Fourth added 2026-08-04** — the third one's *reasoning* was dev-only, though its retraction stood |

## Row 2 — closed 2026-08-04 by deleting the exclusion, and it cost something

**The gate skipped the whole tracker and only ever looked at docs.** Its reason
had been wrong twice: first that converting a tracker link to relative could swap
a working link for a broken one, then — after that was called false — that a
tracker holds too many legitimately-rotted links to gate on.

**The second reason was measured and did not survive:**

| Scope | Links | Findings |
|---|---:|---:|
| docs only (the old default) | 569 | 0 |
| everything | 1,843 | **2** |

Two. Both site-absolute cross-issue links parked on
[`060`](./060_does-the-tracker-share-it.md), zero missing targets. Not a wall.

**A scope carve-out has to earn itself with a number.** This one could not,
twice, so it was deleted rather than given a third reason — the two links were
converted to relative and the gate now walks **1,857 links across 991 files**,
green. `--all` is still accepted and ignored so existing invocations work.

### And the "false" premise turned out to be true

**This is the part worth remembering.** The original reason — *converting a
tracker link to relative could swap a working link for a broken one* — was
retracted as false. Measured against a real static file server on 2026-08-04,
after making exactly that conversion:

```
page served at        /todo/2026-04-10-sync-and-presence/     (301 adds the slash)
emitted href          2026-04-10-editor-core/issue
therefore resolves to /todo/2026-04-10-sync-and-presence/2026-04-10-editor-core/issue
                                                                              404
```

Site-absolute, those two links worked in **every** environment. Relative, they
work in dev and 404 on a static host. **The conversion did exactly what the
premise said it would.**

It was called false on evidence from a dev server only — the same dev-only
reasoning this subtask exists to sweep up, appearing one more time inside the
sweep itself.

### Why the conversion stands anyway

Not because the cost is zero, but because it is **the cost every other tracker
link already pays**. All ~1,800 relative links in this tracker resolve the same
wrong way on a static host; those two were the only ones immune, and they bought
that immunity by leaving `agent-ks move`'s maintenance permanently.

Keeping two links broken-on-disk to dodge a defect that already affects the other
1,800 — and that has its own issue and its own acceptance test — is paying
forever to hide a symptom. The class is fixed by
[absolute link resolution](../../../2026-08-04-absolute-link-resolution/issue.md),
where these two now sit with their siblings instead of being a special case
nobody remembers.

**This is reversible in one edit if the call goes the other way.**

# Todo list

- [x] **1 — the shipped regression.** Gone 2026-08-04, with the replacement work
      opened rather than the breakage moved back to production
- [x] **3 — `check-content-links.mjs`.** Not rewritten: the file is being
      deleted. Correcting the header of a doomed file is waste
- [x] **6 — the slug-stripping claim** in `10_writing.md`, corrected with the
      reason it matters rather than only the sentence
- [x] **9 — the correction block in `0.2.1`.** Needed a fourth, not a third: the
      third existed but justified its retraction with a dev-only fact
- [x] **2 — the tracker exclusion is gone**, not re-justified. Two links
      converted, gate green over everything, and the cost measured and written
      down rather than assumed away
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
