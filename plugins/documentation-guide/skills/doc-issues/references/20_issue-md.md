# `issue.md` — the goal / context

The main body of an issue. **Read it first** when picking up an issue.

Contains the *why*: the user-facing description of the work, success criteria, scope decisions, and links to related issues. Length varies — typically 50–300 lines.

```yaml
---
title: "..."   # optional here; the display title comes from settings.json
---

# Goal

What this issue is trying to achieve, and why.

## Context / background

The situation that motivates the work; links to related issues.

## Done when…

Success criteria — what "finished" looks like.

## Scope decisions

What's explicitly in and out.
```

## What belongs in `issue.md` vs a note

- **`issue.md`** — the durable framing: goal, scope, success criteria, the headline decisions. The thing a reviewer reads to understand *what this issue is*.
- **A `note`** ([22_notes.md](22_notes.md)) — supporting detail: research, alternatives weighed, design rationale, reference material. Anything that's *supporting evidence* rather than *the framing*.

**When `issue.md` is drifting too long:** if it grows past ~300 lines, or starts accumulating sub-headed deep-dives (a full design exploration, a comparison table of three approaches), that material wants to move into `notes/` with a one-line pointer left in `issue.md`. Keep `issue.md` the orientation layer, not the encyclopedia.
