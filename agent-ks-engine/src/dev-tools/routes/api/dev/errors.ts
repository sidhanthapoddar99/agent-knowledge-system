/**
 * Dev API Endpoint: Errors
 *
 * Returns all cached errors and warnings for the error logger dev toolbar.
 * Only available in development mode.
 */

import type { APIRoute } from 'astro';
import { getAllIssues, getCacheStats } from '@loaders/cache';

export const GET: APIRoute = async () => {
  // Only available in dev mode
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { errors, warnings } = getAllIssues();
  const stats = getCacheStats();

  return new Response(
    JSON.stringify({
      errors,
      warnings,
      stats,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
};
