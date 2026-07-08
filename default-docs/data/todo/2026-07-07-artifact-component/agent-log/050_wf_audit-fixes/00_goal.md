---
title: "Goal — fix run for the Fable audit findings (Fable-model agents)"
---

## Goal

Apply every finding from the Fable audit
([../040_au_fable-skill-audit/01_summary.md](../040_au_fable-skill-audit/01_summary.md)),
with the verbatim-prose finding resolved by **genuine rewrite** (the settled
rewrite-never-paste decision, reaffirmed by sidhantha 2026-07-08). Fix agents
run on the **Fable** model per sidhantha's instruction.

## Approach

Workflow: two parallel Fable fixers — (a) the substantial rewrite of
`references/dataviz/` + the lifted `design-fundamentals.md` passages, holding
technical content identical while re-expressing every sentence; (b) the
mechanical accuracy fixes (broken `adopts-site` value, variable-list drift,
canonical sidecar example, history-narration deletions, guide.ts strings,
`embed_height` canonicalization, agent-ks location sentence, opaque-block
clause, palette acknowledgment). Then a Fable verifier re-runs the shingle
analysis, the theme.yaml cross-check, the plugin self-test, and cache-parity
diff; a final fixer applies anything it finds.

## Success criteria

Shingle analysis shows no verbatim runs beyond short technical terms;
PROVENANCE.md's claims are true of the files; the loader-recognized `site`
value taught everywhere; variable list exactly mirrors `required_variables`
(extras flagged as non-contract); zero repo↔cache differences; self-test
green; subtask 95 tickable to `review`.
