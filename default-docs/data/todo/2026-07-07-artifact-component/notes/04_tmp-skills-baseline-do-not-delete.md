---
title: "⚠ tmp_skills/ — machine-local baseline, do not delete"
color: "#e06c75"
---

# `tmp_skills/` — the frozen upstream baseline (machine-local)

**Decision (sidhantha, 2026-07-08): no off-machine backup.** The folder stays
where it is — repo root, fully gitignored (`tmp_skills/.gitignore` contains
`**`), existing **only on this machine**. It is not committed anywhere and
never will be (public repo + Anthropic-authored content — the
rewrite-never-paste stance). sidhantha keeps it in place while working on
this machine.

**Why this note is red:** the folder is the three-way-diff baseline for every
future upstream sync of the `agent-ks-artifacts` skill, and its built-in half
is **version-locked to Claude Code v2.1.202** — after the harness updates,
that exact snapshot cannot be re-downloaded. `git clean -fdx`, a fresh clone,
or a machine change loses it. **Do not delete it. Do not `git clean` the repo
root without checking it survives.**

**If it is ever lost**, recovery is re-capture (a NEW baseline, not this one):
the full per-source method — which channel captured each of the four skills
(in-context Skill-tool load, `/tmp` bundled-skills extraction, plugin cache
copy, public GitHub) — is documented for exactly that purpose in:

- **dev-docs:** `20_development` → *Artifact skill — provenance & re-capture*
  (the recreate-in-future procedure, per source);
- **this issue:** [01_skill-sources-and-provenance.md](01_skill-sources-and-provenance.md)
  (capture coordinates + upstream-sync protocol) and the integrity manifest
  [upstream-integrity-manifest.json](../assets/upstream-integrity-manifest.json)
  (per-file sha256 — the only way to tell a re-capture apart from this
  baseline once it's gone).
