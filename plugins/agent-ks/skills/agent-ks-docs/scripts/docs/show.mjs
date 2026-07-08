#!/usr/bin/env bun
// `docs doc show <name|path>` — one doc page's metadata + frontmatter. See _content.mjs.
import { cmdShow } from '../_content.mjs';
cmdShow('docs', process.argv.slice(2));
