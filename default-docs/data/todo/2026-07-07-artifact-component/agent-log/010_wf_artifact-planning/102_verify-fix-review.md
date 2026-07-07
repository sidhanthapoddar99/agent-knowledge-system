---
iteration: 2
title: "Milestone — adversarial verify, fixes, main-session review"
status: done
---

## Goal

Refute-or-confirm every claim in the written files, apply confirmed findings,
and pass the main session's own review + tracker validation.

## Approach

Two Opus critics ran in parallel: a fact-checker opening every cited code path
in the repo, and a conventions/completeness critic checking the seven vision
requirements all landed. A fixer agent then applied confirmed findings
surgically. The main session read the notes in full, spot-checked structure of
the brainstorms and largest subtasks, and ran `docs-guide check issues`.

## Result

Six findings, all real, all fixed: (1) Cache-Control header mischaracterized
as `immutable` — corrected to the actual `public, max-age=31536000` in three
files; (2+4) sidecar naming drift — four subtasks said bare `<name>.json`
while the settled record says `.meta.json`/`.meta.jsonc` — reconciled to the
settled form (major); (3) `icons.ts` wrongly listed as a `FileType`-switch
site — replaced with the real consumers (`base-parser.ts:255`,
`cache-manager.ts:328-335`); (5) the TOC-collapse design silently diverged
from the vision's "chrome stays" wording — now explicitly reconciled (empty
outline rail = dead chrome, sidebar-only is the accepted reading); (6) dangling
"research report" citations repointed to in-tracker sections. Validator: clean
for this issue (49 folders scanned; only pre-existing warnings elsewhere).

## Next

Human review of the planning content, then implementation begins against
subtasks `10_`–`70_` (suggested order: 20 route → 10 component → 30 guard,
then 40 skill, 50/60 integrations + docs, 70 provenance manifest).
