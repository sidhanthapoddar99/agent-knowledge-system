# Plugin release notes

Every independently tagged `agent-ks` plugin version has two matching declarations and one note:

1. `plugins/agent-ks/.claude-plugin/plugin.json` and `plugins/agent-ks/.codex-plugin/plugin.json` declare the same stable `X.Y.Z` version.
2. `plugins/agent-ks/release-notes/X.Y.Z.md` starts with `# X.Y.Z — <one line>` and remains readable as a standalone document.
3. An owner tags the release commit as `agent-ks-plugin-vX.Y.Z` after it reaches `main`.

Pushing the tag runs the [plugin release workflow](../../../.github/workflows/agent-ks-plugin-release.yml). The workflow refuses a tag that disagrees with either manifest or lacks its matching note. It publishes the note without attaching a custom archive. The release body adds the tag, full commit SHA, and exact `plugins/agent-ks/` Git tree ID so the source is immutable and verifiable.

The GitHub release is metadata for the tagged plugin source. Consumers still install and update the plugin through its marketplace; the release workflow does not package or upload a second copy. The engine and Rust CLI use their own tag namespaces and release notes.

## Note shape

```markdown
# X.Y.Z — One-line statement of the plugin change

Two or three sentences describing the new agent-facing capability or correction.

## What changed

- Changes grouped by what an agent or maintainer can now do.

## Compatibility

State any required engine or CLI floor. Say "No new requirement" when none applies.
```

## Release command

After the version change, both manifests, note, and checks are committed on `main`, the repository owner runs:

```bash
mise run release-check
git tag -a agent-ks-plugin-vX.Y.Z -m "agent-ks plugin X.Y.Z"
git push origin agent-ks-plugin-vX.Y.Z
```

Agents prepare the manifests and note but do not tag, push, or publish. The owner performs those outward actions after review.
