# Example — a research / design issue

The "thinking" half of the tracker. Heavy on `notes/`, few or no code subtasks, oriented toward a written conclusion that a human reviews. Use this shape when the deliverable is a *decision* or a *design*, not a diff.

## Layout

The weight is in `notes/` — gap-numbered because reading order matters here (see [22_notes.md](22_notes.md)):

```
2026-05-02-search-backend-eval/
├── settings.json                  status: open, labels: ["research"], priority: medium
├── issue.md                       the question + what a good answer looks like
├── notes/
│   ├── 010_problem-statement.md   what we're deciding and why now
│   ├── 020_options/
│   │   ├── 010_meilisearch.md     one option per file
│   │   ├── 020_postgres-fts.md
│   │   └── 030_tantivy.md
│   ├── 030_benchmarks.md          evidence: numbers, methodology
│   └── 040_recommendation.md      the conclusion + rationale
├── subtasks/
│   └── 010_write-up-decision.md   often just ONE: "land the recommendation + get sign-off"
└── comments/                      the human↔agent decision dialogue
```

## How it differs from an implementation issue

- **`issue.md` poses a question**, not a task: "Which search backend fits our constraints?" with the criteria for a good answer.
- **`notes/` carries the substance** — one file per option, a benchmarks file with methodology, a recommendation file. This is where the reasoning lives; `issue.md` stays the orientation layer.
- **Subtasks are minimal** — often a single "land the decision and get sign-off." The work product is the written conclusion, so there's little to decompose.
- **`comments/` is load-bearing** — the back-and-forth that converges on the decision (alternatives challenged, constraints clarified) belongs here as the durable thread.
- **Shipping to `review`** means "the recommendation is written and defensible" — the human reads `040_recommendation.md` and either accepts (→ `closed`, often spawning an implementation issue) or pushes back in a comment (→ `open`).

## When to reach for this shape

Whenever you'd otherwise be tempted to make a giant `issue.md`: a comparison of approaches, an architecture exploration, a "should we even do X" investigation. Split the exploration into `notes/` so each strand is reviewable on its own, and keep `issue.md` as the framing.
