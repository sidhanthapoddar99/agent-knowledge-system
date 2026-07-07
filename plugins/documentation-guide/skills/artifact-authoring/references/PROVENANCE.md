# Provenance

This skill is **converged** from four upstream design skills, **rewritten and
adapted** to this framework's publish mechanism — never pasted (they are
Anthropic-authored and this repo is public). The one deliberate verbatim exception is
[`../scripts/validate_palette.js`](../scripts/validate_palette.js), carried as-is
because it is a functional tool (code), with its own provenance header.

The four sources (captured 2026-07-07 into the repo-root `tmp_skills/` snapshot):

| Source | Class | What it fed into this skill |
|---|---|---|
| `artifact-design` | Claude Code v2.1.202 built-in | The spine — calibration (`SKILL.md` §0), honor-the-host (§1), the fundamentals, anti-generic rules, typography, process, and the UI-vs-document router in `design-fundamentals.md` |
| `dataviz` | Claude Code v2.1.202 built-in | The whole chart procedure → `dataviz/`; `validate_palette.js` bundled; `palette.md` re-derived from this framework's theme |
| `design-sync` | Claude Code v2.1.202 built-in | Doctrine only (pipeline stripped) — the design-system anatomy, conventions-authoring rules, and the Styled/Complete/Plausible rubric in `design-systems.md` |
| `frontend-design` | Anthropic plugin (`license: Complete terms in LICENSE.txt`; mirrored on the public `anthropics/skills` repo) | Salvaged into the anti-generic merge — the tone menu, "vary across generations," and the texture/background ideas (editorial branch only) |

**The full source map, capture methods, integrity/licensing posture, and the
upstream-fold-in protocol** are the durable record kept in the issue tracker at
`2026-07-07-artifact-component/notes/01_skill-sources-and-provenance.md` (kept true by
that issue's `70_upstream-provenance` subtask). Read it before attempting an upstream
sync — the convergence map (which upstream change lands in which file here) is the
authoring-skill-design brainstorm §§3–4 in the same issue.

**Rewrite stance in one line:** re-express the *idea*, adapted to our publish target;
never carry claude.ai publish mechanics (the `Artifact` tool, CSP font-data-URI
workarounds, the design upload pipeline) — those were deliberately stripped.
