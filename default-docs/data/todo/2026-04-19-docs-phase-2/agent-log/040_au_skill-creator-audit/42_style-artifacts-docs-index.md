---
title: "Style artifacts docs index"
status: done
agent: claude
---

The plain-language pass over `agent-ks-artifacts`, `agent-ks-docs` and `agent-ks-index-check`, under [08_style-brief.md](./08_style-brief.md). Wording only. No fact, command, path, link target, table column or heading changed.

## Result

Files edited: 13. Files read and left unchanged: `agent-ks-artifacts/references/PROVENANCE.md` (out of scope). Every SKILL.md `description` left as it was.

| File | Sentences before / after | Avg words before / after | Over 20 before / after |
|---|---|---|---|
| agent-ks-artifacts/SKILL.md | 20 / 23 | 13.2 / 12.3 | 2 / 2 |
| agent-ks-artifacts/references/publishing.md | 108 / 143 | 14.5 / 11.6 | 20 / 17 |
| agent-ks-artifacts/references/dataviz.md | 83 / 97 | 13.7 / 12.7 | 13 / 14 |
| agent-ks-artifacts/references/dataviz-color.md | 61 / 73 | 13.3 / 11.3 | 7 / 3 |
| agent-ks-artifacts/references/design-fundamentals.md | 77 / 85 | 8.1 / 7.5 | 0 / 0 |
| agent-ks-artifacts/references/design-systems.md | 45 / 59 | 12.3 / 10.0 | 2 / 0 |
| agent-ks-artifacts/references/palette.md | 36 / 44 | 12.5 / 10.5 | 1 / 0 |
| agent-ks-docs/SKILL.md | 21 / 29 | 11.7 / 9.6 | 2 / 1 |
| agent-ks-docs/references/writing.md | 52 / 57 | 9.5 / 9.3 | 1 / 1 |
| agent-ks-docs/references/docs-layout.md | 45 / 51 | 10.0 / 9.1 | 0 / 0 |
| agent-ks-docs/references/images.md | 20 / 20 | 9.9 / 10.1 | 0 / 0 |
| agent-ks-index-check/SKILL.md | 23 / 26 | 9.7 / 9.4 | 0 / 0 |
| agent-ks-index-check/references/procedure.md | 78 / 91 | 11.8 / 10.3 | 6 / 1 |
| **Group total** | 669 / 804 | 12.1 / 10.8 | 54 / 39 |

The counter reads a table row as one sentence, so most "over 20" left are table rows and list items. The two over 30 in `artifacts/SKILL.md` are the two token-name lists under the inline contract.

SKILL.md body words before / after: artifacts 588 / 614, docs 595 / 647, index-check 594 / 619. All three pass the 600 cap only by the words the splits added. Sid decides.

What changed most: metaphors and clever verbs made literal ("stays true on disk", "dies with the run", "fence a mark", "sink the comparison", "decision furniture", "interface furniture", "graft a foreign idiom", "melt into the surface", "ink a value"); semicolon and colon sentences split; "first-class page" replaced with "renders as a page"; "legal" replaced with "allowed" and "frozen order" with "fixed order" across the dataviz files; "unsandboxed" written as "with no sandbox" with the consequence spelled out; "the governor" removed from `design-fundamentals.md`; arrow chains ("good → warning → serious → critical", "in flux → Home A") written as sentences; fragments in list items made sentences.

### Facts I doubted, left as they were
- `agent-ks-artifacts/references/dataviz-color.md:13`: "the anchor inverts in dark mode". "Anchor" is not defined anywhere in the three dataviz files. A cold reader cannot tell which end of the ramp it means. Left as written.
- `agent-ks-docs/SKILL.md:44`: "Do not guess a flag." No reason recorded in the skill for what a wrong flag does. I added "Run the help command instead" and no reason.

### Terms I defined
- `agent-ks-docs/SKILL.md`: convention, "A convention is a rule the code does not enforce."
- `agent-ks-docs/references/docs-layout.md`: outline rail, "The outline rail is the heading list beside the page." Sidecar, "A sidecar is a file beside the page."
- `agent-ks-docs/references/writing.md`: ordering path, "The ordering path is the numeric prefixes of its folders and its own name, joined by `/`." Colocated, "A colocated file is a file that sits beside the page."
- `agent-ks-artifacts/references/publishing.md`: sidecar, "A sidecar is a `NN_name.meta.json` file beside the artifact." Docs chrome, "The docs chrome is the site's own navbar and sidebar." CSP, written as "a browser policy (CSP)".
- `agent-ks-artifacts/references/design-systems.md`: idiom, "the way it is meant to be used". Fixture, "The fixture is the host frame every option renders in." Home B, named at first use as "A published design-system section (Home B, below)".
- `agent-ks-artifacts/references/palette.md`: CVD, "colour vision deficiency (CVD)".
- `agent-ks-artifacts/references/design-fundamentals.md`: eyebrow, "(a small label above a heading)".
- `agent-ks-index-check/references/procedure.md`: index leaf, "The leaf is the one file that lists the others." Graduated, reworded as "a brainstorm that graduated into `notes/`" to match the issues skill's use of the word.

### Sentences left over 20 words
- `agent-ks-artifacts/references/publishing.md:28`: "A markdown page keeps its outline rail, so the column runs about 610px at a 1280px window and about 930px at its widest." Two measurements and their cause. A split separates the numbers from the reason they differ.
- `agent-ks-docs/SKILL.md:10`: "The CLI resolves the real `data/` path from `CONFIG_DIR` in `.env`, so never assume the folder sits at the current directory." The rule and its reason. A split makes the reason a bare fact.
- `agent-ks-docs/references/writing.md:93`, `agent-ks-artifacts/references/publishing.md:74`, `:86`: each is a rule plus its reason joined by "because" or "so". Left whole for the same reason.
- Table rows counted as one sentence in `dataviz.md`, `dataviz-color.md`, `writing.md`, `procedure.md`: the cells are short. Left as they are.

### Gates
- `agent-ks-dev check skill-links`: ✓ all checks passed
- `agent-ks-dev check link-form plugins/agent-ks/skills`: ✓ all checks passed
- `bun plugins/agent-ks/skills/agent-ks-cli/scripts/_selftest.mjs`: PASS
- Body words: artifacts 614, docs 647, index-check 619 (see above)
- Reference line counts unchanged: `publishing.md` 146, `procedure.md` 148, `writing.md` 138

## Caveats

- `git diff --stat` on the three folders: 13 files, 241 insertions, 241 deletions. Every change is inside an existing line, so the diff reads line by line.
- The three SKILL.md bodies are over 600 words. Nothing was deleted to fit. If the cap holds, the cut is Sid's call.
- The "anchor" term in `dataviz-color.md` needs a definition from whoever owns the dataviz method. I did not invent one.
- Two files in other groups (`agent-ks-issues/references/03_writing.md`, `05_brainstorm-notes-memory.md`) are linked from my files. I read them for the word "graduated" only and did not edit them.

## Links

- [08_style-brief.md](./08_style-brief.md): the brief
- [40_style-tracker.md](./40_style-tracker.md), [41_style-config-cli-blog.md](./41_style-config-cli-blog.md): the other two groups
