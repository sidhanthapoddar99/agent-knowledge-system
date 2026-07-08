---
title: "Goal — ultracode planning run for the artifact content type"
---

## Goal

Produce the full planning depth for this freshly created issue in one
orchestrated run: detailed brainstorm entries (component + route architecture,
authoring-skill design), settled notes (embed-vs-URL decision, skill-source
provenance and convergence map), and all seven subtasks written as
self-contained work orders an implementing agent can pick up cold.

## Approach

Multi-agent workflow (Opus writers at xhigh reasoning), orchestrated by the
main session which reviews everything before sign-off:

1. **Research** — two agents map (a) the first-class diagram pipeline in the
   codebase (the precedent this feature mirrors: loader scan, sidecar metadata,
   routing, sidebar, lightbox/embed affordances) with file:line specificity,
   and (b) the four captured skills in `tmp_skills/` (content inventory, what
   each contributes to the converged authoring skill).
2. **Write** — three Opus xhigh writers produce, in parallel: the two
   brainstorm documents, the two notes, and the seven subtask files.
3. **Verify** — adversarial pass: every file-path/code claim checked against
   the real codebase, tracker conventions checked (frontmatter, numbering,
   prose quality), and a completeness critic checks the user's stated
   requirements all landed somewhere.
4. **Fix** — confirmed findings applied; main session reviews and validates
   (`agent-ks check section`).

## Success criteria

- Brainstorms deliberate real alternatives with a recommendation, not
  post-hoc justification.
- Notes record the settled decisions and the four-skill provenance +
  upstream-update protocol.
- Each subtask passes the "cold reader" bar: component, scope, tasks,
  and verification steps nameable without this session's context.
- Validator passes on the tracker after all writes.
