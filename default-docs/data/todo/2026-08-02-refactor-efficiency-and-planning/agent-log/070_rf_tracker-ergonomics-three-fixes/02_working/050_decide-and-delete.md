---
title: "Decide and delete — the generator goes, the rule gets one home, the blanker gets a spec"
status: done
agent: claude
---

# Goal

Act on round 04's merged findings. Sid set the direction before any of it was
touched: don't duplicate the rule, don't generate the index, and don't add tools
to fix either — *"agent-ks is meant to make things simple, not more
complicated."*

# Inputs

- [the merged findings](./040_four-independent-reviews.md) and the four reports
- Sid's direction, 2026-08-04, in three messages

# Expected Outcome

The fix, and which finding it closes.

# Outcome

**Everything the reviews found is fixed, and the plugin ends up smaller than it
was before this run started.**

| Surface | |
|---|---|
| CLI verbs | **−1** — `issue reindex` deleted |
| Scripts | **−2**, +1 stub, +1 fixture |
| Frontmatter fields | **−1** — `unit:` no longer persisted |
| Validator rules | **−1** — the staleness error |
| New tools / agents / slash commands | **0** |

## The one I planned and dropped

A read-only `/agent-ks-index-check` agent, plus a slash command. Sid stopped it:
*"additional tools create additional memory burden… agent-ks is meant to make
things simple."*

**He was right, and the reason generalises.** The check is needed exactly when
someone is deep in tracker work — which is precisely when the `agent-ks-issues`
skill is **already loaded**. Two new names on the consumer's surface to deliver
something a paragraph in an already-present skill delivers for free. The subagent
survives as a *pattern the skill describes*; nothing ships to invoke it.

## What each finding got

**🔴 The rule lived in fourteen places.** Every copy in the skill and the
published user-guide is now a **link** to one home
(`24_agent-logs.md § When an agent log opens at all`), including the copy 700
lines below the new rule in that same file. The 14 worked cases now ship there
too — instances are what make a rule applicable, and they were sitting in the
tracker where no consumer sees them.

**🔴 The generated index, deleted entirely.** The generator skipped folder-form
rounds and the staleness gate compared the file against that same generator, so a
table with a round missing was certified correct. **Two things that make the same
mistake cannot check each other.** Replaced with a hand-written index and a
reading procedure whose first instruction is `ls` two levels deep — *the
filesystem is the source of truth, the index is the claim under test.* It now
covers what a script never could: a plan stage whose subtasks are all closed while
the stage is not.

**🔴 Four CommonMark false negatives — the dangerous direction.** The blanker was
hiding genuinely broken links: escaped backticks treated as delimiters; `>`-only
lines, list items and headings not treated as block boundaries; CRLF blank lines
missed by a `[ \t]*` split. Plus one false positive, a closer search that gave up
at a longer inner run instead of continuing.

**🔴 Two of three callers still had the old bug.** `move` — the one that
**writes** — kept the per-line blanker and would have rewritten a quoted example.
All three now share one `blankedProseLines`.

**🔴 Three contradictions inside the new rule**, all from Opus: the floor now
explicitly beats triggers 1–2 and never trigger 3; floor 2's *"one pass"* is
stated as literal so a loop or fan-out is not covered by it; and the file-count
prohibition is scoped to *whether the path is worth keeping*, which leaves scale
free to answer the separate setup-cost question it always answered.

## The fixture is in the repo this time

`plugins/agent-ks/skills/agent-ks-docs/scripts/fixtures/code-spans.test.mjs` —
**15 cases, and every one of them is a case that failed.** The previous fixture
lived outside the tree, so its eight passes stopped being a reproduction the
moment that directory was cleared, and none of the five inputs that later broke
the blanker was among them.

## Gates

| | |
|---|---|
| `code-spans.test.mjs` | ✅ 15 passed |
| `check link-form` | ✅ 0 errors, 52 warnings (unchanged) |
| `check issues` | ✅ its two known unrelated warnings |
| `check skill-links` | ✅ 44 files, repo source tree |
| `move` dry-run on a file with 8 inbound links | ✅ all 8 rewritten |
| `new-agent-log` smoke test | ✅ seeds the stub, `check issues` stays clean |

> [!NOTE]
> **What was NOT fixed, and is reported rather than closed.** Sonnet's finding
> that no CI job or git hook runs `check issues` stands — it is true, and making
> it a hook is a decision about this repo's workflow rather than about this run.
> Sol's `--group` traversal gap in the validator also stands; the staleness error
> it let through no longer exists, so the gap is now cosmetic, but the validator
> still does not descend into grouping folders.
