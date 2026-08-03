---
title: "The skill-links gate reads the installed plugin, not the working tree"
status: review
---

# Overview

`agent-ks check skill-links` reports on **the published plugin in
`~/.claude/plugins/cache/`**, never on the repo you are editing. It has been
reporting green on this issue's work all week, and those greens were true of a
copy nobody had changed.

Found 2026-08-03 while gating [the audit follow-ups](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md):
a bare run printed *"✓ all checks passed — 3 skills, 44 markdown files"* under
the path `…/sids-plugin-marketplace/agent-ks/0.7.0/skills`, having read none of
the twelve files that round had just edited.

**Done when** a bare `agent-ks check skill-links` either checks the working tree
or refuses to run, and the fix is control-tested in both directions.

# References

- The round that found it, with the control test:
  [the audit follow-ups](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md)
- The script: `plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs`
- The greens this invalidates: [the release round](../../agent-log/020_wf_ship-the-split/02_working/150_version-bump.md)
  and every earlier "skill-links clean" line in this issue

# Todo list

- [x] Decide the resolution rule. **Recommended: resolve from the content root
      (the `.env` / `CONFIG_DIR` the other `agent-ks` commands already use) and
      fall back to the script's own location only when no repo is found** — that
      makes the invariant structural rather than documented
- [x] Make it **loud when it cannot find a repo skills dir**, rather than
      silently checking the install. A gate that cannot see the tree must fail,
      not pass
- [x] Print the resolved scan root as an assertion, not a header. The current run
      already prints its root and it still fooled a reader
- [x] Control-test both directions: a broken link in the **repo** must fail, and
      a run with no repo present must refuse rather than pass
- [x] Audit the sibling checkers for the same pattern — `check-legacy-tags.mjs`
      resolves its root the same way and may have the same defect
- [x] Re-run the gate on this issue's shipped work and record what it says, since
      no prior green covers the committed tree

# Outcomes and Next Steps

**Fixed 2026-08-03.** The anchor moved from **where the script lives** to **where
you are standing**.

`resolveSkillsDir()` walks up from the CWD looking for
`plugins/agent-ks/skills/` holding at least one `SKILL.md`. Found → that is the
scope. Not found → it falls back to the copy beside the script, which is correct
for a consumer who has no source tree, **and emits a warning** saying so. The
banner now names the tree in words — `[source tree]` or `[FALLBACK — the copy
beside this script, not a tree you are in]` — because the old banner *did* print
its root and still fooled a reader.

The existing `filesScanned === 0` guard already covered the empty case, so the
"cannot see anything" path was never the risk. The risk was seeing something
else and calling it clean.

### The fix cannot take effect until the plugin is reinstalled

**Verified, and it is the defect demonstrating itself.** `agent-ks` on `PATH`
dispatches to the installed plugin, so it runs the installed *copy of this
script* — which still has the old resolution. Running `agent-ks check
skill-links` from the repo root immediately after the fix still reported the
install path.

So until `/plugin install` is re-run, the working-tree invocation is:

```bash
bun plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs
```

After a reinstall the bare `agent-ks check skill-links` becomes correct on its
own, because the installed copy will then walk up from the CWD like everything
else.

### Control test — four paths, both directions

| Run from | Resolved | Verdict |
|---|---|---|
| repo root | repo `plugins/agent-ks/skills` `[source tree]` | ✓ |
| a subdirectory (`default-docs/data`) | same — walk-up works | ✓ |
| outside any repo (`/tmp`) | fallback + **warning** | ✓ |
| repo, with a probe file carrying one broken link | 45 files, **1 error naming the repo file** | ✓ |
| repo, probe removed | 44 files, clean | ✓ |

The file-count change (44 ↔ 45) is the part that matters: it proves the checker
read the directory the probe was written into.

### `check-legacy-tags.mjs` does NOT have this defect — checked

It resolves via `resolveProjectContext(SCRIPT_DIR)`, which walks up from the
script **and then falls back to `process.cwd()`**. Since it resolves *content*
rather than *skills*, the cwd fallback lands on the user's real tracker. Named
here as a clean area, because "we also checked X and it was fine" is signal and
silence is not.

## Why it was not a release blocker

**Not a release blocker, and worth saying why.** `./start build` and
`agent-ks check issues` both read the working tree correctly, and those are the
gates that catch broken content. This one catches broken *links between skill
reference files*: the failure mode is a dead link in the shipped skill, which
degrades an agent's navigation rather than corrupting anything.

But it must be fixed before the next "clean" is worth quoting, because the defect
is not in what the gate checks — it is **a green that names a scope nobody
looked at**, which is indistinguishable from a real pass at the moment someone
decides to ship.

# Details

## Why it happens

`check-skill-links.mjs` derives its scan root from its own location on disk:

```js
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OWN_SKILL  = path.dirname(SCRIPT_DIR);   // scripts/ → this skill's root
const SKILLS_DIR = path.dirname(OWN_SKILL);    // …/skills/
```

Correct for the installed plugin, and correct for a direct `bun` run of the repo
copy. Wrong for the on-`PATH` dispatcher — which is how the docs tell everyone to
run it, because the dispatcher **is** the installed copy.

## This is the audit's own thesis about drift, wearing a different hat

The script's docstring documents fixing a neighbouring bug in the same mechanism:

> It used to default to its own skill root, so a bare run reported "all checks
> passed" having read one skill of three — a clean result that named a scope
> nobody could see.

The scope was widened from one skill to three. **The tree it points at was never
questioned.** A gate that infers what to check from where its code happens to
live will keep producing clean results about the wrong thing.

## The workaround until it is fixed

```bash
bun plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs
```

Confirm the banner names the repo path, not `~/.claude/plugins/cache/`.

## The control that proved the repo run is real

A clean first result is the one to distrust, so the pass was tested for its
ability to fail:

| Run | Files scanned | Result |
|---|---|---|
| Repo, with a probe file carrying one broken link | **45** | `✗ broken link → ./this-file-does-not-exist.md` |
| Repo, probe removed | **44** | clean |

The file-count change is the part that matters: it proves the checker read the
directory the probe was written into, rather than a same-sized scope somewhere
else.
