---
title: "Code the plans section (framework + CLI)"
status: open
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

- [ ] Framework: add the section to the loader enumeration and reader; a plan is
      a **folder** — `settings.json` + reserved `overview.md` + `NN_<name>.md`
      stage files
- [ ] Framework: routes — `route-match.ts`, `static-paths.ts`
- [ ] Framework: presentation — sidebar group, `SubdocTree` prefix map,
      `NotePage` prefix union, `SubDocLayout`, panel keys + URL builders
- [ ] Framework: **the single-page plan view** — `overview.md`, then the
      generated table, then every stage inlined with a generated
      `<prefix> <title>` heading. **Anchor on the title, never the prefix**
- [ ] Framework: **the Subtasks column** — resolve `subtasks:` refs, group by the
      `category` they already carry, count. Reuse `CATEGORIES` and the existing
      status colours; add nothing
- [ ] Framework: **the active-plan pin** — a `Plans` sidebar group with the
      active plan (highest not `done`/`dropped`, derived at render, never
      stored) pinned and marked at its top. **Nothing renders above the issue
      body** (Sid, 2026-08-02)
- [ ] CLI: scaffold verbs — a new plan (folder + `settings.json` +
      `overview.md`), and a new stage (frontmatter pre-filled)
- [ ] CLI: **`new-agent-log.mjs` stops seeding the six slots** — `summary.md` +
      `working/` + `debrief/` + `settings.json`, per
      [the agent-log spec](../../notes/20_agent-log-structure.md)
- [ ] CLI: a verb that **creates an iteration file with its head pre-filled**
      (`# Goal` / `# Inputs` / `# Expected Outcome` / `# Outcome`). The head is
      the orchestrator's work order, so the tool should write it rather than
      leaving four headings to be remembered
- [ ] CLI: `check issues` learns the section **and the new agent log shape**.
      **Do NOT validate "one active plan"** — it is convention, not enforcement
- [ ] *(moved out — agent log `settings.json` is now
      [`015`](./015_code-agent-log-settings.md), a new read path rather than a
      field, and it ships independently of this subtask)*
- [ ] **CLI bug**: `--group` sanitises `_` → `-` and creates a duplicate folder;
      fix the shared path sanitiser (see Details)
- [ ] Update the demo fixture to exercise the new section
- [ ] Verify: `./start build` clean, fixture renders, links resolve

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
