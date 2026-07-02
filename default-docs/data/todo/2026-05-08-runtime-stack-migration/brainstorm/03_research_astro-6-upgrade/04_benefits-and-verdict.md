---
title: "Claimed benefits & why it still lost"
---

# What the upgrade would buy — and why it still lost

Condensed from the source issue's `03-astro-upgrade-benefits/` group (overview + performance +
features/DX + strategic). The twist worth recording: **the benefits research actually concluded
"proceed"** — the bump *did* stand up on its own modest merits. It was then overruled by the
cancellation, on the grounds that this issue's runtime migration is the bigger, better bet. This
file captures both.

## The upside ledger (mostly infrastructural)

The honest framing from the source: *most of this upgrade's cost is incurred whether we move or
not* — the ecosystem is already on the Vite 7 / Node 22 line, so staying on Astro 5 only defers
the same migration while the changelog grows.

| Benefit | Strength | Notes |
|---|---|---|
| **Stays on the supported Node/Vite line** (Node 22.12+, Vite 7) | **Strong** | Avoids accruing a larger deferred migration; 5.x drifts toward EOL. |
| **SSR module-invalidation core fix (6.3.4+, #16757)** | **Strong but conditional** | Could let us delete the dual-invalidation workaround — *only if* it covers our git-ref path (⚠️ unverified). The one project-specific win. |
| **Redesigned dev server on Vite's Environment API** | **Strong** | Runs the real prod runtime in dev → less "works in dev, breaks in prod" drift. Sold as *reliability*, not speed. |
| **Dev-toolbar prebundle fix (6.0.4)** | **Strong** | Directly targets our shape — five custom toolbar apps. **Pin ≥ 6.0.4**, not 6.0.0–6.0.3 (which had a regression that made the toolbar vanish). |
| `security.csp` / Fonts API stabilised | **Latent** | Genuine, but we don't use them today — pay off only if adopted later. |
| Shiki 3→4, Zod 3→4 (bundled) | **Medium** | Currency; output-diff for code blocks ⚠️ unverified. |
| Content-layer / live-collections / image-service / adapter features | **Inert** | We own our content pipeline; zero adoption surface by design. |

**Performance reality check:** Astro 6 + Vite 7 publish almost **no hard numbers** — claims are
qualitative ("faster", "smaller"). The single concrete figure (queued rendering "up to 2×") is
*experimental, flag-gated*. The headline Rolldown **10–30× build** wins are **Vite 8 / Astro 7**,
a *different* bump. So: no shippable step-change in speed here — just currency and an on-ramp.

## What the original research recommended

The strategic note's verdict was **proceed** — because:

- **(a) supported-major upkeep** and **(c) de-risking the packaging track** (two sibling issues
  pin an Astro version; bumping first avoids shipping already-a-major-behind) are **real and
  unconditional**.
- **(b) retiring the SSR workaround** is the headline but **conditional** — bank it only after a
  live test confirms #16757 covers our git-ref path.
- It explicitly flagged the tension with **this** issue: *"if the team commits to the Go + Vite
  rewrite, a 6.x bump is throwaway."* Its resolution: proceed **only while the rewrite stays
  uncommitted** — deferring to an unscheduled rewrite was called the strictly worse bet.

## Why the decision reversed

The strategic note's own hinge was *"is the Go rewrite scheduled work or aspiration?"* — and it
assumed aspiration. The cancellation is that assumption flipping: **this issue is now the adopted
direction.** Once staying-on-Astro is no longer the plan, the whole benefit ledger collapses:

- The unconditional wins **(a) currency** and **(c) packaging-enabler** only matter if we keep
  shipping Astro. If we're leaving Astro, currency on a stack we're retiring is worthless, and
  the packaging track those sibling issues describe is itself superseded by this issue's
  single-binary distribution (`notes/deployment-methods/`).
- The conditional headline **(b)** — deleting the SSR workaround — is *dominated*: the Go runtime
  eliminates the entire bug class structurally, no upstream-fix verification required (see
  `notes/architecture/06_performance-comparison.md`, "SSR module isolation cost": 0 ms, bug class
  doesn't exist).
- The performance story the migration tells is a genuine step-change (see the four-way table in
  `notes/architecture/06_performance-comparison.md`: ~30–80× cold start, ~10× per-request, and —
  the deepest win — "fast prod" and "full features" stop being mutually exclusive). Astro 6
  offered no comparable number.

**Net verdict:** a defensible *upkeep* bump, out-competed by a *transformational* alternative.
The research wasn't wrong — the ground under its central assumption moved. If the Go migration
were ever shelved, this branch's upgrade-steps and impact notes (`2026-06-09-astro-6-upgrade`)
are the ready-to-execute fallback.
