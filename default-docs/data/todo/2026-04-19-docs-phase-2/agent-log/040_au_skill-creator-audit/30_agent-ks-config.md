---
title: agent-ks-config — re-audit
---

# agent-ks-config

**Verdict:** needs fixes. Every ruled fix landed and none regressed. What is left is one class of defect the fix round did not reach: the copy-and-substitute step in `01_new-project.md` still writes wrong output on three ordinary inputs.

**Measured:** SKILL.md 472 body words (597 whole file) · references: 01_new-project 150 lines, 02_add-section 150, 03_site-config 132, 04_navbar-footer 92, 05_themes 119, 06_layouts 106, 07_custom-pages 122, 08_migrations 64 · assets: claude-md.template.md 56 lines, template/ 19 files.

House rules pass. SKILL.md body is 472 words against the 600 cap, so it has room. Every reference is at or under 150; 01 and 02 sit exactly on 150 and have no headroom. Every link is relative — `grep` finds no `](/…)` anywhere in the skill — and `agent-ks-dev check skill-links` exits 0 over 61 files `[repo source tree]`. No history words. No `check links` reference survives (decision G).

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | Template tracker `settings.json` now ships `priority`, `component`, `labels`, each with a full `descriptions` map, no `fields.status`, no `colors`. Checked against `resolveVocabulary()` (`astro-doc-code/src/loaders/issues.ts:718-751`): both throws are avoided |
| 2 | closed | `--ignore-existing` at `01:88`, the skip-report loop at `01:84-85`, `.gitignore` and `assets` in the pre-flight at `01:13`. Verified with `rsync -a -n --itemize-changes`: `.gitignore` and `.env.example` are skipped, `data/README.md` still copies, top-level `README.md` is excluded by the anchored `/README.md` pattern. See N1 and N2 for what the pre-flight still gets wrong |
| 3 | closed as ruled | `sed -i.bak … && rm -f *.bak` at `01:92-104`; the shim walk at `01:29-31` uses `readlink` plus `cd … && pwd -P`, no `readlink -f`. The bundled script stays deferred. See N3 |
| 4 | closed | Template `engine_version: "0.3.10"` = `ENGINE_VERSION`. The step-8 instruction is at `01:150`. See N4 for who executes it |
| 5 | closed | `06:77` reads `issue`, `vocabulary`, `baseUrl`; `06:78` adds the sub-doc row with `subDoc`. Both match `prepareRender()` (`astro-doc-code/src/pages/lib/route-match.ts:357-367`). The other six rows re-checked and correct |
| 6 | closed | The Never table is four rows: confirm, never overwrite, never clone, plus the YAML row from finding 19. The five topic rows are gone |
| 7 | closed | `assets/template/data/README.md` ships, four rows, folder/holds/route. `02:138` points at it as the shape; `03:25` says what to do when a project has none |
| 8 | closed | `05:101` now states the true scope: declared-key only, dev only, error-logger reporting, most themes never walked, and names `@root/scripts/checks/check-theme-contract.mjs` as the real gate. Matches `theme.ts:321-353` and `theme.ts:425-440` |
| 9 | closed | Decision C applied in all three places (`SKILL.md:46`, `05:50`, `06:31`) and `03:34,39` adds the `--detach` and `logs` rows |
| 10 | closed | `01:111-125`: three named cases in a table, merge shown as a before/after diff block |
| 11 | closed | `05:113-117` carries the engine's strings. Verified at `theme.ts:106, 314, 340, 187`. `Circular theme inheritance` greps both emitters (`theme.ts:362, 416`) |
| 12 | closed | `05:115` puts `override` in the warning half and `merge` as silent inheritance. Matches `theme.ts:337-351` |
| 13 | closed | `07:100` now says `LoadedContent`, `data`, `filePath` |
| 14 | closed | Template root `data/docs/settings.json` uses the `sidebar` block. `05_getting-started/settings.json` correctly keeps `isCollapsible`/`collapsed` |
| 15 | closed | The welcome page says "The `/agent-ks-config` command copied this file in" |
| 16 | closed | `05:64` lists all ten files from `src/styles/theme.yaml`, `breakpoints.css` included |
| 17 | closed | `06:104` names all eight breakpoints and marks 640/768/1024 as the common three. Matches `src/styles/breakpoints.css:10-17` |
| 18 | closed | `03:61` is `engine_version: "N.N.N"` with the pointer to `engine-version.ts` |
| 19 | closed | The reason is on the row: "The comments and the key order are the file's documentation, and a rewrite destroys both" |
| 20 | closed | `SKILL.md:48` keeps the self-repair line and sends the fix to the framework repo. The catalogue-maintenance sentence is gone |
| note (issues tail) | closed | `agent-ks-issues`'s description now ends "site config or themes to agent-ks-config" |
| cut/add | closed | `.env.example` at `01:68-69`, the `alt:` substitution at `01:60`, `--detach` and `logs` rows at `03:34,39`, the sub-doc props row at `06:78`, SKILL.md's mode paragraph cut to one line at `SKILL.md:33`. No deployment row, as ruled |

20 closed, 0 partly, 0 open.

**Regression sweep.** I read every changed passage. No new false claim, no lost fact, no broken link, no cap breach. I re-verified the whole contract table at `05:88-98` against `src/styles/theme.yaml → required_variables` and it matches group for group. `agent-ks-dev check config <template>/config` exits 0 (but see N5 for why that is thinner than it reads).

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `references/01_new-project.md:12-13` | The pre-flight tests `./`, but the write root is not chosen until step 3 and step 6 writes into `$chosen_root` | For scope "subfolder" the collision list shown in the step-5 confirm block describes the wrong directory: it names root files that will never be touched, and misses real collisions inside the subfolder. On a Python repo with a root `.gitignore` and scope `docs`, the confirm block says the template's `.gitignore` is skipped while step 6 in fact creates `docs/.gitignore` | Move the collision loop to the end of step 3, after `chosen_root` is fixed, and test `"$chosen_root/$p"`. Leave the blocker loop where it is; it is a guard on the repo, not on the write root |
| N2 | major | `references/01_new-project.md:13` | The collision message "step 6 keeps yours" is true for a file and false for a directory, and the list omits `config` and `.env.example` | `--ignore-existing` skips existing *files*; it still merges new files into an existing directory. Proven with `rsync -a -n --itemize-changes` into a folder that already had `data/`, `assets/`, `config/` and `themes/`: `config/site.yaml` and `data/README.md` were skipped, while `data/docs/`, `data/issues/` and `data/blog/2026-04-26-welcome.md` were written in. A Python repo with a plain `config/` folder gets three template YAMLs merged into it with the confirm block reporting "none" | Split the loop: report a colliding *file* as "kept yours, skipped", and a colliding *directory* as "exists; the template's files are added inside it, your same-named files are kept". Add `config` and `.env.example` to the list |
| N3 | major | `references/01_new-project.md:92-94,103` | `SITE_NAME`, `SITE_TITLE` and `DESCRIPTION` go into the `sed` replacement unescaped, while only `REPO_URL` is escaped (`01:99`) | `&` in a sed replacement expands to the whole match, and `\|` is the delimiter. Ran it: `SITE_NAME='R&D Handbook'` writes `name: "Rname: "My Docs"D Handbook"` into `config/site.yaml` — broken YAML, written silently, and `agent-ks check config` at step 8 does not parse `site.name` so it still exits 0. "R&D", "Ben & Co" and "Design & Research" are ordinary site names | Escape all four the same way, and add the delimiter to the class: `esc() { printf '%s' "$1" \| sed 's\|[\\&\|]\|\\\\&\|g'; }`, then substitute `$(esc "$SITE_NAME")`. The existing `REPO_ESCAPED` line has the same missing `\|` |
| N4 | major | `references/01_new-project.md:150` | The engine-version instruction has no executor: it says "after the clone", the agent must not clone (`SKILL.md:41`), and step 8 ends by printing the hand-off block | The agent's turn is over when the block is printed, so nobody performs the step. Worse, the printed block tells the user to run `./start --detach` immediately after cloning — before the version is corrected — so if the clone's floor has moved past the template's `0.3.10` the user's first launch fails with a version-gate error the skill just told them how to avoid | Move it into the printed block as a numbered step between `echo "CONFIG_DIR=../config" > .env` and `./start --detach`: "read `ENGINE_VERSION` in `astro-doc-code/src/loaders/engine-version.ts` and set `engine_version` in `../config/site.yaml` to match". Keep one sentence outside the block saying why |
| N5 | major | `references/03_site-config.md:131`, `references/01_new-project.md:129` | "Every `data:` path resolves on disk after alias substitution" is not true for an alias key containing a hyphen | `resolveAlias()` in `plugins/agent-ks/skills/agent-ks-cli/scripts/config/check.mjs:164` matches `^@(\w+)\/?(.*)$`, and `\w` excludes `-`. So `@default-docs/user-guide` parses as alias `default`, which is not in the map, and the entry is skipped in silence. The template ships exactly that alias, so the one page whose data path genuinely cannot exist before the clone is the one the check never looks at — and step 8 leans on that exit 0 as the scaffold's gate. The engine itself is fine; `extractPrefix()` (`astro-doc-code/src/loaders/alias.ts:76-88`) matches longest-key-first over the real key set | Fix the regex to `^@([\w-]+)\/?(.*)$` in the CLI script (that change is `agent-ks-cli`'s). Until then, narrow `03:131` to "every `data:` path whose alias the checker can resolve", and have `01` step 8 say the user-guide entry is only verified once the framework is cloned |
| N6 | minor | `references/08_migrations.md:47-54` | "Every script has one shape" over-promises the subcommand set | `migration/0.2.0_agent-log-slot-numbering.py:395` declares `choices=("detect", "migrate", "relink", "verify")` — no `locate`, and an extra `relink` the table does not mention. `0.1.2_legacy-custom-tags.py` has no `verify`, which the table's last row does cover | Write "Most scripts carry these four; a script may add one of its own. Run `python <script> --help` first." Keep the four rows |
| N7 | minor | `references/02_add-section.md:69-81` | The step-5 confirm block does not name the `data/README.md` row that step 7 writes | `SKILL.md:39` says never write into the user's folder without showing the plan and getting a yes. This is the one file the flow edits that the plan omits | Add a line to the "Will create" list: `<data_root>/README.md  (add one row for <name>)` |
| N8 | minor | `assets/claude-md.template.md:38` | The skills table lists seven of the ten shipped skills; `agent-ks-qna`, `agent-ks-quick-idea-note` and `agent-ks-index-check` are missing, and the row ends "Each triggers on its domain" | This file becomes the consumer's own `CLAUDE.md`, so it is the one place a later session learns what the plugin offers. The two command skills at least appear in the Commands row below; `agent-ks-qna` appears nowhere and is never discovered | Add `agent-ks-qna` (scoping a subtask by question and answer) to the Skills row, and say "ten skills" |

## The dry run, second time

The same prompt: "Set up docs for this repo. We don't have any yet — it's a Python package." Site name "R&D Handbook", scope `docs`.

1. Better: step 1 now prints `.gitignore` as a collision and step 6 keeps it. Confirmed by `rsync -n --itemize-changes` — `.gitignore` and `.env.example` skipped, `data/README.md` copied, top-level `README.md` excluded.
2. Better: the step-5 confirm block finally matches step 6 — `data/README.md`, `.env.example` and the collision list are all named before I write anything.
3. Better: step 6's `sed -i.bak` and step 2's `pwd -P` walk both run on BSD. Step 2's fallback resolved correctly here; it only failed because the installed plugin is frozen at 0.9.0 and predates the rename. Not a defect.
4. Better: step 7 is where I was lost last time. Three named cases and a diff block settled it in one read.
5. Better: `agent-ks-dev check config <template>/config` exits 0, and the template tracker now loads — no `fields.status`, descriptions everywhere.
6. Wrong: step 1 ran in `.`, then step 3 put me in `docs/`. The collision list I showed the user was about the repo root (N1).
7. Wrong: it told the user `data` and `assets` were "kept yours, skipped". The dry run shows rsync merging new files into both (N2).
8. Wrong: "R&D Handbook" through step 6's sed writes `name: "Rname: "My Docs"D Handbook"` — broken YAML, and step 8 still exits 0 (N3).
9. Wrong: step 8's last line told me to read `ENGINE_VERSION` after a clone I am forbidden to run, once my turn is already over (N4).
10. Missing: nothing I needed. Every line of 01 is load-bearing, and the two references I opened were the two the triage table named.
