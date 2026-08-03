---
title: "check-content-links was built on the wrong model — reframe it as a rendering gate"
status: open
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

> [!IMPORTANT]
> **PLACEHOLDER** — the script exists and is uncommitted. Blocked on Sid's
> approval, and on [`060`](./060_does-the-tracker-share-it.md) for the tracker
> question.

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
