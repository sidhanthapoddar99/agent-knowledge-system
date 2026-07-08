#!/usr/bin/env bun
// `docs doc search <regex> [section]` — grep doc pages. See _content.mjs.
import { cmdSearch } from '../_content.mjs';
cmdSearch('docs', process.argv.slice(2));
