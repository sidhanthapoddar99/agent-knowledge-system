# Native CLI contributor contract

The framework repository's `agent-ks-cli/src/manifest.json` declares commands. `src/args.rs` supplies shared flags, argument parsing and generated help. Native modules implement the operations. The plugin holds skills and templates; templates are compiled into the binary.

## Invocation

Every command supports `--help` and `-h` without project config. Groups support help as well. `help --json` returns a command array with usage, examples and flags. Bare `agent-ks` shows the project overview.

Value flags accept `--name value` and `--name=value`. `--` ends option parsing. Unknown flags, missing required arguments and invalid values exit 2. A misspelled filter must not broaden results.

## Output

`--json` writes one JSON document to stdout. Diagnostics belong on stderr. `start --json` requires `--dry-run`, because live server output is a log stream. Flush output before exiting.

| Exit | Meaning |
|---|---|
| 0 | Successful operation, query results, or validation without errors |
| 1 | No query results, a handled runtime failure, or validation errors |
| 2 | Invalid usage |

Validators expose errors and warnings separately. Preserve the established result fields when adding information, so existing consumers can keep reading them. Navigation responses include counts and truncation information when limits apply.

## Paths and writes

Use the shared context resolver. Its user-facing rules are in [installation.md](./installation.md#configuration-selection). Resolve content aliases relative to config and classify content from `site.yaml` page definitions.

Validate write scopes through existing real filesystem ancestors before mutation, because symlinks can otherwise escape a lexical boundary. Resolve every referenced input and reject filename/prefix collisions before creating files. Writers preserve unrelated formatting; JSONC state changes retain comments. Link moves prepare edits first and attempt rollback on failure.

The toolkit's `git commit` command exists for explicitly requested scoped commits. Implementing or testing other commands never implies a commit or push.

## Add a command

1. Add its declaration to `src/manifest.json`, because parsing and discovery share that catalog.
2. Add its native dispatch and implementation.
3. Add required-argument help and a filled example in `src/args.rs`.
4. Add behavior tests under `tests/` for its material failure modes.
5. Run the contributor checks below.

```bash
cd agent-ks-cli
cargo fmt --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
cargo build --release --locked
python3 tests/install.py
```

Build artifacts stay under the ignored `agent-ks-cli/releases/`. Versioned notes live under `agent-ks-cli/release-notes/`. A maintainer publishes `agent-ks-v<version>` independently of engine tags. The framework repository's `agent-ks-cli/README.md` describes release packaging and installation.
