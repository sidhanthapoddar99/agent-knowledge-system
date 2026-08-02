/**
 * ref-index-probe.ts — the validator and the renderer resolve `subtasks:` refs
 * against DIFFERENT indexes.
 *
 * check.mjs `issueFileIndex()` walks `subtasks/` AND `agent-log/`; the renderer's
 * `resolvePlanStage` builds its map from `issue.subtasks` only. So a stage that
 * points `subtasks:` at an agent-log file passes the gate and renders red.
 *
 *   cd astro-doc-code && bun ../verification/skill-consistency/ref-index-probe.ts
 */
import { loadIssue } from '../../astro-doc-code/src/loaders/issues';
import { resolvePlanStage } from '../../astro-doc-code/src/layouts/issues/default/server/helpers';
import path from 'node:path';

const tracker = path.resolve('../verification/skill-consistency/out/mutants/M21-agentlog-ref-in-subtasks');
const issue = await loadIssue(tracker, '2026-08-03-scratch-probe');
if (!issue) throw new Error('issue did not load');
for (const plan of issue.plans) {
  for (const stage of plan.stages) {
    const r = resolvePlanStage(issue, stage);
    if (stage.subtaskRefs.length || r.missing.length) {
      console.log(`  ${plan.name}/${stage.name}: refs=${JSON.stringify(stage.subtaskRefs)} resolved=${r.subtasks.length} MISSING=${JSON.stringify(r.missing)}`);
    }
  }
}
