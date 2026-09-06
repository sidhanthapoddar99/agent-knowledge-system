/**
 * Formatting commands — pure CM6 transaction functions for markdown formatting.
 * Works in both source and WYSIWYG modes (transactions flow through y-codemirror.next).
 */

import type { EditorView } from '@codemirror/view';
import type { KeyBinding } from '@codemirror/view';

// ---- Inline toggles (wrap/unwrap selection with markers) ----

function toggleWrap(view: EditorView, marker: string): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);

  // Check if already wrapped
  const mLen = marker.length;
  if (
    from >= mLen &&
    state.sliceDoc(from - mLen, from) === marker &&
    state.sliceDoc(to, to + mLen) === marker
  ) {
    // Unwrap — remove markers around selection
    view.dispatch({
      changes: [
        { from: from - mLen, to: from, insert: '' },
        { from: to, to: to + mLen, insert: '' },
      ],
      selection: { anchor: from - mLen, head: to - mLen },
    });
    return true;
  }

  // Check if selection itself contains the markers at boundaries
  if (
    selected.length >= mLen * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const inner = selected.slice(mLen, -mLen);
    view.dispatch({
      changes: { from, to, insert: inner },
      selection: { anchor: from, head: from + inner.length },
    });
    return true;
  }

  // Wrap
  view.dispatch({
    changes: { from, to, insert: `${marker}${selected}${marker}` },
    selection: { anchor: from + mLen, head: to + mLen },
  });
  return true;
}

export function toggleBold(view: EditorView): boolean {
  return toggleWrap(view, '**');
}

export function toggleItalic(view: EditorView): boolean {
  return toggleWrap(view, '*');
}

export function toggleStrikethrough(view: EditorView): boolean {
  return toggleWrap(view, '~~');
}

export function toggleInlineCode(view: EditorView): boolean {
  return toggleWrap(view, '`');
}

// ---- Line-level toggles ----

function toggleLinePrefix(view: EditorView, prefix: string): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const startLine = state.doc.lineAt(from);
  const endLine = state.doc.lineAt(to);

  const changes: { from: number; to: number; insert: string }[] = [];
  let allHavePrefix = true;

  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = state.doc.line(i);
    if (!line.text.startsWith(prefix)) {
      allHavePrefix = false;
      break;
    }
  }

  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = state.doc.line(i);
    if (allHavePrefix) {
      // Remove prefix
      changes.push({ from: line.from, to: line.from + prefix.length, insert: '' });
    } else {
      // Add prefix
      if (!line.text.startsWith(prefix)) {
        changes.push({ from: line.from, to: line.from, insert: prefix });
      }
    }
  }

  if (changes.length) view.dispatch({ changes });
  return true;
}

export function toggleBulletList(view: EditorView): boolean {
  return toggleLinePrefix(view, '- ');
}

export function toggleOrderedList(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const startLine = state.doc.lineAt(from);
  const endLine = state.doc.lineAt(to);

  // Check if all lines already have ordered list prefix
  let allOrdered = true;
  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = state.doc.line(i);
    if (!/^\d+\.\s/.test(line.text)) {
      allOrdered = false;
      break;
    }
  }

  const changes: { from: number; to: number; insert: string }[] = [];

  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = state.doc.line(i);
    if (allOrdered) {
      const match = line.text.match(/^\d+\.\s/);
      if (match) {
        changes.push({ from: line.from, to: line.from + match[0].length, insert: '' });
      }
    } else {
      if (!/^\d+\.\s/.test(line.text)) {
        const num = i - startLine.number + 1;
        changes.push({ from: line.from, to: line.from, insert: `${num}. ` });
      }
    }
  }

  if (changes.length) view.dispatch({ changes });
  return true;
}

export function toggleBlockquote(view: EditorView): boolean {
  return toggleLinePrefix(view, '> ');
}

// ---- Heading ----

export function insertHeading(view: EditorView, level: number): boolean {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.from);
  const prefix = '#'.repeat(level) + ' ';

  // Remove existing heading prefix if any
  const existingMatch = line.text.match(/^#{1,6}\s/);
  if (existingMatch) {
    view.dispatch({
      changes: { from: line.from, to: line.from + existingMatch[0].length, insert: prefix },
    });
  } else {
    view.dispatch({
      changes: { from: line.from, to: line.from, insert: prefix },
    });
  }
  return true;
}

// ---- Insert blocks ----

export function insertLink(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);

  if (selected) {
    // Wrap selected text as link text
    const insert = `[${selected}](url)`;
    view.dispatch({
      changes: { from, to, insert },
      // Select "url" for easy replacement
      selection: { anchor: from + selected.length + 3, head: from + selected.length + 6 },
    });
  } else {
    const insert = '[text](url)';
    view.dispatch({
      changes: { from, to: from, insert },
      selection: { anchor: from + 1, head: from + 5 },
    });
  }
  return true;
}

export function insertCodeBlock(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  const insert = `\n\`\`\`\n${selected}\n\`\`\`\n`;
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + 5, head: from + 5 + selected.length },
  });
  return true;
}

export function insertTable(view: EditorView): boolean {
  const { from } = view.state.selection.main;
  const table = `\n| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
  view.dispatch({
    changes: { from, to: from, insert: table },
  });
  return true;
}

export function insertHorizontalRule(view: EditorView): boolean {
  const { from } = view.state.selection.main;
  view.dispatch({
    changes: { from, to: from, insert: '\n---\n' },
  });
  return true;
}

// ---- Keymap ----

export function formattingKeymap(): KeyBinding[] {
  return [
    { key: 'Mod-b', run: toggleBold },
    { key: 'Mod-i', run: toggleItalic },
    { key: 'Mod-Shift-s', run: toggleStrikethrough },
    { key: 'Mod-e', run: toggleInlineCode },
    { key: 'Mod-k', run: insertLink },
  ];
}
