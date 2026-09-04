---
title: agent-ks-cli — re-audit
---

# agent-ks-cli

**Verdict:** needs fixes — the blocker is closed and the skill is now broadly true, but three claims about validator behaviour are still wrong, and one of them was introduced by this round's fix.

**Measured:** SKILL.md 569 body words (668 with frontmatter) · 71 lines · description 95 words, 610 characters · references: `cli-toolkit.md` 116 lines, `contract.md` 85 lines. All three inside the decision-I caps.

The fix round landed well. `check links` is gone from the manifest, the script is deleted, and no skill mentions it. The description now names the verbs a user types, and two of the three trigger misses from round one are closed. The worked command lines are the single biggest improvement: the round-one dry run could not assemble an invocation from the tables, and the second run copied one. The self-test passes (`bun scripts/_selftest.mjs` → PASS, 36 commands). `check skill-links` on this skill passes, 16 files.

What is left is one family: the skill still describes the `check` group as if `check issues` were the only validator with warnings, its manifest gives two `check issues` flags the wrong meaning, and the fix to the unknown-flag row put `move` and `img` in the wrong bucket.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `docs-check-links` removed from `_manifest.mjs`, `check-content-links.mjs` deleted, no `check links` string anywhere under `plugins/` or `scripts/`. `agent-ks-dev help` lists seven `check` verbs, none of them `links`. The header comment of `check-link-form.mjs` now points at `scripts/checks/check-links.mjs` as the development-stage owner |
| 2 | closed | `SKILL.md:25-26` and `contract.md:57` now name the families. Verified by running all 20: every `issue` verb, `check section` and `move` exit 1 on a missing argument; `doc`, `blog`, `git` and `find` exit 2 |
| 3 | partly | The `check` half is right — `check blog/config/section/legacy-tags/skill-links/link-form` all ignore an unknown flag, `check issues` exits 2. The `move`/`img` half is now a false claim: both **reject** an unknown flag with exit 1, they do not ignore it. See N1 |
| 4 | closed | `SKILL.md:8` and the `img` row at `cli-toolkit.md:13` both carry the ImageMagick dependency |
| 5 | closed | `cli-toolkit.md:84` states the error/warning split, says to read the counts rather than the exit code, and describes `--strict`. Verified: `check issues --template` prints 424 warnings and exits 0. The description of `--strict` there is the accurate one — the manifest's is not (N3) |
| 6 | closed | `contract.md:67` now reads "It checks the new command's `--help`, `-h` and `--json` … It does not check the exit codes of §5, so test those by hand." Matches `_selftest.mjs:63-82`, which runs exactly those three checks |
| 7 | closed | The proposed description was taken verbatim. Trigger re-test below: two of the three round-one misses now fire |
| 8 | closed | `_manifest.mjs:152` now reads `lp/au/rf/re/it/wf`, matching `DEFAULT_KINDS` in `new-agent-log.mjs:32`. Confirmed through `agent-ks-dev help issue new-agent-log` |
| 9 | closed | `cli-toolkit.md:44` `--log <path> required, relative to agent-log/`; `:42` `--plan <folder> required, the plan folder under plans/` |
| 10 | closed | `cli-toolkit.md:43` links `agent-ks-issue-logs`, which does own the six kinds in its own description and its "The six kinds" table |
| 11 | closed | `cli-toolkit.md:3` now reads "…or a top-level `agent-ks <verb>` for the five in General" |
| 12 | closed | `cli-toolkit.md:88` states the precondition and its reason. Reproduced the message on `default-docs/data/blog` (2 files, 0 links, exit 1) |
| 13 | closed | The banner rule is gone from the SKILL.md Rules table and now sits in the `skill-links` row at `cli-toolkit.md:90`, beside "Maintainer tool" |
| 14 | closed | `SKILL.md:60` gives the reason: "`Grep` reads text, so it cannot see status, vocabulary or subtask counts, which live in `settings.json`" |
| 15 | closed | `new-round.mjs:216` sets `indexUpdated: hasIndex` in the `--json` payload, with a comment. `hasIndex` is the same value that drives the human-path notice at `:220-221`, so the two paths cannot drift. Read only; no tracker file created |
| 16 | closed | `_manifest.mjs:111-112` flipped: `--status` "filter by subtask status", `--state` "alias of --status". Matches `subtasks.mjs` and `cli-toolkit.md:35` |
| add | closed | Six worked command lines at `cli-toolkit.md:53-62`; the two `--report` preconditions at `:51`, both verified against `new-round.mjs:90-107` |

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `SKILL.md:16`, `references/contract.md:31` | "`move`, `img` and every `check` verb but `issues` ignore it instead" is false for `move` and `img`. Both print `Unknown flag: --x`, print usage and exit 1 (`docs/move.mjs:65`, `images/optimize.mjs:78`); only the six `check` verbs ignore it | An agent told the flag was ignored assumes the move or the optimisation ran with the rest of its flags. It did not — nothing happened. The round-one finding named this correctly and the fix mis-sorted it | Split the sentence: "The six `check` verbs other than `issues` ignore an unknown flag and carry on; `move` and `img` reject it and exit 1 instead of 2." Fix both files |
| N2 | major | `SKILL.md:44`, `references/cli-toolkit.md:85-87` | "validators; exit 1 on an error. `check issues` warnings exit 0" reads as a `check issues` exception. The split is the shared behaviour of every validator: `reportAndExit()` in `_check-lib.mjs:101` exits on `errors.length` alone, and `blog/check.mjs`, `docs/check.mjs` (`check section`) and `config/check.mjs` all push warnings (1, 3 and 5 sites) | An agent runs `check config`, sees exit 0, and reports the config clean while "navbar.yaml: no items found" is on screen. That is the same failure finding 5 was raised to stop, still open for five of the seven validators | Say it once for the group: "every validator splits findings into errors (exit 1) and warnings (exit 0) — read the counts, not the exit code", and drop the `check issues` singular from `SKILL.md:44` |
| N3 | major | `scripts/_manifest.mjs:248-249` | The `check issues` flag help is wrong on two flags. `--verbose` is described as "per-file detail while walking"; it actually lists the canonical keys behind an unknown-key warning (`issues/check.mjs:149`). `--strict` is described as "treat warnings as errors"; it promotes only the unknown-key drift warnings (`issues/check.mjs:893-895`). Measured: `check issues --template --strict` exits **0** with 424 warnings | `cli.mjs:69` intercepts `--help`, so the manifest text is the only help anyone ever sees — the script's own correct wording at `check.mjs:48-49` is unreachable. `--strict` is the flag an agent reaches for precisely to make warnings fail; it gets exit 0 and no reason why | Copy the script's own two lines into the manifest: `--verbose` "for unknown-key warnings, also list the canonical keys"; `--strict` "promote unknown-key warnings to errors (exit 1 on schema drift)" |
| N4 | minor | `references/cli-toolkit.md:60-61` | The worked lines read as a sequence, but line 61 passes `--log 040_au_skill-review` while line 60 does not produce prefix `040` — `new-agent-log` takes the next gap-spaced number in that issue | An agent copying both in order gets "No agent log at …" on the second, on the one block the reference added so it would not have to guess | Add one sentence under the block: "the `--log` value is the folder `new-agent-log` printed, not a fixed number" |
| N5 | minor | `references/cli-toolkit.md:88-89` | Neither `link-form [root]` nor `legacy-tags [root]` says what `[root]` defaults to. It is `<content-root>/data` (`check-link-form.mjs:93-95`) | The row already warns that a link-free `[root]` fails; without the default the agent cannot tell whether omitting it is the safe call. It is — the whole-tree default is what the guard was written for | Add "default: the content root's `data/`" to both rows |
| N6 | minor | `references/cli-toolkit.md:51` | "still writes the file, says so on stdout, and sets `indexUpdated: false` in the `--json` payload" reads as three things that happen together. With `--json` only the JSON reaches stdout — the notice is the human path's, per the contract row at `SKILL.md:15` | Small, but it is the one sentence describing the contract's own edge case, in the file that teaches the contract | Two sentences: "…still writes the file. The human path prints a notice; `--json` carries `indexUpdated: false` instead" |

Nothing here is a blocker. No regression found in the round-one fixes other than N1.

Checks run, for the record: `_selftest.mjs` (PASS); `agent-ks-dev help` and `help --json`; every command's manifest flag names diffed against `cli-toolkit.md` (zero drift in either direction, including the 25-flag `img` table and the 28-flag `list` table); `--json` output parsed on eight commands (all valid); exit codes measured on 20 missing-argument cases and 15 unknown-flag cases; the eight statuses and the closed set checked against `astro-doc-code/src/loaders/issue-status.ts`; `resolve-context --json` and `theme tokens --json` key sets checked against `contract.md:61` and `cli-toolkit.md:116` (both match); `check skill-links` on the skill (pass, 16 files); no leading-slash link, no history word, no repo-root-relative framework path in any of the three markdown files.

## The dry run, second time

The same prompt: *"Open an audit agent log on the docs-phase-2 issue for this skill review, and add its first round file."*

Better, in order:

1. SKILL.md group table gave `issue new-agent-log` and `issue new-round` as before, in seconds.
2. `--kind` no longer dead-ends. The row names `agent-ks-issue-logs` as the owner, and `agent-ks-dev help issue new-agent-log` now answers `lp/au/rf/re/it/wf`. Round one lost `re` on both routes; this time either route was enough.
3. `--log` and `--plan` carry their bases, so I did not have to re-query help for what the value is relative to.
4. The worked block ended the assembly problem outright. Round one built a five-flag invocation out of table cells; this time I copied a line.
5. The `--report` preconditions are stated before I could hit them, which is the right place for them.

Still wrong:

6. Copying lines 60 and 61 in order would have failed on the invented `040_` prefix (N4).
7. I still had to read the script to learn what `--strict` does, because `agent-ks help check issues` describes it wrongly and `cli-toolkit.md` describes it rightly — and nothing says which to trust (N3).
8. I read the `img`, `git` and `theme` sections I did not need. At 116 lines that remains an acceptable cost, not a finding.

## Trigger test, second time

| Prompt | Should fire | Fires |
|---|---|---|
| "`agent-ks issue list --state review` exited 2 saying unknown flag — what's the right one?" | yes | yes — "when one fails or exits 2" |
| "rename `07_versioning.md` to `06_versioning.md` and fix every link that points at it" | yes | yes, now — "moving or renaming a page so every link follows". Round-one miss, closed |
| "these onboarding screenshots are ~4 MB each, can you shrink them before I commit" | yes | yes, now — "optimising images before a commit". Round-one miss, closed |
| "I want to add a `check frontmatter` command to the toolkit — where does the script go?" | yes | yes — "when you are adding a new command to the toolkit" |
| "write the guardrails and done-when for subtask 12 before I hand it to an agent" | no | no — `agent-ks-qna` still wins; "scaffolding subtasks" is a near-miss but not a match |
