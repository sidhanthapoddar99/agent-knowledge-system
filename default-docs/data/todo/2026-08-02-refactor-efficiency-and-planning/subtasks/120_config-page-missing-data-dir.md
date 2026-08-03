---
title: "A page whose data folder does not exist builds green"
status: review
---

# Overview

`site.yaml` registers a page `issues-test` pointing at `@data/issues-test`. **That
folder has never existed in this repo** — no git history, no files. The validator
catches it; the build does not.

```
$ agent-ks check config
✗ site.yaml pages.issues-test.data: resolved path does not exist
  (@data/issues-test → default-docs/data/issues-test)

$ ./start build
948 page(s) built — Complete!
```

**Done when** the entry is either removed or backed by a real folder, *and* a
decision is recorded on whether the loader should refuse a page whose data
directory is missing.

Found while gating the 0.2.0 release, not by the audit. **Pre-existing — not
caused by that work.**

# References

- `default-docs/config/site.yaml` — the `issues-test` entry in the `pages:` block
- `astro-doc-code/src/loaders/config.ts` — where page entries resolve, and where
  the version gate already hard-stops on a bad declaration
- [the release iteration file](../agent-log/020_wf_ship-the-split/02_working/150_version-bump.md)
  — where this was found, with the commands above
- [the audit brief](../agent-log/020_wf_ship-the-split/02_working/140_audit-brief.md)
  — the same shape, twice: a check that passes what it should refuse

# Todo list

- [x] Decide what `issues-test` was for. If it was a scratch tracker that lived
      only on Sid's disk, **delete the entry**; if it is wanted, add the folder
      with a root `settings.json`
- [x] Decide the general rule: should `loadSiteConfig()` **refuse** a page whose
      resolved `data` path does not exist, the way it refuses a bad
      `engine_version`? Or is an empty section legitimate — a section registered
      before its content is written?
- [x] If it should refuse — implement it, and give the error the missing path
      **and** the `site.yaml` key that named it
- [x] If empty is legitimate — say so in `check config`'s message and downgrade
      it from error to warning, so the validator and the loader stop disagreeing

# Outcomes and Next Steps

**Done 2026-08-03.** Both halves — the entry deleted and the general rule
implemented.

**Sid answered the question this was waiting on:** *"issues-test was a scratch
tracker on my disk, delete it."* The `site.yaml` comment agreed — *"Phase 1
testbed — throwaway data"* — and the design note that spawned it
([the issues restructure design](../../2026-04-10-issues-layout/notes/01_issues-restructure-design.md))
describes it as a throwaway testbed. Entry removed.

**The loader now refuses**, per the recommendation in Details. `loadSiteConfig()`
throws when any `pages.*.data` resolves to a path that does not exist, naming the
alias as written, the resolved absolute path, and the `site.yaml` key — and it
collects **all** offenders into one error rather than failing on the first.

Same precedent as the version gate and the missing-theme throw: a `site.yaml`
declaration naming something the engine cannot honour hard-stops startup.

## The control test caught a false invariant I had just written

The first draft also asserted the resolved path was a **directory**. Running it
against the real config, the build refused **three** pages — the deliberate probe
plus `home` and `about`, both of which are correct as written:

```
pages.home.data: "@data/pages/home.yaml"   ← a single-page type points at a FILE
```

**A page's `data` is not always a folder.** Section types (`docs`, `issues`,
`blog`) point at a directory; single-page types point at one YAML file. The
`isDirectory()` half was an invariant I invented, and it would have broken two
working pages on every consumer's build.

Worth stating plainly because the guard's whole purpose is to stop a plausible
wrong answer, and its first draft *was* one. It was caught by the control test,
not by review — the check was existence-only afterwards, and the comment in the
code says why so the next reader does not "tighten" it back.

## Evidence

| Check | Before | After |
|---|---|---|
| `./start build` with a missing-dir page | 948 pages, **Complete** | **refuses**, naming the key and both paths |
| `./start build`, clean config | 952 pages | **951** — one fewer, and that one was `issues-test`'s empty index |
| `agent-ks check config` | ✗ `pages.issues-test.data: resolved path does not exist` | ✓ all checks passed |

**That 952 → 951 is the finding in miniature.** The missing folder was not
producing nothing; it was producing an *index page for an empty section* —
rendering successfully, looking exactly like a section whose content had been
deleted on purpose. Nothing anywhere said otherwise.

# Details

## Why this is worth more than deleting one line

The line is trivial to delete. What is not trivial is that **two mechanisms
disagree about whether this is an error**, and the one that disagrees is the one
that runs on every build.

A page pointing at a missing folder renders as an *empty section* — no error, no
warning, and no visual difference from a section whose content was legitimately
deleted. The failure looks exactly like a correct outcome, which is the shape
this issue has spent two days removing from other surfaces:

- the plans validator that accepted a target the renderer would not resolve
- the retired-shape detector whose skip reported nothing, so silence read as
  clean

Same class, third instance.

## The argument for refusing, and the argument against

**Refuse.** The version gate sets the precedent: this project already holds that
a `site.yaml` declaration naming something the engine cannot honour is a hard
startup error, not a warning. A silently empty section is a content-loss symptom
indistinguishable from success.

**Allow.** Scaffolding order — someone registering a section before writing its
first page would be blocked by a strict loader. Though `/agent-ks-add-section`
creates the folder *first*, which is itself an argument that the strict path is
already the normal one.

The recommendation is **refuse**, with the error naming both the resolved path
and the `site.yaml` key that named it. But it changes startup behaviour for every
consumer, so it is Sid's call rather than something to apply inline.
