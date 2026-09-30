---
title: "The timeline"
description: "How the video crate computes every slide, beat, word and action time, from generated clips or from an estimate, and how agentks video info prints it."
---

The video crate computes every time in a video before the player sees it. The player never works out a duration: it reads start and end times from `VideoData` and sets its animations to them. This page gives the rules, how word anchors turn into times, and what changes when the generated voice arrives. Read it before you change pacing, anchors or the estimate.

## The rules

All times are integer milliseconds from the start of the video.

```
slide start    = the previous slide's end; the first slide starts at 0
beat 1 start   = slide start + the transition's duration
next beat      = starts at the previous beat's end
speech end     = beat start + speech length
beat end       = speech end + wait (default: the style's gap, 0.3 s)
slide end      = last beat's end + tail (default: the style's tail, 0.6 s)
action time    = beat start + the anchor's offset
duration       = the last slide's end
```

Speech length has two sources:

| Voice | Speech length |
|---|---|
| Generated | The clip's length |
| Estimated | The beat's word count ÷ 155 words a minute ÷ the video's `rate` |

A beat with only `wait` is a silent beat: it has no speech and lasts its wait. Slides sit back to back. A slide's end is where the next slide's transition starts.

## Anchors

| Anchor | Offset from the beat's start |
|---|---|
| none | 0 |
| `@word` | The start of the first spoken word that is exactly `word`, ignoring case and punctuation |
| `@word#2` | The start of the second such word |
| `@40%` | 40% of the way through the beat's speech |
| `@+1.5s` | 1.5 seconds |
| `@end` | The end of the beat's speech |

**Where word times come from.** Each word of a beat has a timing: its first character, the character after its last, its start and its end.

- **With generated audio**, the voice helper reports each word's character span and times within its clip. The crate adds the clip's start in the video.
- **With the estimate**, a word starts at the speech length × the characters before it ÷ the characters in the beat. It ends where the next word starts, and the last word ends at the speech end.

**Anchors match by character position.** The crate finds a word in the original `say` text. The helper reports spans in the same text, before any pronunciation rewrite. So the crate and the helper never have to split words the same way, and a pronunciation entry never moves an anchor.

## When the clips arrive

A video's times first come from the estimate, with `voice.timing` set to `estimated`. Once every beat has a clip, the crate joins the clips into one stream ([clips, streams and the store](./55_clips-streams-and-the-store.md)) and recomputes the timeline from them:

- each speech length is its clip's length;
- each word time is the helper's time plus the clip's start;
- each clip's start is the real start the join returns. The join places clips on a 2.5 ms grid, and the timeline uses the placed value, not the requested one.

`voice.timing` becomes `generated`, and `voice.stream` names the stream. The page's render hash changes, so a client that has the page open fetches it again.

The helper makes each clip at the voice's natural speed, and a clip's key leaves the rate out. So changing a video's `rate` never regenerates a clip.

## Actions that run long

An action's animation can run past its slide's end. The transition into the next slide then cuts it. The check warns when more than half of an action would be lost, because the author probably meant it to finish.

## Scene files share one timeline

In a video folder, the slides are the scene files in prefix order, on this same timeline. A file boundary adds nothing. The gap between two scene files is the transition into the second, exactly as between two slides of one file, and the voice runs in one stream across both.

## Reading it: `agentks video info`

`agentks video info <video>` prints the timeline, so an agent can check its pacing without playing the video. It takes a single file, a folder or a scene file. Given a scene file, it prints only that scene. `--slide` takes a slide's number or its id, and prints that slide with its scene file's path.

Slide 5 of the example video, with the estimate. Times are relative to the slide's start:

```
slide 5 pipeline  050_pipeline.yaml  "The render pipeline"   24.5 s   estimated voice
  in fade                                      0.00 –  0.60
  beat 1  "A page is rendered only…"           0.60 –  4.47   10 words
     0.60  show fm+embeds+md+links+html rise stagger=0.1
     3.52  show line draw                @asks
  beat 2  "The core reads the frontmatter…"    4.77 – 10.19   14 words
     5.34  send line                     @reads
     5.97  emph fm pulse                 @frontmatter
     7.35  emph embeds pulse             @embedded
     8.99  emph md pulse                 @markdown
  beat 3  "Then it resolves every…"           10.49 – 16.30   15 words
    11.06  emph links pulse              @resolves
  beat 4  "The result is cached…"             16.60 – 23.57   18 words
    17.54  emph html glow                @cached
  tail                                        23.87 – 24.47
```

With generated audio, the numbers come from the clips, and the header says `generated voice`. The command also prints pacing warnings, and takes `--json`.

## Related

- [VideoData](./35_video-data.md): where these times are written.
- [The player](./40_the-player.md): how the times become animations.
- [The meaning checks](./20_the-meaning-checks.md): the whole-word rule for anchors.
