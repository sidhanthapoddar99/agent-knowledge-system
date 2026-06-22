---
title: Rethinking checking & skill optimizations
done: false
state: open
---

Review the validators (`scripts/{docs,blog,issues,config}/check.mjs`) and the skill itself
for correctness and **token efficiency**.

Likely areas: which checks are missing or redundant; whether the skill body + references
load lean (progressive disclosure) or carry weight that could move into scripts; trimming
duplication now that the layout references are split out.

*Basic description only — scope to be discussed before implementing.*
