/**
 * _index-stub.mjs — the empty round index a new agent log is seeded with.
 *
 * This file exists so that a scaffolded agent log SHOWS ITS SHAPE. Before it, a
 * fresh log held one file, and an agent had no way to tell that two thirds of
 * the structure existed — so it wrote everything into the summary. The seed has
 * to be a file rather than a bare `02_working/` folder, because git does not
 * track empty directories and the folder would vanish on clone.
 *
 * **It is a stub, not a template to be filled by a machine.** An earlier version
 * of this generated the whole table from each round's frontmatter and had a
 * checker that compared the file against the generator. Both shared one blind
 * spot — a round stored as a FOLDER was invisible to each — so a table missing a
 * round was certified correct. Two things that make the same mistake cannot
 * check each other.
 *
 * The deeper reason is simpler: a generated table can only restate frontmatter,
 * and the line worth reading is *what the round found*, which no generator can
 * write. So the index is written by whoever ran the round, and kept honest by
 * reading: `/agent-ks-index-check <path>`.
 */

/** The index's own name. Two digits, so it sorts ahead of every `NNN_` round. */
export const WORKING_INDEX = '00_index.md';

/** The seed. Deliberately short — a long stub gets deleted rather than filled. */
export function workingIndexStub() {
  return `---
title: "Rounds"
---

# Rounds

> [!NOTE]
> **Write one entry per round as it lands** — its number and name as a link, and
> a line of **what it found**, which is the part no file header carries. Delete
> this note once the first entry is here.
>
> \`- [the audit round](./010_audit-round.md) — three findings, one of them the
> renderer rather than the content\`
>
> **No bare number in the link text.** A leading number reads as an *ordering
> label*, which the validator resolves against the target's full path — so
> \`[01 · …]\` is reported as wrong. The filename already carries the order.

# The slots, so you know they exist

| | |
|---|---|
| \`01_summary.md\` | the run's one conclusive file, and the brief you point an agent at |
| \`02_working/\` | this folder — one file per **round**, plus a file for each agent that produced something substantial |
| \`03_debrief/\` | what leaves the run: handover, questions, findings, caveats. **Not seeded** — open it when there is something to hand over |
`;
}
