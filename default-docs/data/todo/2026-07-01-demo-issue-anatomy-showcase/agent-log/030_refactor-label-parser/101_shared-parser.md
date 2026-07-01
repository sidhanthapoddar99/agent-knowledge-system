---
iteration: 1
agent: claude-opus-4-8
status: success
date: 2026-07-01
---
# Milestone — one shared label parser
Collapsed per-kind label logic into `cleanLabel` + `prefixNum`, with agent-log's
`#<iteration>` as a precedence override. Files and folders share it.
