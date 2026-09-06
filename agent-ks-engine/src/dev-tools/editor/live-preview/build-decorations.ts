/**
 * Live Preview — decoration builder
 *
 * Walks the Lezer markdown syntax tree and produces:
 * - line decorations for headings, blockquotes, code block backgrounds
 * - mark decorations for bold, italic, strikethrough, inline code, links
 * - replace decorations to hide syntax markers (#, **, *, ~~, `, [](url))
 * - widget decorations for checkboxes, HR, frontmatter
 *
 * Key rule: cursor on a line → that line shows raw source (no hiding).
 */

import { Decoration, type DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { EditorState, Range } from '@codemirror/state';
import { TaskLineWidget, HRWidget, PropertiesWidget } from './widgets.js';

// ---- Cursor helpers ----

function cursorOnLine(state: EditorState, lineFrom: number, lineTo: number): boolean {
  const doc = state.doc;
  for (const r of state.selection.ranges) {
    const cl = doc.lineAt(r.head).number;
    const fl = doc.lineAt(lineFrom).number;
    const tl = doc.lineAt(Math.min(lineTo, doc.length)).number;
    if (cl >= fl && cl <= tl) return true;
  }
  return false;
}

function cursorInRange(state: EditorState, from: number, to: number): boolean {
  for (const r of state.selection.ranges) {
    if (r.from <= to && r.to >= from) return true;
  }
  return false;
}

// ---- Frontmatter parser ----

function parseFrontmatter(doc: string): { end: number; props: [string, string][] } | null {
  if (!doc.startsWith('---\n') && !doc.startsWith('---\r\n')) return null;
  const close = doc.indexOf('\n---', 4);
  if (close === -1) return null;
  let end = close + 4;
  if (end < doc.length && doc[end] === '\n') end++;

  const yaml = doc.slice(4, close);
  const props: [string, string][] = [];
  for (const line of yaml.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const ci = t.indexOf(':');
    if (ci > 0) {
      const k = t.slice(0, ci).trim();
      let v = t.slice(ci + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      props.push([k, v]);
    }
  }
  return props.length > 0 ? { end, props } : null;
}

// ---- Main decoration builder ----

export function buildLivePreviewDecorations(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const docStr = state.doc.toString();

  // ---- Frontmatter → Properties widget ----
  const fm = parseFrontmatter(docStr);
  if (fm && fm.end <= docStr.length && !cursorInRange(state, 0, fm.end)) {
    decorations.push(
      Decoration.replace({ widget: new PropertiesWidget(fm.props), block: true }).range(0, fm.end)
    );
  }

  // Track which lines are inside code blocks (to skip inline processing)
  const codeBlockLines = new Set<number>();

  // ---- Walk the syntax tree ----
  syntaxTree(state).iterate({
    enter(node) {
      const { from, to, name } = node;
      if (fm && from < fm.end) return;

      // ---- Headings ----
      if (name === 'ATXHeading1' || name === 'ATXHeading2' || name === 'ATXHeading3' ||
          name === 'ATXHeading4' || name === 'ATXHeading5' || name === 'ATXHeading6') {
        const level = name.charCodeAt(name.length - 1) - 48;
        const lineStart = state.doc.lineAt(from).from;
        decorations.push(Decoration.line({ class: `cm-lp-h${level}` }).range(lineStart));

        // Hide # markers when cursor is NOT on this line
        if (!cursorOnLine(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'HeaderMark') {
                const next = state.sliceDoc(c.to, c.to + 1);
                decorations.push(Decoration.replace({}).range(c.from, next === ' ' ? c.to + 1 : c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Bold ----
      if (name === 'StrongEmphasis') {
        decorations.push(Decoration.mark({ class: 'cm-lp-bold' }).range(from, to));
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'EmphasisMark') {
                decorations.push(Decoration.replace({}).range(c.from, c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Italic ----
      if (name === 'Emphasis') {
        decorations.push(Decoration.mark({ class: 'cm-lp-italic' }).range(from, to));
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'EmphasisMark') {
                decorations.push(Decoration.replace({}).range(c.from, c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Strikethrough ----
      if (name === 'Strikethrough') {
        decorations.push(Decoration.mark({ class: 'cm-lp-strike' }).range(from, to));
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'StrikethroughMark') {
                decorations.push(Decoration.replace({}).range(c.from, c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Inline code ----
      if (name === 'InlineCode') {
        decorations.push(Decoration.mark({ class: 'cm-lp-code' }).range(from, to));
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'CodeMark') {
                decorations.push(Decoration.replace({}).range(c.from, c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Links ----
      if (name === 'Link') {
        decorations.push(Decoration.mark({ class: 'cm-lp-link' }).range(from, to));
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'LinkMark' || c.name === 'URL') {
                decorations.push(Decoration.replace({}).range(c.from, c.to));
              }
            } while (c.nextSibling());
          }
        }
        return false;
      }

      // ---- Images ----
      if (name === 'Image') {
        decorations.push(Decoration.mark({ class: 'cm-lp-link' }).range(from, to));
        return false;
      }

      // ---- Fenced code blocks ----
      if (name === 'FencedCode') {
        const startLine = state.doc.lineAt(from);
        const endLine = state.doc.lineAt(Math.min(to, state.doc.length));
        const focused = cursorInRange(state, from, to);

        for (let ln = startLine.number; ln <= endLine.number; ln++) {
          codeBlockLines.add(ln);
          let cls = 'cm-lp-codeblock';
          if (startLine.number === endLine.number) cls += ' cm-lp-codeblock-single';
          else if (ln === startLine.number) cls += ' cm-lp-codeblock-first';
          else if (ln === endLine.number) cls += ' cm-lp-codeblock-last';
          decorations.push(Decoration.line({ class: cls }).range(state.doc.line(ln).from));
        }

        // When unfocused, hide the opening ``` and closing ``` fence lines
        if (!focused && startLine.number !== endLine.number) {
          // Hide opening fence line (```lang)
          const openLine = startLine;
          decorations.push(Decoration.replace({}).range(openLine.from, openLine.to + 1));
          // Hide closing fence line (```)
          const closeLine = endLine;
          if (/^`{3,}\s*$/.test(closeLine.text)) {
            const closeStart = closeLine.from > 0 ? closeLine.from - 1 : closeLine.from; // include preceding newline
            decorations.push(Decoration.replace({}).range(closeStart, closeLine.to));
          }
        }
        return false;
      }

      // ---- Blockquote ----
      if (name === 'Blockquote') {
        const startLine = state.doc.lineAt(from);
        const endLine = state.doc.lineAt(Math.min(to, state.doc.length));
        for (let ln = startLine.number; ln <= endLine.number; ln++) {
          decorations.push(Decoration.line({ class: 'cm-lp-bq' }).range(state.doc.line(ln).from));
        }
        // Hide > marks when cursor is not inside
        if (!cursorInRange(state, from, to)) {
          const c = node.node.cursor();
          if (c.firstChild()) {
            do {
              if (c.name === 'QuoteMark') {
                const next = state.sliceDoc(c.to, c.to + 1);
                decorations.push(Decoration.replace({}).range(c.from, next === ' ' ? c.to + 1 : c.to));
              }
            } while (c.nextSibling());
          }
        }
        return; // descend for inline formatting inside blockquote
      }

      // ---- Table ----
      if (name === 'Table') {
        const startLine = state.doc.lineAt(from);
        const endLine = state.doc.lineAt(Math.min(to, state.doc.length));
        const focused = cursorInRange(state, from, to);

        for (let ln = startLine.number; ln <= endLine.number; ln++) {
          const line = state.doc.line(ln);
          const isHeader = ln === startLine.number;
          const isSeparator = /^\s*\|[\s\-:|]+\|\s*$/.test(line.text);

          let cls = 'cm-lp-table-line';
          if (isHeader) cls += ' cm-lp-table-header';

          decorations.push(Decoration.line({ class: cls }).range(line.from));

          // Hide separator row (| --- | --- |) when unfocused
          if (isSeparator && !focused) {
            decorations.push(Decoration.replace({}).range(line.from > 0 ? line.from - 1 : line.from, line.to));
          }
        }
        return false;
      }

      // ---- Lists — descend for inline formatting + task markers ----
      if (name === 'BulletList' || name === 'OrderedList') {
        return; // descend into children
      }

      // ---- List marker (non-task) ----
      if (name === 'ListMark') {
        if (!cursorOnLine(state, from, to)) {
          const text = state.sliceDoc(from, to);
          const listItem = node.node.parent;
          const hasTask = listItem && (listItem.getChild('Task') || listItem.getChild('TaskMarker'));

          // Non-task bullet: replace with styled dot
          if (!hasTask && (text === '-' || text === '*' || text === '+')) {
            decorations.push(Decoration.mark({ class: 'cm-lp-bullet' }).range(from, to));
          }
          // Task items are handled by the Task node below
        }
        return false;
      }

      // ---- Task item: replace entire "- [ ] text" with flex widget ----
      if (name === 'Task') {
        const taskLine = state.doc.lineAt(from);
        if (!cursorOnLine(state, taskLine.from, taskLine.to)) {
          const markerNode = node.node.getChild('TaskMarker');
          if (markerNode) {
            const markerText = state.sliceDoc(markerNode.from, markerNode.to);
            const checked = markerText.includes('x') || markerText.includes('X');

            let textStart = markerNode.to;
            if (state.sliceDoc(textStart, textStart + 1) === ' ') textStart++;
            const textContent = state.sliceDoc(textStart, taskLine.to);

            const listItem = node.node.parent;
            const listMark = listItem?.getChild('ListMark');
            const replaceFrom = listMark ? listMark.from : from;

            const fullLine = state.sliceDoc(taskLine.from, taskLine.to);
            const indent = fullLine.match(/^(\s*)/)?.[1] || '';

            // Check for nested children and add connector lines to their lines
            const nestedList = listItem?.getChild('BulletList') || listItem?.getChild('OrderedList');
            const hasChildren = !!nestedList;

            if (nestedList) {
              // Add connector line decoration to each nested line
              // Position it at parent's checkbox center using CSS variable
              const indentCh = indent.length;
              const nStart = state.doc.lineAt(nestedList.from);
              const nEnd = state.doc.lineAt(Math.min(nestedList.to, state.doc.length));
              for (let ln = nStart.number; ln <= nEnd.number; ln++) {
                decorations.push(
                  Decoration.line({
                    class: 'cm-lp-task-child-line',
                    attributes: { style: `--task-indent: ${indentCh}ch` },
                  }).range(state.doc.line(ln).from)
                );
              }
            }

            decorations.push(
              Decoration.replace({
                widget: new TaskLineWidget(
                  checked, textContent, indent,
                  markerNode.from, markerNode.to,
                  hasChildren,
                ),
              }).range(replaceFrom, taskLine.to)
            );
          }
        }
        return false;
      }

      // ---- Horizontal rule ----
      if (name === 'HorizontalRule') {
        if (!cursorOnLine(state, from, to)) {
          decorations.push(Decoration.replace({ widget: new HRWidget(), block: true }).range(from, to));
        }
        return false;
      }
    },
  });

  // Sort and deduplicate
  decorations.sort((a, b) => a.from - b.from || a.to - b.to);

  // Remove replace decorations that overlap
  const filtered: Range<Decoration>[] = [];
  let lastReplaceEnd = -1;
  for (const d of decorations) {
    const spec = (d.value as any).spec;
    const isReplace = spec && spec.widget !== undefined && spec.class === undefined;
    if (isReplace && d.from < lastReplaceEnd) continue;
    if (isReplace) lastReplaceEnd = d.to;
    filtered.push(d);
  }

  try {
    return Decoration.set(filtered, true);
  } catch (e) {
    console.warn('[live-preview] Decoration set failed:', e);
    return Decoration.none;
  }
}
