---
title: "A page whose data folder does not exist builds green"
status: open
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

- [ ] Decide what `issues-test` was for. If it was a scratch tracker that lived
      only on Sid's disk, **delete the entry**; if it is wanted, add the folder
      with a root `settings.json`
- [ ] Decide the general rule: should `loadSiteConfig()` **refuse** a page whose
      resolved `data` path does not exist, the way it refuses a bad
      `engine_version`? Or is an empty section legitimate — a section registered
      before its content is written?
- [ ] If it should refuse — implement it, and give the error the missing path
      **and** the `site.yaml` key that named it
- [ ] If empty is legitimate — say so in `check config`'s message and downgrade
      it from error to warning, so the validator and the loader stop disagreeing

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — nothing done. This is a proposal, and its first item is a
> question only Sid can answer.

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
