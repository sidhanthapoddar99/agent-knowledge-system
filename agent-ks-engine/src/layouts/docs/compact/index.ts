/**
 * Compact - Documentation layout without sidebar
 *
 * Components:
 * - Sidebar: none (no sidebar)
 * - Body: default (clean typography)
 * - Outline: default (table of contents)
 * - Pagination: included
 */

export const components = {
  sidebar: null,
  body: '@layouts/docs/components/body/default/Body.astro',
  outline: '@layouts/docs/components/outline/default/Outline.astro',
  pagination: '@layouts/docs/components/common/Pagination.astro',
};

export const styles = [
  '@layouts/docs/components/body/default/styles.css',
  '@layouts/docs/components/outline/default/styles.css',
  '@layouts/docs/components/common/styles.css',
];

export const config = {
  name: 'compact',
  description: 'Compact documentation layout without sidebar',
  features: {
    sidebar: false,
    outline: true,
    pagination: true,
    collapsibleSections: false,
  },
};
