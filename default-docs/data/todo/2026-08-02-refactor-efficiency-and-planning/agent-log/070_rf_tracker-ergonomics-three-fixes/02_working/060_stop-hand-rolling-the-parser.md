---
title: "Stop hand-rolling the parser — and the two findings only a shell could reach"
status: done
agent: claude
---

# Goal

Act on the second review round. Sid, on the two calls it raised: *"I will go with
your recommendations. Just fix this."*

# Inputs

- The four final reports: [Opus](./041_opus-the-rule-as-behaviour.md) ·
  [Sonnet](./042_sonnet-the-index-as-a-system.md) ·
  [Fable](./043_fable-commonmark-and-coherence.md) ·
  [Sol](./044_sol-the-reviewer-that-executes.md), re-run against `06098a9`

# Expected Outcome

The fix, and which finding it closes.

# Outcome

**Twenty findings, all closed. The blanker is no longer hand-written.**

## The decision: a parser, not a fourth patch

Three hand-rolled versions shipped and each was wrong differently — a
single-backtick regex, then run-length matching per line, then run-length
matching over a hand-rolled block splitter. The third produced **ten**
divergences from CommonMark, found by two reviewers against a real oracle, four
of them hiding genuinely broken links.

**The pattern, not the bugs, is the finding: each version fixed the case in front
of it and met the spec somewhere new the next round.** A parser has no next
round.

`mdast-util-from-markdown` + `micromark-extension-gfm` — already resolvable, and
the same engine the site renders with, so the gate and the renderer now disagree
about nothing by construction. `scanCodeSpans`, `opensABlock` and `endsABlock`
are gone; it walks the AST and blanks `inlineCode`, `code` and `html` by offset.

> **One thing this surfaced and did not fix:** the plugin has no `package.json`
> and no `node_modules`. It already imported `gray-matter` on a resolve-up-the-tree
> assumption; this adds three more of the same kind. Flagged to Sid, who took the
> trade knowingly. **Undeclared dependencies are now a real fragility** and belong
> on their own subtask.

## The fixture is a differential test now

`fixtures/code-spans.test.mjs` — **31 cases, and it asserts nothing of its own.**
For each input it asks micromark *does a link actually exist here*, asks the
blanker the same, and fails on disagreement.

The version it replaces was fifteen hand-written cases, each a bug already fixed,
each asserting a remembered answer. Sol put it exactly: *"the current
oracle-wrong code passes the fixture."* **A fixture written from the bugs you have
met can only certify that you have met them.** Adding a case now costs one line
and needs no expected value.

## The two findings only a shell could reach

**1 · I called the `--group` gap cosmetic, and I was wrong.** I reasoned that the
only rule it hid — the staleness error — had just been deleted. Sol put the same
malformed run in both places and ran it:

| Where | Result |
|---|---|
| `agent-log/010_au_broken/` | 1 error, exit 1 |
| `agent-log/reviews/010_au_broken/` | **0 errors, exit 0** |

A grouping folder made **every** agent-log check vanish — malformed JSON, missing
summary, invalid round status, colliding round numbers, the depth cap. The
validator now descends through grouping folders, and on this repo it immediately
surfaced **five pre-existing violations it had been hiding.**

**2 · A fourth link-walking caller nobody had counted.**
`check-skill-links.mjs:135` still ran the original two-regex blanker, months
after the other three moved. It was wrong in both directions: it hid a real
broken link behind escaped backticks, and it errored on the scaffolder's own
wrapped code span. **A classification with four private copies is four different
answers.**

## The rule: a stated default, which was a real hole

Opus found that the trigger/floor shape returns **nothing** for repeated
independent work — no trigger fires, and making floor 2's *"one"* literal (my own
previous fix) put loops out of the floor's reach too. The worked table then
reasoned from *no floor* to *yes*, which is an assertion standing where a rule
should be — and it meant **repetition was doing the job file count is explicitly
forbidden to do.**

Now stated: **neither fires → 🟡 ask, once per session.** That also gives the
`Ask` verdict a place in the box, which it did not have.

Four smaller contradictions closed with it: trigger 2's *"on its own it justifies
a log"* vs the floor that outranks it; the Ask section saying "two situations"
over three; two worked-case reasons citing scale, which the rule prohibits; and
the scale carve-out pointing at a routing row whose condition did not mention
scale.

## Documentation leftovers, all from the same failure

- `24_agent-logs.md` shipped a recipe for **`agent-ks issue reindex`, a verb the
  previous commit deleted** — in the file designated as the rule's one home,
  ~450 lines below the section saying the generator was a mistake.
- Three code comments cited **`/agent-ks-index-check`**, the agent and slash
  command Sid had ruled out and I had dropped — including the stub seeded into
  every future agent log.
- `09_using-with-ai.md:181` still carried the retired rule verbatim, 90 lines
  below a line the same commit had converted to a link.
- `SKILL.md` and `guide.ts` kept the unqualified *"the floor wins"* and dropped
  the literal-*one* qualifier, so two contradictions were closed on the reference
  and open on the two surfaces that load without being asked for.

**Every one of those is the same failure as the diff itself: fixing the thing in
view rather than the file it is viewed from.**

## Gates

| | |
|---|---|
| `code-spans.test.mjs` | ✅ **31/31 against micromark**, including all ten divergences |
| `check link-form` | ✅ 0 errors, 52 warnings |
| `check issues` | ✅ 7 warnings — 2 known, **5 newly visible** in a pre-existing exploration folder the group gap was hiding |
| `check skill-links` | ✅ 44 files |
| Production build | ✅ 1,207 pages |
| Grouped-run control test | ✅ malformed run: silent before, **1 error / exit 1** after |
