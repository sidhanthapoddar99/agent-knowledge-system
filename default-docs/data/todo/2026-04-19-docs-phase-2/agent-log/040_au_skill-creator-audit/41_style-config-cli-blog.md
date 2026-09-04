---
title: "Style pass: config, cli, blog"
status: done
agent: claude
---

The plain-language pass over `agent-ks-config`, `agent-ks-cli` and `agent-ks-blog`, under [08_style-brief.md](./08_style-brief.md). Wording only. Every fact, command, path, link target, table and heading stayed as it was.

## Result

Files edited: 18. Files read and left unchanged: none in scope. Out of scope and untouched: every `description` field, `agent-ks-cli/templates/`, `agent-ks-cli/scripts/`.

| File | Sentences before / after | Avg words before / after | Over 20 before / after |
|---|---|---|---|
| agent-ks-config/SKILL.md | 15 / 19 | 12.1 / 9.7 | 1 / 1 |
| agent-ks-config/assets/claude-md.template.md | 7 / 7 | 5.1 / 5.1 | 0 / 0 |
| agent-ks-config/assets/template/README.md | 11 / 25 | 21.8 / 11.0 | 5 / 0 |
| agent-ks-config/assets/template/data/README.md | 8 / 11 | 11.6 / 8.5 | 1 / 0 |
| agent-ks-config/assets/template/data/blog/2026-04-26-welcome.md | 6 / 7 | 9.3 / 9.0 | 0 / 0 |
| agent-ks-config/assets/template/data/docs/05_getting-started/01_welcome.md | 5 / 10 | 21.0 / 11.2 | 2 / 2 |
| agent-ks-config/references/01_new-project.md | 46 / 63 | 11.2 / 9.1 | 7 / 0 |
| agent-ks-config/references/02_add-section.md | 42 / 45 | 8.5 / 8.2 | 2 / 0 |
| agent-ks-config/references/03_site-config.md | 41 / 51 | 10.0 / 8.8 | 3 / 0 |
| agent-ks-config/references/04_navbar-footer.md | 18 / 22 | 11.8 / 10.3 | 0 / 0 |
| agent-ks-config/references/05_themes.md | 48 / 71 | 12.1 / 9.0 | 5 / 0 |
| agent-ks-config/references/06_layouts.md | 49 / 60 | 10.6 / 9.0 | 3 / 1 |
| agent-ks-config/references/07_custom-pages.md | 34 / 41 | 10.9 / 9.4 | 2 / 0 |
| agent-ks-config/references/08_migrations.md | 28 / 35 | 10.3 / 9.6 | 0 / 0 |
| agent-ks-cli/SKILL.md | 15 / 17 | 7.1 / 7.4 | 0 / 0 |
| agent-ks-cli/references/cli-toolkit.md | 32 / 40 | 10.9 / 9.1 | 2 / 1 |
| agent-ks-cli/references/contract.md | 60 / 71 | 9.9 / 9.1 | 1 / 0 |
| agent-ks-blog/SKILL.md | 30 / 34 | 9.1 / 8.0 | 1 / 1 |
| Group total | 495 / 630 | 10.7 / 9.0 | 35 / 6 |

Sentences over 30 words: 8 before, 0 after. Longest sentence: 60 words before, 29 after.

SKILL.md body words before / after: agent-ks-config 472 / 475, agent-ks-cli 588 / 607, agent-ks-blog 1072 / 1084. `agent-ks-cli` is over the 600 cap by the words a definition and three splits added. Sid decides. Reference line counts: 01 and 02 stay at 149, 05_themes.md 119.

### Facts I doubted, left as they were
- `agent-ks-config/assets/template/README.md:10`: "Writes those answers over the placeholder values in `config/site.yaml`." The step 6 script in `01_new-project.md` also substitutes into `config/footer.yaml` and `data/pages/home.yaml`. The README names only `site.yaml`.
- `agent-ks-config/assets/template/data/blog/2026-04-26-welcome.md:24`: "Give it at least `title`, `description` and `date` in the frontmatter." The blog skill says `title` is the only required field.
- `agent-ks-config/assets/template/data/blog/2026-04-26-welcome.md:13`: "Keep the date in the filename and the `date:` field in the frontmatter the same." The blog skill says `date:` overrides the filename date on purpose, to backdate without a rename. The two files give different advice.

### Terms I defined
- `agent-ks-config/references/01_new-project.md`: shim, "The shim is the small script on PATH that starts the CLI."
- `agent-ks-config/references/01_new-project.md`: collision, "A collision is a file or folder in `$chosen_root` that the template also carries."
- `agent-ks-config/references/02_add-section.md`: kebab-case, "lowercase words joined by hyphens".
- `agent-ks-config/references/03_site-config.md`: dogfood mode, "Dogfood mode is the mode the framework's own maintainers use."
- `agent-ks-config/references/04_navbar-footer.md`: site chrome, "the navbar above and the footer below every page".
- `agent-ks-config/references/08_migrations.md`: migration, "A migration is a script that rewrites content into the new format."
- `agent-ks-cli/SKILL.md`: scaffolder, "A scaffolder is an `agent-ks` verb that writes a new file from a template."
- `agent-ks-cli/references/contract.md`: dispatcher, "A dispatcher is the program that receives every `agent-ks` call and starts the right script."
- `agent-ks-cli/references/contract.md`: idempotent, "That means you can run it twice on the same tree, and the second run changes nothing."
- `agent-ks-blog/SKILL.md`: renderer gap, "a defect in the framework and not in the content".

### Sentences left over 20 words
- `agent-ks-config/SKILL.md:12` and `agent-ks-blog/SKILL.md:10`: the "Source of truth" sentence, 25 words. It is one claim followed by a list of five items. A split would separate the list from its claim.
- `agent-ks-config/references/06_layouts.md:93`: the list of forbidden CSS values, 25 words. One instruction, one list. A split would repeat "use no" five times.
- `agent-ks-cli/references/cli-toolkit.md:47`: 21 words, two flags and four accepted forms. A split would repeat the flag names.
- `agent-ks-config/assets/template/data/docs/05_getting-started/01_welcome.md:13,21`: the measure counts two bullet lists as one sentence each because the bullets carry no full stop. Each bullet is under 15 words.

### Words replaced from the hunt list
vendored dependency, scaffold (as a verb, in the template README only), boots, as-is, rsyncs, wired up (body only, the heading stays), lede, clamps, provenance, silently, downstream, misrendering, drift, traversal, re-implement, payload, synchronously, asynchronous, truncates, capability, normalise, flow into, funds (none found), and every "X; Y" joined by a semicolon in prose.

### Gates
- `agent-ks-dev check skill-links`: ✓ all checks passed
- `agent-ks-dev check link-form plugins/agent-ks/skills`: ✓ all checks passed
- `bun plugins/agent-ks/skills/agent-ks-cli/scripts/_selftest.mjs`: PASS
- Body word count: config 475, cli 607, blog 1084

## Caveats

- The `description` frontmatter fields still carry the old register. They were out of scope by the brief.
- `agent-ks-cli/SKILL.md` is 7 words over the 600 cap. The words came from the scaffolder definition and the worktree paragraph split. Cut nothing to fit; Sid decides.
- The three doubted facts above are in the starter template that every new consumer project copies. They are worth a fix in a fact pass, not this one.
- The measure script is `scratch/sentence-stats.mjs` at the repo root, gitignored. The before and after outputs are `scratch/style-before-config-cli-blog.txt` and `scratch/style-after-config-cli-blog.txt`.

## Links

- [08_style-brief.md](./08_style-brief.md)
