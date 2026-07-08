#!/usr/bin/env bun
// `docs blog list` — list posts (date · slug · title), newest first. See _content.mjs.
import { cmdList } from '../_content.mjs';
cmdList('blog', process.argv.slice(2));
