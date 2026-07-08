#!/usr/bin/env bun
/** `docs git commit --scope <path> --message <msg>` — guarded, scoped commit. */
import { cmdCommit } from '../_git.mjs';
cmdCommit(process.argv.slice(2));
