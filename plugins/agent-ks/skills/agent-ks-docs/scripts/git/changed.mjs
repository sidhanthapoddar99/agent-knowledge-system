#!/usr/bin/env bun
/** `docs git changed --since <ref>` — content changed under data/. */
import { cmdChanged } from '../_git.mjs';
cmdChanged(process.argv.slice(2));
