---
title: "Size limits and warnings"
description: "How big one video file and one video may grow, the limits the schema enforces, the warnings agentks check video gives, and the pacing numbers to aim for."
---

A video stays lean on purpose. A small file is quick to read and cheap for an agent to write, and a short video is one people finish. agentks checks this for you: it warns when one file passes its size limit, and when a video's narration passes about four minutes. This page lists the limits, the warnings and the pacing numbers to aim for.

## How big a file may grow

| File | Limit | Past it |
|---|---|---|
| A single-file video | 4 KB | Move it into the folder form |
| A scene file | 2 KB | Split the scene into two |
| `controller.yaml` | 2 KB | Move one-off pronunciations into the project's `config/video.yaml` |

The check measures each file's bytes on disk, never the whole video. The [worked example](./65_worked-example.md) uses about 2 KB of YAML a minute, most of it narration, and none of its scenes reaches 1 KB. Past the limit, `agentks check video` warns with `video-file-size`.

## How long a video may run

A video's narration should stay under 600 words, which is about four minutes. Past that, the check warns with `video-long-video`, in either form. Split a longer topic into a series of short videos.

The check counts words, not seconds. So it gives the same answer before and after the voice is recorded.

## Limits the schema enforces

These are hard limits. Passing one is an error.

| What | Limit |
|---|---|
| A beat's `say` | 400 characters |
| Beats on one slide | 12 |
| Entries in a `bullets` item | 1 to 7 |
| A `code` item | 1,200 characters, about 30 lines |
| Rows in a `table` item | 2 to 8 |
| Values in a chart's `data` | 1 to 12 |
| `wait` after a beat | 10 seconds |
| `rate` | 0.5 to 2 |

The schema holds a few more, such as the length of a title or a label. `agentks video schema` prints them all.

## Warnings

Warnings never stop a build, and `agentks check video` exits with 0 when it finds only warnings. Fix them anyway: each one points at a video that is harder to watch or to maintain.

| Code | Warns when |
|---|---|
| `video-file-size` | One file is past its size limit |
| `video-long-video` | The narration passes 600 words, about four minutes |
| `video-long-beat` | A beat has more than 40 words |
| `video-dense-slide` | A slide shows more than 6 items, or more than 40 words of text, at once |
| `video-silent-slide` | A slide has no narration and no `wait` |

The check also warns when an action would run past the end of its slide and the transition cuts off more than half of it. Start the action earlier, or give the beat a `wait`.

## Pacing to aim for

| Rule | Number |
|---|---|
| Speaking speed | 150 to 160 words a minute |
| One beat | 1 or 2 sentences, at most 40 words |
| One slide | 8 to 30 seconds, with 2 to 4 beats |
| One video | At most about 4 minutes, or 600 words of narration |
| On screen at once | At most 6 items and 40 words |
| Something changes | Every 3 to 6 seconds |
| Silence | Under 2 seconds, unless the pause is deliberate |

`agentks video info` prints each slide's length, so you can check the pacing without playing the video. [Checking and previewing](./45_checking-and-previewing.md#read-the-timeline) shows its output.

## Why the limits are what they are

- **4 KB for a single file** holds about five slides. Past that, an agent that fixes one slide must read the whole file first, and may change slides it never meant to touch.
- **2 KB for a scene** leaves room for one code block of 1,200 characters plus the rest of the slide. A longer listing belongs in an image or a trimmed excerpt.
- **Six items and forty words on screen** is where explainers start to feel crowded. They fail from crowding far more often than from emptiness.
- **Four minutes** keeps each video on one topic. A series of short videos lets a reader pick the part they need, and each video can be fixed and replaced on its own.
