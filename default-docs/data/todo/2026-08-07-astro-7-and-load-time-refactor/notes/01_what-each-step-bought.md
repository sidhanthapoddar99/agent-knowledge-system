---
title: "What each step bought"
---

Four steps landed. This note says what each one did, **in plain words first and
numbers second**. A number alone does not tell you if your work got better.

Each step is scored on the same four things: **speed, memory, disk, and what it
means for you.**

All values were measured on one machine on 2026-08-07. Nothing is a guess. When a
value was not measured, the note says so.

# First: read this, or the speed numbers will mislead you

Every speed value below is one of two kinds. They are not the same, and you must
not compare one with the other.

```
   YOU START THE SERVER
        │
        ├──► the first page you open   ← "protocol A"
        │      The server must also prepare shared code.
        │      You pay this one time.
        │
        └──► every page after that     ← "protocol B"
               The shared code is ready.
               Only the work for that page is left.
```

**Protocol B is the number you meet all day.** You are already working. You click a
link. This is normal use.

**Protocol A is the number you meet one time**, just after you start the server.

The difference between them is about one second. That second is the server
preparing shared code. No step in this issue changes it.

**People feel time in steps.** Below 0.1 seconds, a page looks instant. At 1 second,
you notice a pause, but you keep your attention. Above 2 seconds, your attention
breaks and you look somewhere else. Keep this in mind when you read the tables.

# The scoreboard

| Step | Speed | Memory | Disk | What it means for you |
|---|---|---|---|---|
| 1 · Index loader | `/todo` **1.206 s → 0.155 s** | not measured alone | — | **The tracker stops getting slower as it grows** |
| 2 · Theme CSS | no change on the server | not measured alone | **−62.8 MB** | Each page sends 25% fewer bytes to your browser |
| 3 · Shared caches | no change | one cache, not two | — | A fault is fixed. It also made step 4 safe |
| 4 · Astro 7 | build **13.9 s → 7.1 s** | build **2,049 → 1,239 MB** | **+106 MB** | Builds are twice as fast. The server starts slower |

---

# Step 1 — the index loader reads only the file headers

[Subtask: index loader reads frontmatter only](../subtasks/010_load-time/010_index-loader-frontmatter-only.md)
· [stage 20](../plans/01_implementation/20_load-time-fix.md) · commit `ae16663`

## What changed

The tracker list page shows a table. The table holds titles, dates, and status
marks. It does not show the text of any issue.

But the old code read **and converted the full text of every file** to build that
table. It converted 861 files to show 54 rows. It then threw all that text away.

The new code reads only the small header at the top of each file. That header holds
the title and the status. The code does not touch the body text.

## What you feel

| What you do | Before | Now | What you feel |
|---|---|---|---|
| Click a tracker link while working | 1.206 s | **0.155 s** | A clear pause becomes no pause |
| Open the tracker as your first page | 2.570 s | **1.039 s** | A long wait becomes a short wait |
| Open a page you already opened | 0.034 s | 0.033 s | No change. It was already instant |
| Open one issue as your first page | 2.543 s | **1.576 s** | Still slow, but better |

Before, every click on the tracker sat in the range where you notice the wait. Now
it sits in the range that looks instant.

## Why it matters — this is the important part

**You did not buy one second. You removed a limit.**

The old cost grew with the size of your tracker. More issues meant more files to
convert. More files meant a longer wait. You saw this yourself: *"it takes 10 sec
for real large repo and increase with size."* That is exactly what the old code did.

```
  OLD   the wait grows as your tracker grows
        54 issues  →  1.2 s
        many more  →  much worse

  NEW   the wait stays small as your tracker grows
```

The other three steps make the same work faster. **Only this step removes work.**
That is why it is the one that answers your original problem.

## Memory and disk

Memory was not measured for this step alone. The change stops holding 861 converted
pages in memory at one time, so it must use less. But there is no measurement, so
no number is claimed.

Disk does not change. The pages that go out are the same bytes.

---

# Step 2 — the theme stylesheet is sent one time, not in every page

[Subtask: theme CSS delivery](../subtasks/010_load-time/020_theme-css-delivery.md)
· [stage 20](../plans/01_implementation/20_load-time-fix.md) · commit `e22df2a`

## What changed

Every page carried a copy of the same 65 KB stylesheet inside it. The same bytes,
1,016 times.

Now the stylesheet lives at one address, `/theme.css`. Each page points to it. Your
browser reads it one time and keeps it. Every page after the first uses the copy it
already holds.

## What you feel

The server is not faster. The measured time did not move: 0.155 s before, 0.162 s
after. That difference is noise.

**Your browser receives less.** After the first page, each page is 25% smaller.

| | Before | Now |
|---|---|---|
| `/todo` sent to the browser (compressed) | 51,928 B | **40,167 B** |
| Stylesheet bytes inside each page | 64,938 B | **0** |

On a fast local machine you may not see this. On a slow network you will.

## Disk — the largest single effect in this issue

| | Before | Now |
|---|---|---|
| All built pages | 136.6 MB | **73.8 MB** |

**62.8 MB of your built site was one stylesheet, copied 1,016 times.**

## Why it matters beyond its own numbers

This step also makes partial rebuilds possible. Before it, if you changed one
colour, **every page changed**. No system can skip work when one small edit rewrites
everything. Now a colour change rewrites one file.

See [the partial rebuild note](../brainstorm/01_partial-rebuilds.md).

Artifact pages keep their own copy. There are 277 of them, and they must work alone
as single files. That is their contract.

---

# Step 3 — the caches are shared, not duplicated

[Subtask: module-level cache state](../subtasks/030_correctness/010_cache-module-state.md)
· [stage 30](../plans/01_implementation/30_de-risk-the-upgrade.md) · commit `033c5ff`

## What changed

The build tool loads the same code file two times. One copy runs at start-up. One
copy answers your page requests. Both copies were alive together.

Each copy held its own cache. So there were two caches, not one.

The result: when the system tried to clear the cache, it cleared the copy that
answers no requests. The other cache kept its old content.

This was proved, not assumed. Each copy was counted as it loaded.

## What you feel

**Nothing. This step makes no page faster.**

Your pages were still correct, because a second check on file dates caught changes
on its own. The broken part was hidden behind that check.

## Why it matters

Two reasons, and both are about later work.

**It made step 4 safe.** The upgrade was more likely to break while this fault was
present.

**It weakens the case for the rewrite.** This fault is the main reason given in
[the runtime migration issue](../../2026-05-08-runtime-stack-migration/issue.md) for
moving to Go. The fault is real. But it is smaller than that issue describes, and it
is now fixed in place.

---

# Step 4 — Astro 5.17.1 to 7.2.0

[Subtask: the upgrade](../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md)
· [stage 40](../plans/01_implementation/40_the-upgrade.md) · commit `82c7262`

## What changed

The build tool under this project moved forward by two major versions. The part
that packs the code was replaced with a faster one written in Rust.

We did not choose this for speed. We expected no speed at all. **That expectation
was wrong.**

## What you feel — the good

| | Before | Now | |
|---|---|---|---|
| Full build | 13.7–15.1 s | **7.1–7.3 s** | About two times faster |
| Memory used by the build | 2,049 MB | **1,239 MB** | 38% less |
| Your first page after start | 1.039 s | **0.590 s** | Almost two times faster |
| Open one issue as your first page | 1.576 s | **1.245 s** | A little faster |

**The memory result is the best one here.** Memory was the first problem on your
list. It cost no code change. It came only from the version change.

## What you feel — the bad

| | Before | Now | |
|---|---|---|---|
| Server becomes ready | ~400 ms | **~1,057 ms** | 650 ms slower |
| All built pages | 73.8 MB | **79.9 MB** | 8% larger |
| `node_modules` folder | 419 MB | **525 MB** | 106 MB larger |

The server takes longer to start. You meet this every time you restart. Your first
page then arrives sooner, so you wait less in total. **But the slow start is real.**

## What did not change

A page you already opened still takes 0.034 s. It was instant before. It is instant
now. **This step does not touch the paths that were slow.** Step 1 did that.

The count of type errors is still 27. The upgrade added none. It also fixed none.

## One thing broke, and it was our fault, not Astro's

Our code found its own folder by counting directory levels upward. That worked only
because the old build tool put its files at a matching depth.

The new tool puts them one level deeper. So the code looked in the wrong place, and
every theme search failed. The build stopped on the first page.

**This fault was always there.** The upgrade only made it visible. The code now
searches for a marker file instead of counting levels.

---

# Two faults found by reading, not by measuring

Neither one appears in any timing. Both were real.

**The cache clear command never worked.** It looked for a name that no entry used.
Only the "clear everything" form did anything.

**The folder search counted levels**, described above.

Neither was found by a test. Both were found by reading the code while doing
something else.

---

# Where you started, and where you are now

| | Start of day | Now |
|---|---|---|
| Click a tracker link while working | 1.206 s | **0.155 s** |
| Open the tracker as your first page | 2.570 s | **0.590 s** |
| Full build | 13.9 s | **7.1 s** |
| Memory used by the build | 2,049 MB | **1,239 MB** |
| All built pages | 136.6 MB | **79.9 MB** |
| Bytes sent for one tracker page | 51,928 B | **40,167 B** |
| Server becomes ready | ~400 ms | ~1,057 ms — **worse** |
| `node_modules` folder | 419 MB | 525 MB — **worse** |
| Type errors | 27 | 27 — **not fixed** |

While this work ran, real pages loaded in your browser in **14 to 17 ms**.

# What was not measured

These gaps are stated because a list of only good news is not a measurement.

**Memory of the running server, against a fair comparison.** This is the number
closest to your first complaint, and it is still missing. The server now uses
229 MB at start, 557 MB after four pages, and 597 MB after about forty pages. **No
comparison with the old version is claimed.** The old figures came from a different
set of requests, so the two cannot be compared. A fair test still needs to be run.

**Memory for steps 1, 2 and 3 alone.** Only whole-build memory was measured.

**How any of it looks on a screen.** The stylesheet moved out of the page. Whether
a page shows unstyled text for a moment on a slow first load is a question about
what you see. It needs your eyes, not a measurement.

**The `./start` command against the new version.** Astro 7 changed how the dev
server starts and what it prints. The `./start` script reads that output.
