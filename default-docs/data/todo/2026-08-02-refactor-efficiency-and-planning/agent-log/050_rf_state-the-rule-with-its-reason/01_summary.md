---
title: "Summary"
---

# State

**Closed 2026-08-04.** One worker, one independent auditor, one correction round
by the orchestrator. Landed on `fix/relative-link-rendering`; the subtask it
executed against, [`020`](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md),
is `done`.

# Goal

**Every surface that teaches link form must carry the *reason* for the rule, and
must stop saying that a leading `/` is always wrong.**

The rule itself — internal references are relative — is already stated
everywhere and is not in question. What is missing is why, and the current why is
the shallow one: *"`agent-ks move` cannot maintain a `/` link"*. That reads as a
tooling limitation a better tool would remove, and it is the framing under which
341 content links were converted to a form `move` silently drops.

The real reason is architectural, and it is Sid's, stated 2026-08-04:

> These documents are built in a **filesystem-first format so that filesystem
> tools work on them** — `move`, `grep`, an editor, an agent walking the tree.
> A relative link is the only form that is true on disk, so it is the only form
> all of those can follow. **The UI is an addition that enhances the documents;
> it is not the thing being built.**

Stated in full in this repo's `CLAUDE.md`, section *"The filesystem is the
document. The app renders it."* — the source of truth for this run.

# Todo

References this run executes against:

- [`020_relative-links-are-the-contract.md`](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
  — **the brief proper.** Section *"Todo — the reopened round"*, items 1–4, 6, 7.
  Read it before anything else; it carries the wording of each defect and why it
  is one.
- The project `CLAUDE.md` section *"The filesystem is the document. The app
  renders it."* — the principle to state a short version of, **never to copy**.
- `plugins/agent-ks/skills/agent-ks-docs/references/layouts/docs-layout.md`,
  under *Cross-linking between docs pages* — where items 1–4 all live.

- [ ] [Item 1 — say why, and say the real why](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [ ] [Item 2 — stop saying a leading `/` is always wrong](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [ ] [Item 3 — drop the stale depth claim](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [ ] [Item 4 — keep the warning, delete the 341 story](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [ ] [Item 6 — repeat the fact deliberately, with weight](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [ ] [Item 7 — the two smallest findings](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)

## The one instruction that is easy to get backwards

**Item 6 is not a deduplication task. It is the opposite.** An earlier audit
counted the `move`-skips-`/` fact in eleven places and called it duplication.
Sid's ruling, 2026-08-04: **the fact belongs in three or four places in the
skill, and five or six more across docs, the tracker and the code is fine.** A
rule an author meets once, in a file they may never open, is a rule that gets
missed.

The condition is **weight, not count** — every restatement carries the reason,
not just the instruction. What stays single is the **mechanism**:
`plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs:28` is the one line
that decides it, and no restatement may re-implement or contradict it.

# Out of Scope

- **Cross-root portability.** Moved out of `020` entirely and now
  [`160`](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/040_base-url-and-folder-name-are-not-tied.md)
  — `base_url` and the data folder are independent `site.yaml` values that match
  here only by naming convention. It needs reproducing and probably a
  config-load refusal, not wording. **Do not touch it.**
- **Item 8** — the subtask's todo list and its outcomes section disagree. Sid
  decides which side is right; touch neither.
- **Any content link.** No file under `default-docs/data/**` changes its links in
  this run. The 129-link conversion is done and the rule is enforced by
  `agent-ks check link-form`.
- **The renderer.** `internal-links.ts` is being replaced by
  `2026-06-09` `03`; this run is documentation only.

# Outcome

**15 restatements of the link rule across 13 files, each carrying its reason.**
Working record: [the rewrite](./02_working/010_the-rewrite.md).

| Stage | Result |
|---|---|
| Round 1 — the writer | Items 1, 2, 3, 4, 6 done; item 7 half; two open questions disclosed rather than decided |
| Audit — independent, executing | **DEFECTS FOUND.** Reproduced the `/assets/` gate conflict against a scratch file; answered seven authoring cases from the text alone |
| Round 2 — the correction | The `/assets/` exception deleted outright on Sid's ruling; `guide.ts` and the cross-section claim fixed; item 7 completed |

**The round's own mistake, and it is the useful part.** Round 1 read the rule's
one exception as *"a leading `/` is right for `/assets/…`"* and wrote it onto
five surfaces. Sid, 2026-08-04: *"In the documents, we don't use the asset folder
of the website. The asset folder is only used by the code."* The split is by
**who references**, not by what the folder holds — so there is no exception, and
`check link-form` had been right all along while every prose surface drifted away
from it. **The gate was the only thing that never lied.**

Three surfaces were reached that had no link rule at all before: the docs skill's
general writing reference, `user-guide/15_writing-content/02_markdown-basics.md`,
and `user-guide/19_issues/03_folder-structure.md`. `blog-layout.md` was found
unswept and fixed.

Gates at close: `check skill-links` 44 files pass `[repo source tree]`,
`check link-form` 569 links / 161 files pass, `check issues` clean but for one
pre-existing unrelated warning.

**Left open deliberately:** the `cover:` blog frontmatter field is documented and
nothing reads it — the blog is still under development (Sid, 2026-08-04). And a
diagram file sitting directly beside a page, rather than inside `assets/`, is
covered by no skill surface; the fact lives only in `asset-src.ts:16`.
