---
title: "Code the plans section (framework + CLI)"
status: done
---

# Overview

Build the plans section as specified in
[The plans section (decided)](../../notes/50_plans-section-spec.md) — framework
(loader, routes, sidebar, the single-page plan view), CLI (scaffolding +
validation). **No migration**: the one live consumer is migrated by hand.

**Done when** the demo fixture renders a plan end to end — table, generated stage
headings, live subtask counts by category — `agent-ks check issues` validates it,
and a fresh plan can be scaffolded with one command.

# References

- **The spec — build against this, not the brainstorms**:
  [The plans section (decided)](../../notes/50_plans-section-spec.md)
- How it was argued: [thread 03](../../brainstorm/03_options_plans-as-references.md)
  (what a plan is) · [thread 06](../../brainstorm/06_discuss_plan-file-shape.md)
  (the shape, and one reversal)
- Deliberately NOT in scope: the section registry, sequenced as
  [`090`](./090_section-registry.md)
- Test bed: `default-docs/data/todo/2026-07-01-demo-issue-anatomy-showcase`
- Current CLI verb being replaced/renamed: `agent-ks issue new-memory-plan`
- Prior art for adding a content type: `CLAUDE.md` → "Register routing" (step 6)
  and the `2026-07-07-artifact-component` issue

# Todo list

- [x] Framework: add the section to the loader enumeration and reader; a plan is
      a **folder** — `settings.json` + reserved `overview.md` + `NN_<name>.md`
      stage files
- [x] Framework: routes — `route-match.ts`, `static-paths.ts`
- [x] Framework: presentation — sidebar group, `SubDocLayout`, panel keys + URL
      builders. (`SubdocTree`/`NotePage` are untouched: plans are a fixed
      two-level shape, not a free-form nested tree, so they get their own two
      components rather than joining the tree machinery)
- [x] Framework: **the single-page plan view** — `overview.md`, then the
      generated table, then every stage inlined with a generated
      `<prefix> <title>` heading. **Anchor on the title, never the prefix**
- [x] Framework: **the Subtasks column** — resolve `subtasks:` refs, group by the
      `category` they already carry, count. Reuse `CATEGORIES` and the existing
      status colours; add nothing.
      **Removed 2026-08-03** — see [the plan table rework](../090_plan-table-rework.md).
      The refs are still resolved; they render as named chips, not a tally
- [x] Framework: **the active-plan marker** — a `Plans` sidebar group with the
      active plan (highest not `done`/`dropped`, derived at render, never
      stored) marked. **Nothing renders above the issue body** (Sid, 2026-08-02).
      Shipped as a top-of-group pin; **changed 2026-08-03** to a bold mark with
      the list left in ascending prefix order
- [x] CLI: scaffold verbs — `issue new-plan` and `issue new-stage`
- [x] CLI: **`new-agent-log.mjs` stops seeding the six slots** — see *What
      shipped differently*, below: it creates two files, not four
- [x] CLI: `issue new-iteration` — **creates an iteration file with its head
      pre-filled** (`# Goal` / `# Inputs` / `# Expected Outcome` / `# Outcome`)
      and derives the `NNN` from what is already in `working/`.
      **Changed 2026-08-03** — the folder it reads and writes is now
      `02_working/` ([the numbering spec](../../notes/80_agent-log-numbering-spec.md));
      the `NNN` derivation inside it is untouched
- [x] CLI: `check issues` learns the section **and the new agent log shape**.
      One active plan stays a hint, never an error
- [x] *(moved out — agent log `settings.json` is
      [`015`](./015_code-agent-log-settings.md))*
- [x] **CLI bug**: `--group` sanitising `_` → `-` — fixed in the shared
      sanitiser (`sanitizeGroupSegment` in `issues/_lib.mjs`)
- [x] Update the demo fixture to exercise the new section — one plan, four
      stages, all four status categories represented
- [x] Verify: build clean, fixture renders, links resolve

# Outcomes and Next Steps

**Shipped.** The plans section exists end to end: loader, routes, the single plan
page, the sidebar pin, four CLI verbs, and validation.

**Verified rather than assumed.** Page count 902 → 907 on the same tracker — one
plan page plus four stage pages. The table resolves live subtask status
(`0/0/0/2` · `0/1/0/0` · `0/0/0/0` · `0/0/1/0`), anchors are titles
(`#loader-and-routes`), and stage-body headings are prefixed
(`loader-and-routes-todo`) so four stages each carrying a `## Todo` do not
shadow one another. The new validator error was **proved able to fail**:
renaming one `subtasks:` target gave exactly one error and exit 1; restoring it
gave exit 0.

**Run record:**
[`020_wf_ship-the-split/working/010_plans-section.md`](../../agent-log/020_wf_ship-the-split/02_working/010_plans-section.md).

**Next:** [`015`](./015_code-agent-log-settings.md), then
[`090`](./090_section-registry.md) — deliberately a separate diff.

## What shipped differently from the spec, and why

**A reference that resolves to nothing is an ERROR.** The spec left this open.
It is the one thing about a plan that can go silently wrong: the Subtasks column
is the only number on the page, a dropped ref shrinks it, and a wrong count is
indistinguishable from a right one. So `check issues` errors, and the plan page
names the broken refs in red rather than quietly rendering a smaller number.

**`new-agent-log` creates two files, not four.** The todo above said
`summary.md` + `working/` + `debrief/` + `settings.json`. Only the two *files*
are created. Git does not track an empty directory, so scaffolding the two
folders produces a shape that exists for whoever ran the command and for
nobody who clones — and creating files nobody needs is the exact defect the
six-slot floor was. The folders appear when something goes in them:
`new-iteration` creates the working folder, and the debrief folder is written
when the run has something to hand over. The command prints the `new-iteration`
line as its next step.

**Changed 2026-08-03 — the four names in that paragraph are now
`01_summary.md` + `02_working/` + `03_debrief/` + `settings.json`**
([the numbering spec](../../notes/80_agent-log-numbering-spec.md)). The
two-files-not-four reasoning is unaffected: it is about *when* a folder is
created, not what it is called.

**The new agent-log lint skips old-shape folders, silently.** Existing agent
logs are not migrated — *"history stays as written; this governs what is
recorded next."* Linting them anyway produced **289 warnings** on the first run,
which is how a validator stops being read at all, taking the two real findings
with it. Detection is by the retired markers themselves (`0N_goal`…, `MNN_`
milestones), so a genuinely new folder is still checked.

> [!WARNING]
> **Re-check that detector against the 2026-08-03 numbering
> ([number the agent log's own slots](../100_agent-log-slot-numbering.md)).** The
> new shape's first slot is `01_summary.md`, and the retired six-slot shape had a
> file of **exactly that name**. Any detector keying on a `0N_` prefix rather
> than on the specific retired names (`00_goal`, `02_task_list`, `05_notes`,
> `MNN_`) will now classify every new-shape agent log as old-shape and skip it —
> a lint that silently stops linting, which is the failure mode this paragraph
> exists to avoid. Read off the two shapes, not verified against the code here.

**`SubdocTree` and `NotePage` were not touched.** The Details table below listed
them as required. They are the free-form *nested tree* machinery; a plan is a
fixed two-level shape whose page is a table plus inlined stages, so it gets
`PlanPage.astro` and `PlanStagePage.astro` instead. Joining the tree components
would have meant teaching them a shape they will never otherwise render.

**`agent-ks issue new-memory-plan` is deleted, not renamed.** The old
`agent-memory/plans/` shape is dropped outright, so there was nothing to
repoint. Its replacement is `new-plan`, which writes to a different section
entirely. The skill and user-guide references to it are swept by
[`030`](./030_skill-plans-section.md) and
[`120`](./120_agent-memory-after-plans.md).

# Details

## The framework surface — counted, not guessed

Issue sections are **hard-coded**, not data-driven. Grepped 2026-08-02, a new
top-level section touches at minimum:

| File | What must change |
|---|---|
| `src/loaders/issues.ts` | the section list at the folder walk, plus a reader and a field on the loaded issue |
| `src/pages/lib/route-match.ts` | kind → route matching |
| `src/pages/lib/static-paths.ts` | slug generation |
| `src/layouts/issues/default/parts/detail/DetailSidebar.astro` | the collapsible sidebar group |
| `src/layouts/issues/default/parts/detail/SubdocTree.astro` | the `pathPrefix` map |
| `src/layouts/issues/default/parts/detail/NotePage.astro` | the `prefix` union type |
| `src/layouts/issues/default/SubDocLayout.astro` | standalone sub-doc rendering |
| `src/layouts/issues/default/server/helpers.ts` | panel keys + URL building |
| `src/layouts/issues/default/scripts/detail/panels.ts` | client-side panel routing |
| `src/layouts/issues/default/guide.ts` | the bundled anatomy guide (owned by `050`) |

**That list is a smell, and it is being fixed — but not here.** Ten files
agreeing on one string becomes eleven with plans. The registry is
[`090`](./090_section-registry.md), deliberately sequenced *after* this subtask:
two structural changes in one diff and you cannot tell which one broke the
render. Add the section the existing way; refactor the mechanism next.

## The CLI `--group` defect — reproduced 2026-08-02

```
agent-ks issue new-subtask <issue> --group 040_execution --name foo
→ creates subtasks/040-execution/010_foo.md
```

The underscore is sanitised to a dash, so it silently creates a **second**
sibling folder instead of nesting into the existing `040_execution/`. Same defect
in `new-agent-log --group`. Worked around today by scaffolding then `mv`.

`_` is the canonical ordering-prefix separator in this framework, so stripping it
from a path segment is wrong on its face. Fix the shared sanitiser and add a case
to the CLI tests.

## No migration — decided 2026-08-02

Sid migrates the one live consumer by hand. Nothing is written, nothing is
maintained, and the loader gets no compatibility branch. The old
`agent-memory/plans/` shape is simply dropped.

## Verification

The demo fixture is the test bed *and* the acceptance criterion — if the section
does not render correctly there with folders, nesting, and an index, it is not
done. Note the fixture's `agent-memory/` is currently the older flat shape
(`memory.md` / `decisions.md` / `gotchas.md`), so it needs updating regardless.
