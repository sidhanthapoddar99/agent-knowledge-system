---
title: Tracker guide modal + promote component/label descriptions to required data
status: review
---

Sidhantha's direction (2026-07-02, post-loop sign-off). Two halves of one feature —
a tracker-level **Guide** on the issues *index*, and the data plumbing it needs.

**The modal.** The detail page already has its anatomy Guide panel (`guide.ts`);
the index gets the vocabulary-level sibling: a Guide box in the filter row, placed
before the table↔card switch (`parts/index/ViewToggle.astro`), opening a large
modal that explains this tracker to a cold reader:

- statuses + categories are **fixed in framework code** — render them from the
  `issue-status.ts` constants (same import pattern `guide.ts` uses; never restate
  the values by hand), with their colors and category grouping;
- what's editable vs what's not — fixed: the 7 statuses / 4 categories and their
  grouping; editable per tracker: status *colors*, priority values+colors, the
  component set, the label set, views;
- priorities with their meaning; components and labels each listed **with its
  description** (which is where the second half comes in).

**Promote annotations to data.** Today the meaning of every component and label
lives only as JSONC comments in the tracker root `settings.jsonc` (components ~44-87,
labels ~89-106) — invisible to the loader, so the guide can't render them. Promote
them to proper fields the loader returns, and make them a **strict requirement**:

- [x] Schema shape decided: **parallel `descriptions` map** (not array-of-objects)
      — keeps `values: string[]` intact so filters/ordering/client-config are
      untouched (far lower blast radius). `IssuesVocabularyField` gains
      `descriptions?: Record<string,string>`. DEPRECATED annotations (`wip`,
      `blocked`) carried into the description text.
- [x] **Startup hard error** when any `component`/`labels` value lacks a
      description — `missingDescriptionsMessage()` in `issues.ts`, thrown from
      `resolveVocabulary()`; mirrored as an error in `check.mjs`. `priority`
      descriptions optional.
- [x] Migration — the descriptions check is **facet B of the single merged
      `migration/2026-07-03_root-settings-schema.py`** (per CONTRACT.md §8; merged
      with subtask 12's status-colours facet at sidhantha's suggestion — one
      script for the one root-settings v0.7.0 transition). `detect`/`guide`/
      `verify`, detection+guidance only; lists every value missing a description
      and prints the `descriptions` skeleton. Negative-tested.
- [x] Migrated our own `data/todo/settings.jsonc` by hand — every component /
      label / priority comment moved into a `descriptions` map. `verify` clean.
- [x] Built the Guide modal — `parts/index/GuideModal.astro` (native `<dialog>`,
      self-contained open/close script, semantic tokens only, no runtime nodes),
      a "Guide" button in a new `issues-index__tools` group before the view
      toggle. Renders the fixed lifecycle from the `issue-status.ts` constants
      (STATUSES/CATEGORIES + new STATUS_DESCRIPTIONS/CATEGORY_DESCRIPTIONS +
      resolved `statusColors`) with a fixed/editable split, and priority /
      component / labels from settings with their descriptions. Verified in the
      built HTML: 4 categories, 7 status badges, 3 editable + 1 fixed tags,
      descriptions rendered.
- [~] Propagate: user-guide vocabulary + setup-new-tracker, skill reference
      `00_anatomy/03_overall-issue-tracker-vocabulary.md` (renamed) —
      **in flight this wave** (doc sweep). Plugin version bump + cache mirror at
      finalize.
- [x] Build green (647pp) + `docs-guide check issues` exit 0.

**Sequencing:** landed WITH subtask 12 in one wave, one plugin version bump.
