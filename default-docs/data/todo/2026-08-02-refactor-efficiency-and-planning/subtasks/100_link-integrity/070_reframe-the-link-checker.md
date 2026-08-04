---
title: "check-content-links was built on the wrong model — reframe it as a rendering gate"
status: done
---

# Overview

**A link checker for content pages was written during this round and is
uncommitted. Its machinery is sound; its framing is wrong.** It was built while
the belief was that the *content* was at fault, so its documentation blames
authors, and it carries one exclusion invented to make that story consistent.

Nothing in this repo checks links inside `data/`. That gap is real and worth
closing — the checker should ship. It just needs to say the right thing about
what it is measuring.

**Done when** the checker is committed, describes itself as a **rendering** gate,
its tracker exclusion is justified by evidence or removed, and a deliberately
broken link fails it while removing that link returns it to zero.

# References

- The script, uncommitted:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/check-content-links.mjs`
- Its registration: `plugins/agent-ks/skills/agent-ks-docs/scripts/_manifest.mjs`
  (`docs-check-links` / `agent-ks check links`)
- The defect it should be gating against: [`010`](./010_renderer-drops-a-url-level.md)
- The sibling it was modelled on, and the traps that one fell into twice:
  [`../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md`](../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md)
- The measurement it produced: [`040`](./040_site-wide-link-rot.md)

# Todo list

- [ ] Rewrite the header comment. It currently argues the content is at fault.
      The tool measures whether **rendered links resolve** — that is a statement
      about the renderer, and a failure should send a reader to
      [`010`](./010_renderer-drops-a-url-level.md), not to the content
- [ ] **Re-examine the tracker exclusion.** Trackers are skipped by default on
      the argument that *"a link that rotted because its target was deleted is
      history, not a defect."* That reasoning was invented to fit the wrong model
      and has never been tested against the actual 3,978 — see
      [`060`](./060_does-the-tracker-share-it.md). Either justify it with the
      triage, or drop it
- [ ] Keep the parts that are right, and say why in the file: it reads the
      **rendered `href`**, resolves it the way a browser does, and **fails when
      it finds nothing to check** rather than reporting clean
- [ ] Control-test in both directions — break a link, watch it fail; remove the
      break, watch it return to zero. Neither half alone proves anything
- [ ] Re-run it after [`010`](./010_renderer-drops-a-url-level.md) lands and
      record before/after counts per section
- [ ] Decide whether it belongs in `agent-ks check` as a default or an opt-in,
      given it needs a build first

# Outcomes and Next Steps

**Reframed and committed 2026-08-03.**

The header no longer blames authors. It now tells whoever trips the gate **which
layer to look at, in order**: the renderer first, the target second, the author
third — with the reason attached, which is that uniform failure across
independent authors is evidence about the tool. It also carries the prohibition
that matters most: never resolve a failure here by converting the link to
site-absolute form, because that renders green and leaves link maintenance.

### The tracker exclusion — now justified by measurement, not by a story

The original reason (*"a rotted link is history, not a defect"*) was reasoned to,
not measured, and was invented to fit the wrong model. Measured after the renderer
fix:

| Scope | Pages | Broken |
|---|---:|---:|
| Default — docs sections | 173 | **0** |
| `--all` — including the tracker | 978 | **1,372** |

So the exclusion stands, on the honest ground: including trackers would put the
gate at 1,372 on arrival, and **a gate that is red on arrival is a gate people
learn to ignore.** Whether those 1,372 are history, demo-fixture fiction, or a
second transform bug is untriaged — that is
[`060`](./060_does-the-tracker-share-it.md), and the header now says so instead of
asserting a principle.

~~**One signal worth carrying to `060`:** the tracker failures are dominated by
*relative* links that do not resolve.~~ **Retracted 2026-08-03.** They resolve
fine — [`110`](./110_live-check.md) clicked fifteen of them. What this row
actually measures is the **built** site, and the built site adds a trailing
slash the dev server does not, so the tool and the browser disagree about what a
relative href means. The 1,372 is not a count of broken tracker links; it is the
size of that disagreement. See
[`120`](./120_dev-and-build-disagree-on-the-base.md).

**And the gate cannot currently see the failure that is real:** a missing page
answers HTTP `200` with a *Page Not Found* body, so status alone proves nothing.

# Details

## What is right about it, and worth keeping

The design decision that matters is that it reads the **built site**, not the
markdown. A link's correctness is a property of the URL it resolves to, and that
is not knowable from the source: ordering prefixes are stripped, folder segments
are kept, and pages become directories. A checker that reasons about markdown
paths has to reimplement all of that and will disagree with the router the moment
any of it changes.

It also refuses to pass when it has checked nothing — no `dist/`, zero pages, or
zero links all produce a failure. That guard exists because the sibling skill-link
checker fell into exactly that trap **twice**, reporting `all checks passed` over
files it had never read.

## What is wrong about it

**It tells the reader the wrong thing.** Its header comment presents 313 dead
links as an authoring failure and frames the whole tool as catching bad writing.
Under the corrected understanding those links were **written correctly** and
broken in rendering. A gate that misattributes its own findings sends whoever
trips it to fix the wrong layer — which is precisely what happened to the person
who wrote it.

**The tracker exclusion is unsupported.** The stated reason sounds principled and
was reasoned to, not measured. Three different populations are mixed inside that
3,978 and none has been separated:

| Population | Is it a defect? |
|---|---|
| Demo/fixture issues pointing at fictional paths (`/docs/api`, `/contact`) | No — intentional |
| Links whose target was genuinely deleted | No — that is history |
| Correct links broken by the renderer | **Yes** |

Excluding all three together hides the third. Whether the exclusion is right
depends on the triage in [`060`](./060_does-the-tracker-share-it.md), which has
not been done.

## The lesson this tool should carry in its own comments

A checker written while believing the wrong cause **encodes that belief in what
it reports.** The measurements it produced were accurate and its conclusions were
not, and anyone reading the output would have inherited the conclusions. Worth
stating in the file itself, because the next person to trip this gate needs to
know which layer to look at.

# Reopened — the checker measures less than it reports

**Back to `in-progress` 2026-08-03.** Codex executed against the built HTML with
a real parser and found the tool's own numbers misleading.

- 🔴 **Anchors are never checked.** `check-content-links.mjs:207` uses
  `.pathname`, discarding fragments. **Four broken anchors** exist right now:
  three on `user-guide/20_custom-pages/01_overview.md:33` (`#home`, `#info`,
  `#countdown`; the built IDs are `customhome` / `custominfo` / `customcountdown`)
  and one on `25_themes/04_tokens/05_layout-dimensions.md:156`
  (`#…doesnt-require` vs a generated `…doesn39t…`).
- 🔴 **The link count is inflated.** The body regex at `:177` selects the outer
  `<main>`, so repeated sidebars are counted. Reported 15,585; the real
  markdown-body figure is **569**. Every "N links checked" line quoting this tool
  — including mine — is wrong by ~27×.
- 🟡 Misses `[x](/y "title")` (titled markdown links) and raw HTML `<a href>`.
- 🟡 **False failure:** a markdown link inside an HTML comment is reported,
  though the renderer emits no anchor for it.

**So "0 broken in-body links" means "0 broken paths".** The direction of 418 → 0
holds; the claim needs narrowing and the tool needs to check fragments.

# Closed 2026-08-04 — the framing was still wrong, one level up

**This subtask reframed the checker twice and both times inside the wrong
question.** Round one said: it blames authors, make it blame the renderer. Round
two said: it measures less than it reports, fix the four defects. Neither asked
whether **a gate that reads the built site belongs in the plugin at all.**

Sid's answer, 2026-08-04: it does not. `agent-ks` owns files and the links
between them; whether a link resolves in a browser is the engine's output and the
engine's to test. The tool was measuring the renderer and shipping to consumers.

That is now [`180`](./180_rendered-link-check-belongs-to-this-repo.md), with the
three stages written into the project `CLAUDE.md`. Run record:
[the gate-and-shift run](../../agent-log/060_wf_move-the-gate-and-drop-the-shift/01_summary.md).

## The four reopened findings, checked one by one

Every one was verified rather than taken from the audit report, and **two of the
four were attributed to the wrong tool**:

| Finding | Verdict |
|---|---|
| **Anchors are never checked** — `.pathname` discards the fragment | ✅ **Real.** The replacement checks fragments against the target's `id`/`name` |
| **The count is inflated ~27×** — the body regex matches `<article\|main>` and a built page opens `<main>` first, so every sidebar is counted | ✅ **Real, and measured on one real page: 112 counted, 9 actually in the body.** Corrected in [`040`](./040_site-wide-link-rot.md), which had quoted it |
| Misses titled links `[x](/y "title")` and raw HTML `<a href>` | ❌ **Not this tool.** It reads HTML, where `href="/y" title="t"` matches fine. The gap is in `check-link-form.mjs`, which reads markdown: `MD_LINK_RE`'s `[^)\s]+` stops at the space. **Two such links exist in the content** — carried to [`170`](./170_relative-but-not-a-path.md) |
| False failure on a link inside an HTML comment | ❌ **Does not reproduce.** Zero `<a>` tags inside comments anywhere in `dist/` |

**Recording the two that were wrong matters as much as the two that were right.**
An audit finding that reads plausibly and is misattributed sends the next person
to edit a file that was never broken — the same failure this whole group is
about, one layer up.

## What the two real defects turned out to be evidence of

Not bugs to patch. **Both exist only because the tool reads `dist/`**, and both
vanish in a live-server crawler: fragments are checked against a real response,
and body-versus-chrome is a crawl decision rather than a regex over a static file.

**And the anchor gap is the sharper of the two.** The gate reported `0 broken`
while four anchors were broken. A gate that cannot see a failure class does not
merely miss it — **it certifies it.** That is the shape this group keeps finding,
and it was inside the tool built to find it.

## The part of this subtask that was right and outlives it

*"A checker written while believing the wrong cause encodes that belief in what
it reports."* That held, and it held twice more than expected: the tool blamed
authors for a renderer defect, and it was placed in the tree that could not fix
what it found. The header rewrite it produced is kept and moves to the
replacement.
