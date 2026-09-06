/**
 * Live Preview — small inline/block widgets
 * Only used for elements that genuinely need DOM replacement:
 * checkboxes, horizontal rules, frontmatter properties.
 */

import { WidgetType } from '@codemirror/view';

/** Inline checkbox widget — kept for simple cases */
export class CheckboxWidget extends WidgetType {
  constructor(public checked: boolean) { super(); }
  toDOM() {
    const el = document.createElement('span');
    el.className = `cm-lp-checkbox${this.checked ? ' cm-lp-checkbox-checked' : ''}`;
    el.setAttribute('aria-label', this.checked ? 'Completed' : 'Incomplete');
    if (this.checked) {
      el.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 5.5"/></svg>`;
    }
    return el;
  }
  eq(other: CheckboxWidget) { return this.checked === other.checked; }
  ignoreEvent() { return false; }
}

/**
 * Task line widget — replaces "- [ ] text" with a custom flex element:
 *
 *   [indent][connector-line][checkbox][text content]
 *
 * Features:
 * - Flex layout: wrapped text aligns under first letter, not under checkbox
 * - Clickable checkbox: toggles [ ] ↔ [x] in the document
 * - Vertical connector line from checkbox down to nested items
 * - Indent preserved from markdown whitespace
 */
export class TaskLineWidget extends WidgetType {
  constructor(
    public checked: boolean,
    public textContent: string,
    public indent: string,
    /** Position of [ ] or [x] in the document — for click-to-toggle */
    public markerFrom: number,
    public markerTo: number,
    /** Whether this task has nested children below it */
    public hasChildren: boolean,
  ) { super(); }

  toDOM(view: import('@codemirror/view').EditorView) {
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-lp-task-line';

    // Indent (preserves markdown whitespace)
    if (this.indent) {
      const indentEl = document.createElement('span');
      indentEl.className = 'cm-lp-task-indent';
      indentEl.textContent = this.indent;
      wrapper.appendChild(indentEl);
    }

    // Checkbox column
    const cbCol = document.createElement('span');
    cbCol.className = 'cm-lp-task-cb-col';

    // Checkbox circle
    const cb = document.createElement('span');
    cb.className = `cm-lp-checkbox${this.checked ? ' cm-lp-checkbox-checked' : ''}`;
    if (this.checked) {
      cb.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 5.5"/></svg>`;
    }

    // Click to toggle
    const markerFrom = this.markerFrom;
    const markerTo = this.markerTo;
    const checked = this.checked;
    cb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newMarker = checked ? '[ ]' : '[x]';
      view.dispatch({
        changes: { from: markerFrom, to: markerTo, insert: newMarker },
      });
    });

    cbCol.appendChild(cb);
    wrapper.appendChild(cbCol);

    // Text content
    const text = document.createElement('span');
    text.className = 'cm-lp-task-text';
    if (this.checked) text.classList.add('cm-lp-task-done');
    text.textContent = this.textContent;
    wrapper.appendChild(text);

    return wrapper;
  }

  eq(other: TaskLineWidget) {
    return this.checked === other.checked
      && this.textContent === other.textContent
      && this.indent === other.indent
      && this.markerFrom === other.markerFrom
      && this.hasChildren === other.hasChildren;
  }

  ignoreEvent(e: Event) {
    // Let mousedown through for checkbox click
    return e.type === 'mousedown';
  }
}

/** Horizontal rule — replaces `---` / `***` / `___` */
export class HRWidget extends WidgetType {
  toDOM() {
    const el = document.createElement('hr');
    el.className = 'cm-lp-hr';
    return el;
  }
  eq() { return true; }
}

/** Frontmatter properties — replaces YAML block */
export class PropertiesWidget extends WidgetType {
  constructor(private props: [string, string][]) { super(); }
  toDOM() {
    const box = document.createElement('div');
    box.className = 'cm-lp-props';

    const hdr = document.createElement('div');
    hdr.className = 'cm-lp-props-hdr';
    hdr.textContent = 'Properties';
    box.appendChild(hdr);

    for (const [k, v] of this.props) {
      const row = document.createElement('div');
      row.className = 'cm-lp-props-row';

      const key = document.createElement('span');
      key.className = 'cm-lp-props-key';
      key.textContent = k;

      const val = document.createElement('span');
      val.className = 'cm-lp-props-val';
      val.textContent = v || '—';

      row.appendChild(key);
      row.appendChild(val);
      box.appendChild(row);
    }
    return box;
  }
  eq(other: PropertiesWidget) {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
  ignoreEvent() { return false; }
}
