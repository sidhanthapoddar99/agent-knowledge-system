# releases/ — one written-up release per version

Every version of this engine gets **two artefacts, and both are required**:

1. **An annotated git tag** — `v<engine-version>`, on the commit that moves
   `ENGINE_VERSION` in `astro-doc-code/src/loaders/engine-version.ts`. The tag
   lands on `main` after the work merges, never on a working branch.
2. **A release note** — `releases/<version>.md`, this folder. It is published as
   the GitHub release body:

   ```bash
   gh release create v0.2.0 --title "0.2.0 — <one line>" --notes-file releases/0.2.0.md
   ```

**The note is an upgrade instruction, not a changelog line.** Its reader is
someone whose build just stopped with a version error, or an AI assistant acting
for them. A list of commit subjects does not help either of them.

## Two version series, one tag

| Series | Where | Tagged? |
|---|---|---|
| **Engine / content format** | `ENGINE_VERSION` + `MIN_CONTENT_VERSION` | **Yes** — this is the repo's version |
| **Plugin** (`agent-ks` skills + CLI) | `plugins/agent-ks/.claude-plugin/plugin.json` | No — it rides in the note |

The plugin version is stated in every note because a consumer updates both, and
nothing in the code checks the plugin's number.

## The shape

```markdown
# <version> — <one-line statement of what this release is>

<Two or three sentences: what changed at the level of "what can I now do", and
whether this release forces action.>

**Engine `X.Y.Z` · floor `X.Y.Z` · plugin `A.B.C`** — released <date>, tag `vX.Y.Z`.

## Breaking changes            ← omit only if there genuinely are none

Per change: what changed, **the symptom a consumer sees if they skip it**, and
the script that fixes it. The symptom matters most — it is how someone
recognises the problem they already have.

## Upgrade

The exact chain, in order, copy-pasteable. Ending with the `site.yaml` bump as
the last step, never the first.

## What's new

Features, grouped by what they do for the user. Link the docs page, not the
commit.

## Fixed

Defects a consumer could have hit. Internal churn does not belong here.

## Notes

Anything decided during the release that a future maintainer would otherwise
re-litigate — a rejected option, a numbering call, a deliberate omission.
```

## Rules

- **Written by whoever ships the change**, as part of the release — the same
  rule as the migration script. A format change with no note leaves consumers
  holding the gate's error message and nothing else.
- **Every breaking change names its symptom.** "Status vocabulary changed" is
  not actionable; "your agent-log files show a blank status chip and
  `check issues` errors on every one" is.
- **Link documentation, not commits.** A commit SHA answers *what was typed*; the
  reader needs *what is now true*.
- **A release that shipped no format change still gets a note and a tag** — it is
  how a consumer knows what an update contains before taking it.
- **Retro notes say so.** A note reconstructed from git history after the fact
  carries a line marking it reconstructed, and its date is the release commit's
  date, not the day it was written.
