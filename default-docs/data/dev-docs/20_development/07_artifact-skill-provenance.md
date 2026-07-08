---
title: "Artifact skill — provenance & re-capture"
---

# Artifact skill — provenance & re-capture

The `agent-ks-artifacts` skill (in the `agent-ks` plugin) is a
**convergence of four Anthropic-authored design skills**, re-expressed for
this framework's publish mechanism. This page records where each source came
from and — the part that matters operationally — **how to capture each one
again**, so the source set can be recreated on any machine and future
upstream improvements can be diffed and folded in.

The verbatim source snapshot lives at repo-root **`tmp_skills/`** —
deliberately **gitignored and machine-local** (public repo; the skill's
licensing stance is *rewrite, never paste*, and that governs the baseline
too). A per-file **sha256 integrity manifest** is committed in the tracker
(issue `2026-07-07-artifact-component`, `assets/upstream-integrity-manifest.json`)
so a re-capture can be compared against the original baseline even if the
folder itself is lost.

## The four sources and how each was captured

| Source | Upstream identity | Capture method | Fidelity |
|---|---|---|---|
| `artifact-design` | Claude Code **built-in** skill (v2.1.202) | **In-context load**: trigger the skill in a live Claude Code session; the harness injects its `SKILL.md` body into context (frontmatter stripped); transcribe it to disk verbatim | Transcription (content-faithful, not byte-exact) |
| `dataviz` | Claude Code **built-in** skill (v2.1.202) | Two channels: `SKILL.md` body by **in-context load** (as above); `references/` + `scripts/` copied **byte-for-byte** from the bundled-skills extraction dir the harness materializes on load — `/tmp/claude-1000/bundled-skills/<version>/<hash>/dataviz/` | Mixed: SKILL.md transcribed; deeper files byte-exact |
| `design-sync` | Claude Code **built-in** skill (v2.1.202) | Same two channels — note this skill is `disable-model-invocation`, so the in-context load requires the **user** to type `/design-sync`; sub-skills (`storybook/`, `non-storybook/`), `lib/`, and `*.mjs` drivers then appear in the extraction dir | Mixed, as above |
| `frontend-design` | Official Anthropic **plugin** (marketplace); also public at `github.com/anthropics/skills` | Copied **verbatim including frontmatter** from the installed plugin cache (`~/.claude/plugins/cache/claude-plugins-official/frontend-design/<hash>/skills/frontend-design/`); independently re-fetchable from the public GitHub repo | Byte-exact, license header intact |

Key mechanics worth knowing when re-capturing:

- **Built-in skills are compiled into the Claude Code binary** — there is no
  file on disk to copy until a skill is *loaded*, at which point its bundled
  payload is extracted under `/tmp/claude-1000/bundled-skills/<version>/`.
  The in-context load is the only channel for the `SKILL.md` body (the
  extraction dir holds the deeper files but, for some skills, not the
  top-level `SKILL.md`), and the harness strips YAML frontmatter on load —
  which is why the three built-in baselines carry none.
- **The extraction dir is version-keyed.** A re-capture on a newer Claude
  Code produces that version's snapshot — a *new* baseline, not a recovery
  of the old one. Record the version; it is the snapshot's identity.
- **`frontend-design` needs no session at all** — pin a commit SHA on the
  public `anthropics/skills` repo and fetch.

## Re-capture procedure (per source)

1. Note the current Claude Code version (`claude --version`).
2. Built-ins: load each skill in a session (`artifact-design` and `dataviz`
   trigger on demand; `design-sync` must be typed as `/design-sync` by the
   user), transcribe the injected body to `SKILL.md`, then copy the skill's
   folder from `/tmp/claude-1000/bundled-skills/<version>/…` byte-for-byte.
3. Plugin: copy from the marketplace cache or fetch from
   `anthropics/skills@<pinned SHA>`.
4. Hash every file (sha256) and compare against the committed integrity
   manifest: matches = faithful re-capture; mismatches = upstream changed —
   feed the delta into the upstream-sync protocol recorded in the tracker
   issue (`notes/01_skill-sources-and-provenance.md`).

## Where the converged skill's own truth lives

The skill itself (`plugins/agent-ks/skills/agent-ks-artifacts/`)
is the *product*; its per-section source mapping is recorded in its
`references/PROVENANCE.md`, and the design deliberation lives in the tracker
issue's `brainstorm/02_discuss_authoring-skill-design.md`. Edits to the skill
must be mirrored byte-identically into the installed plugin cache (see
`CLAUDE.md` → plugin parity).
