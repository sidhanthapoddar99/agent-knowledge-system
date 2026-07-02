---
title: Review and Close
description: The human's side — reviewing agent work, deciding accept or reject, writing the close-out
sidebar_position: 3
---

# Review and Close

When an issue (or subtask) is flipped to `review`, it's waiting for you. Signing it off to `done` — like dropping it to `dropped` — is a transition that stays on the human side in the autonomous loop; everything up to **review** an agent can do itself. This page is the operating manual for the reviewer.

## Why review stays human

In a fully-autonomous tracker, AI would close its own work. Two problems:

1. **Silent breakage.** AI thinks it's done; something subtle broke. Shipped anyway. User finds out when the site is wrong.
2. **No audit.** No one ever actually read the diff. The tracker says `done` but nobody can confirm.

The review state is a deliberate trust boundary. The AI's claim is "I think this is done." The human's job is to **verify**. Without this step, you're either over-trusting or babysitting — no middle ground.

See [Design Philosophy](../design-philosophy) for the full argument.

## When something shows up in your queue

Navigate to the tracker's list view → **Review tab**. This shows:

- Issues with `status: review`
- Issues with `status: open` but one or more subtasks in `review` (subtask-debt promotion)

The count on the tab tells you how much human attention is pending. See [List View](../ui/list-view).

## Reviewing an issue

### 1. Read the agent-log

**Start here.** The agent-log is the story of what was tried. Entries have Goal / Approach / Result / Next. You can scan the Results column (success / failed / in-progress) to see the arc of the run.

If the log is empty or sparse, that's itself a signal — the work wasn't captured. Ask for a log entry before reviewing further.

### 2. Read the summary comment or closing log

A good hand-off includes a summary: what shipped, what's in diff, links to commits or PRs. If missing, it's the first thing to ask for.

### 3. Check the artefacts

Per the review checklist, there should be **verifiable artefacts**:

- Commit / PR for code changes
- Test output for behaviour changes
- Screenshot for UI changes
- Before/after metrics for performance changes

Open them. Actually look. "The agent said it's done" is not review.

### 4. Spot-check the subtask states

Look at the subtask checklist. Anything `open` or `dropped` without a reason? Anything `review` that you haven't flipped to `done` yet? The subtask graph should make sense:

- Everything `done` → work done
- Everything `dropped` → reasons visible in comments / agent-log
- Everything `review` → the batch you're looking at now

### 5. Decide

Three options:

- **Accept** — flip `review → done`. See [Accepting](#accepting).
- **Reject** — flip `review → open`, write a comment explaining what needs to change. The agent picks up again.
- **Partial accept** — close individual subtasks but push back on others. Flip specific subtasks to `done`, leave or bump others back to `open`.

### Accepting

1. Flip each subtask that's in `review` to `done` (in the UI's subtask checklist, or manually edit frontmatter)
2. If the issue-level status is `review`, flip that to `done`
3. **Trigger a closing agent-log entry** — the convention is: when the human closes, the agent's next pickup writes a final log summarising shipped state (commit hash / PR number). This closes out the audit trail cleanly.

After closing:
- The issue moves to the Closed tab
- It stops consuming review capacity
- It stays on disk — don't delete

### Rejecting

Flip `review → open` (subtasks, issue, or both depending on scope) and write a comment:

```markdown
---
author: sidhantha
date: 2026-04-21
---

Pushback on subtask 02 — the preset-view hydration is double-loading on
cold refresh, visible as the chip strip flickering. Need to guard the
second hydration behind a mount flag.

Subtask 01 and 03 look good, leaving those in review.
```

The next agent pickup reads the comment and resumes. Subtask status back to `open` is the signal: *this needs more work*.

### Partial accept

Common when most of a batch is good but one subtask needs iteration:

1. Flip subtasks `01`, `03`, `05` → `done` (accepted)
2. Leave subtask `02` at `review` — or bump to `open` with a comment explaining
3. The parent issue's status often stays at `review` with subtask-debt showing partial progress

## Patterns for good review

### Review in batches

Don't context-switch for every subtask that hits `review`. Let 2–3 batches pile up, then review them together. Reduces thrash.

### Keep the review bar consistent

If you sometimes accept work without reading the diff, the agent learns that's the pass/fail line. If you always read the diff, it learns to ship diff-readable work. You're training the loop.

### Ask for more evidence when missing

"Show me the test output" is a legitimate push-back. Flip to `open` with the request. The alternative is accepting blind, which erodes the trust boundary.

### Write close-out notes for complex issues

After closing a large issue, leave a final comment or closing agent-log entry summarising what shipped. Future readers searching for *how we built X* find the story.

## What to do when reviewing goes wrong

### Agent closes something it shouldn't have

Happens if the skill rules aren't being followed. Flip back `done → open`, write a comment noting the skill violation, and adjust the skill's prompt if this keeps happening.

### Log says success, diff looks broken

Hard to investigate. Flip `review → open`, ask in a comment: *"Log says X, but I see Y in the diff — can you re-verify and explain the mismatch?"* The next iteration's Goal becomes reconciling the claim with reality.

### No log written at all

"Cannot review without audit trail. Flip to `open` with a comment requesting agent-log entry." Do not accept blind. See [Agent Log](../sub-docs/agent-log).

## Dropping during review

If you realise the issue shouldn't proceed at all:

1. Flip to `dropped`
2. Write a comment with the reason (required for `dropped`)
3. Close-out log entry is still useful — summarise what was tried and why it won't ship

## See also

- [Lifecycle and Review](../lifecycle-and-review) — the seven-status / four-category model in detail
- [Work an Issue](./work-an-issue) — the other side of the handoff
- [Using with AI](../using-with-ai) — how agents are trained to respect the review boundary
- [Agent Log](../sub-docs/agent-log) — what to read first, every review
