/**
 * guide.ts — the framework-bundled "issue anatomy" guide.
 *
 * Rendered on every issue's **Guide** panel (see DetailBody.astro). This is the
 * static, plugin-independent twin of the `documentation-guide` skill's guide:
 * a THIN legend (the map of what each section is), not the full operating manual.
 * The manual lives in the skill; keep this in sync with it at release time.
 *
 * It's a TS module (not a data file) on purpose: the guide ships *with the
 * framework*, so it's present at every build/deploy regardless of whether the
 * Claude Code plugin is installed.
 */
import { renderMarkdown } from '@parsers/renderers';

export const ISSUE_GUIDE_MARKDOWN = `# Issue anatomy

How a tracked issue is organized. Each issue is one coherent unit of *thinking +
execution*. Use whichever of these sections fit what you're doing — there's no
required order.

| Section | What it holds |
|---|---|
| **Overview** | The issue body (\`issue.md\`) — the problem + metadata. |
| **Comments** | Lean evolution log — what changed, status, hand-offs. Not a forum. |
| **Brainstorm** | Active deliberation — ideation, research, exploration, options. The *process*. |
| **Notes** | Finalized output + references. The *product* you build on. |
| **Subtasks** | The plan — the to-dos to complete. |
| **Agent log** | Execution record — autonomous loops & workflows (\`NNN_<name>/\` per activity). |
| **Agent memory** | AI-mutable working state for this issue. |

## Boundaries that keep these from blurring

- **Brainstorm (process) ≠ Notes (product).** When deliberation settles, the
  conclusion *graduates* from Brainstorm into Notes.
- **Subtasks (the *what*) ≠ Agent log (the *how*).**
- **Comments record *that* a decision happened** — the debate that produced it lives
  in Brainstorm.
- **Agent memory is issue-scoped** — it complements, never replaces, global memory.

> For the full operating manual — when to log a milestone, the explicit-save rules,
> worked examples — see the **documentation-guide** skill.
`;

/** Pre-rendered HTML for the Guide panel. Computed once at build. */
export const ISSUE_GUIDE_HTML = renderMarkdown(ISSUE_GUIDE_MARKDOWN);
