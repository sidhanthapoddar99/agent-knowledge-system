---
title: "Skill sources and provenance — the four captured skills + upstream-sync protocol"
---

# Skill sources and provenance

This note is the durable provenance record for the four design skills captured
into repo-root `tmp_skills/` and converged into the new `artifact-authoring`
skill (design deliberation, including the section-by-section convergence map, in
[`../brainstorm/02_discuss_authoring-skill-design.md`](../brainstorm/02_discuss_authoring-skill-design.md)
§§3–4). Its job is to make a *future*
upstream sync possible: because we **adapt and rewrite** the sources rather than
fork them, the only way to fold in later upstream changes is to diff the new
upstream against the frozen snapshot we captured — so that snapshot, and the
exact coordinates that produced it, must be recorded here.

All four were captured on **2026-07-07**. They fall into two provenance classes:
three Claude Code **built-ins** and one **plugin-marketplace** skill.

---

## The four sources

| Source | Class | Upstream identity | Capture method | Lives under | Converges into |
|---|---|---|---|---|---|
| `artifact-design` | CC built-in | Claude Code v2.1.202 built-in skill ("Artifact Design") | `SKILL.md` body transcribed from an in-context Skill-tool load (harness strips frontmatter on load) | `tmp_skills/artifact-design/SKILL.md` | Calibration (§0), honor-the-host (§1), fundamentals + anti-generic + both-themes + typography + process + the UI/dashboard router |
| `dataviz` | CC built-in | Claude Code v2.1.202 built-in skill ("Data Visualization") | `SKILL.md` body transcribed from an in-context load; `references/` (7 files) + `scripts/` (2 files) copied **byte-for-byte** from the bundled-skills extraction | `tmp_skills/dataviz/` (`SKILL.md`, `references/`, `scripts/`) | The whole dataviz procedure → `references/dataviz/`; `validate_palette.js` bundled |
| `design-sync` | CC built-in | Claude Code v2.1.202 built-in skill ("Sync a design system to claude.ai/design") | `SKILL.md` body transcribed from an in-context load; the two sub-skills (`storybook/`, `non-storybook/`) + `lib/` + top-level `.mjs` scripts copied **byte-for-byte** from the bundled-skills extraction | `tmp_skills/design-sync/` (`SKILL.md`, `storybook/`, `non-storybook/`, `lib/`, `*.mjs`) | Design-system taxonomy + conventions-authoring doctrine + Styled/Complete/Plausible rubric → `references/design-systems.md` (machinery dropped) |
| `frontend-design` | plugin marketplace | Official Anthropic plugin; also on the public `anthropics/skills` GitHub repo | Copied **verbatim, with frontmatter** from the installed plugin-marketplace cache (frontmatter carries `license: Complete terms in LICENSE.txt`) | `tmp_skills/frontend-design/SKILL.md` | Salvaged into the anti-generic merge — the tone menu, "vary across generations," texture/background ideas (editorial branch only) |

### Capture-method detail (why two extraction paths per built-in)

The three built-ins were captured through **two channels at once**, and the
distinction matters for re-capture:

1. **The top-level `SKILL.md` body** came from an *in-context Skill-tool load* —
   i.e. the skill was loaded in a live Claude Code session and its rendered body
   transcribed. The harness **strips the YAML frontmatter** when it loads a
   skill, which is why `tmp_skills/artifact-design/SKILL.md`,
   `tmp_skills/dataviz/SKILL.md`, and `tmp_skills/design-sync/SKILL.md` all begin
   with a `#` heading and carry **no** `name:`/`description:` frontmatter.
   (Verified: all three start at their title heading; only `frontend-design`
   retains frontmatter — see below.)
2. **The deeper files** (dataviz `references/` + `scripts/`; design-sync
   `storybook/`, `non-storybook/`, `lib/`, and the top-level `.mjs` drivers) came
   **byte-for-byte** from the bundled-skills extraction directory at
   `/tmp/claude-1000/bundled-skills/`, which exposes the on-disk skill payload
   including the files a Skill-tool load does not surface.

`frontend-design` is the exception on both counts: it is a **plugin** (not a
built-in), so it was copied **verbatim including its frontmatter** from the
installed plugin-marketplace cache. Its frontmatter (`name`, `description`,
`license: Complete terms in LICENSE.txt`) is intact in
`tmp_skills/frontend-design/SKILL.md`, and the same skill is publicly mirrored on
the `anthropics/skills` GitHub repository — which is the re-fetchable coordinate
for it (see the protocol below).

### Consequence for provenance fidelity

- The built-in **top-level `SKILL.md` bodies are transcriptions**, not
  byte-exact copies (frontmatter stripped, whitespace possibly normalized). They
  are faithful in content but must not be treated as a cryptographic baseline for
  those specific files.
- The built-in **deeper files and all of design-sync's machinery are byte-exact**
  (direct copies from the extraction dir) — these *are* a hashable baseline.
- `frontend-design` is byte-exact *with* frontmatter and independently
  re-fetchable from public GitHub.

---

## Reconciliation — the shipped map (post-implementation, 2026-07-07)

Subtask `40` has shipped `plugins/documentation-guide/skills/artifact-authoring/`
(mirrored byte-identically into the installed cache). This is the file-for-file
map of **what actually shipped**, replacing the pre-implementation plan — the
manifest's per-source `convergence_destination` strings were written against the
plan (a single `dataviz.md`, a `design-system.md`) and are superseded by this
table. Every shipped file names its source(s), and every source is accounted for.

| Shipped file | Source(s) | Nature as shipped |
|---|---|---|
| `SKILL.md` (§0 calibrate · §1 honor-the-host · §2 both-themes + self-contained · §3 verify gate; triage table; Provenance footer) | **artifact-design** spine | rewritten to our publish target |
| `references/design-fundamentals.md` | **artifact-design** (fundamentals, anti-generic, typography, process, UI-vs-document router) + **frontend-design** salvage (tone menu, "vary across generations", texture/background ideas — editorial branch only) | rewritten / salvaged |
| `references/publishing.md` | **ours** (the framework publish mechanism — sidecar, `/artifacts` route, embed, theme handshake, self-containment); the both-themes/host-first discipline echoes artifact-design | authored |
| `references/design-systems.md` | **design-sync** doctrine only (design-system-as-consumable-contract, write-conventions-for-a-guessing-agent, the Styled/Complete/Plausible rubric) — the entire claude.ai upload pipeline dropped | rewritten |
| `references/dataviz/{00_overview,choosing-a-form,color-formula,marks-and-anatomy,interaction,components,anti-patterns}.md` | **dataviz** (form heuristic, four-jobs/six-checks color formula, mark specs, interaction, anti-pattern catalog) | **re-expressed** in our own prose |
| `references/dataviz/palette.md` | **dataviz** `palette.md` *structure*, re-derived from this framework's theme contract | rewritten / re-instanced |
| `scripts/validate_palette.js` | **dataviz** | **VERBATIM** — the one deliberate carve-out (a functional tool, carried with a provenance header) |
| `references/PROVENANCE.md`, `notes/../assets/upstream-integrity-manifest.json` | **ours** | authored metadata |

**Verbatim-ness as shipped — the guarantee holds file-for-file.** The only file
carried verbatim from a source is `scripts/validate_palette.js` (code, tool). Every
prose file — `SKILL.md` and all seven references, the dataviz set included — is
re-expressed in our own words. This was *verified*, not assumed, during this
reconciliation: the seven `references/dataviz/*.md` files were diffed against their
frozen `tmp_skills/dataviz/references/` baseline and measured at **1–10% six-gram
shingle overlap** (the residual being unavoidable technical vocabulary — spec
numbers, the literal validator command, chart-type names), confirming genuine
re-expression rather than a pasted copy. The `PROVENANCE.md` claim ("the one
deliberate verbatim exception is `validate_palette.js`") and this note's
"adapt and rewrite" stance are therefore true as shipped.

**Dropped-but-exists-upstream (conscious omissions, not oversights):**
`validate_palette.py` (a redundant `.py` twin of the bundled `.js`); the entire
design-sync claude.ai upload pipeline (`lib/`, `storybook/`, `non-storybook/`, the
`*.mjs` drivers); and claude.ai-specific artifact-design mechanics (the
font-as-data-URI CSP workaround, the viewer `data-theme` contract) — each rewritten
for our file-based publish target or left out entirely. All are flagged in the
integrity manifest.

**Verification of the reconciliation (subtask `70`).** Cross-check passed: every
shipped `SKILL.md` section and reference file above names its source(s); all four
sources (artifact-design, dataviz, design-sync, frontend-design) have their
contributions accounted for, with nothing claimed that isn't present and nothing
shipped without provenance. The `tmp_skills/` home is as described — untracked in
this public repo, the integrity manifest (`notes/04`) committed as the publishable
half, the verbatim baseline a private USER preservation item. The fold-in
protocol's re-capture→diff steps have now been dry-run against **two** sources: the
frontend-design public re-fetch (recorded below) and this dataviz baseline diff —
both executable, both surfaced a real delta (frontend-design's public-mirror drift;
the dataviz re-expression measured above).

---

## `tmp_skills/` is the frozen baseline

`tmp_skills/` is the point-in-time snapshot that makes a **three-way diff**
possible in the future: *baseline (this snapshot)* vs *new upstream (a later
re-capture)* vs *our converged skill*. Without a preserved baseline you cannot
tell whether an upstream file changed because upstream evolved or because we
adapted it — you would be diffing our rewrite against a moving target with no
common ancestor.

Current state: `tmp_skills/` is **fully untracked** — it carries its own
`tmp_skills/.gitignore` containing a single `**`, so git ignores the directory
and everything in it (including the `.gitignore`). Nothing under `tmp_skills/`
is committed today. That is deliberate, and it creates the core tension this note
has to resolve: an untracked baseline is one `git clean -fdx` or one fresh clone
away from being gone, and the built-in baseline is **version-locked** — you
cannot easily reinstall Claude Code v2.1.202's bundled skills once the harness
moves on, so if the built-in snapshot is lost it may be **unrecoverable**.

---

## Where the baseline should permanently live — recommendation

The requirement pulls two ways: a three-way diff wants the verbatim baseline
preserved, but this is a **public repo** and the sources are **Anthropic-authored**
— the same reason the converged skill rewrites rather than pastes (see the
brainstorm's licensing section). Options weighed:

- **(a) Leave it untracked at repo root (status quo).** Zero licensing exposure,
  but the version-locked built-in baseline is unprotected — a clean checkout or a
  disk wipe loses it permanently. Rejected as the *sole* measure: it fails the
  one job this note exists to guarantee.
- **(b) Commit the verbatim sources into the public repo** (e.g. under the
  issue's `assets/`). Maximally safe for the diff, but republishes Anthropic's
  skill text verbatim in a public repo — exactly what the rewrite/never-paste
  stance avoids. Rejected.
- **(c) Preserve the verbatim baseline *durably but privately*, and commit only
  our own metadata publicly.** Keep the full `tmp_skills/` snapshot somewhere
  outside `git clean`'s reach and outside the public repo (a private/internal
  archive or a private companion repo), and commit into *this* public repo only
  material we authored: this provenance note plus a lightweight **integrity
  manifest** (per-file `sha256` + the byte-exact/transcribed flag + capture date
  + convergence destination). The manifest is our own metadata — safe to publish
  — and it lets a future agent verify whether a re-capture matches the baseline
  without the baseline text ever entering the public repo.

**Recommendation: (c).** Concretely:

1. **Do not commit `tmp_skills/` verbatim to this public repo** — the rewrite
   stance governs the content, and the baseline is content.
2. **Preserve the frozen `tmp_skills/` snapshot durably outside the repo** (a
   private archive), because the built-in half is version-locked and otherwise
   unrecoverable. This is the actual three-way-diff baseline.
3. **Pin `frontend-design` to a specific `anthropics/skills` commit SHA** in the
   manifest — it is publicly re-fetchable. **Pinned 2026-07-07** (via `gh api`):
   repo HEAD `9d2f1ae187231d8199c64b5b762e1bdf2244733d`, file
   `skills/frontend-design/SKILL.md` last changed at
   `2235be7c60b551f5de82ade908fd3816455afcda` (2026-06-09). **Caveat discovered
   during implementation:** the public mirror is **not** byte-identical to what we
   captured — our copy came from the installed plugin-marketplace cache (`sha256
   d39adf3a…`, 4274 B) and the current GitHub HEAD blob is a substantially
   rewritten, expanded revision (`sha256 1608ea77…`, 8260 B). Because the mirror
   file's last change (2026-06-09) *predates* our 2026-07-07 capture, the
   plugin-cache release we captured was already lagging the public mirror. So the
   SHA is a re-*fetch* coordinate, **not** a reproduction of our baseline — the
   real three-way-diff baseline for frontend-design is still the privately
   preserved captured copy, and a future re-capture must diff against *that*, not
   the public mirror (which already shows drift). The manifest records both hashes
   and this caveat.
4. **Commit, under this issue, an integrity manifest** — now shipped at
   [`../assets/upstream-integrity-manifest.json`](./../assets/upstream-integrity-manifest.json)
   (alongside this note), recording, per source file: `sha256`,
   byte-exact-vs-transcribed flag, capture date (2026-07-07), upstream coordinate
   (CC v2.1.202 for built-ins; the pinned SHA for frontend-design), and the
   convergence destination in the planned `artifact-authoring` skill. It covers
   all 39 files under `tmp_skills/` (every recorded hash re-verified against disk),
   flags the dropped-but-exists-upstream items (`validate_palette.py`, the entire
   design-sync machinery) as conscious omissions, and carries the fold-in protocol
   in machine-readable form. That manifest is the publishable, durable half of the
   record; this prose note is its companion.

The net effect: the public repo carries *what came from where and how to verify
it*; the verbatim baseline lives privately where it survives clean checkouts; and
frontend-design's public SHA is a re-fetch coordinate that must be diffed against
the private baseline, not assumed equal to it.

---

## Upstream update protocol

When a future maintainer wants to fold upstream improvements into the converged
skill, the frozen baseline turns a guess into a mechanical three-way diff.

**1. Re-capture the new upstream (per source, respecting its class).**

- **Built-ins (`artifact-design`, `dataviz`, `design-sync`)** — on a **new
  Claude Code version**, re-run the original two-channel capture: load each skill
  in-session to transcribe the current `SKILL.md` body, and copy the deeper files
  byte-for-byte from that version's bundled-skills extraction dir (the analogue
  of `/tmp/claude-1000/bundled-skills/`). Record the new CC version — it is the
  new snapshot's identity, exactly as v2.1.202 is this one's.
- **`frontend-design`** — `git pull` / re-fetch the `anthropics/skills` repo and
  read the current file at HEAD; note the new commit SHA. No harness version is
  involved.

**2. Diff new-upstream against the frozen baseline.** Compare the re-capture to
the preserved `tmp_skills/` snapshot (for byte-exact files, a `sha256` mismatch
against the manifest flags a change instantly; for the transcribed `SKILL.md`
bodies, a textual diff — the transcription is faithful enough to diff at the
paragraph level). This yields the **upstream delta**: what genuinely changed
upstream since we captured, isolated from our own adaptations.

**3. Fold the delta into the converged skill.** For each upstream change, decide
per the convergence map (the brainstorm's §§3–4) where that content lives in our
skill and
apply the *idea* — rewritten to our publish target, never pasted (the same
licensing + correctness stance that governed the original convergence). A change
to dataviz `palette.md`, for instance, folds into `references/dataviz/palette.md`
but keeps our theme-derived instance; a change to a claude.ai publish mechanic in
artifact-design is *ignored* because we deliberately stripped that layer.

**4. Advance the baseline.** After folding, the re-captured snapshot becomes the
new frozen baseline (preserved per the recommendation above) and the manifest's
hashes/coordinates are updated. The next sync diffs against *this* snapshot.
Every sync advances the common ancestor so drift never re-accumulates.

**Why this works:** the three-way structure (frozen baseline · new upstream · our
rewrite) is what lets an adapted, rewritten skill still track an upstream it does
not fork. Lose the baseline and every future sync degrades into re-reading both
skills and guessing what moved — which is precisely the failure this note, and
the durable-preservation recommendation, exist to prevent.

> Preservation decision (sidhantha, 2026-07-08): no off-machine backup —
> `tmp_skills/` stays gitignored and machine-local. See the red note
> [04_tmp-skills-baseline-do-not-delete.md](04_tmp-skills-baseline-do-not-delete.md)
> and the re-capture manual in dev-docs
> `20_development/07_artifact-skill-provenance.md`.

---

## The integrity manifest (embedded)

The manifest lives at
[`assets/upstream-integrity-manifest.json`](../assets/upstream-integrity-manifest.json)
and is embedded below — the committed, publishable half of the baseline record
(hashes and coordinates only, never source text):

```json
[[../assets/upstream-integrity-manifest.json]]
```
