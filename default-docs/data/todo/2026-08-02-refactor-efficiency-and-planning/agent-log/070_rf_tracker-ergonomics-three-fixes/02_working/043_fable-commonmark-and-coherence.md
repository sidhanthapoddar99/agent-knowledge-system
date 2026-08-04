---
title: "Fable — the blanker against CommonMark, and a repo-wide coherence sweep"
status: done
agent: fable
unit: audit
---

# Goal

Two halves. Test the rewritten code-span blanker against the **actual CommonMark
rules** rather than against the case it was written for; then sweep the whole
repo for surfaces the change now contradicts.

# Inputs

- `_links.mjs` (`scanCodeSpans` / `blankCodeSpans` / `blankCodeSpansDoc`) and its
  three callers
- every skill reference, the published user-guide, `_manifest.mjs`,
  `cli-toolkit.md`, `guide.ts`, the framework loader

# Expected Outcome

Findings — each with `file:line`, the concrete input, and whether it was run.

# Outcome

**Verdict: the blanker is better than the regex for its motivating case and is
not CommonMark-correct.** Five inputs where it is wrong, four of them in the
worse direction. **All five were re-run locally before recording, and all five
reproduce.**

## Half one — the blanker

```markdown
1  `a ``b`` [x](./missing.md)`      one span containing a LONGER run
2  see \`[x](./broken.md)\` here    escaped backticks — literal, not delimiters
3  > a ` [x](./broken.md) b         blockquote, then a `>`-only line, then ` d
4  - a ` [x](./broken.md)           two list items, no blank line, then ` d
5  a ` [x](./broken.md)\r\n\r\n     CRLF — `\r` fails the [ \t]* split
```

| # | CommonMark says | The blanker does | Direction |
|---|---|---|---|
| 1 | one code span; the link is quoted | ❌ link exposed | **false positive** |
| 2 | the link is real | ❌ blanked | **false negative** |
| 3 | two paragraphs; the link is real | ❌ blanked | **false negative** |
| 4 | two blocks; the link is real | ❌ blanked | **false negative** |
| 5 | two paragraphs; the link is real | ❌ blanked | **false negative** |

> [!NOTE]
> **These examples are in a fence for a reason.** Written inline, case 2 trips the
> defect it documents — the escaped backticks pair, the link is exposed, and the
> gate errors on a file whose subject is that error. That is the third time in
> this run the tool has accused a document of the thing it was correctly
> demonstrating.

**The cause of four of the five is one assumption**: `blankCodeSpansDoc` splits on
`/\n[ \t]*\n/` and treats that as CommonMark's paragraph break. It is not — a
`>`-only line, a list-item boundary and an ATX heading all end a paragraph
without a blank line.

**The fifth is the exact-length search.** `_links.mjs:176` takes the *first*
`indexOf(run)`; when that lands inside a longer run the scanner abandons the
opener instead of searching onward for a later closer of the right length.

Two further findings, read rather than run:

- **`move.mjs:306` and `issues/check.mjs:299` still call the per-line blanker** —
  the wrapped-span bug was fixed in one caller of three. `move` **writes**, so
  there the bug rewrites a quoted example: precisely the damage its own comment
  says the blanker exists to prevent. The scaffolder's Todo template guarantees
  the triggering shape exists in every consumer tracker.
- **The eight-case fixture was never committed.** It lives outside the repo, and
  none of the five findings above is among its eight cases. There is no
  regression guard in the tree.

Pre-existing, not this commit's: 4-space indented code blocks and HTML comments
are not excluded by the fence tracker; reference-style links are invisible to the
link pattern entirely.

## Half two — coherence

**The four intended landing sites were hit. The rule lives in at least ten more
places that still state the old one.**

| Where | What is stale |
|---|---|
| `user-guide/19_issues/05_sub-docs/05_agent-log.md:34-39` · `09_using-with-ai.md:88-89,155,180-184` · `08_workflows/02_work-an-issue.md:67-69` | the retired rule verbatim, published — including the *"three-file floor"* framing the new rule names as a **prohibition** |
| `_manifest.mjs:133` | `new-agent-log` summary still reads *"nothing else seeded"* — **in the file this commit edited to add `reindex`** |
| `agent-ks-docs/references/cli-toolkit.md:42-56` | self-described complete reference: stale `new-agent-log` row, **no `reindex` row at all** |
| `agent-ks-issues/SKILL.md:359` | says `02_working/` appears *"as work lands"*, contradicting the same file's new paragraph |
| `24_agent-logs.md:167-169, 495-496, 580, 585-592, 647, 746-748` | the rewritten file's own body still carries old triggers, old file counts, and trees without the index |
| `guide.ts:287-292` · `10_writing/10_writing.md:28` · `05_agent-log.md:348-352` | frontmatter key tables omit `unit:` while the same documents say the Kind column reads it |
| `60_examples/61_multiple-subtasks.md` · `63_agent-loops.md` · `41_searching.md:48` · `01_folder-layout.md:40` | old rule, old scaffold description, trees without the index |

**Checked and clean:** repo-root `CLAUDE.md`, both READMEs, dev-docs, the
`issues.ts` loader and the layouts (`00_index.md` sorts first on its `00` prefix;
`unit:` is ignored harmlessly), and the `reindex` manifest registration itself.

The installed plugin cache is a complete pre-commit snapshot — expected drift
pending a release, and stated as fact rather than as a violation.
