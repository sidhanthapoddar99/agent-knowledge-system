---
title: "Retire the custom-tags transformer code from the framework"
status: open
---

With the native-markdown-only decision, `astro-doc-code/src/custom-tags/` (callout,
tabs, collapsible transformers + `createCustomTagsRegistry()`) and the
`TagTransformerRegistry` re-exports have no future consumer — dormant code that
misleads readers into thinking tags are a feature. This supersedes the wire-up plan
of [2026-04-20-custom-tags](../../2026-04-20-custom-tags/issue.md) (flagged there in
comment 002; final close-out call on that issue is the human's).

- [ ] Delete `src/custom-tags/` and the custom-tags re-export block in
      `src/parsers/transformers/index.ts`; decide whether `TagTransformerRegistry`
      itself (`src/parsers/transformers/registry.ts`) stays as generic
      infrastructure or goes too — nothing else uses it today.
- [ ] Verify no imports break (`transformers/index.ts` is the only importer found
      in the audit) and the build passes: `./start build`.
- [ ] If the GFM-alerts open point (brainstorm, subtask 20) resolves to "yes", add
      renderer support (e.g. `marked-alert`) + theme CSS for it here, so the
      user-guide only ever documents what renders.
