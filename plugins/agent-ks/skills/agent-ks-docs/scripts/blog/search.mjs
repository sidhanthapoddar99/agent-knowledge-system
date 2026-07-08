#!/usr/bin/env bun
// `docs blog search <regex>` — grep blog posts. See _content.mjs.
import { cmdSearch } from '../_content.mjs';
cmdSearch('blog', process.argv.slice(2));
