---
title: "AGENTS.md and code rules"
description: "How the main repository's AGENTS.md works as a contract, the tripwires that force a restructure, and the rules every engine crate keeps."
---

This page explains the brief every agent reads first, `AGENTS.md` at the root of the main repository, and the code rules it and the engine's lint settings enforce. Most contributors to agentks are AI agents, so the brief is written as a contract they can be checked against.

## A brief that is a contract

`AGENTS.md` is the only instruction file in the repository. `ctl check` fails when a `CLAUDE.md` appears, so there is never a second, conflicting brief.

An audit compares the repository against the brief's tables, not against a general standard. So the brief must match reality. **Update it in the same change that re-decides a choice.** A brief that lags the code reads as drift at the next audit.

| Section | Holds |
|---|---|
| Working rules | The rules that bind every agent on every change |
| Recorded choices | One row per structural axis: frontend shape, backend role, migration style, theme modes, the gate ladder and more |
| Skeletons | The folder shape of each app and package, and what each folder holds |
| Tripwires | Size limits that force a restructure, and the deferrals recorded against them |
| Styling | The design rules for UI code |
| Documentation and code | Which way references point |
| Exceptions to the standard layout | Where this repository departs from the project-setup guide, and why |
| Stack | Every pinned tool and dependency, with the reason for each |
| Commands | The `ctl` summary |
| Review passes | Which second-party checks run, and when |
| Deciding alone | What an agent decides and keeps going, decides and records, or stops and asks |

## Tripwires

A tripwire is a size limit. Crossing one obliges the restructure, or a one-line deferral in `AGENTS.md` that says what is deferred and until when.

| Tripwire | Restructure |
|---|---|
| 8 to 10 flat modules in one crate | Split the crate by layer |
| 10 files in one module folder | Subdivide inside the module |
| A file over 300 lines | Split it. 500 is the hard cap |
| A route file over 50 lines, or a component over 150 | Move logic into a module or a primitive |
| The same utility combination twice | Add a variant to the primitive |
| A helper used three times | Extract it and name it |

Migration scripts are a recorded exception and may run to 500 lines, because each one is a single file by contract.

## Rules every engine crate keeps

The workspace lints in `apps/agentks-engine/Cargo.toml` enforce most of these, so `ctl gate lint` catches a breach.

| Rule | Enforced by |
|---|---|
| No `unwrap`, `expect`, `panic`, `todo`, `unimplemented` or `dbg!` outside tests. When the engine is unsure, it returns an error | Clippy, denied. `clippy.toml` allows the first three in tests |
| No printing outside `apps/agentks-engine/crates/cli/`. The CLI is the only crate that writes to the terminal | Clippy denies `print_stdout` and `print_stderr` |
| No `unsafe` code | `unsafe_code = "forbid"` |
| Every public item has a doc comment that states its contract | `missing_docs` |
| A function stays simple enough to read | Clippy's cognitive complexity, threshold 15 |
| A crate depends only on crates in lower layers | `scripts/gate/crate-layers.ts`, in `ctl check` |
| Third-party versions live only in the workspace `Cargo.toml` | Review |

Two more rules shape how errors flow. A content problem goes to an `ErrorSink`, and the work goes on, so one bad page does not hide the others. A fatal problem is an `Err` from loading. Each crate has one error enum, built with `thiserror`.

A body that is not built yet returns a `NotImplemented` error variant, or its type holds an `Infallible` field so it cannot be constructed. It never panics and never makes up a value.

## Documentation points at code

Docs, tracker issues, plans and skill pages name files and lines. A code comment never names a doc page, a plan, a subtask number or a skill file, because those move and renumber and no test reads comments. When a rule is worth citing in code, the comment states it in one sentence instead.

`README.md` files and `AGENTS.md` are the exceptions: they are the entry doors. Every crate has a `README.md` that says four things:

1. what the crate owns;
2. what it must not do;
3. what is built;
4. what fills it next.

`apps/agentks-engine/README.md` holds the table of every crate, its layer and what it owns.

## Deciding alone

| Kind of choice | What an agent does |
|---|---|
| Wording, names, the order of steps, test names | Decides and keeps going |
| A structural choice a guide leaves open, an exception to the layout, a deferral past a tripwire | Decides and records it in `AGENTS.md`, and in the work item it belongs to |
| A product question no engineering principle settles, or a change to a recorded choice | Stops and asks the repository owner |

Hosting, DNS and anything on the owner's own accounts always go to the owner. For a structural question the brief does not cover, the agent loads the project-setup skill and follows it rather than inventing a pattern, because a pattern with no home cannot be found by the next agent.

## Related

- [ctl and the gate](./10_ctl-and-the-gate.md): the `ctl check` rules that keep the brief honest.
- [Adding a crate or an app](./25_adding-a-crate-or-an-app.md): what to record in the brief when the layout grows.
