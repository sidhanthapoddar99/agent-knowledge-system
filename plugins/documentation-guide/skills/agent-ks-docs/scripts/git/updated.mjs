#!/usr/bin/env bun
/** `docs git updated <issue|path>` — last-commit date for any content. */
import { cmdUpdated } from '../_git.mjs';
cmdUpdated(process.argv.slice(2));
