---
description: Quickly capture an adhoc idea / half-formed issue into the issue dump (writes a subtask entry into the right dump issue — no folder ceremony).
allowed-tools: Read, Write, Edit, Bash
argument-hint: [the idea, in a phrase or a sentence]
---

You are running the `/docs-quick-idea-note` slash command from the `documentation-guide` plugin.

# Goal

Capture a half-formed thought into the **issue dump** with near-zero ceremony: one
subtask file appended to the right dump issue. No new issue folder, no
`settings.json`, no ritual — but also **no bare dump**: the entry gets a couple of
context-setting sentences so it reads cold later.

Background (from the tracker's operating rules — the `agent-ks-issues` skill carries the
full version): a thought earns a **full issue** only if you can name its component
and its first subtask in one breath. The dump is for thoughts that *fail* that test
**and have no obvious home**. Dump issues are ordinary issues tagged with the
`issue-dump` component; each dump entry is a subtask; a graduated entry is
**promoted to a real issue and deleted from the dump** (never ticked off).

# Workflow

## Step 1 — Get the idea

If `$ARGUMENTS` is non-empty, that's the idea. Otherwise ask:

> What's the idea? (a phrase or a sentence is enough)

## Step 2 — Route it (the dump is a last resort)

Before dumping, spend one quick check deciding where the thought belongs:

1. **Does it obviously belong to an existing issue?** Run
   `agent-ks issue list --search "<two or three keyword roots>" --quiet-tips`.
   - Strong match → **don't dump it.** Tell the user: "This looks like it belongs to
     `<id>` — add it there as a subtask instead?" On yes, write it as a subtask of
     that issue (next `NN_` prefix, standard frontmatter) and stop.
2. **Does it already pass the full-issue litmus test** (component + first subtask
   nameable in one breath)? If clearly yes, say so and offer to create a real issue
   instead (per the `agent-ks-issues` skill's creation recipe). Only proceed to the dump
   if the user prefers to park it.
3. Otherwise → it's dump material. Continue.

Don't over-engineer this step — one search call, one judgment. The command's whole
point is speed.

## Step 3 — Pick the dump issue

Find the dump issues:

```bash
agent-ks issue list --component issue-dump --quiet-tips
```

- **One dump issue** → use it.
- **Several** (e.g. one for backlog items, one for future features) → pick by kind;
  ask only if genuinely ambiguous.
- **None exist** → tell the user no dump issue exists yet and offer to create the
  first one (an ordinary issue: component `["issue-dump"]`, low priority, a short
  `issue.md` explaining the dump contract — capture here, promote-and-delete on
  graduation). If the tracker vocabulary has no `issue-dump` component value yet,
  add it to the tracker-root `settings.json(c)` first (with a comment marking it
  the deliberate non-stack-axis exception).

## Step 4 — Write the entry

Append a subtask to the dump issue:

1. `ls <dump-issue>/subtasks/` → next gap-spaced `NN_` prefix.
2. Write `<dump-issue>/subtasks/NN_<kebab-slug>.md`:

```markdown
---
title: "<Short imperative title>"
state: open
---

<Two or three sentences of context: what the idea is, what prompted it, where the
relevant code/docs live if known. Enough that someone reading it cold in three
months understands what was meant — never just the raw phrase.>

Graduates to a real issue when it can name its component + first subtask
(promote and delete this entry).
```

Preserve the user's wording where it carries meaning; add context around it, don't
rewrite it away.

## Step 5 — Confirm

Reply with one line — where it landed and the path:

```
Captured → <dump-issue-id>/subtasks/NN_<slug>.md
```

No validation ceremony needed for a single subtask write; run
`agent-ks check issues` only if you touched settings files (Step 3 creation path).

# Tone & guardrails

- **Speed is the feature.** One search, one file write, one confirmation line. Don't
  interrogate the user about priority/labels/components — the dump exists to defer
  those decisions.
- **Never create a new issue folder for the idea itself** — that's exactly the
  ceremony this command avoids (the only folder ever created is the first dump
  issue, once, with consent).
- Don't tick off or delete existing dump entries here — graduation is a separate,
  deliberate act.
- If the user's "idea" is actually a bug report with an obvious home, route it there
  (Step 2) — the dump is for the unhomed only.
