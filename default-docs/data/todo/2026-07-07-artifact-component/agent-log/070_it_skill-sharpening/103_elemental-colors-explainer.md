---
title: "M3 — site-mode elemental-colors doctrine + the live explainer artifact"
iteration: 1
---

## Goal

Two follow-ups from sidhantha's review of the shipped sharpening pass: (1)
confirm-and-close a doctrine hole — the skill said site mode "defines no
palette", which read literally forbids the element-specific colors an
explanatory *diagram* legitimately needs (strokes, node fills, series hues);
(2) a live example in the issue's `notes/`: a site-mode explanatory artifact
diagramming how the whole color/rendering system works.

## Approach

Doctrine first, so the executing agent would read the updated skill: a "Local
elemental colors (site mode)" section in `publishing.md` (content colors may
be defined in the HTML; ambient stays injected; values must hold on both
surfaces and be declared in the sidecar) + the matching exception line in
SKILL §2's site-mode bullet. Cache re-mirrored. Then a cold Sonnet agent built
the artifact from the updated skill.

## Result

- Doctrine shipped (repo + cache parity clean). The check sidhantha asked
  about — "explanatory/documentation artifacts get injection" — was already
  covered by §1's mode doctrine ("data representation → site"); the elemental
  exception was the genuinely missing piece.
- **[notes/05_theme-modes-explainer.html](../../notes/05_theme-modes-explainer.html)**
  (+ sidecar, `theme: "site"`, `type: "report"`): four panels — the
  file→loader→embed→route pipeline, the site/self decision + injection
  mechanics, the where-colors-come-from decision tree, the five-check verify
  gate. Ambient styling 100% injected tokens with neutral fallbacks (24
  consumed tokens declared, grepped from the shipped HTML); four local
  elemental hues for diagram strokes/branch markers, contrast-checked ≥4:1
  against BOTH real surfaces (`#fafafa` light / `#0a0a0a` dark). The artifact
  is its own demonstration: everything ambient re-themes with the site; only
  the four legend hues stay fixed.
- Screenshot-verified at embed width (fallback rendering, dev server down);
  the agent also self-corrected an out-of-contract token (`--spacing-2xl` →
  `--spacing-xl`) — the inline contract catching a violation in practice.

## Next

Live-injection check when the dev server is next up (open the note in the
tracker, toggle the theme, confirm ambient re-colors while legend hues hold).
