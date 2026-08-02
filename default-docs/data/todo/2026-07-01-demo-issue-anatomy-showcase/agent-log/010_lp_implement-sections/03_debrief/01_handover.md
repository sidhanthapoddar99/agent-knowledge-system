---
title: "Handover"
---

# What the next run must know

**The depth cap is stated twice.** The loader reads `MAX_SUBFOLDER_DEPTH`; the
sidebar draws from its own constant. They agree today and nothing makes them
agree tomorrow — a classic *"every current caller passes the right thing"*, which
is a census of today's callers, not a guarantee.

Filed as a subtask rather than left here: **anything actionable leaves the log.**
A bug recorded only as log prose dies in the log.

# What is fixed, and what is not

- Fixed: every section loads, routes, and renders in the sidebar.
- **Not fixed:** the plan table's counts. That is stage 25, deliberately.

# Lessons

Reading the existing readers first was worth the round it cost — the reader that
shipped is the one already in the codebase, not a fourth shape.
