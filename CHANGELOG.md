# Changelog

**Index only.** Each release's full note lives at `releases/<version>.md` and is
published verbatim as the [GitHub release](https://github.com/sidhanthapoddar99/agent-knowledge-system/releases)
body when its tag is pushed. Nothing is restated here — a fact with two homes
drifts, and the note is the home.

The version tracked below is the **engine / content-format version**
(`ENGINE_VERSION`). The plugin (`agent-ks` skills + CLI) carries its own number
and is stated inside each note.

| Version | Date | What it is | Forces action? |
|---|---|---|---|
| **[0.2.0](./releases/0.2.0.md)** | 2026-08-03 | Plans section · one status vocabulary across every file kind · status colours in theme CSS · numbered agent-log slots | **Yes** — floor raised to `0.2.0`; three migrations |
| **[0.1.2](./releases/0.1.2.md)** | 2026-07-03 | The version contract itself: `engine_version` in `site.yaml`, the startup gate, root-owned `migration/` | **Yes** — a tree with no declaration is refused |
| **[0.1.1](./releases/0.1.1.md)** | 2026-07-02 | One lifecycle vocabulary: seven statuses, four categories, `state:` → `status:` | **Yes**, quietly — old values are mapped on read, so the disk drifts instead of failing |
| **[0.1.0](./releases/0.1.0.md)** | 2026-06-22 | `done:` retired from subtask frontmatter; the `migration/` script convention | **Yes** — subtasks marked done with `done:` alone come back open |

`0.1.0` and `0.1.1` are **retroactive labels**: `ENGINE_VERSION` did not exist
when they shipped, and their notes were reconstructed from git history on
2026-08-03. Each says so on its face. The constant has only ever held `0.7.0`
(for thirty minutes on 2026-07-03, never published) and `0.1.2` before `0.2.0`.

## Upgrading across several versions

Run **every** script in `(your-version, target]` in version order — a zero-hit
detect is a passed check, not a script you were allowed to skip — and set
`engine_version` in `site.yaml` **last**. Each note carries its own copy-pasteable
chain; [`migration/README.md`](./migration/README.md) has the convention.

## Adding a release

See [`releases/README.md`](./releases/README.md). Two artefacts, both required:
the tag `v<version>` and the note. Pushing the tag publishes the note — and
[the workflow](./.github/workflows/release.yml) **fails the tag** if no note
exists, so the rule is enforced rather than remembered. Add the row here in the
same change.
