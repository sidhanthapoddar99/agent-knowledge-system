/**
 * Default - Classic documentation layout
 *
 * Components:
 * - Sidebar: default (collapsible sections)
 * - Body: default (clean typography)
 * - Outline: default (table of contents)
 * - Pagination: included
 */

// Export component paths for dynamic imports
export const components = {
  sidebar: '@layouts/docs/components/sidebar/default/Sidebar.astro',
  body: '@layouts/docs/components/body/default/Body.astro',
  outline: '@layouts/docs/components/outline/default/Outline.astro',
  pagination: '@layouts/docs/components/common/Pagination.astro',
};

// Style imports for CSS bundling
export const styles = [
  '@layouts/docs/components/sidebar/default/styles.css',
  '@layouts/docs/components/body/default/styles.css',
  '@layouts/docs/components/outline/default/styles.css',
  '@layouts/docs/components/common/styles.css',
];

// Layout configuration
export const config = {
  name: 'default',
  description: 'Classic documentation layout with sidebar and outline',
  features: {
    sidebar: true,
    outline: true,
    pagination: true,
    collapsibleSections: true,
  },
};
