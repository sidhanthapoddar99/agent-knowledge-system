---
title: "Testing a library"
---

Test a library the way its users will meet it: through an agentks project that lists it in `dep.yaml`. A small test project inside the library's own repository, with a local `path:` entry, shows every change at once, with no tag and no push. This page sets one up and lists what `agentks check libraries` checks.

## Set up a test project

The test project lives inside the library's repository, because a local `path:` must stay inside the repository of the project that uses it.

```bash
cd acme-kit                                # the library's repository
agentks init test-site                     # a small project to test with
cd test-site
agentks library add --local .. --as acme   # the library, as a local entry
```

The result:

```text
acme-kit/
  manifest.json
  components/
    icons/rocket.svg
    widgets/price-table.html
  test-site/
    config/
      dep.yaml        acme: { path: ../.. }, the library's root seen from config/
    ...
```

## Try it

```bash
agentks library show acme      # the manifest, as agentks reads it
agentks library find rocket    # can people and agents find the element?
agentks check libraries        # every rule in the list below
agentks start                  # see the elements in a page
```

To see an element in a page, add an artifact page to one of the test project's sections, for example `20_library-check.html`:

```html
<!doctype html>
<html lang="en">
<body>
  <img src="/_lib/acme/rocket" alt="Rocket" width="48" height="48">
</body>
</html>
```

While `agentks start` runs, it watches the local library. Save a change to an element or to the manifest, and the page picks it up. A local library is read in place, so there is nothing to install between edits.

## What check libraries checks

`agentks check libraries` checks every library the project uses, and every place the project names an element. It reports:

- a missing or malformed manifest, or a missing required field;
- a `file` that does not exist or leads outside the library;
- an element name used twice;
- an `engine` range that excludes the running agentks;
- a `category` that does not match the file's folder;
- a file that breaks its category's rules, such as an icon's view box or a size cap;
- an `alias:element` or a `/_lib/` address in the project's pages that no library offers.

It reads only files, so it needs no running server. It exits with `1` when it finds an error, which makes it easy to use in a script.

## In continuous integration

Run the same test project in your library's continuous integration: `agentks check libraries` from `test-site/`, on every push and before every tag. The rules live in agentks, so do not copy them into checks of your own. A copy would drift from the version your users run.

When the checks pass, [release the library](./40_releasing-a-library.md).
