# agent-ks-engine/release-notes/ — one written-up release per version

Every version of this engine gets **two artefacts, and both are required**:

1. **An annotated git tag** — `agent-ks-engine-v<engine-version>`, on the commit that moves
   `ENGINE_VERSION` in `agent-ks-engine/src/loaders/engine-version.ts`. The tag
   lands on `main` after the work merges, never on a working branch.
2. **A release note** — `agent-ks-engine/release-notes/<version>.md`, this folder. It remains the
   standalone upgrade record for that tag.

**Pushing the tag validates the version and note.** [The engine tag workflow](../../.github/workflows/agent-ks-engine-release.yml)
fires only on `agent-ks-engine-v*`, reads `agent-ks-engine/release-notes/<version>.md`, validates the tag against `ENGINE_VERSION`, verifies the full commit and exact `agent-ks-engine/` tree. It creates no GitHub release page. Line 1 remains `# <version> — <one line>` because the note must read as a standalone document.

**It fails the tag when the note is missing.** That is the point: a release
note is the artefact most easily skipped, because nothing downstream breaks
without one. This makes the rule something the repo checks rather than something
a maintainer remembers.

After the version change, note, and checks are committed on `main`, the repository owner runs:

```bash
mise run release-check
git tag -a agent-ks-engine-vX.Y.Z -m "agent-ks engine X.Y.Z"
git push origin agent-ks-engine-vX.Y.Z
```

**[`CHANGELOG.md`](../CHANGELOG.md) in the engine folder is the index** — one row per
engine release, linking here. Add the row in the same change as the note; it
restates nothing, so there is nothing to drift.

**The note is an upgrade instruction, not a changelog line.** Its reader is
someone whose build just stopped with a version error, or an AI assistant acting
for them. A list of commit subjects does not help either of them.

The repository's [release architecture](../../RELEASING.md) defines the independent engine, plugin, and Rust CLI streams. The engine workflow is tag-only; this folder and the engine changelog retain the written release record.

## The shape

```markdown
# <version> — <one-line statement of what this release is>

<Two or three sentences: what changed at the level of "what can I now do", and
whether this release forces action.>

**Engine `X.Y.Z` · floor `X.Y.Z`** — released <date>, tag `agent-ks-engine-vX.Y.Z`.

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
