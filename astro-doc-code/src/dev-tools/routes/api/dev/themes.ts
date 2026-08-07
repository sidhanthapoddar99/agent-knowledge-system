/**
 * Dev API Endpoint: Themes
 *
 * Returns all available themes and the currently configured theme.
 * Only available in development mode.
 */

import type { APIRoute } from 'astro';
import { getAvailableThemes, loadThemeConfig, resolveThemeName } from '@loaders/theme';
import { getTheme } from '@loaders/config';

export const GET: APIRoute = async () => {
  // Only available in dev mode
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const themes = getAvailableThemes();

  let currentThemeRef: string;
  let currentName = 'Unknown';
  try {
    currentThemeRef = getTheme();
    const currentConfig = loadThemeConfig(currentThemeRef);
    currentName = currentConfig.manifest.name;
  } catch (err) {
    currentThemeRef = '';
    currentName = `Error: ${(err as Error).message}`;
  }

  // Get details for each available theme
  const themeDetails = themes.map((themeName) => {
    const themeRef = resolveThemeName(themeName);
    try {
      const config = loadThemeConfig(themeRef);
      return {
        name: themeName,
        ref: themeRef,
        displayName: config.manifest.name,
        description: config.manifest.description || '',
        version: config.manifest.version,
        extends: config.manifest.extends || null,
        supportsDarkMode: config.manifest.supports_dark_mode ?? true,
        error: null,
      };
    } catch (err) {
      return {
        name: themeName,
        ref: themeRef,
        displayName: themeName,
        description: '',
        version: 'unknown',
        extends: null,
        supportsDarkMode: true,
        error: (err as Error).message,
      };
    }
  });

  return new Response(
    JSON.stringify({
      current: {
        ref: currentThemeRef,
        name: currentName,
      },
      themes: themeDetails,
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
