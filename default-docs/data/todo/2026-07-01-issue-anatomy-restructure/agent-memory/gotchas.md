# Gotchas — issue-anatomy restructure

- `@parsers` has **no bare-barrel** alias; import the string `renderMarkdown` from
  `@parsers/renderers`, not `@parsers`.
- The active theme is **`full-width`** (`--max-width-primary: none`) — issue/docs
  layouts must cap at the cluster sum, not rely on `--max-width-primary`.
- The loader's sub-folder list is **hardcoded** (`issues.ts`); any new section folder
  must be added there or it won't be read.
- New note-shaped sections (brainstorm, agent-memory) reuse `IssueNote` +
  `readFreeformDocs` + `NotePage` (with a `prefix`) — mirror, don't fork.
