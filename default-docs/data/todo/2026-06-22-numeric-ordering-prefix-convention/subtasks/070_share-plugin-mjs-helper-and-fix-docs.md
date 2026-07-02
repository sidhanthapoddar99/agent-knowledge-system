---
title: Share the grammar in the plugin (mjs) and reconcile the reference docs
status: done
---

The plugin can't import the framework's TS, so it had its own copies of the prefix
regexes. Collapse them onto one mjs mirror and make the reference wording accurate.

- Create `scripts/_order-prefix.mjs` — exact mirror of `order-prefix.ts` (strict + loose
  families, `ORDER_PREFIX_FULL_RE`, `ANY_DIGIT_PREFIX_RE`). The second and last copy;
  keep the two in lockstep.
- Wire `scripts/issues/_lib.mjs` (subtask, subtask-group, agent-log) to `parseOrderPrefixLoose`
  and `scripts/docs/check.mjs` to the shared strict constants.
- Fix the over-claim: `docs-layout.md` and `issue-layout.md` previously said issues used
  "the same shared parser" before it was true. Now it is — reword to state the precise
  model: one grammar (2–5 digits, numeric-value sort), `_` canonical, issue tracker also
  tolerates a legacy `-`.

`docs-check-section` re-verified: accepts mixed widths + a leading-digit group, rejects
1-digit and 6+-digit, catches numeric collisions (`02_` ≡ `002_`), exit 0/1 correct.
