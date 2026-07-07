---
title: "M2 — design-memory doctrine, vocab preference, README, parity + records"
iteration: 1
---

## Goal

Ship the three sharpening items sidhantha added after reviewing the live
cold-Sonnet test, then close the loop: cache parity, tracker records,
validation.

## Approach

Direct edits to `SKILL.md`, `references/publishing.md`, and `README.md`; cp
mirror into the installed cache (`0.5.4` — the only cache dir carrying
`artifact-authoring`); tracker records updated per the doc-issues conventions.

## Result

- **Sidecar as design memory:** publishing.md gained a "read before, update
  after" paragraph (extend/companion work starts from ~40 lines of declared
  JSON, never HTML parsing) with the **anti-drift duty** — every `.html` edit
  updates the sidecar in the same change, because on this agents-first
  platform no human pass catches a stale declaration. SKILL.md's sidecar
  bullet and §3 gate item 6 now carry the same duty, so it's visible from the
  always-read layer, not just the reference.
- **Self-mode naming preference:** SKILL §1 states it (contract *names*, own
  *values*, free additions beyond the contract); publishing.md's dual-theme
  pattern snippet was rewritten to demonstrate contract names
  (`--color-bg-primary` … plus `--color-accent-soft` as the added-role
  example). `variation-set` joined the sidecar `type` enum with
  `options` / `recommendation` / `decision` keys.
- **README:** new "Built for agents, observable by humans" section — the
  platform framing sidhantha dictated, recorded where consumers see it.
- **Parity + records:** repo ↔ cache byte-identical (`diff -rq` clean).
  Subtask 100 → `status: review` with all tasks ticked and the sharpening
  items enumerated; audit log 060 got an Outcome section; the settled
  decisions (pattern doctrine, design-memory duty, naming preference) appended
  to `notes/02_settled-decisions.md`. `docs-guide check issues` clean.

## Next

Human review of subtask 100 (AI ceiling is `review`). Optional deepening
remains open: export 1–2 reference artifacts into `assets/` for a direct
fidelity comparison; a mechanical sidecar-drift check in `docs-guide` stays a
future option if drift ever bites.
