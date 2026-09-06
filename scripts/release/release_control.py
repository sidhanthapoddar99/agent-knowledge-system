#!/usr/bin/env python3
"""Shared release-title and moving-alias controls for GitHub workflows."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import time
from dataclasses import dataclass
from typing import Any, Iterable


SEMVER = re.compile(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)")


@dataclass(frozen=True)
class Product:
    label: str
    tag_prefix: str
    latest_alias: str


PRODUCTS = {
    "engine": Product("Engine", "agent-ks-engine-v", "engine-latest"),
    "plugin": Product("Plugin", "agent-ks-plugin-v", "plugin-latest"),
    "cli": Product("CLI", "agent-ks-cli-v", "cli-latest"),
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


def select_alias_target(
    releases: Iterable[dict[str, Any]], product_name: str, triggering_tag: str
) -> dict[str, Any] | None:
    """Select the newest stable product release after validating the triggering release."""

    if product_name != "cli":
        raise ReleaseControlError("Only CLI selects latest aliases from GitHub releases")
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


def alias_update_decision(
    current_version: tuple[int, int, int] | None,
    desired_version: tuple[int, int, int],
) -> str:
    if current_version is None or current_version < desired_version:
        return "advance"
    if current_version == desired_version:
        return "current"
    return "keep-newer"


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


def remote_tag_state(
    remote: str, product_name: str
) -> tuple[str | None, dict[str, str]]:
    spec = product(product_name)
    response = run(
        [
            "git",
            "ls-remote",
            "--tags",
            remote,
            f"refs/tags/{spec.tag_prefix}*",
            f"refs/tags/{spec.latest_alias}",
        ]
    )
    direct: dict[str, str] = {}
    peeled: dict[str, str] = {}
    for line in response.stdout.splitlines():
        object_id, reference = line.split("\t", 1)
        name = reference.removeprefix("refs/tags/")
        if name.endswith("^{}"):
            peeled[name[:-3]] = object_id
        else:
            direct[name] = object_id

    numbered = {
        tag: peeled.get(tag, object_id)
        for tag, object_id in direct.items()
        if tag.startswith(spec.tag_prefix)
    }
    return direct.get(spec.latest_alias), numbered


def version_at_alias(
    alias_object: str | None,
    numbered_tags: dict[str, str],
    product_name: str,
) -> tuple[int, int, int] | None:
    if alias_object is None:
        return None
    versions = [
        version_from_tag(product_name, tag)
        for tag, object_id in numbered_tags.items()
        if object_id == alias_object
    ]
    if not versions:
        raise ReleaseControlError(
            f"Existing {product(product_name).latest_alias} does not target a numbered "
            f"{product(product_name).label} release"
        )
    return max(versions)


def fetch_tag_commit(remote: str, tag: str, expected_object: str) -> None:
    """Fetch a possibly annotated tag without creating or moving a local tag."""

    run(["git", "fetch", "--force", "--no-tags", remote, f"refs/tags/{tag}"])
    fetched = run(["git", "rev-parse", "FETCH_HEAD^{commit}"]).stdout.strip()
    if fetched != expected_object:
        raise ReleaseControlError(
            f"Fetched {tag} at {fetched}, expected remote commit {expected_object}"
        )


def sync_cli_official_latest(repository: str, remote: str, attempts: int = 5) -> None:
    spec = product("cli")
    for attempt in range(1, attempts + 1):
        releases = github_releases(repository)
        alias_object, numbered_tags = remote_tag_state(remote, "cli")
        if alias_object is None:
            raise ReleaseControlError(f"Remote alias is missing: {spec.latest_alias}")
        candidates = [
            release
            for release in releases
            if is_published_stable(release, "cli")
            and numbered_tags.get(release["tag_name"]) == alias_object
        ]
        if not candidates:
            raise ReleaseControlError(
                f"{spec.latest_alias} does not target a published stable CLI release"
            )
        target = max(
            candidates,
            key=lambda release: version_from_tag("cli", release["tag_name"]),
        )
        numbered_tag = target["tag_name"]
        run(
            [
                "gh",
                "release",
                "edit",
                numbered_tag,
                "--repo",
                repository,
                "--latest=true",
            ]
        )
        official: dict[str, Any] = json.loads(
            run(["gh", "api", f"repos/{repository}/releases/latest"]).stdout
        )
        observed, _ = remote_tag_state(remote, "cli")
        if observed == alias_object and official.get("tag_name") == numbered_tag:
            print(f"Marked {numbered_tag} as the official Latest release ({alias_object})")
            return
        if attempt < attempts:
            time.sleep(0.5)
    raise ReleaseControlError(
        f"Could not synchronize the official CLI Latest release after {attempts} attempts"
    )


def update_latest_alias(
    product_name: str,
    triggering_tag: str,
    repository: str,
    remote: str,
    attempts: int = 5,
) -> None:
    spec = product(product_name)
    for attempt in range(1, attempts + 1):
        if product_name == "cli":
            target = select_alias_target(
                github_releases(repository), product_name, triggering_tag
            )
            if target is None:
                print(
                    f"{triggering_tag} is not a successfully published stable release; "
                    f"{spec.latest_alias} is unchanged"
                )
                return
            target_tag = target["tag_name"]
        else:
            target_tag = triggering_tag
        desired_version = version_from_tag(product_name, target_tag)
        alias_object, numbered_tags = remote_tag_state(remote, product_name)
        desired_object = numbered_tags.get(target_tag)
        if desired_object is None:
            raise ReleaseControlError(f"Remote numbered tag is missing: {target_tag}")

        current_version = version_at_alias(alias_object, numbered_tags, product_name)
        decision = alias_update_decision(current_version, desired_version)
        if alias_object == desired_object or decision == "current":
            print(f"{spec.latest_alias} already targets {target_tag} ({desired_object})")
            if product_name == "cli":
                sync_cli_official_latest(repository, remote, attempts)
            return
        if decision == "keep-newer":
            print(
                f"{spec.latest_alias} already targets newer version "
                f"{'.'.join(map(str, current_version or ()))}; refusing to regress to "
                f"{'.'.join(map(str, desired_version))}"
            )
            if product_name == "cli":
                sync_cli_official_latest(repository, remote, attempts)
            return

        fetch_tag_commit(remote, target_tag, desired_object)
        expected = alias_object or ""
        lease = f"refs/tags/{spec.latest_alias}:{expected}"
        push = run(
            [
                "git",
                "push",
                remote,
                f"--force-with-lease={lease}",
                f"{desired_object}:refs/tags/{spec.latest_alias}",
            ],
            check=False,
        )
        if push.returncode == 0:
            observed, observed_tags = remote_tag_state(remote, product_name)
            if observed == desired_object:
                print(f"Advanced {spec.latest_alias} to {target_tag} ({desired_object})")
                if product_name == "cli":
                    sync_cli_official_latest(repository, remote, attempts)
                return
            observed_version = version_at_alias(observed, observed_tags, product_name)
            if observed_version and observed_version > desired_version:
                print(f"A newer release won the race for {spec.latest_alias}")
                if product_name == "cli":
                    sync_cli_official_latest(repository, remote, attempts)
                return

        if attempt < attempts:
            time.sleep(0.5)

    raise ReleaseControlError(
        f"Could not update {spec.latest_alias} after {attempts} lease-protected attempts"
    )


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)

    title = commands.add_parser("title")
    title.add_argument("--product", choices=PRODUCTS, required=True)
    title.add_argument("--version", required=True)
    title.add_argument("--heading", required=True)

    latest = commands.add_parser("update-latest")
    latest.add_argument("--product", choices=PRODUCTS, required=True)
    latest.add_argument("--release-tag", required=True)
    latest.add_argument("--repository", required=True)
    latest.add_argument("--remote", default="origin")
    latest.add_argument("--attempts", type=int, default=5)
    return root


def main() -> None:
    arguments = parser().parse_args()
    if arguments.command == "title":
        print(release_title(arguments.product, arguments.version, arguments.heading))
        return
    update_latest_alias(
        arguments.product,
        arguments.release_tag,
        arguments.repository,
        arguments.remote,
        arguments.attempts,
    )


if __name__ == "__main__":
    try:
        main()
    except ReleaseControlError as error:
        raise SystemExit(str(error)) from error
