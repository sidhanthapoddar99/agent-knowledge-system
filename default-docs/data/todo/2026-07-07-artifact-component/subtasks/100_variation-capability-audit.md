---
title: "Audit — can the skill guide agents to multi-variation design-option artifacts?"
status: done
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
`variation-set` type. **Accepted by sidhantha 2026-07-08** (with three additions
from his live-test review) and authored the same day — execution record in
[../agent-log/070_it_skill-sharpening/](../agent-log/070_it_skill-sharpening/).

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
- [x] **Author the section on acceptance** — the design-systems.md
      variation-set section + the four hooks (triage row, §1 cross-link,
      §3 interaction-exercise gate line, §0 treatment note) + sidecar
      `variation-set` type/keys in publishing.md; worked skeleton included;
      repo + cache parity; AFTER the 050 fix run lands (same files).
      *(Shipped 2026-07-08 — emphasis shifted per the live-test delta onto the
      shared-fixture realism + shippable-polish bar; a Home-A cross-link fixes
      the per-option-files misreading at its source.)*
- [x] **Sharpening items from the live-test review** (sidhantha, 2026-07-08 —
      all shipped with the section, repo + cache parity):
      - *Self-mode token vocabulary preference* — a self-mode artifact should
        reuse the host contract's token **names** (own values) for overlapping
        roles, free to add names beyond it → SKILL §1 + the publishing.md
        pattern snippet now demonstrates contract names.
      - *Sidecar-as-design-memory, surfaced as marketed* — the skill now tells
        agents explicitly to READ the sidecar before touching an existing
        artifact (or building a companion) and to build design-consistent work
        from its ~40 lines of declared values → SKILL "What an artifact is
        here" + publishing.md "The sidecar is design memory".
      - *Anti-drift duty* — every `.html` edit updates the sidecar in the same
        change (agents are the editors on this platform; nobody else catches a
        stale declaration) → publishing.md + SKILL §3 gate item 6.
      - *README note* — the platform is agents-first, humans in the loop;
        tracker = observability surface; docs serve a dual readership →
        `README.md` "Built for agents, observable by humans".
- [x] **Record + link** — findings in
      [../agent-log/060_au_variation-capability/](../agent-log/060_au_variation-capability/)
      (incl. the follow-up sidecar-provenance check that produced the
      vocabulary item); execution in
      [../agent-log/070_it_skill-sharpening/](../agent-log/070_it_skill-sharpening/);
      triaged and accepted with sidhantha 2026-07-08.

Optional deepening (user action): export 1–2 reference artifacts into this
issue's `assets/` for a direct fidelity comparison against what the skill
describes.

## Linked artifacts

Artifacts produced by agents in this repo so far (all served at
`/artifacts/<path>`; the reference set above has no linkable URLs from here —
it lives in sidhantha's claude.ai account):

- [../notes/03_planning-overview.html](../notes/03_planning-overview.html) —
  this issue's planning overview (self mode; the tracker-rendering fixture).
- `default-docs/data/user-guide/15_writing-content/10_design-system-demo.html`
  — the docs showcase demo (self mode).
- `default-docs/data/user-guide/15_writing-content/11_site-theme-demo.html`
  — the site-theme-mode demo (site mode).
- [../brainstorm/10_variation-comparison/](../brainstorm/10_variation-comparison/)
  — **the live gap demonstration**: `mobile-nav-options.html`, built by a
  cold Sonnet agent following ONLY the current skill (the audit's failing
  executor profile, run for real), plus the delta write-up comparing it
  against the reference pattern's signature qualities.
- [../notes/05_theme-modes-explainer.html](../notes/05_theme-modes-explainer.html)
  — "How artifacts get their colors" (**site mode** — the live demonstration
  of injection + the local-elemental-colors exception; built by a cold Sonnet
  agent from the *sharpened* skill, post-acceptance).
