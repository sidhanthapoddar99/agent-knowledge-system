#!/usr/bin/env bun
// `docs doc list [section]` — list doc pages (rel · section · title). See _content.mjs.
import { cmdList } from '../_content.mjs';
cmdList('docs', process.argv.slice(2));
