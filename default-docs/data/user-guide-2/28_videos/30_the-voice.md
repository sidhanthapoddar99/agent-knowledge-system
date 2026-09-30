---
title: "The voice"
description: "Install the generated voice, choose a voice per project or per video, fix how product names are said, and know where the audio lives."
---

A video speaks with one of two voices. The **generated voice** is made on your machine by a small helper program, `agentks-voice`, and sounds the same for every reader. The **browser voice** is the reader's own browser speaking the text, and it is the fallback whenever generated audio is missing. This page shows how to install the generated voice, choose a voice, and fix how words are said.

## Two voices

| | Generated voice | Browser voice |
|---|---|---|
| Comes from | The Kokoro speech model, run by `agentks-voice` on your machine | The reader's browser and operating system |
| Setup | `agentks voice install`, once per machine | None |
| Sounds | The same everywhere, and natural | Good in some browsers, robotic in others |
| Timing | Exact, to the word | Estimated. The video waits when speech runs long |
| Seeking | To any moment | To the start of a sentence |
| Used when | Every beat has its recording | Recordings are missing, or the reader picks it |

Narration is in English.

## Install the generated voice

```bash
agentks voice install     # the helper, the model and the voices; asks first
agentks voice status      # what is installed, its size, the audio store's size, whether it works
agentks voice remove      # removes the helper and the model
```

`voice install` shows the download size, about 110 MB, and asks before it downloads anything. It checks every file it fetches against a checksum built into agentks. It puts the helper in `~/.agentks/tools/` and the model in `~/.agentks/models/`, outside every project.

## Choose a voice

A voice id names a Kokoro voice, such as `af_heart`, `am_michael` or `bf_emma`. An id that starts with `a` speaks American English, and one that starts with `b` speaks British English. `browser` always uses the browser voice.

A video uses the first of these that is set:

1. `voice:` in the video's header;
2. `voice:` in the project's `config/video.yaml`;
3. the browser voice.

Use one voice for the whole project, set once in `config/video.yaml`. A consistent narrator is part of what makes a series of videos sound good. `rate:` in the header sets the speaking speed, from 0.5 to 2.

## Words the voice does not know

The voice turns text into sounds with a word list. A word that is not on the list, such as a product name, would come out spelled letter by letter. That sounds broken while the file looks fine. So agentks never guesses: a word the voice cannot say is an error, `video-unknown-word`, which lists each word.

You fix it with a **pronunciation list**: a map from a word to how it is said. The value is a respelling in plain words, or phonemes between slashes.

```yaml
# config/video.yaml
voice: af_heart
pronounce:
  WebSocket: web socket
  frontmatter: front matter
  Preact: pree act
```

- Put a word the project says often in `config/video.yaml`. Every video uses that list.
- Put a one-off word under `pronounce:` in the video's header. For that video, its entry wins.
- A word matches as a whole word, whatever its case.
- A word in capitals, such as CLI or HTML, is spelled on purpose and is never reported.
- A number other than a plain whole number, such as 7.8 or 09, is reported too. Write it as words: "seven point eight".

The check asks the helper about every word, so `agentks check video` reports unknown words only when the helper is installed. Without it, the check prints one note that pronunciation was not checked. The browser voice has its own pronunciation and ignores the list.

## Write for the ear

- Short sentences, one idea each.
- Numbers as they are spoken: "thirteen hundred", "eight kilobytes".
- Symbols spelled out: "site dot yaml", "slash docs".
- No brackets, and no lists read aloud.
- The screen shows the keywords, and the voice explains them. Never read the slide aloud word for word.

## When the audio is made

The helper records one short clip per beat. Rewording one beat records that beat again, and nothing else. Changing `rate:` records nothing, because the speed is applied as the video plays.

- **When you open a video** in the local app or its standalone page, with the helper installed. agentks records the missing beats in the background, first slide first. The page shows its progress and offers to play now with the browser voice. When the last beat is ready, the player switches to the generated voice.
- **When you ask:** `agentks video voice <video>` records one video, and `agentks video voice --all` records every video in the project. Use it in CI, or before you go offline.
- **When you build:** `agentks build` records any missing beat, when the helper is installed.

The first run for a three-minute video takes a minute or more. After that, an edited beat takes a few seconds.

## Where the audio lives

The recordings live in `~/.agentks/audio/`, one store for the whole machine. A recording is keyed by everything that decides its sound: the text, the pronunciations, the voice, the model and the helper's version. So a second clone, a moved project or another branch reuses every recording.

- **Audio is never in git.** No audio file belongs in a project.
- **Upgrading agentks keeps it.** A new agentks version does not change how a beat sounds.
- **Cleanup keeps what you use.** `agentks cache clean` keeps every recording a video in the scanned projects still uses. [The machine home](../05_getting-started/30_machine-home.md) explains cleanup.
- **In CI**, cache `~/.agentks/audio/`, `~/.agentks/tools/agentks-voice/` and `~/.agentks/models/`, keyed by the helper's version. A deploy then records only the beats that changed. Without that cache, each CI run downloads the helper and the model, and records every beat.
