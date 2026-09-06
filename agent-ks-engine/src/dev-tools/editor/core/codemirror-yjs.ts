/**
 * CodeMirror 6 ↔ Yjs binding via y-codemirror.next
 *
 * This replaces:
 * - v1 onInput diff algorithm (prefix/suffix matching)
 * - v1 cursors.ts mirror-div measurement
 * - v1 textarea.value reads/writes
 *
 * y-codemirror.next intercepts CM6 transactions directly and
 * renders remote cursors via the awareness protocol.
 */

import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
import { keymap } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { UndoManager, type Text as YText } from 'yjs';
import type { Awareness } from 'y-protocols/awareness';

export function createYjsExtensions(ytext: YText, awareness: Awareness): Extension[] {
  return [
    yCollab(ytext, awareness, { undoManager: new UndoManager(ytext) }),
    keymap.of(yUndoManagerKeymap),
  ];
}
