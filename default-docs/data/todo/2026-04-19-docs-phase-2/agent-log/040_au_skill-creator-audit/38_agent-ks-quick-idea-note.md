---
title: agent-ks-quick-idea-note — re-audit
---

# agent-ks-quick-idea-note

**Verdict:** needs fixes — every first-round finding landed, but the routing step now hands the agent a closed match with no row that fits, and the search placeholder produces either nothing or everything.

**Measured:** SKILL.md 813 body words (103 body lines) · references: none (still a single file, no `references/`, `scripts/` or `assets/`). Decision I exempts a single-file skill from the 600-word cap. The body grew from 525 to 813; the worked example is ~95 of that and earns its place.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `SKILL.md:54` now requires the value in `fields.component.values` **and** a matching `fields.component.descriptions` entry, with the reason. Matches `issues.ts` `resolveVocabulary()` (throws) and `check.mjs:543-545` |
| 2 | closed | `SKILL.md:22-32` is two calls. Ran both: the `--path "sidebar" --include-closed --count` call returns `2026-05-07-sidebar-state-persistence` (done) and `2026-06-10-sidebar-cache-v2` (done). The miss is fixed. `--include-closed` is a real flag. What to do with that result is new finding N2 |
| 3 | closed | `SKILL.md:65` names the `- [ ] item` / `- [ ] sub-item` placeholders, orders the sub-head deletion, keeps the five `#` sections, and a worked example follows. The template confirms the placeholders |
| 4 | closed | `SKILL.md:36` links `../agent-ks-issues/references/06_subtasks.md` as the work-order standard, with the handoff-anchor reason |
| 5 | partly | The one line landed at `SKILL.md:52`, per the verdict. But nothing tells the agent to inspect the dump's subtasks, and steps 4 and 5 still describe the scaffold branch only. See N3 |
| 6 | closed | The proposed description is in place verbatim. `agent-ks-issues` still names "the issue dump" and "backlog" in its own description; that is the sibling's file, not this one |
| 7 | closed | `SKILL.md:10` reads "two lookups, one file, one confirmation line" and step 2 prescribes two. The bucket branch adds a third that is not counted (N3) |
| 8 | closed | `SKILL.md:54` is down to "a short `issue.md` that states the contract from the operations reference". The To Do line and the Never row keep the other two copies, as ruled |
| 9 | closed | `SKILL.md:10` carries an "open it when". The gate is now false in two other places (N4) |
| 10 | closed | `SKILL.md:58` says "the lead paragraph: why this exists". `agent-ks-dev help issue new-subtask` says "the lead paragraph: why this subtask exists". One name per thing |
| add ×4 | closed | Worked example (`67-89`), the title-or-slug test for a strong match (`36`), the closed-scope caveat (`28-32`), the `01_anatomy.md` settings-field link (`54`) |
| cut ×3 | closed | The third contract copy, "one search", and "in a phrase or a sentence" from the description (still in `argument-hint`, as intended) |

No regression found in the changed passages. `agent-ks-dev check skill-links` passes (61 files, `[repo source tree]`). No site-absolute link. No history. `@root/astro-doc-code/src/layouts/docs/default/Sidebar.astro` in the example exists (decision B form). "Gap-spaced by ten" matches `new-subtask.mjs:77-89`.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `SKILL.md:25` | `--search "<two or three keyword roots>"` never says the value is a regex, and neither reading of the placeholder works | Measured on this tracker: `--search "sidebar expand persist"` returns **0 issues**; `--search "sidebar\|expand\|persist"` returns **20 issues, 363 matches**. The breadth call is step 2's first act and it answers nothing either way | Show the form instead of describing it: `agent-ks issue list --search "sidebar.*(expand\|collaps\|persist)" --count --quiet-tips`. Say the value is a regex, roots joined by `\|`, narrowed with `.*` when one root is common |
| N2 | major | `SKILL.md:28-36` | The new closed-scope lookup returns closed issues, and the Result table has no row for one. The only row that fits says "offer to add it to `<id>` as a subtask" | The dry run reproduces it: the strong match is `2026-05-07-sidebar-state-persistence`, status `done`. The skill's own reason clause says "a subtask on a **live** issue", so the instruction contradicts its reason. The sibling reference already rules on this case: `09_operations.md:73` "Closed match only — create. Mention the prior issue when it matters" | Split the strong-match row. Open or review → offer the subtask as today. Closed → say the surface already shipped, name the issue, and ask whether this is a regression, a follow-up, or already covered. Do not dump and do not scaffold before the answer |
| N3 | major | `SKILL.md:52` vs `56-101` | The category-bucket branch states the rule but gives the agent no lookup to reach it and no output shape once it is reached | Step 4 says "Scaffold with the CLI" unconditionally, the worked example is a five-section leaf, and step 5 confirms `subtasks/NN_<slug>.md`. On this tracker the bucket case is the *only* case, so the agent follows the rule at 52 and then contradicts it twice. `agent-ks issue subtasks <id> --quiet-tips` shows the shape in seven lines and is never named | Put `agent-ks issue subtasks <dump-issue-id> --quiet-tips` in step 3 as the shape check, and update line 10's count. Give step 4 and step 5 the append variant: which file, which `##` heading, and `Captured → <id>/subtasks/NN_<bucket>.md § <heading>` |
| N4 | minor | `SKILL.md:10` vs `37`, `54` | "Open the operations reference **only** when the user pushes back on the routing call in step 2" is false — lines 37 and 54 both send the agent there for other reasons | An agent that takes "only" literally writes the first dump issue's `issue.md` without the contract it is told to state | Reword: "Open it for the create branch in step 3, or when the user pushes back on the routing call in step 2" |
| N5 | minor | `SKILL.md:65` | "Delete the `##` sub-heads a dump entry has nothing to say about" has one exception the sentence does not name | `check issues` warns when `# 02` carries no `## Agent log` (`check.mjs:196-218`). A dump entry has nothing to say there, which is exactly the trigger the sentence gives for deleting it. Only the worked example saves the run | Add the exception with its reason: "…except `## Agent log`, which stays as `none` — the validator warns when it is missing" |
| N6 | minor | `SKILL.md:50`, `54` | The create-the-first-dump-issue branch names no procedure. There is no `agent-ks issue new` verb — confirmed against `agent-ks-dev help` — so the agent builds the folder by hand with no folder-name rule in front of it | The `01_anatomy.md` link covers the settings fields only. Folder name, `settings.json` and `issue.md` are left to inference on the one branch that writes a folder | Point at the six-step "A new issue" list in `09_operations.md` instead of restating it |

## The dry run, second time

The same prompt: *"quick thought before I forget — the sidebar should remember which section you had expanded when you come back. no idea where that belongs, just park it."*

1. Better: step 2 is two calls with a stated purpose each, and `--count` gives one line per issue as promised.
2. Better: the closed-scope call found `2026-05-07-sidebar-state-persistence` and `2026-06-10-sidebar-cache-v2`, both `done`. Last time I only found them by suspicion. **The idea is already shipped, and the skill now surfaces that.**
3. Better: "strong match" has a test (title or slug), and both hits pass it. No judgement call left.
4. Better: step 4 tells me to strip the placeholders, and the worked example settles the shape. Nothing to guess.
5. Better: I did not open `09_operations.md`, and did not need it.
6. Wrong: the breadth call. `"sidebar expand persist"` → 0 issues. `"sidebar|expand|persist"` → 20 issues, 363 matches. I had to invent the regex form myself (N1).
7. Wrong: with a `done` strong match, the only table row told me to offer a subtask on a closed issue. I stopped and reported instead. The skill has no row for "already shipped" (N2).
8. Wrong: step 3 found the one dump issue cleanly, then I had to run an unlisted `issue subtasks` call to learn its seven subtasks are still category buckets. Step 4 then told me to scaffold and step 5 to confirm a leaf path (N3).
9. Stopped before the write, as briefed. Nothing was created or edited.
10. Still missing: the append branch's output shape, and the regex form of the search.
