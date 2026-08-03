---
title: "Fix the tools, then the links"
---

Close the last silent-failure defect, then the whole link-integrity group, in one
run. Four stages.

**Stages reference the subtasks they schedule; they never restate them.** The
chips under each stage are resolved live, so this plan cannot show a status that
has moved on — it stores none.

## The order, and why it is not the obvious one

The obvious order starts with the renderer, because it is the cause of
everything. It is wrong, by one stage.

```
  10  the tools tell the truth   ← every later gate is quoted from these
       │
  20  the renderer               ← the actual defect
       │
  30  one rule, every surface    ← edits the skills heavily. Needs stage 10 live
       │                            or "skill-links clean" means nothing again
  40  correct the record, gate it
```

**Stage 10 first because every stage after it quotes a gate.** Today
`agent-ks check skill-links` reports on the installed plugin rather than the
working tree, so a green during stage 30 — which edits skill files heavily —
would describe a copy nobody touched. That already happened once: every
"skill-links clean" recorded in this issue before 2026-08-03 was about the wrong
tree.

**Stage 40 last because it encodes decisions the earlier stages take.** The link
form gate has to know whatever [`020`](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
concludes about cross-section links, and the records can only be corrected once
the corrected story is settled.

## The rule this plan is really removing

Three defects in this run share one mechanism, and each stage removes one
instance of it:

> **A rule required for correctness, written as a preference.** When the caller
> skips it, the system returns a plausible result anyway — it renders, it reads
> right, and it is already broken.

| Written as | Actually | Stage |
|---|---|---|
| *"or the resolved URL — also works"* | `move` cannot maintain absolute links | 30 |
| *"or backticked repo paths in prose"* | nothing can maintain a backticked path | 30 |
| the scan root inferred from where you stand | only the human knows which tree they mean | 10 |

## Standing constraints for the whole run

- **`done` and `dropped` are Sid's.** Every stage and subtask closes at `review`.
- **Control-test both directions on every fix** — the guard fires on the defect,
  and stays quiet on correct input. Neither half alone proves anything. This is
  not ceremony here: both of the last two guards written in this issue were wrong
  on first draft and the control test is what caught them.
- **No mass content edit without a batch-and-check loop.** Stage 30 proposes the
  second large link edit in this repo. The first was 341 files and wrong.
- **Commit on `fix/relative-link-rendering` only. No micro-commits. Do not push.**

## Outcome

**All four stages ran 2026-08-03. Broken in-body links 418 → 0; every stage at
`review`, none at `done`.**

| Stage | Result |
|---|---|
| `10` tools | `agent-ks` = installed, `agent-ks-dev` = this tree. Needs `/plugin install` before the bare command changes behaviour |
| `20` renderer | Three lines. 418 → 55, control-tested by disabling the shift and rebuilding. Zero content files changed |
| `30` the rule | No cross-section exception exists — proven, not assumed. 129 links converted, 55 → 0 broken |
| `40` records + guards | `0.2.1` corrected in place with a dated block; `move` reports its skips; `check link-form` ships green |

**Stage 10 first was the right call, and it paid off within the run.** Stage 30
edited five skill surfaces; every "clean" quoted for those edits came from
`agent-ks-dev`, reading the tree that was actually being changed.

### Three things worth carrying out of this run

**A count improving is not evidence a change is correct.** The renderer fix took
418 → 55 and had introduced a new bug on the way: it shifted links to colocated
*files*, which a different postprocessor resolves against a different base. It
was found by tracing one link into its built output — the same check that would
have prevented the original 341-link mistake, and it costs one request.

**The exception that wasn't.** `020` was told to verify the cross-section
exception rather than assume it. Verifying collapsed it: `move` maintains
cross-section relative links, so 115 links believed to follow a convention were
simply unmaintained. **Checking a rule you expect to confirm is how you find the
rule doesn't exist.**

**Both new gates are green on arrival, deliberately.** The tree was taken to zero
before `check link-form` shipped, and the backticked-path rule was left unbuilt
precisely because it would have landed red against ~44 existing instances. A gate
that is red on arrival is a gate people learn to ignore.

### Left open, and why

- **[`060`](../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md)** —
  1,372 broken tracker links, measured, untriaged. Different pipeline, different
  defect; acting on it without triage is what this whole group is about.
- **[`080`](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)** —
  the rule is live on every surface, the ~44 existing backticked paths are not
  converted. Judgement per instance, not a sweep.
- **[`040`](../../subtasks/100_link-integrity/040_site-wide-link-rot.md)** still
  prescribes the rewrite that was reverted.
