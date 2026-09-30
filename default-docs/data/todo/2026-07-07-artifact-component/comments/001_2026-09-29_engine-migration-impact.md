---
author: claude
date: 2026-09-29
---

The engine migration ([2026-09-29-rust-core-engine-migration](../../2026-09-29-rust-core-engine-migration/issue.md)) affects this issue — **needs re-planning in part**: the shipped core (iframes, sidecar, skill, `/artifacts` route) carries over; 110 overlaps the migration's "artifact as a top-level page" idea, and 120 changes how inline scripts run inside a single-page app.
Pause 110 and 120. No status was changed; see [the impact note](../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/18_impact-on-other-issues.md).
