---
title: "One URL resolver for dev and build, plus a real 404 page"
status: input-needed
---

# Overview

**Dev and production disagree about URLs, measurably.** Two files hold the same knowledge
and are kept in sync by hand: `pages/lib/route-match.ts` (369 lines, SSR URL resolution)
and `pages/lib/static-paths.ts` (build-time URL enumeration). They have already drifted.

Reproduced:

- `/todo/<issue>/plans/<plan>/<nonexistent>` returns a **302 redirect** in dev and a **host
  404** in the built site.
- `/user-guide/<nonexistent>` serves a **296,909-byte fully styled page** in dev, while
  `dist/` contains **no `404.html` at all**.

This is the only architectural defect the migration audit could measure. Merging the two
resolvers is the same 5–8 days in TypeScript as it would be in Go — the language is not
what makes it expensive.

# References

- [the loaders, cache and routing surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/016_surface_loaders-cache-routing.md) — the reproduction and the drift analysis
- [the structure and layout separation note](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) — the design that motivated this: URL rules belong to a structure, not to two central switches
- [the default-route-resolution issue](../../../2026-05-07-default-route-resolution/issue.md) — the issue that originally owned this; check it before starting so the work is not done twice

# Todo list

- [x] Reproduce both divergences and record them as the baseline
- [x] Read the default-route-resolution issue — decide whether this subtask leads or follows it
- [x] Add a real `404.html` to the static output
- [x] Build a dev-versus-build URL diff harness
- [x] Re-run both reproductions
- [ ] 🟡 **Extract one resolver that both SSR matching and build-time enumeration call** — recommend NOT doing this; see below. Sid's call
- [ ] 🟡 Enumerate build URLs from that resolver rather than beside it — same call

# Outcomes and Next Steps

⭐ **One decision for you, and it is to cancel most of this subtask.** Commit
`7001490`.

The harness got built first, ahead of the merge, because a refactor you cannot
measure is a refactor you cannot check. It then measured something that changes
what the merge is worth:

```
  1285 URLs      agree 1273      explained 12      DIVERGE 0
```

**The two resolvers do not disagree anywhere.** The premise this subtask was
written on — *"two files hold the same knowledge and are kept in sync by hand.
They have already drifted"* — is half right. They do hold related knowledge. They
have not drifted.

## What was already true, and what had actually changed

The two files **already share every URL spelling**, by import rather than by
discipline. `static-paths.ts` imports `sourceFormSlug`, `canonicalContentUrl` and
`planStageAliasUrl` from `route-match.ts`, so each URL is written down exactly once.
What is genuinely separate is the *traversal* — which URLs exist — and that is a
harder thing to merge than a spelling.

Both reported divergences were re-run. Neither is what it was described as:

| Reported | Reproduced | Verdict |
|---|---|---|
| `/user-guide/<missing>` serves a **296,909-byte styled 200** | **404**, 133,998 bytes | ✅ Already fixed. `route-match.ts:137` carries the comment explaining it — *"It used to answer 200, so every link checker that trusts the status code reported dead links as healthy."* The shell body is kept **on purpose** so the tree stays navigable while a file is mid-edit |
| `/plans/<plan>/<nonexistent>` **302s in dev, host-404s in the build** | Confirmed, exactly | ❌ Not a defect. `planStageAliasTarget`'s final return deliberately lands *any* file under a plan folder on the plan page, so a relative link to `overview.md` resolves. The build cannot enumerate names that do not exist. Dev is lenient by design |
| `dist/` has no `404.html` | Confirmed | ✅ **Real.** Fixed — `src/pages/404.astro`, 9,916 bytes in `dist/` |

## The recommendation, and what it rests on

> 🟡 **Do not merge the two resolvers. Keep both walks and keep the harness.**

The merge was scoped at 5–8 days, larger than stages 10–50 combined, on
routing code with no test suite. It buys protection against drift. The harness
buys the same protection in one command, catches drift the merge could still
introduce, and — the plan says this itself — **is the half that ports unchanged to
any future runtime**, where a merged TypeScript resolver does not.

Spending the larger, riskier budget to prevent a problem the smaller one already
detects is the wrong order.

**What would change my mind:** the harness starting to report divergences that are
genuinely two-implementations bugs rather than environment differences. It runs in
about three minutes, so that evidence is cheap to collect. Until then the merge is
insurance against a fire that has not started, bought at the price of the building.

⚠️ **This is a scope reduction on the largest piece of the issue, so it is yours to
accept or reverse.** Reversing costs nothing that has been done here — the harness
is what a merge would need in front of it anyway.

## The harness

`scripts/check-route-parity.mjs`. Enumerates from `buildStaticPaths` — the build's
own source of truth — then checks each URL against a running dev server *and* the
files in `dist/`, plus a hand-written set of addresses that must **not** resolve.
That negative set matters: it is the half nothing enumerates, and it is where both
reported defects came from.

Every URL lands in `agree`, `explained` or `DIVERGE`, and **`explained` is a stated
claim rather than a mute button** — each entry prints the reason it is correct. Both
current entries are environment behaviour, not resolver disagreement:

- **6 · a dotted final segment needs a trailing slash.** `/…/03_docs.html` is a
  *file* request to `astro dev` and never reaches the page route; `/…/03_docs.html/`
  resolves fine. The build writes it as a directory and a static host 301s the bare
  form to the slash form. This is the same three-environment split
  `scripts/check-links.mjs` was built around.
- **6 · an unknown docs slug renders the section shell** with a 404 status. Both
  sides say "not found"; only the body differs.

Controlled in both directions, because I wrote it:

```
  BASELINE                          404=True  agree=1273 explained=12 DIVERGE=0
  remove dist/404.html              404=False agree=1273 explained=12 DIVERGE=0
  corrupt a redirect target         404=True  agree=1272 explained=12 DIVERGE=1
  delete a page dev still serves    404=True  agree=1272 explained=12 DIVERGE=1
  RESTORED                          404=True  agree=1273 explained=12 DIVERGE=0
```

❗ **That exercise found a real bug in the harness itself**, which is the argument
for doing it. The first run reported 23 divergences. Seventeen were mine: I compared
`new URL(location).pathname` — which drops the fragment — against the build's
canonical href, which carries `#stage-anchor`. Every plan-stage redirect agreed
exactly and I had reported them all as broken. **A harness that has never failed on
purpose is not evidence**, and this one would have sent someone into
`planStageAliasTarget` looking for a bug that was in my own comparison.

## On the `default-route-resolution` issue

The plan asked whether this stage leads, follows, or merges into it. **Neither** —
it is `done` and covers different ground: a hierarchical-sort bug that made
`/user-guide` land on a `to_be_written` stub. Nothing here overlaps it.

## Next steps

- **Yours:** accept or reverse the recommendation above.
- Run the harness in CI. Three minutes, exits non-zero, no divergences to baseline
  away.
- ⚠️ Build before running it. It compares against `dist/` as it finds it, so a
  stale build reports every page added since as a divergence — correct behaviour,
  confusing first run.
- One genuine papercut left, and it is Astro's rather than ours: in **dev**, a
  markdown link written as `./03_docs.html` — the form that is true on disk, which
  this project requires — 404s without a trailing slash. The deployed site handles
  it. Worth its own subtask if it bites anyone.

# Details

## This is the biggest item in the issue — treat it accordingly

At 5–8 days it is larger than everything else here combined. If the issue needs to shrink,
**this is the piece to split out**, not to squeeze. It sits in its own group so that it can
leave without disturbing anything else.

## The diff harness is the deliverable that lasts

Merging the two files fixes today's drift. Only a harness stops tomorrow's. Enumerate every
URL from the resolver, fetch each from a dev server, compare status and byte length against
the built file. It is the same technique a Go port would need, so it is not throwaway work
under any future decision.

## Why the redirect and the 404 are one subtask

Both come from the same root: build-time enumeration does not know what request-time
matching knows. The 302 exists in one path and not the other; the 404 page exists in
neither, because nothing enumerates "the set of URLs that should not resolve".

## Done when

- [ ] One resolver, called by both request matching and build enumeration
- [ ] `/todo/<issue>/plans/<plan>/<nonexistent>` behaves identically in dev and build
- [ ] `dist/404.html` exists and is served for unknown paths
- [ ] A missing docs page does not return a 296,909-byte styled 200 in dev
- [ ] The diff harness runs and reports zero divergences
- [ ] `agent-ks check link-form` and `check links` still pass
