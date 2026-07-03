---
title: "Retire the custom-tags transformer code from the framework"
status: done
---

With the native-markdown-only decision
(`brainstorm/01_discuss_native-markdown-only.md`), `astro-doc-code/src/custom-tags/`
(callout, tabs, collapsible transformers + `createCustomTagsRegistry()`) has no
future consumer — dormant code that misleads readers into thinking tags are a
feature. This superseded the wire-up plan of the now-dropped
[2026-04-20-custom-tags](../../2026-04-20-custom-tags/issue.md). First in execution
order — clears the ground before alerts (20), docs (30), and skills (40).

- [ ] Delete `src/custom-tags/` and the custom-tags re-export block in
      `src/parsers/transformers/index.ts`; decide whether `TagTransformerRegistry`
      itself (`src/parsers/transformers/registry.ts`) stays as generic
      infrastructure or goes too — nothing else uses it today.
- [ ] Sweep framework source for remaining `custom-tags` / `callout` mentions
      (comments, type exports, `parsers/types.ts` `TagTransformer` if orphaned).
- [ ] Verify no imports break and the build passes: `./start build`.
