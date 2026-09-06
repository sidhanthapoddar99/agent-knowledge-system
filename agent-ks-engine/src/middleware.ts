/**
 * Astro Middleware
 *
 * Handles dev-time features like layout switching.
 * In static mode, Astro.url doesn't include query params from the actual request,
 * so we use middleware to pass them via Astro.locals.
 */
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Only process in dev mode
  if (import.meta.env.DEV) {
    // Get layout override from actual request URL
    const layoutOverride = context.url.searchParams.get('layout');
    if (layoutOverride) {
      context.locals.layoutOverride = layoutOverride;
    }
  }

  return next();
});
