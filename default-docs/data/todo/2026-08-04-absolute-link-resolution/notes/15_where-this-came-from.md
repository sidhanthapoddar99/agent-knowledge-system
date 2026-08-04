---
title: "Where this came from — the complete map back into the link-integrity round"
---

# What this note is for

**Everything this issue knows was learned somewhere else first, at real cost.**
This is the index back into that work — every prior subtask, run record and
correction, with what it settled and whether it is still live. Nothing here is
restated; each row points at the file that owns it.

Read it when you need the *evidence* behind a claim in this issue, or before
re-opening a question that has already been answered and paid for.

The whole prior round lives in
[the link-integrity group](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/00_overview.md)
of the refactor-and-planning issue, plus
[the issue-link-resolution issue](../../2026-06-09-issue-link-resolution/issue.md),
now closed.

# The story in five beats

```
  ① 341 links "fixed"        content rewritten to site-absolute form.
     (before this round)     The renderer was never opened. Reverted.
              │
              ▼
  ② the diagnosis            it IS the renderer — a one-level depth shift
     010, 030, 040           lands. Numbers measured off dist/.
              │
              ▼
  ③ the live check           15 links clicked in a browser. 12 worked.
     110, 120                The dist/ numbers were measuring something else.
              │
              ▼
  ④ the shift removed        Sid reproduces the failure in one click.
     190                     Then trailingSlash: 'always' — also reverted.
              │
              ▼
  ⑤ THIS ISSUE              no constant is correct. Stop guessing;
                            resolve absolutely at render time.
```

# The prior subtasks, and what each one settled

**Closed into this issue** — their live work continues here:

| Prior subtask | What it settled | Where it continues |
|---|---|---|
| [the depth shift is removed](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/190_the-depth-shift-is-removed.md) `dropped` | The diagonal: no constant offset is correct, including zero. `trailingSlash: 'always'` is not the way out either | this issue, whole |
| [reframe the link checker](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/070_reframe-the-link-checker.md) `dropped` | Reframed three times; the third answer was that a `dist/`-reading gate does not belong in the plugin | [retire the plugin's rendering gate](../subtasks/100_absolute-resolution/060_retire-the-plugin-rendering-gate.md) |
| [the rendering gate is in the wrong tree](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/180_rendered-link-check-belongs-to-this-repo.md) `done` | The live crawler, control-tested both ways, with the three-environment baseline | [recheck the rendered links](../subtasks/100_absolute-resolution/070_recheck-rendered-links.md) |
| [`base_url` and the folder name are not tied](../subtasks/100_absolute-resolution/040_base-url-and-folder-name-are-not-tied.md) | Moved here outright | it is a subtask of this issue |
| [the Comprehensive panel](../subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md) | Moved from the June issue, where absolute resolution was first decided | it is a subtask of this issue |

**The evidence base** — closed, and this issue rests on them:

| Prior subtask | What it proved |
|---|---|
| [the live check — 12 of 15 worked](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md) `done` | **The single most valuable thing in the round.** Fifteen browser clicks destroyed a conclusion two independent audits had agreed on. Everything after it is re-based on this |
| [dev and build disagree on the base](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md) `input-needed` | The real diagnosis, and the three options. Now measured as a number: 0 disagreements dev↔preview, **546** dev↔a real file server |
| [the renderer drops a URL level](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/010_renderer-drops-a-url-level.md) `done` | The original diagnosis, the shift, and the four broken link shapes handed forward to [the shared resolver](../subtasks/100_absolute-resolution/020_the-shared-resolver.md) |
| [does the tracker share it?](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/060_does-the-tracker-share-it.md) `done` | Answered *no* — **but on dev-only evidence.** Re-check it under [unify the tracker and blog](../subtasks/100_absolute-resolution/050_unify-tracker-and-blog.md) rather than inheriting the answer |
| [relative links are the contract](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/020_relative-links-are-the-contract.md) `done` | The **content** rule, on 15 surfaces, with its architectural reason. This issue must not contradict it: links in markdown stay relative; only the *rendered href* becomes absolute |
| [the user-guide's 85 broken relative links](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/030_user-guide-relative-links-404.md) `done` | The measurement, and the fix that had to be reverted |
| [site-wide link rot](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/040_site-wide-link-rot.md) `done` | The 4,295 and the in-body count, both retracted in place |
| [correct the published records](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/050_correct-the-published-records.md) `done` | Nothing published still recommends the site-absolute form |
| [what the wrong diagnosis taught](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/130_what-the-wrong-diagnosis-taught.md) `in-progress` | The damage inventory — nine surfaces the wrong conclusion reached |
| [dual-slug URL resolution](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/140_dual-slug-url-resolution.md) · [plans auto-resolution](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/150_plans-auto-resolution.md) `done` | Routing defects found by the live check, fixed on the June issue |

**Still live over there, and deliberately not moved** — these are *file* questions,
and absolute resolution does not answer any of them:

| Prior subtask | Why it stays |
|---|---|
| [relative but not a path — 334 slug-form links](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/170_relative-but-not-a-path.md) `open` | A link naming a published slug rather than a file. Every gate passes it and `move` skips it **silently**. It is invisible to a renderer change — and it will become a *lookup miss* once [the path map](./30_the-path-map.md) lands, which is the first thing that has ever been able to see it |
| [tools must say what they skip](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/090_tools-must-say-what-they-skip.md) `in-progress` | `move` and `check` silently declining links is a tooling contract |
| [links whose target does not exist — 55 of them](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/100_links-whose-target-does-not-exist.md) `review` | Genuinely dead targets — a content defect |
| [link it, don't name it](../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/080_link-it-dont-name-it.md) `open` | A backticked path is unmaintainable. A writing convention |

**The split, stated once:** whether a link *resolves in a browser* is the
engine's output and this issue's; whether it *names a file that exists* is the
content's and stays there. That is the same three-stages test that moved the
rendering gate out of the plugin.

# The run records

Where the work was actually carried out, with the reasoning as it happened:

- [move the gate and drop the shift](../../2026-08-02-refactor-efficiency-and-planning/agent-log/060_wf_move-the-gate-and-drop-the-shift/01_summary.md)
  — the run that removed the shift, wrote the live crawler, and commissioned the
  independent audit of every path change of the preceding four days
- [state the rule with its reason](../../2026-08-02-refactor-efficiency-and-planning/agent-log/050_rf_state-the-rule-with-its-reason/01_summary.md)
  — putting the relative-link rule, with its *why*, onto every surface that
  teaches it
- [fix the tools, then the links](../../2026-08-02-refactor-efficiency-and-planning/agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md)
  — the round that produced the retracted numbers, kept for exactly that reason

# The corrections, kept on purpose

**This round retracted more numbers than it published, and that is the most
useful thing in it.** Every one is corrected in place in the file that made the
claim; listed here so nobody re-quotes a dead figure:

| Claim | Reality |
|---|---|
| "4,295 broken links site-wide" | Retracted — measured off `dist/` with a constructed URL |
| "15,586 in-body links" | Inflated ~27× — the body regex matched `<main>`, so every sidebar was counted. 112 vs 9 on one real page |
| "418 → 55, control-tested both directions" | Both numbers from one method that assumed the trailing slash. **The control could not have failed** |
| "1,372 broken tracker links" | Not a count of broken links — the size of the dev/build disagreement |
| "0 broken in-body links" | Meant *0 broken paths*. Four broken **anchors** existed and the gate could not see fragments at all |
| "55 → 0 broken in-body links" | Actually 4 |

**The pattern under all six:** a number produced by a tool that could not see the
environment it was describing, reported as if it could. That is why every
measurement in this issue names the environment it was taken in, and why
[the recheck](../subtasks/100_absolute-resolution/070_recheck-rendered-links.md)
requires **two** numbers rather than one.

# The rules this round paid for

Each one cost at least a day. They belong to the project, not to this issue:

- **Trace one link end to end before touching anything.** A 404 has more than one
  cause — source, transform, routing, config, output — and uniform failure across
  independent authors discriminates none of them. The check costs one HTTP
  request; the edit it guards cost 341 files.
- **Two directions of one method are still one method.** A control proves the
  measurement responds to the change, not that it is asking the right question.
- **Corroboration requires independence.** Ask whether the second opinion *could*
  have disagreed.
- **A gate that cannot see a failure class certifies it**, rather than missing it.
- **Measure the environment that ships.** Neither `astro dev` nor `astro preview`
  reproduces a static host — 4 versus 546.
- **Never fix a broken link by making it site-absolute.** It renders green and
  silently leaves link maintenance forever, because `move` skips every target
  beginning with `/`.
