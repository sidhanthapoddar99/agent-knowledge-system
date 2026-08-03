---
title: "The last three — a stale guide page, a page pointing nowhere, and a gate anchored on itself"
status: done
agent: claude
---

# Goal

Clear the three remaining open subtasks —
[`110`](../../../subtasks/110_using-with-ai-page-stale.md),
[`120`](../../../subtasks/120_config-page-missing-data-dir.md),
[`130`](../../../subtasks/130_skill-links-checks-the-wrong-tree.md) — and push.

Sid, having been given the three in plain terms and asked what he wanted:
*"issues-test was a scratch tracker on my disk, delete it / complete the three
and push."*

# Inputs

- The one answer only he had: what `issues-test` was for
- The recommendation he accepted by not objecting: **the loader should refuse**
  a page whose data path is missing

# Expected Outcome

Three subtasks at `review`, gates green against the **working tree**, one commit,
pushed.

# Outcome

**All three done.** `110` delegated (prose, and every command on it needed
running); `120` and `130` are code and stayed here.

## `130` — the anchor was the bug, not the radius

Moved from *where the script lives* to **where you are standing**.
`resolveSkillsDir()` walks up from the CWD for `plugins/agent-ks/skills/`; not
found falls back to the copy beside the script **with a warning**, which is
correct for a consumer who has no source tree.

**The fix could not test itself, and that is the defect in one sentence.**
Running `agent-ks check skill-links` right after writing it still reported the
install path — because the dispatcher on `PATH` runs the *installed copy of the
script being fixed*. Until the plugin is reinstalled the working-tree invocation
stays `bun plugins/…/check-skill-links.mjs`; after a reinstall the bare command
becomes correct on its own.

Control-tested four ways: repo root, a subdirectory (walk-up), outside any repo
(warns), and with a deliberately broken link (45 files / 1 error naming the repo
file, versus 44 / clean). The file-count change is the proof it read the right
directory.

`check-legacy-tags.mjs` was checked for the same pattern and **does not have
it** — it resolves *content*, whose cwd fallback lands correctly. Named as a
clean area because silence is not signal.

## `120` — and the guard's first draft was itself a plausible wrong answer

`issues-test` deleted on Sid's word. `loadSiteConfig()` now throws when any
`pages.*.data` resolves to a path that does not exist, naming the alias as
written, the resolved path, and the `site.yaml` key — collecting every offender
into one error rather than failing on the first.

**The control test caught a false invariant I had just written.** The first draft
also asserted the path was a *directory*. Run against the real config it refused
**three** pages: the probe, plus `home` and `about` — which are correct, because
a single-page type points at one YAML file (`@data/pages/home.yaml`), not a
folder. That guard would have broken two working pages on every consumer build.

The irony is worth keeping: a guard written to stop a plausible wrong answer
*was* one for about four minutes. Existence-only now, with the reason in a code
comment so the next reader does not "tighten" it back.

**952 → 951 pages after deleting the entry**, and that single page is the whole
finding: the missing folder was not producing nothing, it was producing an index
page for an empty section — rendering successfully, indistinguishable from a
section emptied on purpose.

# Gates

| Gate | Result |
|---|---|
| `./start build` | **951 pages**, exit 0 |
| `agent-ks check config` | ✓ — was `✗ pages.issues-test.data` before |
| `agent-ks check issues` | 51 folders, 0 errors, 1 pre-existing warning |
| `check-skill-links.mjs` **against the working tree** | 3 skills, clean, control-tested both directions |
| `tsc --noEmit` | **0 errors in `loaders/config.ts`** (27 pre-existing elsewhere, untouched) |
| Loader refusal | control-tested — fires on a probe, names the key and both paths |

# Left over

**A consumer upgrading now gets a new hard stop that can fail a build that used
to pass.** That is a real behaviour change and it belongs in a release note, so
the loader refusal should ship as part of **0.2.1** rather than silently. Not
bumped here — a release is outward-facing and was not asked for.

`MIN_CONTENT_VERSION` does **not** move: no content format changed, so nobody
needs to migrate. Only the engine's tolerance for a bad `site.yaml` changed.
