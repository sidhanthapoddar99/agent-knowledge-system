#!/usr/bin/env python3
"""Numbered release titles and official CLI Latest selection."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import dataclass
from typing import Any, Iterable


SEMVER = re.compile(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)")


@dataclass(frozen=True)
class Product:
    label: str
    tag_prefix: str


PRODUCTS = {
    "engine": Product("Engine", "agent-ks-engine-v"),
    "plugin": Product("Plugin", "agent-ks-plugin-v"),
    "cli": Product("CLI", "agent-ks-cli-v"),
}


class ReleaseControlError(RuntimeError):
    """A release invariant failed."""


def product(name: str) -> Product:
    try:
        return PRODUCTS[name]
    except KeyError as error:
        raise ReleaseControlError(f"Unknown product: {name}") from error


def parse_version(value: str) -> tuple[int, int, int]:
    match = SEMVER.fullmatch(value)
    if not match:
        raise ReleaseControlError(f"Stable numeric version required, got: {value}")
    return tuple(int(part) for part in match.groups())


def version_from_tag(product_name: str, tag: str) -> tuple[int, int, int]:
    spec = product(product_name)
    if not tag.startswith(spec.tag_prefix):
        raise ReleaseControlError(f"{tag} is not a {spec.label} release tag")
    return parse_version(tag[len(spec.tag_prefix) :])


def release_title(product_name: str, version: str, heading: str) -> str:
    """Return `Product X.Y.Z — description` without duplicate product prefixes."""

    spec = product(product_name)
    parse_version(version)
    text = heading.strip()
    if text.startswith("# "):
        text = text[2:].strip()
    allowed_prefixes = {f"{spec.label} "}
    if product_name == "cli":
        allowed_prefixes.add("agent-ks ")
    for prefix in ("Engine ", "Plugin ", "CLI ", "agent-ks "):
        if text.startswith(prefix):
            if prefix not in allowed_prefixes:
                raise ReleaseControlError(
                    f"{spec.label} release heading cannot start with {prefix.strip()}"
                )
            text = text[len(prefix) :]
            break

    if text == version:
        description = ""
    elif text.startswith(f"{version} — "):
        description = text[len(version) + 3 :].strip()
        if not description:
            raise ReleaseControlError("Release title description cannot be blank")
    else:
        raise ReleaseControlError(
            f"Release heading must name version {version} with an optional description"
        )

    title = f"{spec.label} {version}"
    return f"{title} — {description}" if description else title


def is_published_stable(release: dict[str, Any], product_name: str) -> bool:
    if release.get("draft") or release.get("prerelease") or not release.get("published_at"):
        return False
    try:
        version_from_tag(product_name, str(release.get("tag_name", "")))
    except ReleaseControlError:
        return False
    return True


def select_latest_release(
    releases: Iterable[dict[str, Any]], product_name: str, triggering_tag: str
) -> dict[str, Any] | None:
    """Select the newest stable product release after validating the triggering release."""

    if product_name != "cli":
        raise ReleaseControlError("Only CLI selects GitHub releases")
    version_from_tag(product_name, triggering_tag)
    release_list = list(releases)
    triggering_release = next(
        (release for release in release_list if release.get("tag_name") == triggering_tag),
        None,
    )
    if triggering_release is None or not is_published_stable(triggering_release, product_name):
        return None

    stable = [
        release for release in release_list if is_published_stable(release, product_name)
    ]
    if not stable:
        raise ReleaseControlError(f"No published stable {product_name} release exists")
    return max(
        stable,
        key=lambda release: version_from_tag(product_name, release["tag_name"]),
    )


def run(command: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=check, capture_output=True, text=True)


def github_releases(repository: str) -> list[dict[str, Any]]:
    releases: list[dict[str, Any]] = []
    for page in range(1, 1001):
        endpoint = f"repos/{repository}/releases?per_page=100&page={page}"
        response = run(["gh", "api", endpoint])
        batch = json.loads(response.stdout)
        if not isinstance(batch, list):
            raise ReleaseControlError("GitHub releases response must be a list")
        releases.extend(batch)
        if len(batch) < 100:
            return releases
    raise ReleaseControlError("GitHub release pagination exceeded 1000 pages")


def sync_cli_official_latest(repository: str, triggering_tag: str, attempts: int = 5) -> None:
    # The CLI workflow serializes publication and Latest changes in one concurrency group.
    for _ in range(attempts):
        target = select_latest_release(github_releases(repository), "cli", triggering_tag)
        if target is None:
            print("Triggering release is not published and stable; Latest unchanged")
            return
        tag = target["tag_name"]
        run(["gh", "release", "edit", tag, "--repo", repository, "--latest=true"])
        refreshed = select_latest_release(github_releases(repository), "cli", triggering_tag)
        official = json.loads(run(["gh", "api", f"repos/{repository}/releases/latest"]).stdout)
        if refreshed and refreshed["tag_name"] == tag and official.get("tag_name") == tag:
            print(f"Official Latest: {tag}")
            return
    raise ReleaseControlError("Latest selection changed repeatedly; retry the workflow")


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)

    title = commands.add_parser("title")
    title.add_argument("--product", choices=PRODUCTS, required=True)
    title.add_argument("--version", required=True)
    title.add_argument("--heading", required=True)

    latest = commands.add_parser("official-latest")
    latest.add_argument("--release-tag", required=True)
    latest.add_argument("--repository", required=True)
    latest.add_argument("--attempts", type=int, default=5)
    return root


def main() -> None:
    arguments = parser().parse_args()
    if arguments.command == "title":
        print(release_title(arguments.product, arguments.version, arguments.heading))
        return
    sync_cli_official_latest(
        arguments.repository, arguments.release_tag, arguments.attempts
    )


if __name__ == "__main__":
    try:
        main()
    except ReleaseControlError as error:
        raise SystemExit(str(error)) from error
