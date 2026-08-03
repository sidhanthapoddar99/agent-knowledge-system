---
title: "Summary"
---

# State

**All four stages executed and committed; two independent reviews in flight.**

> [!WARNING]
> **This log was opened after the run finished, not before it.** That is the
> defect [`110/010`](../../subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md)
> exists to stop recurring, and it costs something real here: the working files
> below are reconstructed from six commits and the gate output, not written as
> the rounds happened. Where a round's reasoning survived only in my head, it is
> gone. Treat times and orderings as approximate; treat the numbers as measured,
> because every one of them came from a command that is repeatable.

**[Both reviews are in, and neither was clean](02_working/050_independent-reviews.md)**
— commissioned after the fact on Sid's prompt, because the rule requiring them
did not fire during the run.

> [!CAUTION]
> **Retracted 2026-08-03.** ~~Two independent reviewers, two methods, one
> conclusion on the worst finding: the rule this run wrote into the three tracker
> surfaces mandates a link form that **404s in the tracker today**. Codex
> measured it at **1,410 errors** with `--all`.~~
>
> **It does not 404.** Sid clicked fifteen tracker links; twelve opened the right
> page, and every failure was a link *leaving* the tracker, not one inside it —
> [`110`](../../subtasks/100_link-integrity/110_live-check.md). Tracker pages are
> served without a trailing slash and keep their `NN_` prefixes, so relative
> links already land where the author meant.
>
> **The two methods were one method.** Both reviewers read the same `dist/` and
> the same `contentType` gate; neither opened a URL. Their agreement is what made
> the finding feel settled, and it was worth nothing — the built site adds a
> trailing slash the dev server does not, so `dist/` cannot answer this question
> at all. The real defect, including a docs regression this run shipped, is
> [`120`](../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md).

**Three of my own reported numbers were wrong in kind, and the executing review
is what caught them:**

- *"0 broken in-body links"* means **0 broken paths**. The checker discards
  fragments, and four anchors are broken.
- *"15,585 links"* counts repeated sidebars. The real markdown-body figure is
  **569**.
- The new `check link-form` gate **passes 306 links `move` cannot maintain** —
  it tests for a leading `/` and nothing else, while `move` resolves targets as
  filesystem paths. The gate does not check what it claims to check.

**What came back clean:** all 129 conversions verified individually — every one
resolves to the same published pathname as before.

Nothing fixed, nothing disputed. Sid asked for both audits in hand first.

# Goal

**Close the last silent-failure defect and the whole link-integrity group in one
run**, following
[the plan](../../plans/01_fix-the-tools-then-the-links/overview.md).

The plan's own ordering decision was the load-bearing one: **fix the tools
first**, because every later stage quotes a gate, and the gate covering skill
files was reading the installed plugin rather than the tree being edited.

# Todo

- [x] [Stage 10 — the tools tell the truth](../../plans/01_fix-the-tools-then-the-links/10_the-tools-tell-the-truth.md)
      — reverted the CWD walk-up, added `bin/agent-ks-dev` + `mise.toml`, so the
      command you type states which tree you mean
- [x] [Stage 20 — fix the renderer](../../plans/01_fix-the-tools-then-the-links/20_fix-the-renderer.md)
      — one-level URL-depth shift, index pages exempt; 418 → 55 broken links with
      **zero content files changed**. ⚠️ Both numbers were measured against the
      **built** site; the shift is wrong on the dev server, where the same page
      is served without a trailing slash —
      [`120`](../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)
- [x] [Stage 30 — one link rule, everywhere](../../plans/01_fix-the-tools-then-the-links/30_one-link-rule-everywhere.md)
      — the cross-section exception was checked and does not exist; 129 links
      converted, 55 → 0
- [x] [Stage 40 — correct the record, and gate it](../../plans/01_fix-the-tools-then-the-links/40_correct-the-record-and-gate-it.md)
      — dated correction in `0.2.1`, `move` reports its skips, `check link-form`
      shipped green
- [ ] Merge the two independent reviews as a **union**, and fix what they find

# Out of Scope

- ~~**The tracker's 1,372 broken links.**~~ **Corrected 2026-08-03.** They are
  not broken links. The figure is what `dist/` reports for a tracker whose pages
  resolve correctly in the browser — it measures the trailing-slash gap between
  the built site and the dev server, not link rot. Twelve of fifteen clicked
  links opened the right page
  ([`110`](../../subtasks/100_link-integrity/110_live-check.md)); the diagnosis
  is [`120`](../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md),
  and [`060`](../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md)
  is answered rather than pending.
- **The backticked-path content sweep.** The rule landed on every surface; the
  ~44 existing instances need judgement per instance, and stay on
  [`080`](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md).

# Outcome

**Broken in-body links 418 → 0**, over 173 pages and 15,585 links. Six commits,
`e969982..bf0099c`, none pushed. Everything at `review`; nothing at `done`.

| Gate | Result |
|---|---|
| `./start build` | 980 pages |
| `check links` | ✅ clean (was 418) |
| `check link-form` | ✅ clean — new gate, green on arrival by design |
| `check skill-links` | ✅ clean, on the **source tree** |
| `check config` | ✅ clean |
| `check issues` | ✅ clean but one pre-existing unrelated warning |

The rounds, with what each actually found:

- [`010` — the tools](02_working/010_the-tools-tell-the-truth.md)
- [`020` — the renderer](02_working/020_fix-the-renderer.md)
- [`030` — the rule, and the regression](02_working/030_one-link-rule-and-a-regression.md)
- [`040` — records and guards](02_working/040_records-and-guards.md)

## The three findings worth carrying out of this run

**A count improving is not evidence a change is correct.** The renderer fix took
418 → 55 and had introduced a *new* bug on the way — it shifted links to
colocated files, which a different postprocessor resolves against a different
base, so one page emitted two different URLs for the same asset. Found by tracing
one link into its built output. That is the same check the original 341-link
mistake skipped, and it costs one request.

**Checking a rule you expect to confirm is how you find the rule doesn't exist.**
[`020`](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
was told to verify the cross-section exception rather than assume it. A dry-run
`move` showed cross-section relative links *are* maintained — so 115 links
believed to follow a convention were simply unmaintained, and the rule got
simpler instead of gaining a carve-out.

**Both new gates are green on arrival, deliberately.** The tree was taken to zero
before `check link-form` shipped, and the backticked-path half was left unbuilt
because it would have landed red against ~44 existing instances. A gate that is
red on arrival is a gate people learn to ignore.

## What this run got wrong about itself

Two process defects, both Sid's catch, both now recorded rather than absorbed:

1. **No agent log was opened** — this file, written afterwards. Fixed as
   [`110/010`](../../subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md).
2. **No independent review was commissioned**, although the run edited standing
   instructions — both `SKILL.md` files, two reference files, `guide.ts` and the
   project `CLAUDE.md`. The rule that a change to standing instructions is not
   final until independently reviewed by more than one agent is in
   `~/.claude/references/writing-claude-md.md`, and it did not fire. Commissioned
   late; **until those land, the instruction edits in this run are unreviewed and
   should be read as such.**
