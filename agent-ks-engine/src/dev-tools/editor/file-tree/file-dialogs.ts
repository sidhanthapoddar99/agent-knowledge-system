/**
 * File dialogs — modal dialogs for create, rename, delete operations.
 * Uses existing .ev2-modal CSS classes from editor.css.
 */

function showModal(title: string, content: HTMLElement, onSubmit: () => void, onCancel: () => void, submitLabel = 'Create', danger = false): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'ev2-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'ev2-modal';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  modal.appendChild(h3);
  modal.appendChild(content);

  const actions = document.createElement('div');
  actions.className = 'ev2-modal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'ev2-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => { backdrop.remove(); onCancel(); });

  const submitBtn = document.createElement('button');
  submitBtn.className = `ev2-btn primary${danger ? ' danger' : ''}`;
  submitBtn.textContent = submitLabel;
  if (danger) {
    submitBtn.style.borderColor = 'var(--ev-danger)';
    submitBtn.style.color = 'var(--ev-danger)';
  }
  submitBtn.addEventListener('click', () => { backdrop.remove(); onSubmit(); });

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  modal.appendChild(actions);
  backdrop.appendChild(modal);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) { backdrop.remove(); onCancel(); }
  });

  // Close on Escape
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { backdrop.remove(); onCancel(); document.removeEventListener('keydown', onKey); }
    if (e.key === 'Enter') { backdrop.remove(); onSubmit(); document.removeEventListener('keydown', onKey); }
  }
  document.addEventListener('keydown', onKey);

  document.body.appendChild(backdrop);

  // Focus input if present
  const input = content.querySelector('input') as HTMLInputElement;
  if (input) setTimeout(() => input.focus(), 50);

  return backdrop;
}

export function showNewFileDialog(callback: (name: string) => void): void {
  const content = document.createElement('div');
  content.innerHTML = `
    <label>File name</label>
    <input type="text" placeholder="my-new-page" id="ev2-dialog-input" />
    <div style="font-size:11px;color:var(--ev-text-faint);margin-top:-8px">
      Prefix (XX_) and .md extension will be added automatically.
    </div>
  `;

  showModal('New File', content, () => {
    const input = content.querySelector('#ev2-dialog-input') as HTMLInputElement;
    const name = input.value.trim();
    if (name) callback(name);
  }, () => {});
}

export function showNewFolderDialog(callback: (name: string) => void): void {
  const content = document.createElement('div');
  content.innerHTML = `
    <label>Folder name</label>
    <input type="text" placeholder="my-new-section" id="ev2-dialog-input" />
    <div style="font-size:11px;color:var(--ev-text-faint);margin-top:-8px">
      Prefix (XX_) will be added automatically.
    </div>
  `;

  showModal('New Folder', content, () => {
    const input = content.querySelector('#ev2-dialog-input') as HTMLInputElement;
    const name = input.value.trim();
    if (name) callback(name);
  }, () => {});
}

export function showRenameDialog(currentName: string, callback: (newName: string) => void): void {
  // Strip prefix and extension for display
  const cleanName = currentName.replace(/^\d+_/, '').replace(/\.[^.]+$/, '');

  const content = document.createElement('div');
  content.innerHTML = `
    <label>New name</label>
    <input type="text" value="${cleanName}" id="ev2-dialog-input" />
    <div style="font-size:11px;color:var(--ev-text-faint);margin-top:-8px">
      Prefix and extension will be preserved.
    </div>
  `;

  showModal('Rename', content, () => {
    const input = content.querySelector('#ev2-dialog-input') as HTMLInputElement;
    const name = input.value.trim();
    if (name && name !== cleanName) callback(name);
  }, () => {}, 'Rename');
}

export function showDeleteDialog(itemName: string, callback: () => void): void {
  const content = document.createElement('div');
  content.innerHTML = `
    <div style="font-size:13px;color:var(--ev-text);margin-bottom:8px">
      Are you sure you want to delete <strong>${itemName}</strong>?
    </div>
    <div style="font-size:12px;color:var(--ev-text-muted)">
      This action cannot be undone.
    </div>
  `;

  showModal('Delete', content, callback, () => {}, 'Delete', true);
}
