---
title: "Policy hardening — never bump past the gate; floor discipline everywhere"
iteration: 3
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Policy hardening — never bump past the gate; floor discipline everywhere

## Goal

Post-implementation review by sidhantha surfaced two policies the surfaces
stated too softly: (a) on a gate error the AI must run and test the **entire**
migration chain before any version bump — regardless of what the user asks —
because the gate's purpose is *detecting* migration needs; (b) the internal
development discipline (breaking change ⇒ script added inside `migration/` +
floor raised + documented) must be rigorous in CLAUDE.md and the docs — it's
toolkit-maintenance knowledge, not skill material.

## Result

- **Skill** (`doc-migration.md`, repo + cache, parity clean): "The upgrade flow
  — never bump past the gate" — full-chain enumeration over `(X, Y]`, zero-hit
  detect = passed check not skipped script, bump is the last step, and the
  explicit instruction to refuse "just change the version" requests with the
  explanation.
- **CLAUDE.md**: new "Breaking-change discipline (internal — never skip)"
  paragraph — the inseparable triple (version bump + migration script +
  floor raise), why the floor is the enforcement arm, and the consumer
  mirror-image rule.
- **User-guide** (`07_versioning.md`): `[!CAUTION]` callout against bare bumps
  (dogfooding the new GFM alerts) + "For engine maintainers — breaking changes
  move the floor" section.
- **`migration/README.md`** + the issue's design note: triple + document-it
  requirement ("the change does not exist until its script does").

## Next

— (verification build deferred: `engine_version` is currently commented out in
the dogfood site.yaml — user testing the gate live; uncomment to build)
