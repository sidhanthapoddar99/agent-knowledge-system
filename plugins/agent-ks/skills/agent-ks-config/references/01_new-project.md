# New project

Copy the starter template into the folder the user picks. Substitute the site name, title, description and repo URL. Walk the steps in order. Ask before you write. Summarise at the end.

## The result

The confirm block at step 5 names every file this writes. Two things sit outside that list. The user clones the framework into `<chosen_root>/agent-knowledge-system/`, beside `config/` and `data/`; that is consumer mode, and [03_site-config.md](./03_site-config.md) draws the full tree. A patched `CLAUDE.md` at `<chosen_root>/CLAUDE.md` tells later sessions the layout, the skills and the build commands.

## 1 Pre-flight

```bash
for p in config/site.yaml default-docs/config/site.yaml agent-knowledge-system; do test -e "./$p" && echo "BLOCKER, docs already set up: $p"; done
```

This loop guards the repo, so it runs on `./`. If a blocker prints, stop with:

> Docs are already set up here (`<path>` exists). Add a section instead ([02_add-section.md](./02_add-section.md)), or remove the existing structure first.

## 2 Locate the template

The template is `assets/template/` beside this skill's `SKILL.md`. Claude Code sets `CLAUDE_PLUGIN_ROOT`; any other host derives the path from the `agent-ks` shim.

```bash
TEMPLATE_DIR="${CLAUDE_PLUGIN_ROOT}/skills/agent-ks-config/assets/template"
# The fallback uses no `readlink -f`: BSD and macOS do not have it. Follow the shim by hand.
p="$(command -v agent-ks)"
while [ -L "$p" ]; do d="$(cd "$(dirname "$p")" && pwd -P)"; p="$(readlink "$p")"; case "$p" in /*) ;; *) p="$d/$p";; esac; done
[ -d "$TEMPLATE_DIR" ] || TEMPLATE_DIR="$(cd "$(dirname "$p")/.." && pwd -P)/skills/agent-ks-config/assets/template"
test -d "$TEMPLATE_DIR/config" && echo "Template: $TEMPLATE_DIR" || { echo "ERROR: bundled template not found"; exit 1; }
```

If the test fails, the install is broken. In Claude Code: run `/plugin update agent-ks@sids-plugin-marketplace`, then `/reload-plugins`. In Codex: copy the skill folder again.

## 3 Scope

Ask: whole repo, or a subfolder? A subfolder (default `docs`) is right when the repo already holds source code. Whole repo: `chosen_root="."`. Subfolder: ask the name, create the folder if missing, `chosen_root="./<name>"`. Print `realpath "$chosen_root"` and confirm it before you write.

Then list the collisions. Step 6 writes into `$chosen_root`, so the test belongs here, where that root is known. A file and a folder get different messages, because `rsync --ignore-existing` skips an existing file and still adds new files inside an existing folder. A collision is not a blocker. Copy every line this prints into the confirm block at step 5, so the user reads it before anything is written.

```bash
for p in config data assets themes .gitignore .env.example; do
  [ -f "$chosen_root/$p" ] && echo "file, yours is kept and the template's copy is skipped: $p"
  [ -d "$chosen_root/$p" ] && echo "folder, it stays; the template's files are added inside it, your same-named files are kept: $p"
done
```

## 4 Site identity

Ask all four in one message.

| Question | Used for | Default |
|---|---|---|
| Site name | navbar label, and the logo `alt:` text | the basename of `chosen_root` |
| Site title | the `<title>` tag | the site name |
| Description | one-sentence tagline | `Documentation built with agent-knowledge-system` |
| Repo URL, or `org/repo` | footer and social links | the placeholder `your-org/your-repo`; the user edits `config/footer.yaml` later |

Keep them in `SITE_NAME`, `SITE_TITLE`, `DESCRIPTION` and `REPO_URL` (a full URL). When the user picks a non-default answer, restate it, so they can correct a typo. Each answer lands inside a double-quoted YAML scalar, so ask for another when one carries a `"` or a `\`.

## 5 Confirm the plan

```
Will copy the template (five sections: Home, Docs, Issues, Blog, User Guide) into <absolute-chosen-root>:

  config/site.yaml         (subs: name/logo alt=<SITE_NAME>, title=<SITE_TITLE>, description=<DESCRIPTION>)
  config/footer.yaml       (subs: copyright=<SITE_NAME>, repo=<REPO_URL>)
  config/navbar.yaml       (no substitution)
  data/README.md           (the folder map; add a row whenever you add a folder)
  data/pages/home.yaml     (sub: hero.title=<SITE_TITLE>)
  data/docs/ data/blog/ data/issues/   (a starter page, a welcome post, an empty tracker)
  assets/ themes/ .gitignore   (placeholder logos; no themes yet; .env, .astro/, node_modules/ and dist/ ignored)
  .env.example                 (a reference copy of the keys; the real .env is written at step 8, in the framework folder)

Already here (the step-3 lines, or "none"):
  <a file: yours is kept and the template's copy is skipped>
  <a folder: it stays, and the template's files are added inside it>

Will patch CLAUDE.md at <chosen_root>/CLAUDE.md (created if absent), then print the clone and .env instructions.

Proceed?
```

## 6 Copy and substitute

```bash
# Name every file the copy will skip. --ignore-existing keeps the user's copy; without it rsync replaces their .gitignore and they lose it silently.
(cd "$TEMPLATE_DIR" && find . -type f ! -path './README.md' | sed 's|^\./||') \
  | while read -r f; do [ -e "$chosen_root/$f" ] && echo "kept yours, skipped: $f"; done

# Drop the template's own README.md; it documents the template, not the project. The leading slash anchors the pattern to the top level, so data/README.md still copies.
rsync -a --ignore-existing --exclude='/README.md' "$TEMPLATE_DIR/" "$chosen_root/" && cd "$chosen_root"

# Escape all four answers. In a sed replacement `&` means the whole match and `|` ends the command, so an unescaped "R&D Handbook" writes `name: "Rname: "My Docs"D Handbook"` into site.yaml and nothing reports it.
esc() { printf '%s' "$1" | sed 's/[\\&|]/\\&/g'; }
# `sed -i` needs a backup suffix on BSD and macOS. Give it one, then delete the backups.
sed -i.bak -e "s|name: \"My Docs\"|name: \"$(esc "$SITE_NAME")\"|" -e "s|alt: \"My Docs\"|alt: \"$(esc "$SITE_NAME")\"|" \
  -e "s|title: \"My Documentation\"|title: \"$(esc "$SITE_TITLE")\"|" \
  -e "s|description: \"Modern documentation built with Astro\"|description: \"$(esc "$DESCRIPTION")\"|" config/site.yaml

sed -i.bak -e "s|© {year} My Docs. All rights reserved.|© {year} $(esc "$SITE_NAME"). All rights reserved.|" config/footer.yaml

[ -n "$REPO_URL" ] && [ "$REPO_URL" != "https://github.com/your-org/your-repo" ] && sed -i.bak "s|https://github.com/your-org/your-repo|$(esc "$REPO_URL")|g" config/footer.yaml

sed -i.bak "s|title: \"My Documentation\"|title: \"$(esc "$SITE_TITLE")\"|" data/pages/home.yaml
rm -f config/site.yaml.bak config/footer.yaml.bak data/pages/home.yaml.bak && cd - > /dev/null
```

## 7 Patch CLAUDE.md

The template is `assets/claude-md.template.md`, beside `assets/template/`. Substitute `<SITE_NAME>`, `<DESCRIPTION>` and `<chosen_root>` (`.` for the root itself). Without it, later sessions do not know the layout, the skills or the build commands. This is the one step that edits a file the user already owns, so it has three named cases and never rewrites the rest.

| `<chosen_root>/CLAUDE.md` | Do |
|---|---|
| Absent | Write the substituted template in full |
| Present, with no `## Documentation` heading | Append the template from its `## Documentation` heading to the end of the file. Change no existing line |
| Present, with a `## Documentation` heading | Merge, as below |

Merge means: keep the user's heading and every line they wrote, then add the template lines that section does not already carry, at the end of that section. Nothing above or below the section moves.

```diff
 ## Documentation
 Docs live in ./docs. Run the linter before you push.
+
+Content: `docs/data/`. Config: `docs/config/site.yaml`.
+Run the site: `cd docs/agent-knowledge-system && ./start --detach`.
```

## 8 Validate and hand off

Run `agent-ks check config "<chosen_root>/config"` with the explicit path; `.env` does not exist yet. It must exit `0`. Otherwise fix it or report it. One entry is outside this check's reach: the `user-guide` page reads `@default-docs/user-guide`, which lives in the framework folder, so it is verified only after the clone.

The block below carries one step you cannot run yourself. The template's `engine_version` is the version current when the plugin shipped, the clone can be newer, and content outside the engine's range refuses to start. So the user sets it after the clone and before the first launch. End with:

```
Created the docs scaffold at <absolute-chosen-root>. Next step: clone the framework beside your content.

  cd <chosen_root>
  git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git
  cd agent-knowledge-system
  echo "CONFIG_DIR=../config" > .env
  grep "^export const ENGINE_VERSION" astro-doc-code/src/loaders/engine-version.ts   # set engine_version in ../config/site.yaml to this value, or the next command stops on the version gate
  ./start --detach   # installs deps when missing, then serves. Drop --detach to hold this terminal; ./start stop ends it either way.

Open http://localhost:4321. Five sections: Home / Docs / Issues / Blog / User Guide.

To customise: site identity in config/site.yaml; navbar, footer and the logo in config/ and assets/; a section with
/agent-ks-config section <name>; a theme at themes/<name>/theme.yaml (extends: "@theme/default"). The User Guide section
reads the framework's bundled docs; to drop it, delete its `user-guide:` block from site.yaml pages: and from navbar.yaml.
```
