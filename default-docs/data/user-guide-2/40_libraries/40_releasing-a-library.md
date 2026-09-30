---
title: "Releasing a library"
---

A library release is a git tag. There is no package registry and no upload step: you push a version tag, and projects pick it up through `dep.yaml`. This page covers version numbers, the engine range, hosting, private libraries, the catalog, and what to do when a new agentks release changes the formats.

## One version for the whole library

- The library has one version series. Elements have no versions of their own.
- `manifest.json` holds the version as `x.y.z`.
- A release is a git tag with the same number, written `x.y.z` or `vx.y.z`: `1.2.0` or `v1.2.0`.
- Any change to any element is a new version.

When the tag and the manifest disagree, agentks shows a warning to every project that installs that tag. Keep them equal.

Follow semantic versioning, because projects often ask for a range such as `^1.2`, which accepts every `1.x.y` from `1.2.0`:

| Change | New version |
|---|---|
| Fix an element without changing how it is used | Patch: `1.2.0` → `1.2.1` |
| Add an element | Minor: `1.2.0` → `1.3.0` |
| Remove or rename an element, or change how it behaves | Major: `1.2.0` → `2.0.0` |

A pre-release tag such as `2.0.0-beta.1` reaches only projects that ask for that exact tag. Ranges and "newest release" skip it, so you can test a release with a few projects first.

## The engine range

`engine` in the manifest says which agentks versions the library works with, for example `">=1.0.0 <2.0.0"`. agentks refuses a library whose range excludes it, and names the library, the range and its own version.

Only a major agentks release changes formats, so a range that spans one major version is normal. When a project runs `agentks install --update` and your newest release needs a different agentks than the project has, the update fails and names both versions. It never falls back to an older release on its own.

## Releasing

```bash
# after updating "version" in manifest.json to 1.3.0 and committing
git tag v1.3.0
git push origin v1.3.0
```

Before you tag, run `agentks check libraries` from a test project that uses the library, as in [testing a library](./37_testing-a-library.md).

## Hosting

Any git host works. Users add your library with the source that fits:

```yaml
libraries:
  acme:
    github: acme/acme-kit             # GitHub
    tag: ^1.3
  shapes:
    git: https://gitlab.com/acme/shapes.git   # any other git host, HTTPS or SSH
  frames:
    github: acme/design-system
    path: libraries/frames            # one library in a subfolder
```

One repository can hold several libraries in subfolders, each with its own `manifest.json`. Users point at each one with `path:`. agentks fetches the repository once per commit and reads each library from its folder.

## Private libraries

A private repository works like a public one for anyone who can clone it. agentks fetches with the machine's git credentials: SSH keys and the git credential helper. A user without access gets an error that names the repository and how to sign in.

## The catalog

The catalog lists the libraries and templates the agentks team offers for quick install, starting with `agentks-default`. It lives in `library.json` in the `NeuraLabsHQ/agent-knowledge-system-library` repository. Your library does not need to be in the catalog: users add it by `owner/repo` or git URL, and it works exactly the same way. [Finding elements](./15_finding-elements.md#the-catalog-file) shows the catalog's format.

## When agentks changes a format

A major agentks release can change the formats a library uses. The library's owner migrates the library; its users never do, because their copy sits read-only in the machine cache.

1. Install the new agentks.
2. Run the library migrations on your library's folder:

   ```bash
   agentks migrate --library .
   ```

3. Set the new `engine` range in `manifest.json`, raise the version, and tag it.

Users then move to your new release with `agentks install --update`, when their selector allows it. Otherwise they change the `tag` in their `dep.yaml`. [Upgrading](../60_upgrading/01_overview.md) covers the user's side of a major release.

## An AI plugin for library authors

agentks ships a second, smaller AI plugin for people who build and host libraries and templates. It teaches an agent the manifest and its checks, testing through a `path:` entry, version tags, the engine range and library migrations. Install it from the Neuralabs plugin marketplace, next to the main agentks plugin.
