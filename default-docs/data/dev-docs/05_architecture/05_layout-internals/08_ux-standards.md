---
title: UX Standards
description: The interaction and visual-language rules every layout follows — tooltips, icons, status color, hierarchy
sidebar_position: 8
---

# UX Standards

The rules behind the framework's interaction details. They were first shipped in the issues layout and are now the standard for **every** layout surface — a new layout (or a change to an existing one) should follow them, and a reviewer should be able to point at this page when one is violated.

These are *rules with rationale*, not a feature changelog. The concrete symbol legends live where users look for them: the issue **Guide** panel (generated from code constants) and the [user-guide detail-view page](/user-guide/issues/ui/detail-view).

## 1. Tooltips only when they add information

A tooltip that repeats fully visible text is noise. The site-wide tooltip (`src/scripts/tooltip.ts`, see [Scripts → Tooltip](/dev-docs/scripts/tooltip)) enforces this centrally:

- **Text rows** carry `data-tip` unconditionally, but the tip shows **only when the text is actually cropped** (ellipsis). The markup declares *what* the tip says; the script decides *whether* it's needed.
- **Icons, symbols, dots** carry `data-tip-always` — their meaning is never visible as text, so they always need naming (a status icon says "In Progress", an agent-log kind symbol says "audit", a type glyph says "Diagram").

The decision lives in one script rather than in each layout, so no layout can get it half-right.

## 2. Mark the exception, not the default

Markdown is the framework's default content type — so markdown rows carry **no** file-type icon. Only the exceptions are marked: first-class diagram and artifact pages get a small trailing glyph (shared vocabulary in `src/layouts/file-type-icons.ts`, consumed by both the docs sidebar and the issues sub-doc tree).

Marking the default inverts the signal: if every row had an icon, no icon would mean anything. The same logic gives agent-log *meta* files no badge while milestones get `#N`.

## 3. Color belongs to status — nothing else

Status color always comes from the theme status variables — `--color-info` (in progress), `--color-warning` (needs a human: review / input-needed), `--color-success` (done), `--color-error` (dropped/failed) — never hardcoded hex, so themes and dark mode keep working. Two corollaries:

- **File-type glyphs are monochrome** (muted text color). Type is secondary information; tinting it would compete with status.
- **Resting states stay neutral.** `open` and `blocked` render in muted grey — blocked is a *resting* state (its reason is read in prose), not an alarm.

## 4. Hierarchy from weight and position, not size

Layout chrome uses the three semantic text tiers (`--ui-text-micro/body/title`); emphasis within a tier comes from `font-weight` and `color`, not a new font size. Counts and indicators sit at the **end** of the row (trailing count, review dot, type glyph), leading badges carry ordering (`NN`, `#N`). See the typography regulations in `CLAUDE.md` and the theme contract in `src/styles/theme.yaml`.

## 5. Passive status over interruption

Progress and attention states render as **passive, glanceable marks** — a `done/total` count on a folder, an amber dot when something awaits review, a tinted `#N` milestone badge — never modals, banners, or animation. The user reads state when they look for it; the UI never demands the look.

## 6. Dynamic state must keep its labels honest

When client code changes a state it must update everything that *names* that state, not just the glyph: the subtask status cycler swaps the icon **and** its `data-tip`/`aria-label` (`setIconTip()` in the issues layout's `subtask-state.ts`). A tooltip that names the previous state is worse than none.

## Where the pieces live

| Piece | File |
|---|---|
| Tooltip singleton + crop rule | `src/scripts/tooltip.ts` (+ `.ui-tooltip` in `src/styles/element.css`) |
| File-type glyph vocabulary | `src/layouts/file-type-icons.ts` |
| Status icon shapes | `src/layouts/issues/default/server/state-icon.ts` |
| Status labels / descriptions | `src/loaders/issue-status.ts` |
| Status tint rules | `src/layouts/issues/default/styles/detail.css`, `src/styles/docs.css` |
| Generated legend | `src/layouts/issues/default/guide.ts` (Guide panel) |
