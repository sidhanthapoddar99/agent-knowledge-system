#!/usr/bin/env bun
/** `docs git log <issue|path>` — commit history of one folder/file. */
import { cmdLog } from '../_git.mjs';
cmdLog(process.argv.slice(2));
