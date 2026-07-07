---
title: "doc-issues skill — agent-log milestones don't get structured (iteration frontmatter, phase granularity)"
status: open
---

Observed on the artifact-component runs (`2026-07-07-artifact-component/agent-log/`,
activities `010_wf_*` / `020_wf_*` / `030_wf_*`): agents following the `doc-issues`
skill produce the activity-folder shell correctly but not the milestone structure
inside it. Concretely, across three workflow runs:

- **No `iteration` frontmatter at all** — milestones carry only `title` +
  `status: done`, missing the documented `iteration` / `agent` / `date` fields
  (`references/20_sections/24_agent-logs.md` milestone shape), so the `#N` badge
  never renders. Worse, `done` is not even in the milestone status vocabulary
  (`not-started | in-progress | success | failed`) — it was borrowed from the
  subtask vocabulary.
- **Whole multi-phase workflows squashed into one milestone.** A workflow with
  distinct phases (e.g. build ×2 → verify → fix, or research → write → review)
  landed as a single `101_` file. Each workflow *phase* is a natural iteration
  point; the skill's "~3–6 milestones per activity" guidance isn't translating
  into per-phase milestones for `wf` runs.
- **Meta trio incomplete** — `020_wf_implementation/` never got its `01_summary.md`.

Intended granularity to settle and encode (case-by-case, but the defaults should
be stated in the skill):

- **Workflows (`wf`)**: each top-level workflow phase (the `phase()` groups —
  build / verify / fix, etc.) becomes one milestone with `iteration: N`; sub-steps
  and per-agent detail go as bullets *inside* that milestone, noting agent counts /
  what each stage covered. A final audit/fix phase is its own milestone.
- **Loops (`lp`)**: large loop iterations map 1:1 to milestones; small/rapid loop
  iterations get consolidated, several per milestone — judged case by case.
- **Audits (`au`)**: sweep → findings → fixes are natural milestone boundaries.

This is a **skill review, not a code change**: reread `24_agent-logs.md` (and the
`63_agent-loops.md` worked example) and figure out why the milestone shape isn't
being followed — likely the frontmatter block and the per-kind granularity rules
are too buried/implicit for an agent writing logs mid-run — then strengthen the
skill text (repo source `plugins/documentation-guide/skills/doc-issues/` **and**
the installed cache, mirrored byte-identically) plus the bundled `guide.ts` legend
if its wording contributed.

- [ ] Audit recent agent-log activities across the tracker for the same gaps
      (missing `iteration`/`agent`/`date`, wrong status vocabulary, one-milestone
      workflows, missing `01_summary.md`).
- [ ] Discuss + settle the per-kind granularity defaults above (wf phases as
      iterations; lp consolidation thresholds) — likely a short `discuss`
      brainstorm on this issue first.
- [ ] Strengthen `24_agent-logs.md` (and SKILL.md's executing-work section) so the
      milestone frontmatter + granularity rules are unmissable at write time;
      mirror to the installed cache; sync `guide.ts` if needed.
- [ ] Verify on the next real run: milestones carry `iteration`/`agent`/`status`
      from the correct vocabulary, one milestone per workflow phase, summary
      written at wrap.
