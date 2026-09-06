/**
 * Code block labels — shows language name on the top-right of code blocks.
 * On hover, the text changes to a copy icon + "Copy". Clicking copies code.
 */

const COPY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function initCodeLabels() {
  const codeBlocks = document.querySelectorAll<HTMLPreElement>('.markdown-content pre[data-language]');
  if (codeBlocks.length === 0) return;

  for (const pre of codeBlocks) {
    const lang = pre.getAttribute('data-language') || '';
    if (!lang) continue;

    pre.style.position = 'relative';

    const label = document.createElement('span');
    label.className = 'code-label';
    label.innerHTML = lang;
    label.setAttribute('data-lang', lang);

    // Swap text on hover
    pre.addEventListener('mouseenter', () => {
      if (!label.classList.contains('code-label--copied')) {
        label.innerHTML = `${COPY_SVG} Copy`;
      }
    });
    pre.addEventListener('mouseleave', () => {
      if (!label.classList.contains('code-label--copied')) {
        label.innerHTML = lang;
      }
    });

    // Copy on click
    label.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        label.innerHTML = `${CHECK_SVG} Copied!`;
        label.classList.add('code-label--copied');
        setTimeout(() => {
          label.innerHTML = lang;
          label.classList.remove('code-label--copied');
        }, 1500);
      } catch {
        // Clipboard API not available
      }
    });

    pre.appendChild(label);
  }
}

initCodeLabels();
