---
title: "Distribution — single binary, cross-compile, install paths"
sidebar_label: "04 · Distribution"
---

# Distribution — single binary across platforms

Go's killer feature for this project is **dead-simple cross-compilation + zero-runtime-deps deployment**. This note captures the distribution mechanics.

## Binary size budget

| Component | Estimate |
|---|---|
| Go runtime + stdlib | ~5 MB |
| Goldmark + chroma + extensions | ~3 MB |
| chi router + slog | ~1 MB |
| fsnotify + git library | ~2 MB |
| YAML/JSON/TOML parsers | ~1 MB |
| **Embedded `dist/`** (compressed) | ~1–2 MB |
| **CodeMirror bundle** (in dist/) | ~180 KB compressed |
| Yjs server (y-go) | ~2 MB |
| Cobra + subcommand surface | ~1 MB |
| Slack of misc deps | ~3–5 MB |
| **Total stripped** | **~25–35 MB** |

Compare:
- Astro + Node + node_modules: ~250 MB on disk before content
- Next.js standalone build: ~90 MB
- Hugo: ~25 MB (similar reference point — Hugo is the precedent)

## Cross-compile matrix

```bash
# All from a single dev machine, no Docker, no toolchain juggling
GOOS=darwin  GOARCH=arm64   go build -o dist/doc-engine-darwin-arm64
GOOS=darwin  GOARCH=amd64   go build -o dist/doc-engine-darwin-amd64
GOOS=linux   GOARCH=amd64   go build -o dist/doc-engine-linux-amd64
GOOS=linux   GOARCH=arm64   go build -o dist/doc-engine-linux-arm64
GOOS=windows GOARCH=amd64   go build -o dist/doc-engine-windows-amd64.exe
```

`goreleaser` automates this:

```yaml
# .goreleaser.yml
builds:
  - id: doc-engine
    main: ./cmd/doc-engine
    binary: doc-engine
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
    ldflags:
      - -s -w
      - -X main.version={{.Version}}

archives:
  - format: tar.gz
    format_overrides:
      - goos: windows
        format: zip

checksum:
  name_template: 'checksums.txt'

brews:
  - tap:
      owner: <org>
      name: homebrew-tap
    homepage: https://doc-engine.dev
```

One CI run produces:
- 5 platform-specific archives
- SHA256 checksums
- GitHub release with all archives
- Updated Homebrew tap formula

## Install channels

| Channel | One-liner | Best for |
|---|---|---|
| Curl installer (Linux/macOS) | `curl -sSf https://doc-engine.dev/install.sh \| sh` | Default for Unix-likes |
| PowerShell installer (Windows) | `iwr -useb https://doc-engine.dev/install.ps1 \| iex` | Windows |
| Homebrew | `brew install <tap>/doc-engine` | Mac/Linux brew users |
| Direct download | GitHub releases page | Air-gapped; restricted environments |
| Docker | `docker run -v $(pwd):/site doc-engine:latest serve` | CI; production |
| `go install` | `go install github.com/.../doc-engine@latest` | Go developers |

All paths deliver the same binary (or pull-and-run the same image).

## Install script behaviour (`install.sh`)

```sh
#!/bin/sh
set -e

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH=amd64 ;;
  aarch64|arm64) ARCH=arm64 ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

VERSION=$(curl -sSf https://doc-engine.dev/latest)
URL="https://github.com/<org>/doc-engine/releases/download/${VERSION}/doc-engine-${OS}-${ARCH}.tar.gz"

INSTALL_DIR="${DOC_ENGINE_INSTALL_DIR:-$HOME/.local/bin}"
mkdir -p "$INSTALL_DIR"

curl -sSfL "$URL" | tar -xz -C "$INSTALL_DIR"
chmod +x "$INSTALL_DIR/doc-engine"

echo "✓ Installed doc-engine ${VERSION} to $INSTALL_DIR/doc-engine"
echo "  Add $INSTALL_DIR to your PATH if it isn't already:"
echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
```

Behaviour:
- Resolve OS + arch
- Fetch the latest version pointer (`https://doc-engine.dev/latest` returns a version string)
- Download the matching archive
- Extract to `~/.local/bin` (overrideable via `DOC_ENGINE_INSTALL_DIR`)
- Print PATH-setup hint
- Idempotent: re-running upgrades

## Docker image

```dockerfile
# Multi-stage; build in golang stage, ship in scratch
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN cd frontend && npm ci && npm run build
RUN go build -ldflags="-s -w" -o /doc-engine ./cmd/doc-engine

FROM scratch
COPY --from=builder /doc-engine /doc-engine
ENTRYPOINT ["/doc-engine"]
CMD ["serve", "--host", "0.0.0.0"]
```

Final image size: ~25–35 MB (just the binary on `scratch`). For users wanting shell + ca-certs: `FROM alpine` adds ~5 MB.

## Version pinning per project

Optional `doc-engine.toml` in project root:

```toml
[engine]
version = "0.5.0"   # binary version this project expects

[server]
host = "localhost"
port = 4321
```

If the user's installed binary doesn't match `engine.version`:

- `doc-engine` warns and offers to download the matching version
- Or, if `engine.strict_version = true`, refuses to start

Multiple binary versions can coexist under `~/.cache/doc-engine/versions/<ver>/` (the v1 binary spawns the requested version's binary as a subprocess). This matches the design from `2026-04-26-framework-as-cli-tool` but simpler — there's no Astro+Bun cache layer to manage.

## What's preserved from existing CLI-tool issue

The `2026-04-26-framework-as-cli-tool` issue planned three usage methods (CLI / from-source / Docker). After this migration:

- **Method 1 (CLI)** — same UX; binary is the framework now, not a wrapper
- **Method 2 (from-source)** — clone the framework repo, `go run ./cmd/doc-engine`. Mostly for framework devs.
- **Method 3 (Docker)** — image instead of bundle; same Dockerfile patterns, simpler base image

Detail in `notes/deployment-methods/`.

## Update path

```
$ doc-engine upgrade
[doc-engine] checking for updates...
[doc-engine] current: 0.5.0
[doc-engine] latest:  0.6.0
[doc-engine] downloading doc-engine-darwin-arm64 (29 MB)...
[doc-engine] verifying checksum... ok
[doc-engine] replacing /Users/sid/.local/bin/doc-engine
[doc-engine] ✓ upgraded to 0.6.0
```

Self-update via the same install endpoints. Atomic rename (`doc-engine.new` → `doc-engine`). Rollback via `doc-engine upgrade --rollback`.

## Why this matters more than "just smaller"

- **Air-gapped deployments**: tar the binary + `default-docs/`, scp to target, run. No package manager, no network.
- **CI velocity**: docker pull + run vs apt + npm + bun + setup. Cold start in CI drops from ~2 min to ~10 s.
- **Reproducibility**: the binary either runs or it doesn't. There is no "works on my machine because my Node version is 20.4 and yours is 20.5."
- **Onboarding**: "drop this binary, run it" vs "install Node, install Bun, clone repo, run install, hope nothing's broken."

The single-binary distribution is the single biggest user-experience upgrade in this whole migration.
