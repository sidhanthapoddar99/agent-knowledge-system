---
title: "Remove dead code and unused imports"
status: open
---

**What it means.** Find and delete code nothing references any more — unused imports, unreferenced exported functions/types, and branches left behind by earlier refactors.

**Status of the audit.** Not yet enumerated — unlike the other subtasks, I didn't verify this one by inspection. It needs a static pass to produce the actual list before any deletion:

```bash
cd astro-doc-code
bunx tsc --noEmit --noUnusedLocals --noUnusedParameters   # unused locals/imports
# + a knip / ts-prune run for unreferenced *exports* across modules
```

**Why it matters.** Dead code reads as intentional and misleads the next person (or agent) into maintaining paths that never run.

**Caution.** An "unused" export may be part of the public surface in `loaders/index.ts` re-exported for consumers — confirm it's truly unreferenced (not just unused *inside* the module) before removing.

**Done when.** The tsc/knip passes above come back clean, and the build + a spot-check of the app still work.
