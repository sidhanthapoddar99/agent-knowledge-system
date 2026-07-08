#!/usr/bin/env bun
// `docs blog show <slug|date>` — one post's metadata + frontmatter. See _content.mjs.
import { cmdShow } from '../_content.mjs';
cmdShow('blog', process.argv.slice(2));
