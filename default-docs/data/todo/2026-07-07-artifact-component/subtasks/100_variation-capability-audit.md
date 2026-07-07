---
title: "Audit — can the skill guide agents to multi-variation design-option artifacts?"
status: open
---

Requested by sidhantha (2026-07-08). The single most-loved real-world use of
artifacts so far: **one artifact carrying 4–10 workable design variations** of
a UI element or screen — beyond wireframes, actual designs with working
interactions (button presses work, states toggle, pages navigate inside the
HTML) — used to compare options before committing to one. Reference set (in
sidhantha's claude.ai account; titles for caliber calibration — not
downloadable from this environment, so the audit works from this pattern
brief):

- *AI Agent Mark — Mobile Nav Options* · *Agent Ask-bar — three states* ·
  *Chimère Pay · Dashboard Redesign Options* · *Chimère Pay · Action Button
  Placement* · *Agent chat — docked glass options* · *Agent FAB — glass
  options* · *Agent "acting" edge glow — options*

The pattern's signature qualities: N clearly labeled variations side by side
or switchable; each variation genuinely interactive (hover/press/state
transitions work); a shared fixture context (the host app's look) so options
are comparable; polished enough to be *the* design, not a sketch; built for a
decision ("which one?") rather than documentation.

## The question (audit only — do NOT create artifacts)

Does the `artifact-authoring` skill (SKILL.md + references), followed by a
cold agent with **no session context**, carry enough intent and guidance to
produce artifacts of this kind at this caliber? Two executor profiles matter:
an **Opus** agent and a **Sonnet agent at medium thinking** — the skill must
carry the intent for the weaker profile especially, since guidance the model
can't infer must be written down.

**Audit complete (2026-07-08)** — synthesis + verdict in
[../agent-log/060_au_variation-capability/01_summary.md](../agent-log/060_au_variation-capability/01_summary.md):
Opus insufficient-with-gaps (recovers), **Sonnet-medium insufficient** — the
pattern's three defining qualities (operable-not-mocked fidelity bar,
one-artifact-N-variations structure, shared fixture) are unwritten, and the
verify gate is interaction-blind (a static mock passes clean). Remedy
proposed: a "Variation-set / options-explorer artifacts" section in
`references/design-systems.md` + triage row + verify-gate line + sidecar
`variation-set` type. Awaiting sidhantha's go-ahead below.

## Tasks

- [x] **Gap analysis (parallel Opus auditors)** — walk the skill as each
      executor profile planning one reference-caliber artifact (e.g. "5
      mobile-nav variations for an existing app"). For every step where the
      agent would have to invent rather than follow — pattern structure
      (variation grid/switcher), interaction-fidelity bar ("workable, not
      mocked"), shared-fixture framing, labeling/annotation conventions,
      decision-support framing, `self`-mode theme fit, sidecar declaration of
      variations — record: missing entirely / present but underweighted /
      sufficient. Verdict per profile.
- [x] **Recommendation** — if gaps exist: the smallest skill addition that
      closes them (likely a "variation-set / options-explorer artifact"
      pattern section with structure + fidelity bar + a worked skeleton),
      placed per the skill's lean-triage shape. If none: record that the
      existing sections compose to cover it, with the citation trail.
      *(Delivered — see the audit summary's "Recommended remedy".)*
- [ ] **Author the section on acceptance** — the design-systems.md
      variation-set section + the four hooks (triage row, §1 cross-link,
      §3 interaction-exercise gate line, §0 treatment note) + sidecar
      `variation-set` type/keys in publishing.md; worked skeleton included;
      repo + cache parity; AFTER the 050 fix run lands (same files).
- [ ] **Record + link** — findings in
      [../agent-log/060_au_variation-capability/](../agent-log/060_au_variation-capability/);
      triage with sidhantha; any accepted skill addition becomes its own
      task here (repo + cache parity).

Optional deepening (user action): export 1–2 reference artifacts into this
issue's `assets/` for a direct fidelity comparison against what the skill
describes.
