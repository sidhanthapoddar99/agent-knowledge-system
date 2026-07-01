# Comments

**Scope:** the lean **flat** evolution log — what changed, status shifts, hand-offs.
Like a changelog for the issue, **not** a discussion forum.

Boundary: a comment records *that* something happened and the hand-off context — never
the debate that produced it (that's Brainstorm).

## To discuss

- Is the `NNN_` prefix **required** on comment files, or optional like other subdocs?
- Extra frontmatter beyond `author:` + `date:`? (e.g. a `type:` like status-change /
  hand-off / note — or is that the kind of field that rots?)

## Decided

- **Flat. No threading, no sub-comments, no substructure.** One file per comment
  (`002_scope-narrowed.md`). Removes the costliest framework change from scope.
- `author:` + `date:` frontmatter for attribution.
- Rendered as the GitHub-style thread on the **Comments** panel (issue body = opening
  post), with the per-comment index in the right rail.
