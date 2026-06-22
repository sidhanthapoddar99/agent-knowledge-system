---
title: Explore including the NN_ prefix in docs URLs (backward compatible?)
done: true
state: closed
---

Today the `NN_` ordering prefix is **stripped** from docs URLs:
`01_getting-started/05_overview.md` → `/docs/getting-started/overview`. This subtask
explores the inverse: **what if the URL included the prefix** (e.g.
`/docs/01-getting-started/05-overview`)? Is it feasible, and is it backward compatible?

*Exploration / decision subtask — investigate and recommend before any implementation.*

## Where the stripping happens (feasibility)

Technically straightforward — the strip is centralized:

- `astro-doc-code/src/parsers/content-types/docs.ts` — slug generation.
- `astro-doc-code/src/parsers/postprocessors/internal-links.ts` — `stripOrderPrefix` on
  relative links.
- (Both now go through the shared `parsers/core/order-prefix.ts`.)

So making it conditional (keep vs strip) is a small, contained change — likely a per-section
or global config flag (e.g. `strip_prefix: true|false`).

## The catch — backward compatibility & URL stability

Two distinct concerns to weigh:

1. **Existing links break.** Every current URL is prefix-stripped. Including the prefix
   changes every docs URL at once → breaks bookmarks, inbound links, and search indexing.
   Not backward compatible as a hard switch.
2. **URLs stop being stable under renumbering** — and this is the bigger one. The whole
   point of gap-numbering is to reorder/insert freely (`05_` → `055_`, drop `015_` between
   `010_` and `020_`). If the number is *in the URL*, every reorder churns URLs. Today,
   stripped URLs are stable across renumbering — a real feature we'd be giving up.

## Questions to answer

- Is the goal cosmetic (URLs mirror the sidebar order) or functional (something needs the
  number in the path)? If functional, what?
- If we want it: opt-in config (default = strip, as today) vs. default change? Strongly lean
  opt-in given (1) and (2).
- Could we get the benefit without the cost — e.g. keep stripped canonical URLs but expose
  the order some other way (sidebar already does), or add redirects?
- If adopted, how to handle renumbering churn (redirects? freeze numbers once published?).

## Tentative lean

Feasible, but the renumbering-stability loss (2) is a strong argument against making it the
default. If pursued at all, do it as an **opt-in flag** with stripped URLs remaining the
default and canonical form. Decide here before touching code.

## Decision

**Keep stripped URLs as the permanent default and canonical form.** The standardization does
not pay off on net: the only upside is cosmetic (URL mirrors sidebar order), and the sidebar
already shows order. Against that, including the prefix (a) breaks every existing docs URL at
once and (b) — the decisive point — surrenders URL stability under renumbering, which is the
entire reason gap-numbering exists. We'd be re-introducing the fragility the convention was
designed to remove, permanently and on every reorder.

**Confirmed blast radius** (grounded in the code): stripping happens in exactly two places
that must stay in lock-step — `docs.ts → generateSlug()` (URL build) and
`internal-links.ts → rewriteHref()` (relative-link rewrite). Everything else that reads
`order-prefix.ts` only uses `position` (the sidebar sort key) and is unaffected. So a flag
*could* be added cheaply, but the recommendation stands regardless.

**If ever revisited**, the only acceptable shapes are: an **off-by-default flag** (stripped
stays canonical), or — better — keep clean URLs canonical and **301-redirect** any numbered
URL to the clean one (gives "numbered paths work if typed" without churn). Document the
renumbering-churn tradeoff loudly either way.

**Cross-content back-links (issue → docs) note.** A tangential finding from the link-resolution
review: including prefixes in docs URLs would *incidentally* make some issue→docs relative
links resolve better (the issues pipeline keeps `NN_` prefixes; docs strip them — see
`24_agent-logs.md`/link-resolution discussion). This is **not** a reason to adopt it — the
robust fix for cross-root back-links is to use **absolute `/user-guide/...` URLs** (the
postprocessors deliberately leave `/`-rooted hrefs untouched), not to reshape every docs URL.
