---
title: "Summary"
---

# State

> [!NOTE]
> **Reader done, writer next.** The read path is on the shared prefix parser and
> byte identity is proved across the fixture corpus. The write path has not been
> touched, so the migration is half done and this log stays `in-progress` —
> independently of its parent, which is `done`.

# Goal

Move the codec onto the shared prefix parser that
[the parent run](../01_summary.md) built, **without changing a single byte it
emits**.

**Trigger:** the parser landed with two callers while the codec was still parsing
prefixes by hand — the second implementation the parent run existed to remove.

**This is a child agent log, not an iteration file, because it has a goal of its
own.** *Do not change the emitted bytes* is a constraint the parent does not
carry, and it can succeed or fail on its own terms.

# Todo

- [x] [Move the read path](./02_working/010_reader.md) — the hand-rolled prefix
      parse deleted, one more caller on the shared parser
- [x] [Prove byte identity](./02_working/011_probe-byte-identity/01_report.md) — a
      producer file: every fixture re-encoded and compared byte for byte
- [ ] Move the write path — not started, and it is the half that can actually
      change the bytes

# Out of Scope

The schema. It travels with the writer and carries its own compatibility
question.

# Outcome

Half shipped, and the half that shipped is the safe one — a read path cannot
corrupt what it reads. Byte identity held across the whole fixture corpus; the
method and the counts are in
[the probe report](./02_working/011_probe-byte-identity/01_report.md), which is a
producer file rather than prose in the round above it because it is evidence
someone may need to re-check.

What the next run needs is in [the handover](./03_debrief/01_handover.md).
