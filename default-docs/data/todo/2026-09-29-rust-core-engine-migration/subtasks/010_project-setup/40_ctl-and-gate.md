---
title: "ctl and the gate — one entrypoint, green means proved"
status: in-progress
---

Every contributor and every agent runs the repository through `ctl`, so there is one way to set up, develop, build and check. The gate is what "green" means: a commit is done only when `ctl gate` passes. This leaf adapts the project-setup `ctl` to agentks's apps and fills in the four floor rungs for Rust and TypeScript.

# 01 To Do
- [ ] **Verbs** (each a worker under `scripts/<group>/<name>.sh`, listed in `ctl --help` and in `AGENTS.md`):

| Verb | Does |
|---|---|
| `ctl setup` | Toolchains through mise, `bun install` in each app, `cargo fetch` in the engine, `.env` from `.env.template` |
| `ctl dev` | The engine (`cargo run -p agentks-cli -- start --dev`, rebuilt on change) and the client's Vite dev server together; Vite proxies `/api` to the engine |
| `ctl build` | The release binary, with the client and the static renderer embedded, into `data/builds/agentks` |
| `ctl test [app]` | Every test layer that needs no browser |
| `ctl e2e` | Parity and end-to-end checks with a headless browser ([170/00 testing](../170_testing/00_overview.md)) |
| `ctl gate` | lint → typecheck → test → check |
| `ctl check` | The repository contract (project-setup's `check`) plus agentks's own checks below |
| `ctl release-check` | The installer's release contract; publishes nothing ([160](../160_distribution/00_overview.md)) |
| `ctl ps`, `ctl stop` | Processes `ctl dev` started |
| `ctl clean rust` | Project-setup's Rust clean |

- [ ] **The rungs, filled in:**

| Rung | Rust (`apps/agentks-engine`) | TypeScript (each app and the UI package) |
|---|---|---|
| lint | `cargo fmt --check`; `cargo clippy --workspace --all-targets -- -D warnings` | the app's linter (oxlint, as project-setup ships) |
| typecheck | `cargo check --workspace --all-targets` | `tsc --noEmit` per app |
| test | `cargo test --workspace` | the unit tests per app (`bun test`) |
| check | the crate dependency-direction check ([030/00](../030_rust-engine/00_overview.md)); `agentks check` on `docs/` once the command exists | the UI package's purity check ([080/20](../080_ui-and-client/20_shared-ui-package.md)); the theme contract check ([100/10](../100_layouts/10_theme-contract-and-css.md)) |

- [ ] **Each check must be able to fail.** Add a control for each new check: break the rule on purpose, see red, restore. Note the control in the check's header comment.
- [ ] **Stop at the first red and name every rung not reached**, as project-setup's `gate/all.sh` does.

## Guardrails
- No logic in `ctl` itself. Workers are Bash, or TypeScript under Bun for structured steps (project-setup `08_ctl.md`).
- A gate rung calls the same worker the dev verb calls, so the loop and the gate cannot drift.
- A skipped rung is red, never green.

## Done when
- `./ctl --help` lists every verb above.
- `./ctl gate` exits 0 on a clean tree and exits non-zero, naming the rung, after a deliberate `clippy` warning or a failing `bun test`.
- `./ctl dev` serves the client at the Vite port and a request to `/api` reaches the engine (a WebSocket echo is enough until [050](../050_server/00_overview.md) lands).

# 02 Status and Result
In progress. The gate works, and `ctl dev`, `ctl ps` and `ctl stop` are built; left: `e2e`, `release-check`, `clean rust`, the deliberate red-rung check, and `ctl dev` end to end once the engine opens a project.

## Result
- `ctl` verbs today: `setup`, `check`, `status`, `build`, `dev`, `ps`, `stop`, `test`, `gate`.
- `ctl gate` runs `lint typecheck test check` and is green in about 11 s warm (the engine's clippy, check and tests dominate).
- `ctl dev` (2026-10-01) follows the project-setup dev controller. `scripts/common/_process.sh` (from the template) runs each app in its own recorded process group (`logs/run/<name>.process/`, log `logs/dev/dev-<app>.log`); `scripts/dev/_apps.sh` is the app table (engine, client, the mock, homepage); `scripts/dev/rust-watch.ts` runs `cargo run -p agentks-cli -- start --port $ENGINE_DEV_PORT --dev-origin http://localhost:$CLIENT_DEV_PORT --config-dir $ENGINE_DEV_CONFIG` under watchexec 2.7.3. `ctl dev` with no app runs engine and client; `ctl dev client` runs Vite against the mock engine; `--detach`, `--dry-run`. `ctl ps` lists the recorded groups with state, pid, port and log; `ctl stop` stops them (TERM, then KILL after the grace period).
- Checked by hand: `ctl dev client --detach` then `ctl ps` then `ctl stop` (0.5 s); foreground `ctl dev client` stopped by SIGINT leaves no record and no listener; a taken port is refused before anything starts; `ctl dev` builds the engine, starts the watcher and, when `agentks start` exits, fails within the 30 s readiness wait, printing the end of the engine's log.
- `ctl dev` end to end stops at `agentks start`: "not implemented yet: opening a site" (the site track), and `ENGINE_DEV_CONFIG` defaults to `./docs/config`, which does not exist yet.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` (`ctl`, `scripts/`).
- **Read first:** [05/05 Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) sections 02 to 06; the project-setup skill's `08_ctl.md` and `10b_static-checks.md`; neuracode's `ctl` and `scripts/gate/`.
- **Depends on:** [20](./20_main-repo-skeleton.md), [30](./30_toolchain-pins.md).
- **Unblocks:** [50](./50_ci-workflows.md), [90](./90_contributor-setup-guide.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the repository is set up with the project-setup guide, so `ctl` is the one entrypoint and `ctl gate` is what green means.
- Decided (claude, 2026-09-30): the verb table above, including `e2e` and `release-check`, from [05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 03.
- Decided (claude, 2026-10-01): `ctl dev` runs `agentks start --port $ENGINE_DEV_PORT` (5175, in `.env`), because Vite must know the engine's address before the engine starts; the port sits outside 20000-29999, where installed servers take their derived ports.
- Decided (claude, 2026-10-01): the dev engine gets its own machine home (`ENGINE_DEV_HOME`, default `data/dev-home`), because with the shared `~/.agentks` it would attach to an installed agentks already serving the same project and never run the working-tree code.
- Decided (claude, 2026-10-01): `ctl dev` compiles the engine with `cargo build` before starting the watcher, so the 30 s readiness wait covers start-up only, not the first compile.
- Decided (claude, 2026-10-01): a free port is tested by connecting to it, not by `lsof`, because `lsof` took minutes on this machine; `ctl stop` still signals only recorded process groups, never a port's holder.
- Decided (claude, 2026-10-01): `ctl ps` is a plain list of this checkout's recorded processes, not the template's interactive browser with port killing, because that browser offers to kill any listener on a dev port, including another checkout's.

# 05 Notes & Analysis
## Watch out
- `ctl dev` runs two long processes. Record both under `logs/run/` so `ctl ps` and `ctl stop` find them; a stray engine keeps its port and the next `ctl dev` fails.
- The engine's stable-port rule ([050/45 stable ports](../050_server/45_stable-ports.md)) applies to the dev engine too; pass the port from `.env` so it never floats.
