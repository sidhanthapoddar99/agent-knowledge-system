---
title: "Turn the COMMANDS map into a rich command manifest"
status: done
---

Today `cli.mjs` holds `name → scriptpath`. Make it `name → { script, category, summary, flags[] }` — one registry as the single source of truth for **routing + help + discovery**. Unblocks 04 (discovery) and 05 (generated help).

## Tasks

- [ ] Define the manifest schema: `{ script, category (0/1/2/3), summary, flags: [{name, alias, takesValue, description}] }`
- [ ] Migrate all 13 (→ 15 after orphans wired) entries into the manifest in `cli.mjs` (or a `_manifest.mjs` it imports)
- [ ] Keep routing working off the manifest (`name → script`)
- [ ] Ensure the manifest is the ONLY place command metadata lives — help text is generated from it, not hand-written
- [ ] Design it language-neutral (a `.py` entry must be expressible) — see subtask 13
