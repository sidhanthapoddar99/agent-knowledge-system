# Agent logs — the pointer

An agent log is the working folder of one run under `agent-log/`. It exists for two reasons. It is written by an agent for a human to review, so it stays simple. And it is the store for information too large to live anywhere else: an audit's two hundred findings, a research pass over fifteen products. Most work earns none. The result of a run goes in the subtask; the log holds the path and the bulk, and never the only copy of a result.

Everything about logs has one home: [the agent-ks-issue-logs skill](../../agent-ks-issue-logs/SKILL.md). It holds when a run earns a log and who decides, the six kinds (`lp`, `rf`, `au`, `re`, `it`, `wf`) with the file shape of each, what a log never holds, the size hints, and the commands. Read it before you open, continue or review a log. Before you continue an issue, read the open log's `00_index.md` and `agent-memory/memory.md` first.
