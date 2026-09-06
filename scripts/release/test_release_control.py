#!/usr/bin/env python3
"""Pure regression tests for release titles and latest-alias selection."""

from __future__ import annotations

import unittest

from release_control import (
    ReleaseControlError,
    alias_update_decision,
    release_title,
    select_alias_target,
    version_from_tag,
)


def release(
    tag: str,
    *,
    draft: bool = False,
    prerelease: bool = False,
    published: bool = True,
) -> dict[str, object]:
    return {
        "tag_name": tag,
        "draft": draft,
        "prerelease": prerelease,
        "published_at": "2026-09-06T00:00:00Z" if published else None,
    }


class ReleaseControlTests(unittest.TestCase):
    def test_titles_are_product_first_without_duplicate_prefixes(self) -> None:
        self.assertEqual(
            release_title("engine", "1.2.3", "# 1.2.3 — Useful change"),
            "Engine 1.2.3 — Useful change",
        )
        self.assertEqual(
            release_title("plugin", "1.2.3", "# Plugin 1.2.3 — Useful change"),
            "Plugin 1.2.3 — Useful change",
        )
        self.assertEqual(
            release_title("cli", "1.2.3", "# agent-ks 1.2.3 — Useful change"),
            "CLI 1.2.3 — Useful change",
        )
        self.assertEqual(release_title("cli", "1.2.3", "# CLI 1.2.3"), "CLI 1.2.3")
        with self.assertRaises(ReleaseControlError):
            release_title("engine", "1.2.3", "# Plugin 1.2.3 — Wrong product")

    def test_newest_stable_release_uses_numeric_order_and_own_namespace(self) -> None:
        releases = [
            release("agent-ks-engine-v0.3.9"),
            release("agent-ks-engine-v0.3.10"),
            release("agent-ks-engine-v0.4.0", prerelease=True),
            release("agent-ks-engine-v0.5.0", draft=True),
            release("agent-ks-engine-v0.6.0", published=False),
            release("agent-ks-plugin-v9.0.0"),
        ]
        selected = select_alias_target(releases, "engine", "agent-ks-engine-v0.3.10")
        self.assertIsNotNone(selected)
        self.assertEqual(selected["tag_name"], "agent-ks-engine-v0.3.10")

    def test_failed_or_prerelease_trigger_does_not_advance_alias(self) -> None:
        stable = release("agent-ks-cli-v0.1.0")
        prerelease = release("agent-ks-cli-v0.1.1", prerelease=True)
        self.assertIsNone(
            select_alias_target([stable], "cli", "agent-ks-cli-v0.1.1")
        )
        self.assertIsNone(
            select_alias_target([stable, prerelease], "cli", "agent-ks-cli-v0.1.1")
        )

    def test_older_rerun_selects_newest_release_and_never_regresses(self) -> None:
        releases = [
            release("agent-ks-plugin-v0.11.0"),
            release("agent-ks-plugin-v0.12.0"),
        ]
        selected = select_alias_target(releases, "plugin", "agent-ks-plugin-v0.11.0")
        self.assertIsNotNone(selected)
        self.assertEqual(selected["tag_name"], "agent-ks-plugin-v0.12.0")
        self.assertEqual(alias_update_decision((0, 12, 0), (0, 11, 0)), "keep-newer")
        self.assertEqual(alias_update_decision((0, 11, 0), (0, 12, 0)), "advance")

    def test_only_strict_stable_numeric_tags_are_accepted(self) -> None:
        for tag in (
            "agent-ks-cli-v1.2.3-beta.1",
            "agent-ks-cli-v01.2.3",
            "cli-latest",
        ):
            with self.assertRaises(ReleaseControlError):
                version_from_tag("cli", tag)


if __name__ == "__main__":
    unittest.main()
