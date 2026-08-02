#!/usr/bin/env python3
"""Control harness for migration/0.1.4_agent-log-slot-numbering.py.

A migration that reports "0 to change" over a tracker it never looked at scores
identically to one that correctly found nothing. So this builds a scratch
tracker containing, deliberately, one instance of every case the script has to
get right — including two it must LEAVE ALONE — and asserts each outcome.

The cases, and why each is here:

  1. current-shape activity          summary.md / working/ / debrief/ -> renamed
  2. child activity at 100_          left alone; it is already correct
  3. child activity at 020_          REPORTED, never moved: renumbering changes
                                     its identity and every inbound link
  4. legacy six-slot activity        SKIPPED entirely — history stays as written.
                                     Its `01_summary.md` already exists, and a
                                     half-converted historic record is worse than
                                     an unconverted one
  5. inbound link to a renamed slot  rewritten
  6. DECOY: notes/summary.md         NOT rewritten. This is the control. A naive
                                     `summary.md -> 01_summary.md` replace would
                                     break this link, and nothing downstream
                                     would notice until someone clicked it
  7. frontmatter agent-logs: ref     rewritten — it is the reference most likely
                                     to break, because nothing renders it as a
                                     link until a plan page resolves it
  8. a RENAMED file that itself       rewritten. This is the case the first
     contains links                   version of this harness missed, and the
                                     bug it hid was not a wrong rewrite but a
                                     CRASH: the script collected the file under
                                     its pre-rename path, renamed it, then tried
                                     to open the old path. Renames all applied,
                                     links only partly, non-zero exit, tree half
                                     converted. `01_summary.md` links into
                                     `./02_working/` constantly, so this is the
                                     common case, not an edge one
  9. re-running on a half-done tree   `relink` repairs it. The link pass derives
                                     its targets from the TREE, not from the
                                     renames a given run planned, so it is not a
                                     no-op once the renames are done

Run:  python3 verification/agent-log-slot-numbering/control.py
Exit: 0 all cases pass, 1 otherwise.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SCRIPT = REPO / "migration" / "0.1.4_agent-log-slot-numbering.py"


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def build(root: Path) -> None:
    issue = root / "todo" / "2026-01-01-fixture"
    log = issue / "agent-log"

    # 1. current shape, with a child at 100 (case 2) and one at 020 (case 3)
    cur = log / "030_lp_overnight"
    # Case 8: the summary links into its own slots, and is itself renamed.
    write(
        cur / "summary.md",
        "---\ntitle: Summary\n---\n\n# Goal\n\n"
        "- [the round](./working/010_round.md)\n"
        "- [the handover](./debrief/01_handover.md)\n",
    )
    write(cur / "working" / "010_round.md", "---\ntitle: Round\n---\n\nbody\n")
    write(cur / "debrief" / "01_handover.md", "---\ntitle: Handover\n---\n\nbody\n")
    write(cur / "100_wf_child" / "summary.md", "---\ntitle: Summary\n---\n\nbody\n")
    write(cur / "020_au_misnumbered" / "summary.md", "---\ntitle: Summary\n---\n\nbody\n")

    # 4. legacy six-slot activity — must be skipped whole
    old = log / "010_it_historic"
    write(old / "00_goal.md", "---\ntitle: Goal\n---\n\nbody\n")
    write(old / "01_summary.md", "---\ntitle: Summary\n---\n\nbody\n")
    write(old / "02_task_list.md", "---\ntitle: Tasks\n---\n\nbody\n")
    write(old / "03_working" / "notes.md", "---\ntitle: Notes\n---\n\nbody\n")
    write(old / "summary.md", "---\ntitle: Stray\n---\n\nbody\n")

    # 5 + 6. a note with a real inbound link AND the decoy
    write(
        issue / "notes" / "10_refs.md",
        "---\ntitle: Refs\n---\n\n"
        "- [the run](../agent-log/030_lp_overnight/summary.md)\n"
        "- [a round](../agent-log/030_lp_overnight/working/010_round.md)\n"
        "- [the decoy](./summary.md)\n",
    )
    write(issue / "notes" / "summary.md", "---\ntitle: A note that happens to be called summary\n---\n\nbody\n")

    # 7. a plan stage whose frontmatter references the run
    write(
        issue / "plans" / "01_plan" / "10_stage.md",
        "---\ntitle: Stage\n"
        'agent-logs:\n  - "[Overnight](../../agent-log/030_lp_overnight/summary.md)"\n'
        "---\n\n## Todo\n",
    )


def run(root: Path, *args: str) -> str:
    out = subprocess.run(
        [sys.executable, str(SCRIPT), *args, "--root", str(root)],
        capture_output=True, text=True, check=False,
    )
    return out.stdout + out.stderr


def main() -> int:
    failures: list[str] = []

    def check(name: str, ok: bool, detail: str = "") -> None:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}{(' — ' + detail) if detail and not ok else ''}")
        if not ok:
            failures.append(name)

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp) / "data"
        build(root)

        # --- the run must have found something. A clean first result over a
        # fixture built to be dirty is the failure this whole file exists for.
        detect = run(root, "detect")
        planned = detect.count("rename  ")
        # Enumerated independently rather than counted off the output, so the
        # assertion cannot be satisfied by the script finding a DIFFERENT five.
        # A child activity has its own three slots — that is what makes it an
        # activity — so both children contribute, and the legacy folder none.
        expected = [
            "030_lp_overnight/summary.md",
            "030_lp_overnight/working",
            "030_lp_overnight/debrief",
            "030_lp_overnight/100_wf_child/summary.md",
            "030_lp_overnight/020_au_misnumbered/summary.md",
        ]
        check("detect plans exactly the 5 expected renames", planned == len(expected),
              f"planned {planned}, expected {len(expected)}\n{detect}")
        for want in expected:
            check(f"detect plans {want}", want in detect.replace("\\", "/"), detect)
        check("detect reports the legacy activity as skipped", "010_it_historic" in detect, detect)
        check("detect reports the low-numbered child", "020_au_misnumbered" in detect, detect)

        run(root, "migrate")
        cur = root / "todo" / "2026-01-01-fixture" / "agent-log" / "030_lp_overnight"
        old = root / "todo" / "2026-01-01-fixture" / "agent-log" / "010_it_historic"
        notes = root / "todo" / "2026-01-01-fixture" / "notes"
        stage = root / "todo" / "2026-01-01-fixture" / "plans" / "01_plan" / "10_stage.md"

        check("1. summary.md -> 01_summary.md", (cur / "01_summary.md").is_file())
        check("1. working/ -> 02_working/", (cur / "02_working").is_dir())
        check("1. debrief/ -> 03_debrief/", (cur / "03_debrief").is_dir())
        check("1. the round file came with it", (cur / "02_working" / "010_round.md").is_file())
        check("2. the 100_ child is untouched", (cur / "100_wf_child").is_dir())
        check("3. the 020_ child was NOT moved", (cur / "020_au_misnumbered").is_dir())
        check("3. but its own slots WERE numbered — it is still an activity",
              (cur / "020_au_misnumbered" / "01_summary.md").is_file())
        check("2. the 100_ child's slots were numbered too",
              (cur / "100_wf_child" / "01_summary.md").is_file())

        check("4. legacy activity keeps its 03_working/", (old / "03_working").is_dir())
        check("4. legacy activity keeps its stray summary.md", (old / "summary.md").is_file())
        check("4. legacy activity gained no 02_working/", not (old / "02_working").exists())

        refs = (notes / "10_refs.md").read_text(encoding="utf-8")
        check("5. inbound link rewritten",
              "030_lp_overnight/01_summary.md" in refs, refs)
        check("5. inbound link into the folder rewritten",
              "030_lp_overnight/02_working/010_round.md" in refs, refs)
        check("6. THE CONTROL — the decoy link is untouched",
              "[the decoy](./summary.md)" in refs, refs)
        check("6. the decoy file itself still exists",
              (notes / "summary.md").is_file())

        stage_text = stage.read_text(encoding="utf-8")
        check("7. frontmatter agent-logs: ref rewritten",
              "030_lp_overnight/01_summary.md" in stage_text, stage_text)

        # 8. The renamed file's OWN links. Reading it at all proves the script
        # did not die partway; the assertions prove it finished the job.
        summary_text = (cur / "01_summary.md").read_text(encoding="utf-8")
        check("8. a renamed file's own links were rewritten (working)",
              "./02_working/010_round.md" in summary_text, summary_text)
        check("8. a renamed file's own links were rewritten (debrief)",
              "./03_debrief/01_handover.md" in summary_text, summary_text)

        again = run(root, "migrate")
        check("idempotent — a second run finds nothing", "nothing to do" in again, again)

        # 9. relink is the repair path, and must be a no-op on a finished tree.
        relink = run(root, "relink")
        check("9. relink on a finished tree rewrites nothing",
              "0 file(s) rewritten" in relink, relink)

        verify = subprocess.run(
            [sys.executable, str(SCRIPT), "verify", "--root", str(root)],
            capture_output=True, text=True, check=False,
        )
        check("verify exits 0 after migrating", verify.returncode == 0, verify.stdout)

    print()
    if failures:
        print(f"{len(failures)} FAILED: {', '.join(failures)}")
        return 1
    print("all cases pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
