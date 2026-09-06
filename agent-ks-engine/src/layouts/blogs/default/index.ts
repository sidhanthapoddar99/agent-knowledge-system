/**
 * Default - Grid layout with cards
 *
 * Components:
 * - IndexBody: default (grid of cards)
 * - PostBody: default (full width article)
 * - PostCard: default (image + content card)
 */

export const components = {
  indexBody: '@layouts/blogs/components/body/default/IndexBody.astro',
  postBody: '@layouts/blogs/components/body/default/PostBody.astro',
  postCard: '@layouts/blogs/components/cards/default/PostCard.astro',
};

export const styles = [
  '@layouts/blogs/components/common/index-styles.css',
  '@layouts/blogs/components/common/post-styles.css',
  '@layouts/blogs/components/cards/default/styles.css',
];

export const config = {
  name: 'default',
  description: 'Grid layout with image cards',
  features: {
    featuredImage: true,
    tags: true,
    author: true,
    pagination: true,
  },
};
