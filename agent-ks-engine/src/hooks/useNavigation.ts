/**
 * Navigation Hook - Utilities for navigation and routing
 */

/**
 * Check if a path is active (current or parent)
 */
export function isActivePath(currentPath: string, targetPath: string): boolean {
  if (targetPath === '/') {
    return currentPath === '/';
  }

  // Normalize paths
  const normalizedCurrent = currentPath.replace(/\/$/, '');
  const normalizedTarget = targetPath.replace(/\/$/, '');

  return normalizedCurrent === normalizedTarget ||
         normalizedCurrent.startsWith(normalizedTarget + '/');
}

/**
 * Generate breadcrumbs from a path
 */
export interface Breadcrumb {
  label: string;
  href: string;
  isActive: boolean;
}

export function generateBreadcrumbs(
  path: string,
  labels?: Record<string, string>
): Breadcrumb[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += '/' + segment;

    const label = labels?.[segment] ||
      segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    breadcrumbs.push({
      label,
      href: currentPath,
      isActive: i === segments.length - 1,
    });
  }

  return breadcrumbs;
}

/**
 * Get the parent path
 */
export function getParentPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return '/';
  }

  segments.pop();
  return '/' + segments.join('/');
}

/**
 * Join path segments safely
 */
export function joinPaths(...segments: string[]): string {
  return '/' + segments
    .map(s => s.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

export default {
  isActivePath,
  generateBreadcrumbs,
  getParentPath,
  joinPaths,
};
