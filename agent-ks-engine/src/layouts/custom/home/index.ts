/**
 * Home Style - Landing page with hero and features
 */

export const components = {
  hero: '@layouts/custom/components/hero/default/Hero.astro',
  features: '@layouts/custom/components/features/default/Features.astro',
};

export const styles = [
  '@layouts/custom/components/hero/default/styles.css',
  '@layouts/custom/components/features/default/styles.css',
];

export const config = {
  name: 'home',
  description: 'Landing page with hero section and feature grid',
  features: {
    hero: true,
    features: true,
  },
};
