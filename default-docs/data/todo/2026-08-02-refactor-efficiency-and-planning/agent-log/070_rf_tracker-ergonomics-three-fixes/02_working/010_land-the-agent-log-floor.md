---
title: "The agent-log rule lands: one question, three triggers, two floor conditions"
status: done
agent: claude
unit: execution
---

# Goal

Land the rule decided in
[`020`](../../../subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md)
on every surface that carries the short form, and at the point of use. The rule
had a trigger and no floor: read literally it said *executing tracked work opens
an agent log*, and a two-file routing fix qualified.

# Inputs

- `subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md` — the
  decided rule and its six shipping items
- `subtasks/110_tracker-ergonomics/010_plan-execution-needs-an-agent-log.md` —
  the surfaces the opposite fix already touched

# Expected Outcome

The change, and what it touched.

# Outcome

**Four surfaces, and the six items are all on them.**

| Surface | What it now carries |
|---|---|
| `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md` | the full rule — question, triggers, floor, the limits table with both prohibitions, verify-vs-audit, the `🟡 Ask` cap, and the routing table |
| `plugins/agent-ks/skills/agent-ks-issues/SKILL.md` | the short form — question, triggers, floor, both prohibitions, verify-vs-audit, append-don't-open |
| `astro-doc-code/src/layouts/issues/default/guide.ts` | the same short form, plugin-independent |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-agent-log.mjs` | the rule in `--help`, above the flags — where someone is already committing to a log |

**The reasoning ships with the verdicts, not just the verdicts.** Every surface
leads with *a log exists so a finding can be withdrawn*. A rule shipped without
its reason gets applied literally, which is exactly how the previous correction
came to read "always".

**What deliberately stayed in the tracker:** the 14 worked cases, the revision
reasoning, and the archaeology of the five factors. Instances rot; the reference
carries the rule.

## The acceptance test — all 14 verdicts re-run, none moved

The claim the restructure rests on is that it changes *what a reader holds in
their head*, not a single answer. So every case in the subtask's table was
re-decided against the shipped wording alone:

| Group | Cases | New shape gives | Moved? |
|---|---|---|---|
| Plan execution · loops (3–4 and 30–40) · multi-stage audit · migration chain · substantial refactor · the hard bug | 7 | 🟢 trigger 1 (a later step acted on what came back); the hard bug also trigger 2 | no |
| One bounded delegated job · an investigation that changed no code · a 20–30 line commit · anything questioning its own subtask | 4 | ⬜ floor — one self-contained pass, or the log would restate the subtask | no |
| One independent review · the interactive sitting · a design discussion | 3 | 🟡 Ask, capped once per session | no |

**14 of 14 unchanged.** The delegated-job case is the one worth naming: under the
old five factors *whose hands* was co-equal and could have carried it; under the
new shape it is explicitly a weight that never triggers alone, so the floor
wins — same verdict, arrived at without weighing.

## Control test — both directions still fire

The point of a floor is that it must not eat the gate the previous fix built.

| Input | Wanted | Shipped wording gives |
|---|---|---|
| four-stage plan execution | 🟢 required | trigger 1, and *executing a plan always fires trigger 1* is stated by name — the floor cannot reach it, because a plan is not one self-contained pass |
| four-line routing fix, read → edit → curl → build | ⬜ not required | every check is a **verify**, so there is no stage; floor condition 2 holds |

Those are the two failures this subtask exists to keep apart, and they land on
opposite sides.
