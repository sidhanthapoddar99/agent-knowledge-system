# 1. targeted mutants — does ONE legacy marker silence a current-shape log?

| case | findings on this log | verdict | what it is |
|---|---|---|---|
| P0-control-no-marker | 3 | CONTROL-OK (caught) | CONTROL — the same three breakages with NO legacy marker. Must be caught. |
| P1-root-milestone-file | 0 | **MASKED — validator silent** | current shape, intact, + one loose `140_audit-brief.md` at the log root |
| P2-03-working-typo | 0 | **MASKED — validator silent** | current shape, intact, + a `03_working/` folder (off-by-one from `02_working/`) |
| P3-05-notes-folder | 0 | **MASKED — validator silent** | current shape, intact, + a `05_notes/` folder (a plausible fourth slot) |

# 2. blast radius on the real tracker

| metric | count |
|---|---|
| activity folders scanned | 36 |
| classified as RETIRED shape (all checks skipped) | 31 |
| …of those, carrying `01_summary.md` (current-shape marker too) | 23 |

ambiguous folders (current-shape summary + a legacy marker):
  - 2026-08-02-refactor-efficiency-and-planning/agent-log/010_au_recording-overhead
  - 2026-04-19-docs-phase-2/agent-log/020_it_agent-log-skill-strengthening
  - 2026-04-19-docs-phase-2/agent-log/010_au_subtask-completion-audit
  - 2026-04-26-project-rebrand/agent-log/010_it_agent-ks-rename
  - 2026-04-26-project-rebrand/agent-log/020_au_agent-benchmark
  - 2026-07-01-issue-anatomy-restructure/agent-log/010_rf_skill-split
  - 2026-07-01-issue-anatomy-restructure/agent-log/020_au_skill-stress-test
  - 2026-07-07-artifact-component/agent-log/060_au_variation-capability
  - 2026-07-07-artifact-component/agent-log/050_wf_audit-fixes
  - 2026-07-07-artifact-component/agent-log/070_it_skill-sharpening
  - 2026-07-07-artifact-component/agent-log/040_au_fable-skill-audit
  - 2026-07-07-artifact-component/agent-log/010_wf_artifact-planning
  - 2026-07-07-artifact-component/agent-log/030_wf_extensions
  - 2026-07-03-skill-custom-tags-staleness/agent-log/020_wf_native-markdown-execution
  - 2026-07-03-skill-custom-tags-staleness/agent-log/010_au_stale-syntax-audit
  - 2026-07-08-ux-standards/agent-log/010_it_implement-ux-standards
  - 2026-07-03-docs-engine-versioning/agent-log/010_it_versioning-implementation
  - 2026-06-23-cli-toolkit-consolidation/agent-log/200_lp_cli-consolidation
  - 2026-04-10-editor-diagrams/agent-log/011_au_display-first-audit
  - 2026-04-10-editor-diagrams/agent-log/010_lp_display-first-implementation
  - 2026-07-02-issue-lifecycle-and-creation-rules/agent-log/030_au_four-agent-consistency-audit
  - 2026-07-02-issue-lifecycle-and-creation-rules/agent-log/020_it_signoff-and-followups
  - 2026-07-02-issue-lifecycle-and-creation-rules/agent-log/010_lp_lifecycle-implementation
