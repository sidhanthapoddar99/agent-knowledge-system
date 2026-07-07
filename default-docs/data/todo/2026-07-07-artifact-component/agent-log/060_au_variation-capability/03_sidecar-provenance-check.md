---
title: "Follow-up check — did the cold agent really follow our skill?"
---

## Goal

sidhantha, reviewing [the cold-Sonnet artifact](../../brainstorm/10_variation-comparison/mobile-nav-options.html),
noticed its `.meta.json` declares a palette, and the HTML uses CSS variables
(`--accent-soft`, `--ink`, …) that are neither defined in the skill nor drawn
from the documentation-guide theme contract. Question raised: did the subagent
ignore `artifact-authoring` and fall back to the built-in `artifact-design` /
`frontend-design` skills — and would that also explain the delta findings?

## Approach

Compared the artifact's sidecar against the skill's own sidecar contract
(`references/publishing.md`, `artifact` block key table) and against what the
built-in skills prescribe.

## Result

**The agent did follow our skill.** Three findings:

1. The sidecar keys (`purpose`, `type`, `theme`, `palette: {light, dark}`,
   `data`, `interactions`, `sources`) are *our* publishing.md schema; the
   built-in skills have no sidecar concept at all. Only a reader of our skill
   could have produced this file.
2. The palette appearing in both meta.json and the HTML is prescribed:
   publishing.md requires the sidecar to declare "the hex actually used" and
   every declared value to appear in the artifact — declaration +
   implementation, not accidental replication.
3. Not consuming `--color-bg-primary` & co. is the mode-choice doctrine
   working as designed: this is a `self`-mode artifact, which writes its own
   visual world; only `site` mode consumes the framework contract.

So the delta findings (greeked fixture, polish bar) are NOT explained by
"wrong skill read" — the right skill was read and is simply silent there.

## Genuine gap surfaced — self-mode token vocabulary

The skill contracts the *sidecar keys* but never the *CSS variable names*
inside a self-mode artifact, so each artifact invents its own (`ink` vs
`text`, `accent-soft` vs `accent-muted`). sidhantha's stance, recorded for
the sharpening pass: **ideally a self-mode artifact should use our
vocabulary; where it needs a token outside it, it is free to add one.** A
small "recommended self-mode token names" line belongs in the upcoming
variation-set / sharpening work — a fix-a-little item, not a redesign.

Also recorded: sidhantha rates the cold-Sonnet output format itself
"ninety-nine percent close to the original thing" — notable given the
executor was Sonnet, the audit's *failing* profile, not Opus.
