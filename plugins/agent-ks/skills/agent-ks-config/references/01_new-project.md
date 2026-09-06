# New project

Copy the starter template into the folder the user picks. Substitute the site name, title, description and repo URL. Walk the steps in order. Ask before you write. Summarise at the end.

## The result

The confirm block at step 5 names every file this writes. Two things are outside that list. `agent-ks start` clones the framework into `<chosen_root>/agent-knowledge-system/`, beside `config/` and `data/`. That is consumer mode. [03_site-config.md](./03_site-config.md) draws the full tree. A patched `CLAUDE.md` at `<chosen_root>/CLAUDE.md` tells later sessions the layout, the skills and the build commands.

## 1 Pre-flight

```bash
for p in config/site.yaml default-docs/config/site.yaml agent-knowledge-system; do test -e "./$p" && echo "BLOCKER, docs already set up: $p"; done
```

This loop guards the repo, so it runs on `./`. If a blocker prints, stop with:

> Docs are already set up here (`<path>` exists). Add a section instead ([02_add-section.md](./02_add-section.md)), or remove the existing structure first.

## 2 Locate the template

The template is `assets/template/` beside this skill's `SKILL.md`. Resolve it from the skill file you loaded. In Claude Code, `${CLAUDE_PLUGIN_ROOT}/skills/agent-ks-config/assets/template` names the same directory. The standalone binary's path does not locate plugin assets.

Install the toolkit using [the installation reference](../../agent-ks-cli/references/installation.md) before validation, because scaffold setup needs `agent-ks check config`. Confirm `agent-ks --version` succeeds.

## 3 Scope

Ask: whole repo, or a subfolder? A subfolder is right when the repo already holds source code. The default subfolder name is `docs`. For the whole repo, set `chosen_root="."`. For a subfolder, ask the name, create the folder if it is missing, and set `chosen_root="./<name>"`. Print `realpath "$chosen_root"` and confirm it before you write.

Then list the collisions. A collision is a file or folder in `$chosen_root` that the template also carries. Step 6 writes into `$chosen_root`, so the test belongs here, where that root is known. A file and a folder get different messages. `rsync --ignore-existing` skips an existing file, but it still adds new files inside an existing folder. A collision is not a blocker. Copy every line this prints into the confirm block at step 5. Then the user reads it before anything is written.

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

Keep them in `SITE_NAME`, `SITE_TITLE`, `DESCRIPTION` and `REPO_URL`. `REPO_URL` is a full URL. When the user gives a non-default answer, repeat it back, so they can correct a typo. Each answer goes inside a double-quoted YAML value. So when an answer carries a `"` or a `\`, ask for another one.

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
  .env.example                 (a reference copy of the keys; the native CLI supplies config per invocation)

Already here (the step-3 lines, or "none"):
  <a file: yours is kept and the template's copy is skipped>
  <a folder: it stays, and the template's files are added inside it>

Will patch CLAUDE.md at <chosen_root>/CLAUDE.md (created if absent), then provide the `agent-ks start` command.

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

The template is `assets/claude-md.template.md`, beside `assets/template/`. Substitute `<SITE_NAME>`, `<DESCRIPTION>` and `<chosen_root>`. For the repo root itself, `<chosen_root>` is `.`. Without this patch, later sessions do not know the layout, the skills or the build commands. This is the one step that edits a file the user already owns. So it has three named cases, and it never rewrites the rest of the file.

| `<chosen_root>/CLAUDE.md` | Do |
|---|---|
| Absent | Write the substituted template in full |
| Present, with no `## Documentation` heading | Append the template from its `## Documentation` heading to the end of the file. Change no existing line |
| Present, with a `## Documentation` heading | Merge, as below |

Merge means this. Keep the user's heading and every line they wrote. Then add the template lines that the section does not already carry, at the end of that section. Nothing above or below the section moves.

```diff
 ## Documentation
 Docs live in ./docs. Run the linter before you push.
+
+Content: `docs/data/`. Config: `docs/config/site.yaml`.
+Run the site: `cd docs && agent-ks start --detach`.
```

## 8 Validate and hand off

Run `agent-ks --config-dir "<chosen_root>/config" check config --json` to validate the chosen directory. References to bundled user-guide content become available after the framework clone. Report those missing targets explicitly if the viewer has not been installed yet.

When startup is requested, run `agent-ks --config-dir "<chosen_root>/config" start --detach`. It clones the framework into the project when missing and supplies config through the environment. It installs viewer dependencies through the framework launcher. Resolve an engine-version mismatch through [the migration protocol](./08_migrations.md); do not blindly bump the version field.

End with the created root, validator result and the next command:

```bash
cd <chosen_root>
agent-ks
agent-ks start --detach
```

If the viewer was started, include the reported URL. The config, navbar, footer, assets and themes remain under the chosen root. The User Guide page reads the framework's bundled docs.
