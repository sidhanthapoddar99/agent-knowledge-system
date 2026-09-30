---
title: "Security for owners"
---

Sharing opens your running project to other people. This page tells you exactly who can reach the server, what each kind of key allows, and what to do when a key leaks. Read it before you hand out an `edit` key.

## Who can reach the server

| You started the server with | Who can reach it |
|---|---|
| `agentks start` | **Only this machine.** The server listens on the loopback addresses (`127.0.0.1` and `::1`), so nothing on the network can connect. It also answers only requests addressed to this machine, and only its own pages may open its data connection. So a website open in another browser tab cannot read or change your project. No key is needed |
| `agentks start --share` | **Anyone who can reach the address and holds a valid key.** Without a key, a visitor sees only the key prompt. This includes you: in share mode even requests from this machine need a session, which is why agentks prints an owner link |

## What each key allows

| Action | `read` key | `edit` key |
|---|---|---|
| Read every page of the project, **drafts and unpublished sections included** | Yes | Yes |
| See who is on a page and watch edits appear live | Yes | Yes |
| Edit any existing markdown page, tracker file or diagram in the content sections | No | Yes |
| Change an issue's status, labels or priority, and add comments | No | Yes |
| Paste an image into a page's `assets/` folder | No | Yes |
| Use the Problems, Cache and System tools of the dev toolbar | No | Yes |

**No key can** create, rename, move or delete files (the only exceptions are a pasted image and a new comment), change `config/`, a `settings.json` file or a sidecar, reach `.git` or anything outside the project, or run commands on your machine.

> [!WARNING]
> An `edit` key lets its holder change **any existing content file** in the project. Give one only to someone you would trust to edit the repository, and review their changes with `git diff` before you commit.

> [!IMPORTANT]
> A `read` key shows the whole project as the local app shows it, including draft pages and sections marked `publish: false`. Those settings only keep content off the published site ([publishing](../55_publishing/01_overview.md)).

## Where keys and records live

| What | Where | Who can read it |
|---|---|---|
| A fingerprint (hash) of each key, and the open sessions | `~/.agentks/share/<project key>.json` | Only your user account |
| The journal of who edited which file | `~/.agentks/share/<project key>.edits.jsonl` | Only your user account |

The project key is the project's id in your machine home; `agentks resolve-context` prints it. Neither file holds a key's secret or the contents of your files. agentks never writes keys or session ids to its logs, and never stores a key in the project or in `config/.env`.

## Safe habits

- **One key per person**, with their name as the label. You can then revoke one person without affecting the others, and `agentks share log` names the right person.
- **Prefer `read` keys.** Give `edit` only to people who need to change files.
- **Use HTTPS beyond a trusted network.** Without a tunnel or reverse proxy, keys and pages cross the network unencrypted ([Sharing a project](./20_sharing-a-project.md#use-a-tunnel-beyond-a-trusted-network)).
- **Revoke keys when the work ends.** `agentks share list` shows when each key was last used.
- **Keep keys out of files.** Never put a key in the project, in a commit, or in an issue. The agentks skills tell AI agents to hand a key only to you.
- **Stop sharing when you are done.** Restart the server without `--share`.

Guessing a key does not work: a key holds about 130 random bits, and agentks slows down any address that keeps presenting wrong keys.

## When a key leaks

1. **Revoke it at once.** Its sessions end and its visitors are disconnected within about a second.

   ```bash
   agentks share list           # find the key's id
   agentks share revoke <id>    # or: agentks share revoke --all
   ```

2. **See what it changed.** List the files it edited, then look at the changes:

   ```bash
   agentks share log
   git diff
   ```

3. **Issue a new key** to the person who should have access, with `agentks share create`.
