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
| **[0.2.4](./releases/0.2.4.md)** | 2026-08-04 | `agent-ks issue reindex` withdrawn with the generated round table it maintained; all four link gates parse markdown instead of approximating it; `check issues` stops skipping runs inside a `--group` folder | **No migration** — floor stays `0.2.0`. **Breaking for scripts**: delete any `issue reindex` call. Expect new (always-true) warnings if you use `--group` |
| **[0.2.3](./releases/0.2.3.md)** | 2026-08-04 | `check link-form` requires a link's target to exist on disk, and stops skipping the tracker; `move` no longer edits links inside code spans and now maintains titled ones | **Migration ships, floor stays `0.2.0`.** Unmigrated content renders identically — run `migration/0.2.3_slug-form-links.py` to keep links maintainable |
| **[0.2.2](./releases/0.2.2.md)** | 2026-08-03 | A URL written against the file tree resolves: docs and blog accept both spellings, any file under a plan resolves to the plan, a missing page answers `404` instead of `200`, `agent-ks --version` | **No migration** — floor stays `0.2.0`. Every change adds a working URL; none removes one |
| **[0.2.1](./releases/0.2.1.md)** | 2026-08-03 | Three gates that passed what they should have refused: a missing page `data` path, the skill-links checker reading the installed plugin, two agent-log numbering cases | **No migration** — floor stays `0.2.0`. A `site.yaml` page pointing at a missing folder now fails the build |
| **[0.2.0](./releases/0.2.0.md)** | 2026-08-03 | Plans section · one status vocabulary across every file kind · status colours in theme CSS · numbered agent-log slots | **Yes** — floor raised to `0.2.0`; three migrations |
| **[0.1.2](./releases/0.1.2.md)** | 2026-07-03 | The version contract itself: `engine_version` in `site.yaml`, the startup gate, root-owned `migration/` | **Yes** — a tree with no declaration is refused |
| **[0.1.1](./releases/0.1.1.md)** | 2026-07-02 | One lifecycle vocabulary: seven statuses, four categories, `state:` → `status:` | **Yes**, quietly — old values are mapped on read, so the disk drifts instead of failing |
| **[0.1.0](./releases/0.1.0.md)** | 2026-06-22 | `done:` retired from subtask frontmatter; the `migration/` script convention | **Yes** — subtasks marked done with `done:` alone come back open |

`0.1.0` and `0.1.1` are **retroactive labels**: `ENGINE_VERSION` did not exist
when they shipped, and their notes were reconstructed from git history on
2026-08-03. Each says so on its face. The constant has only ever held `0.7.0`
(for thirty minutes on 2026-07-03, never published) and `0.1.2` before `0.2.0`.

**`0.2.1` is the first release where `MIN_CONTENT_VERSION` (`0.2.0`) is behind
`ENGINE_VERSION`.** That gap is the floor doing its job: it means *oldest content
that still loads*, not *newest release available*. Every earlier release moved
both together, which made them look like one number.

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
