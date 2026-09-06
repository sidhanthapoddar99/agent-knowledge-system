/**
 * Info Style - Simple content page
 */

export const components = {
  content: '@layouts/custom/components/content/default/Content.astro',
};

export const styles = [
  '@layouts/custom/components/content/default/styles.css',
];

export const config = {
  name: 'info',
  description: 'Simple content page with title and body',
  features: {
    title: true,
    description: true,
  },
};
