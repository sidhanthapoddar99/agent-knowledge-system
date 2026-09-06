/**
 * Layout registry — discovers layout .astro files at build time and resolves
 * `@type/style` aliases into loaders.
 *
 * Vite requires `import.meta.glob` arguments to be literal strings, so every
 * (type, variant) pair has its own pair of glob calls (built-in + external).
 * External matches override built-in ones by style name.
 */

type LayoutLoader = () => Promise<{ default: unknown }>;

/** The page-level layout variants we support. `@type/style` aliases map into
 *  these via the combination of the alias prefix and the page type. */
export type LayoutVariant =
  | 'docs'
  | 'custom'
  | 'blog-index' | 'blog-post'
  | 'issues-index' | 'issues-detail' | 'issues-subdoc';

/** Chrome layouts — navbar / footer — live in their own namespace. */
export type ChromeKind = 'navbar' | 'footer';

// ============================================================================
// Globs — every entry is `{ builtin, ext }` so external dirs can override by
// style name. Patterns must be literals (Vite constraint).
// ============================================================================

const GLOBS = {
  docs: {
    builtin: import.meta.glob('/src/layouts/docs/*/Layout.astro'),
    ext:     import.meta.glob('@ext-layouts/docs/*/Layout.astro'),
  },
  custom: {
    builtin: import.meta.glob('/src/layouts/custom/*/Layout.astro'),
    ext:     import.meta.glob('@ext-layouts/custom/*/Layout.astro'),
  },
  'blog-index': {
    builtin: import.meta.glob('/src/layouts/blogs/*/IndexLayout.astro'),
    ext:     import.meta.glob('@ext-layouts/blogs/*/IndexLayout.astro'),
  },
  'blog-post': {
    builtin: import.meta.glob('/src/layouts/blogs/*/PostLayout.astro'),
    ext:     import.meta.glob('@ext-layouts/blogs/*/PostLayout.astro'),
  },
  'issues-index': {
    builtin: import.meta.glob('/src/layouts/issues/*/IndexLayout.astro'),
    ext:     import.meta.glob('@ext-layouts/issues/*/IndexLayout.astro'),
  },
  'issues-detail': {
    builtin: import.meta.glob('/src/layouts/issues/*/DetailLayout.astro'),
    ext:     import.meta.glob('@ext-layouts/issues/*/DetailLayout.astro'),
  },
  'issues-subdoc': {
    builtin: import.meta.glob('/src/layouts/issues/*/SubDocLayout.astro'),
    ext:     import.meta.glob('@ext-layouts/issues/*/SubDocLayout.astro'),
  },
  navbar: {
    builtin: import.meta.glob('/src/layouts/navbar/*/index.astro'),
    ext:     import.meta.glob('@ext-layouts/navbar/*/index.astro'),
  },
  footer: {
    builtin: import.meta.glob('/src/layouts/footer/*/index.astro'),
    ext:     import.meta.glob('@ext-layouts/footer/*/index.astro'),
  },
} satisfies Record<string, { builtin: Record<string, LayoutLoader>; ext: Record<string, LayoutLoader> }>;

const STYLE_FROM_PATH = /\/([^/]+)\/[^/]+\.astro$/;

function buildStyleMap(entry: { builtin: Record<string, LayoutLoader>; ext: Record<string, LayoutLoader> }): Map<string, LayoutLoader> {
  const out = new Map<string, LayoutLoader>();
  for (const [p, loader] of Object.entries(entry.builtin)) {
    const m = p.match(STYLE_FROM_PATH);
    if (m) out.set(m[1], loader);
  }
  for (const [p, loader] of Object.entries(entry.ext)) {
    const m = p.match(STYLE_FROM_PATH);
    if (m) out.set(m[1], loader); // external overrides built-in
  }
  return out;
}

type RegistryKey = keyof typeof GLOBS;

const REGISTRY = new Map<RegistryKey, Map<string, LayoutLoader>>(
  (Object.keys(GLOBS) as RegistryKey[]).map((k) => [k, buildStyleMap(GLOBS[k])]),
);

// ============================================================================
// Alias matching
// ============================================================================

/** The alias prefix users write in `site.yaml → layout:` per variant. */
const ALIAS_PREFIX: Record<LayoutVariant, string> = {
  docs: '@docs',
  custom: '@custom',
  'blog-index': '@blog',
  'blog-post': '@blog',
  'issues-index': '@issues',
  'issues-detail': '@issues',
  'issues-subdoc': '@issues',
};

/** Where the source file is expected to live — used in error messages. */
const EXPECTED_PATH: Record<RegistryKey, (style: string) => string> = {
  docs: (s) => `src/layouts/docs/${s}/Layout.astro`,
  custom: (s) => `src/layouts/custom/${s}/Layout.astro`,
  'blog-index': (s) => `src/layouts/blogs/${s}/IndexLayout.astro`,
  'blog-post': (s) => `src/layouts/blogs/${s}/PostLayout.astro`,
  'issues-index': (s) => `src/layouts/issues/${s}/IndexLayout.astro`,
  'issues-detail': (s) => `src/layouts/issues/${s}/DetailLayout.astro`,
  'issues-subdoc': (s) => `src/layouts/issues/${s}/SubDocLayout.astro`,
  navbar: (s) => `src/layouts/navbar/${s}/index.astro`,
  footer: (s) => `src/layouts/footer/${s}/index.astro`,
};

function parseAlias(alias: string): { type: string; style: string } | null {
  const m = alias.match(/^@(\w+)\/(.+)$/);
  if (!m) return null;
  return { type: `@${m[1]}`, style: m[2] };
}

// ============================================================================
// Public API
// ============================================================================

/** List the available style names for a given variant — used by error messages
 *  and the dev toolbar to validate cookie-driven overrides. */
export function availableStyles(variant: LayoutVariant | ChromeKind): string[] {
  return [...(REGISTRY.get(variant)?.keys() ?? [])];
}

/** Resolve `@type/style` for a given variant to a loader. Throws descriptive
 *  errors on misconfiguration so build failures point the user at the fix. */
export function resolveLayout(alias: string, variant: LayoutVariant, pageName: string): LayoutLoader {
  if (!alias) {
    throw new Error(
      `\n[CONFIG ERROR] Missing 'layout' field for page "${pageName}".\n` +
      `  Add a layout field like: layout: "@docs/default"\n`
    );
  }
  const parsed = parseAlias(alias);
  if (!parsed) {
    throw new Error(
      `\n[CONFIG ERROR] Invalid layout format: "${alias}"\n` +
      `  Expected format: @{type}/{style}\n` +
      `  Examples: @docs/default, @blog/default, @custom/home\n`
    );
  }
  const expectedPrefix = ALIAS_PREFIX[variant];
  if (parsed.type !== expectedPrefix) {
    throw new Error(
      `\n[CONFIG ERROR] Layout alias "${alias}" does not match page type.\n` +
      `  Page: ${pageName}\n` +
      `  Expected prefix: ${expectedPrefix}/…\n`
    );
  }

  const loader = REGISTRY.get(variant)?.get(parsed.style);
  if (!loader) {
    throw new Error(
      `\n[CONFIG ERROR] Layout "${parsed.style}" does not exist for ${variant}.\n` +
      `  Page: ${pageName}\n` +
      `  Config: ${alias}\n` +
      `  Expected: ${EXPECTED_PATH[variant](parsed.style)}\n` +
      `  Available: ${availableStyles(variant).join(', ') || '(none)'}\n`
    );
  }
  return loader;
}

/** Resolve `@navbar/style` or `@footer/style` to a loader. */
export function resolveChrome(alias: string, kind: ChromeKind): LayoutLoader {
  const parsed = parseAlias(alias);
  if (!parsed || parsed.type !== `@${kind}`) {
    throw new Error(
      `\n[CONFIG ERROR] Invalid ${kind} layout format: "${alias}"\n` +
      `  Expected format: @${kind}/{style}\n` +
      `  Examples: @${kind}/default\n`
    );
  }
  const loader = REGISTRY.get(kind)?.get(parsed.style);
  if (!loader) {
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    throw new Error(
      `\n[CONFIG ERROR] ${label} layout "${parsed.style}" does not exist.\n` +
      `  Config: ${alias}\n` +
      `  Expected: ${EXPECTED_PATH[kind](parsed.style)}\n` +
      `  Available: ${availableStyles(kind).join(', ') || '(none)'}\n`
    );
  }
  return loader;
}

/** Dev-toolbar layout override. Returns the effective alias to use for this
 *  request, preferring the cookie-provided style when it names a real layout
 *  for the page type — otherwise falls through to the config value. */
export function applyLayoutOverride(
  configLayout: string,
  pageType: string,
  cookieStyle: string | null,
): string {
  if (!cookieStyle) return configLayout;
  const cases: Array<[RegExp, string]> = [
    [/^docs(-index)?$/, '@docs'],
    [/^blog-(index|post)$/, '@blog'],
  ];
  for (const [re, prefix] of cases) {
    if (!re.test(pageType)) continue;
    const variant = prefix === '@docs' ? 'docs' : pageType === 'blog-index' ? 'blog-index' : 'blog-post';
    if (availableStyles(variant as LayoutVariant).includes(cookieStyle)) {
      return `${prefix}/${cookieStyle}`;
    }
    break;
  }
  return configLayout;
}

/** Validate a navbar/footer cookie override before applying it. */
export function applyChromeOverride(configAlias: string, kind: ChromeKind, cookieStyle: string | null): string {
  if (!cookieStyle) return configAlias;
  return availableStyles(kind).includes(cookieStyle) ? `@${kind}/${cookieStyle}` : configAlias;
}
