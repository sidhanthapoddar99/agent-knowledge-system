---
title: "Depth guard"
status: open
---

# Overview

Depth overflow warns to a console nobody reads and drops the page. Make it an
error.

# References

- [The merged verdict](../../agent-log/020_au_edge-cases/working/010_findings.md) — confirmed, verdict **fix**

# Todo list

- [ ] Validator errors on a folder deeper than the cap
- [ ] Mutate the rule to prove it fires, then restore

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion.

# Details

**Failing loudly beats a plausible wrong answer.** A page silently dropped looks
exactly like a page nobody wrote.
