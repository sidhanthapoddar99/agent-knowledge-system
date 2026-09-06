#!/bin/sh
# Install a checksum-verified, versioned agent-ks binary from GitHub Releases.
set -eu
repo='sidhanthapoddar99/agent-knowledge-system'
version=${AGENTKS_VERSION:-}
pinned=${version:+yes}
shell_setup=1
install_dir=${AGENTKS_INSTALL_DIR:-"$HOME/.local/bin"}
usage() {
  cat <<'HELP'
Install agent-ks from GitHub Releases.
Usage: sh install.sh [--version X.Y.Z] [--install-dir PATH] [--no-shell-setup]
Default: newest agent-ks-vX.Y.Z release, installed into ~/.local/bin.
Environment: AGENTKS_VERSION and AGENTKS_INSTALL_DIR set the same defaults.
Adds PATH and a silent five-hour auto-update hook to your shell startup file.
--version pins the installation and pauses automatic updates.
Needs curl, tar, and sha256sum or shasum. No sudo and no Rust toolchain required.
HELP
}
while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --no-shell-setup) shell_setup=0; shift ;;
    --version) [ "$#" -ge 2 ] || { echo '--version requires X.Y.Z' >&2; exit 2; }; version=$2; pinned=yes; shift 2 ;;
    --install-dir) [ "$#" -ge 2 ] || { echo '--install-dir requires a path' >&2; exit 2; }; install_dir=$2; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done
[ -n "$install_dir" ] || { echo 'Install directory must not be empty' >&2; exit 2; }
for dep in curl tar; do command -v "$dep" >/dev/null 2>&1 || { echo "Required command missing: $dep" >&2; exit 1; }; done
if command -v sha256sum >/dev/null 2>&1; then checksum=sha256sum
elif command -v shasum >/dev/null 2>&1; then checksum=shasum
else echo 'Required: sha256sum or shasum' >&2; exit 1
fi
case "$(uname -s)" in Linux) os=unknown-linux-musl ;; Darwin) os=apple-darwin ;; *) echo 'Use a Windows .zip asset from GitHub Releases, or run this installer in WSL.' >&2; exit 1 ;; esac
case "$(uname -m)" in x86_64|amd64) arch=x86_64 ;; aarch64|arm64) arch=aarch64 ;; *) echo 'Supported architectures: x86_64 and arm64' >&2; exit 1 ;; esac
tmp=$(mktemp -d)
stage=
cleanup() { rm -rf "$tmp"; if [ -n "$stage" ]; then rm -f "$stage"; fi; }
trap cleanup EXIT HUP INT TERM
fetch() { curl --proto '=https' --tlsv1.2 -fsSL --retry 3 --connect-timeout 15 --max-time 120 "$1" -o "$2"; }
if [ -z "$version" ]; then
  page=1
  : > "$tmp/versions"
  while [ "$page" -le 10 ]; do
    fetch "https://api.github.com/repos/$repo/releases?per_page=100&page=$page" "$tmp/releases.json"
    # Public GitHub release responses omit drafts. Match only numeric CLI tags;
    # engine tags and suffix-tagged prereleases cannot enter the version list.
    sed -n 's/^[[:space:]]*"tag_name":[[:space:]]*"agent-ks-v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)",\{0,1\}[[:space:]]*$/\1/p' "$tmp/releases.json" >> "$tmp/versions"
    count=$(grep -c '^[[:space:]]*"tag_name"[[:space:]]*:' "$tmp/releases.json" || true)
    [ "$count" -ge 100 ] || break
    page=$((page + 1))
  done
  [ "$page" -le 10 ] || { echo 'Release history exceeds 1,000 entries; select a CLI version with --version.' >&2; exit 1; }
  version=$(LC_ALL=C sort -t . -k1,1n -k2,2n -k3,3n "$tmp/versions" | tail -n 1)
fi
if ! printf '%s\n' "$version" | LC_ALL=C grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo 'No stable CLI release found. Publish agent-ks-vX.Y.Z first, or select an existing version with --version.' >&2
  exit 1
fi
asset="agent-ks-$arch-$os.tar.gz"
base="https://github.com/$repo/releases/download/agent-ks-v$version"
fetch "$base/$asset" "$tmp/$asset"
fetch "$base/SHA256SUMS" "$tmp/SHA256SUMS"
expected=$(awk -v name="$asset" '$2 == name { print $1 }' "$tmp/SHA256SUMS")
[ "${#expected}" -eq 64 ] || { echo "Missing or ambiguous checksum for $asset" >&2; exit 1; }
case "$expected" in *[!0-9a-fA-F]*) echo 'Malformed checksum' >&2; exit 1 ;; esac
if [ "$checksum" = sha256sum ]; then actual=$(sha256sum "$tmp/$asset" | awk '{print $1}')
else actual=$(shasum -a 256 "$tmp/$asset" | awk '{print $1}')
fi
[ "$actual" = "$expected" ] || { echo 'Checksum mismatch; existing installation was not changed.' >&2; exit 1; }
# The release archive contains exactly this one regular file.
[ "$(tar -tzf "$tmp/$asset")" = 'agent-ks' ] || { echo 'Unexpected archive contents' >&2; exit 1; }
tar -xzf "$tmp/$asset" -C "$tmp" agent-ks
[ -f "$tmp/agent-ks" ] && [ ! -L "$tmp/agent-ks" ] || { echo 'Archive did not contain a regular binary' >&2; exit 1; }
mkdir -p "$install_dir"
stage=$(mktemp "$install_dir/.agent-ks-install.XXXXXX")
cp "$tmp/agent-ks" "$stage"
chmod 755 "$stage"
[ "$("$stage" --version)" = "agent-ks $version" ] || { echo 'Binary version check failed; existing installation was not changed.' >&2; exit 1; }
mv -f "$stage" "$install_dir/agent-ks"
stage=
printf 'Installed agent-ks %s into %s\n' "$version" "$install_dir"
case ":$PATH:" in *":$install_dir:"*) ;; *) printf 'Add this directory to your shell PATH: %s\n' "$install_dir" ;; esac

# Preferences are managed by the binary, keeping one state format on every OS.
"$install_dir/agent-ks" update --enable >/dev/null
if [ -n "$pinned" ]; then "$install_dir/agent-ks" update --pin "$version" >/dev/null
else "$install_dir/agent-ks" update --unpin >/dev/null
fi
if [ "$shell_setup" -eq 1 ]; then
  case "${SHELL:-bash}" in
    */zsh|zsh) shell_name=zsh; profile="${ZDOTDIR:-$HOME}/.zshrc" ;;
    */fish|fish) shell_name=fish; profile="${XDG_CONFIG_HOME:-$HOME/.config}/fish/config.fish" ;;
    *) shell_name=bash; profile="$HOME/.bashrc" ;;
  esac
  mkdir -p "$(dirname "$profile")"
  # Replace only our managed block. Refuse malformed markers instead of
  # accidentally dropping a user's remaining shell configuration.
  if [ -f "$profile" ]; then
    awk '
      $0 == "# >>> agent-ks >>>" { if (skip || seen) exit 1; skip=1; seen=1; next }
      $0 == "# <<< agent-ks <<<" { if (!skip) exit 1; skip=0; next }
      !skip { print }
      END { if (skip) exit 1 }
    ' "$profile" > "$tmp/profile" || { echo "Malformed agent-ks markers in $profile; shell setup left unchanged." >&2; exit 1; }
  else : > "$tmp/profile"
  fi
  printf '# >>> agent-ks >>>\n' >> "$tmp/profile"
  "$install_dir/agent-ks" init "$shell_name" >> "$tmp/profile"
  printf '# <<< agent-ks <<<\n' >> "$tmp/profile"
  # Preserve symlinks and permissions used by dotfile managers.
  cat "$tmp/profile" > "$profile"
  printf 'Configured PATH and silent automatic updates in %s (five-hour cooldown).\n' "$profile"
fi
