---
title: "06 — The shape of a plan: folder-of-stages vs one file"
---
**Resolved → [The plans section (decided)](../notes/50_plans-section-spec.md)** — the decided spec. This thread is the
argument and is kept for the reasoning, including where it was overturned.


# The shape of a plan

Follows [thread 03](./03_options_plans-as-references.md), which settled *what a
plan is* (order and blocking, storing no status) and got the four scoping
questions answered. This thread settles *what it looks like on disk*.

**The governing constraint, from Sid (2026-08-02), which decides ties:**

> *"The system should be designed to make your implementation faster by providing
> me observability, instead of us focusing a lot of time on documenting stuff."*

So a shape that the framework can **render** as a dashboard beats a shape someone
has to **write** as a status report. That is the axis, not elegance.

## What a plan must express

From Sid, and this is the requirements list every option is judged against:

1. A plan holds **ordered stages**; each stage works toward a single goal.
2. Each stage lists subtasks — **some linked, some not** (small things that do not
   deserve a subtask of their own).
3. **Extra subtasks can be added to a stage** at any time.
4. **A new stage can be inserted** at any point.
5. **The order itself can be altered.**
6. Stages carry: name, one-line outcome, who it is waiting on, status, and
   related agent logs.
7. Each stage has a **todo list** and a **questions list**, both nestable.

Requirements 3–5 are the interesting ones. They are why the naive answer —
number the stages 1, 2, 3 — fails.

---

# Proposal A — folder of stages, hash-named, with an order file

```
plans/
└── NN_<plan-name>/
    ├── settings.json
    ├── order.json          ← the order, by reference
    └── <4-hex>.md          ← one file per stage
```

Stage frontmatter: `Name`, `Outcome`, `Who`, `Subtasks[]`, `Status`,
`Agent-logs[]`. Body: `## Todo` and `## Questions`, both nestable.

**The insight it is built on:**

> **Order must not be identity.** If a stage's number is also its name, then
> inserting between 2 and 3 produces "2.5", and every existing reference to
> "stage 3" now means something else.

> [!NOTE]
> **Half of this survived and half did not.** The failure it names is real — but
> its cause is *consecutive* numbering, not numbering as such. **Gap-spacing
> fixes it without any abstraction**, so the prefix can safely be the identity
> after all. See [the reversal](#the-prefix-is-the-id--reversed-and-why).

**What it costs.**

| Cost | Why it matters here |
|---|---|
| `a3f9.md`, `7c21.md`, `e04b.md` in a file tree, a git diff, a link | Directly against the governing constraint. The UI would render `Name:` fine, but the filesystem, `git log`, and every raw link become unreadable |
| `order.json` is a second file that must agree with the folder listing | A stage added and not registered is an orphan that renders nowhere. New sync surface — the exact failure *"no file stores a fact another file owns"* warns about |
| A collision-safe hash generator to write and test | New code for a problem the framework already solved |

---

# Proposal B — one file per plan

`plans/NN_<plan-name>.md`. Like the current `agent-memory/plans/` file, plus
ordered sections, a questions section, a results section, and status in
frontmatter.

**What it gets right:** you read the whole plan in one open — which is itself
observability. Reordering is moving a block. There is no ordering mechanism at
all, which is the cheapest possible correct answer, and no sync surface.

**What it costs:** no per-stage status or `who` that anything can render. Those
become prose, and prose does not colour a sidebar. For an overnight run,
*"which stages are waiting on Sid"* is the single most valuable view, and B can
only answer it by being read.

---

# Recommendation — C, which is A without its two costs

**Folder per plan, one file per stage. The gap-spaced numeric prefix is both the
order and the id. No `order.json`, no hashes.**

```
plans/
└── 01_decoder-and-retention/
    ├── settings.json          ← plan status + title
    ├── overview.md            ← reserved: the plan's intro, never a stage row
    ├── 10_decoder-swap.md     ← the prefix is the order AND the id
    ├── 20_journal-compat.md
    ├── 30_retention.md
    └── 40_concurrency.md
```

Against the five hard requirements:

| Requirement | How C does it |
|---|---|
| Insert a new stage | `23_` between `20_` and `30_` — see the gap convention below |
| Alter the order | Renumber prefixes. That is a **move**, and `agent-ks move` rewrites every reference to it |
| Add subtasks to a stage | Append to its `subtasks:` list |
| Stages ordered | Sorted by prefix, already how every other section sorts |
| Stable reference | The path, kept correct by `move` |

**What it removes from A:**

- **No `order.json`.** The folder listing *is* the order, so there is no second
  file to disagree with it and no orphan state.
- **No hashes.** `20_journal-compat.md` is readable in a tree, a diff, a link
  and a conversation. `7c21.md` is readable in none of them.
- **No new code.** `parseOrderPrefixLoose` already splits prefix from name;
  gap-spaced `NNN_` prefixes are already how subtasks, notes and agent logs sort.

**What it keeps from B:** the single-page read — recovered, not lost. The plan
renders as **one page** with a generated table at the top and every stage inlined
below it (see *The rendered view*). So B's one real advantage survives, and it
arrives generated rather than hand-written, which is the whole point.

## Say "stage", not "section"

`section` already means a top-level issue folder — notes, brainstorm, subtasks,
agent-log. Using it for a unit *inside* a plan repeats exactly the collision that
forced `notes/` → `debrief/` one thread ago, and it costs a disambiguating clause
every time either is mentioned. **Stage** is free and already how the plan work
is described in conversation.

## Stage frontmatter

Sid's list, with three changes and the reasons:

```yaml
---
title: "Journal compatibility"          # NOT `Name` — `title` is required by the
                                        # framework on every markdown file, so a
                                        # second name field is a duplicate
outcome: "6.7 journals still open in the new reader"   # one line
who: sid                                # sid | claude | kaustubh — who it waits on
status: in-progress                     # the 7-value issue vocabulary
subtasks:
  - "[Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)"
  - "[Byte stability](../../subtasks/13_memory/86_byte-stability.md)"
agent-logs:
  - "[Overnight, stages 3-5](../../agent-log/030_lp_overnight-stages-3-5/summary.md)"
---

## Todo
- [ ] [Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)
  - [ ] the reader half
- [ ] rename the fixture — too small for its own subtask

## Questions
- [ ] Does the 6.7 reader need to survive a truncated tail?
  - [ ] If yes, does it refuse or repair?
```

**Markdown links inside frontmatter work, and this was checked, not assumed.**
`agent-ks move` scans **every line** of a file with a markdown-link regex and does
not skip frontmatter (`scripts/docs/move.mjs:209–225`) — so moving or renaming a
subtask rewrites the plan's reference to it automatically, today, with no
framework change. YAML needs the strings quoted; that is the whole tax.

**No `# H1` in a stage file.** The body starts at `## Todo`. The heading is
generated as `<prefix> <title>` — writing one here would be a second copy of a
name the frontmatter already owns.

**The path is truth; the link text is a reading aid.** The renderer resolves the
path and pulls the subtask's live title and status. A stale link text therefore
renders nothing and costs nothing — which is what keeps this consistent with
*plans store no status*.

**Not linking every todo is deliberate.** A todo may point at a subtask or stand
alone; small things should not be forced into a folder of their own. Stated
explicitly so nobody later "fixes" it into a rule.

---

# The rendered view — one page per plan

**Decided (sidhantha, 2026-08-02).** A plan does not render as a folder of
separate sub-pages. It renders as **one page**, and the stage frontmatter is what
builds the table at the top of it. This is the payoff for stages being files:
the observability is generated, not written.

```
┌─ /plans/01_decoder-and-retention ─────────────────────────────────┐
│                                                                   │
│  overview.md — what this plan is for                              │
│                                                                   │
│  ┌─ THE PLAN TABLE ───────────────────────────────────────────┐   │
│  │  #    Stage            Outcome        Who    Subtasks  ▸   │   │
│  │  10   Decoder swap     …one line…     claude 0/1/0/3  done │   │
│  │  20   Journal compat   …one line…     sid    2/1/1/0  wip  │   │
│  │  30   Retention        …one line…     claude 4/0/0/0  open │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  # 20 Journal compatibility        ← GENERATED heading           │
│     …the stage file's body…                                       │
│                                                                   │
│  # 30 Retention                                                  │
│     …                                                             │
└───────────────────────────────────────────────────────────────────┘
```

## The stage heading is generated — stage files carry no `#`

The heading is `<prefix> <title>`, built from the filename and frontmatter. A
stage file's body starts at `## Todo`. Writing an `# H1` inside it would be a
second copy of a name the frontmatter already owns — the same rule as everywhere
else here.

## The table IS the index — do not render both

A separate auto-generated index listing the same stages the table already lists
is duplication **in the UI**, which is the same defect as duplication on disk.
The Stage Name cell links to the stage's anchor; that is the index.

This also dissolves the "do we descend into subheadings?" question — nothing
descends, because there is no second list.

## The Subtasks column is the framework's existing categories — measured

Sid's four buckets map **exactly** onto `CATEGORIES` in
`src/loaders/issue-status.ts`, and `IssueSubtask.category` is already derived at
load time. So the column is: resolve the `subtasks:` references, group by the
`category` they already carry, count.

| Column bucket | Framework category | Statuses in it | Default colour |
|---|---|---|---|
| Open | `not-started` | `open`, `blocked` | `#888888` grey |
| Progress | `in-progress` | `in-progress` | `#61afef` blue |
| Review / input needed | `review` | `input-needed`, `review` | `#f0c674` yellow |
| Completed / closed | `closed` | `done`, `dropped` | `#7ec699` green |

**The colours Sid asked for are already the defaults.** No new logic, no new
palette, no new vocabulary — and a tracker overriding `fields.status.colors`
restyles the plan table for free.

**Only the `subtasks:` list counts.** Unlinked todos in the body are todos, not
subtasks, and must not enter the tally — otherwise the column silently measures
two different things.

## Stage status is the full seven — one vocabulary, not a new one

Stages use the **issue/subtask vocabulary unchanged**: `open` · `blocked` ·
`in-progress` · `input-needed` · `review` · `done` · `dropped`. That is what
gives Sid the read he asked for — tick, cancelled, review, not started, blocked,
question mark — and it comes from the same module, with the same icons,
validation and colours already built.

`issue-status.ts` states the set and the category grouping are **fixed in
framework code**; using them for stages costs nothing and adds nothing.

> [!IMPORTANT]
> **This narrows the open vocabulary question.** Three carriers now exist, and
> only one of them is genuinely different:
>
> | Carrier | Vocabulary | Verdict |
> |---|---|---|
> | issues · subtasks · **plan stages** | the canonical 7 | fine — one shared module |
> | agent logs (`settings.json`) | a 5-value **subset** of the same 7 | fine — a subset, not a dialect |
> | iteration files (frontmatter) | `not-started` · `in-progress` · `success` · `failed` | **the outlier** |
>
> Worse than it looked: **`not-started` is already a CATEGORY id** in
> `issue-status.ts`, so the iteration vocabulary reuses an existing word for a
> different kind of thing. Settle this before either ships
> ([the framework spec](../notes/40_agent-log-settings-framework-spec.md)).

## The prefix IS the id — reversed, and why

> [!IMPORTANT]
> **This section previously argued the opposite** (*"call it Order, never id;
> anchor on the name"*). Sid overturned it 2026-08-02 and was right. Kept as a
> reversal because the reasoning is the useful part.

**The argument that settles it: there is no indirection layer.** A reference in
this tracker is a markdown path — `[…](../plans/01_decoder/20_journal-compat.md)`
written literally — and that path **contains the prefix**. So "identity is the prefix-stripped
name" is only true if something resolves names to paths. That means a new link
syntax and a resolver, against the framework's own rule that internal links are
standard markdown relative links.

Sid's framing, which is the general form:

> **Either abstract identity completely (hashes), or do not abstract it at all
> (filenames). You cannot have it both ways.**

Filenames won for readability
([the folder-of-stages recommendation](#recommendation--c-which-is-a-without-its-two-costs)),
so the prefix is part of the reference, and that is fine:

- **Renumbering is a move**, and `agent-ks move` is link-aware — it rewrites
  every reference, including the ones in frontmatter
  (`scripts/docs/move.mjs:209–225`, verified).
- So the table column is **`id`**, it shows the prefix, and **"stage 20" is the
  correct way to refer to a stage.**
- No `id:` frontmatter field. No uniqueness check on prefix-stripped names —
  there is nothing for it to protect.

**Where the earlier reasoning does still hold:** the *order-is-not-identity*
insight was right about **stage numbers in a plan**, which was A's real
contribution. It is wrong about **filenames**, because a filename is a location,
and locations are what `move` exists to change.

## Gap numbering — the convention

**Decided (sidhantha, 2026-08-02).** Two digits, opening at multiples of ten:

```
10  20  30  40 …          ← nine free slots between any two stages
```

Inserting between `20` and `30`, spread rather than crowd:

```
20  23  26  29  30        ← not 21, 22, 23 — leaves room to insert again
```

The rule is **spread into the gap, do not fill from one end.** Filling from the
bottom (`21, 22, 23`) exhausts the space next to `20` while leaving `24`–`29`
empty, and the next insertion at that spot has nowhere to go.

Two digits gives nine top-level stages with nine gaps each. A plan needing more
than nine stages is usually two plans — but the prefix parser accepts 2–5
digits, so `NNN` is available without any change if one genuinely needs it.

## What is still open

- **Does a stage need `blocked-by` as a field?** Thread 03 says blocking edges
  are a thing only the plan knows, including blocked-on-a-human. `who:` covers
  the human case. Cross-stage blocking has no home yet.
- **What closes a plan, concretely** — a `status` in `settings.json`, and what
  the closing record looks like. Thread 03 says what shipped and what was dropped
  rather than finished. Where that is written is undecided.
- **Whether a section registry replaces the ten hard-coded files.** Raised in
  [the execution subtask](../subtasks/040_execution/010_code-the-plans-section.md);
  a plans section makes it eleven.
- **Where the plan's own intro lives.** Proposed: a reserved `overview.md` in the
  plan folder, rendering as the page intro and never appearing as a stage row —
  the same reserved-name pattern as `working/` and `debrief/` in an agent log.
- **Do individual stage pages still exist?** The sub-doc machinery gives every
  markdown file a route for free. Recommended: keep them reachable, link nothing
  to them, and make the single plan page the canonical view. Two URLs for one
  piece of content is tolerable; suppressing the route is work for no gain.
