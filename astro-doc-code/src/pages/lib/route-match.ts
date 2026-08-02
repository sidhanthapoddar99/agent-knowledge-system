/**
 * Server-mode route resolution and render-props preparation.
 *
 * In static build mode, `buildStaticPaths` hands `[...slug].astro` a fully
 * resolved `props` object per URL. In dev / SSR mode, `Astro.props` is empty;
 * `matchServerRoute` walks the configured pages, parses the URL, and returns
 * the same shape of props — so the downstream rendering code in the .astro
 * is identical across both modes.
 *
 * `prepareRender` then derives three render-time values (title, contentType
 * hint for the dev toolbar, and the per-layout props bag) from the match.
 */
import { loadContent } from '@loaders/index';
import { loadIssues, loadIssue, MAX_SUBFOLDER_DEPTH, sectionById } from '@loaders/issues';

export type PageType =
  | 'custom'
  | 'docs-index' | 'docs'
  | 'blog-index' | 'blog-post'
  | 'issues-index' | 'issues-detail' | 'issues-subdoc';

export interface RouteProps {
  pageName: string;
  pageConfig: any;
  dataPath: string;
  layout: string;
  pageType: PageType;
  /** When set, `[...slug].astro` redirects here instead of rendering a layout. */
  redirectTo?: string;
  doc?: any;
  post?: any;
  issue?: any;
  vocabulary?: any;
  issues?: any[];
  allContent?: any[];
  subDoc?:
    | { kind: 'subtask'; subtask: any }
    | { kind: 'note'; note: any }
    | { kind: 'brainstorm'; brainstorm: any }
    | { kind: 'memory'; memory: any }
    | { kind: 'log'; log: any }
    | { kind: 'plan'; plan: any }
    | { kind: 'plan-stage'; plan: any; stage: any };
}

export type RouteResolution =
  | { kind: 'render'; props: RouteProps }
  | { kind: 'not-found' };

/** Internal prefixes that `[...slug].astro` should never render. */
function isInternalSlug(slug: string): boolean {
  return (
    slug.startsWith('api/') || slug === 'api' ||
    slug.startsWith('_') ||
    slug === 'editor' ||
    // The reserved full-page artifact route (src/pages/artifacts/[...path].ts)
    // owns /artifacts/... — never let the page matcher try to render it in
    // dev/SSR. (The reserved-base-URL guard in config.ts blocks a section from
    // claiming these, so the shadowing is defence in depth.)
    slug === 'artifacts' || slug.startsWith('artifacts/')
  );
}

export async function matchServerRoute(
  siteConfig: { pages?: Record<string, any> },
  slug: string,
): Promise<RouteResolution> {
  if (isInternalSlug(slug)) return { kind: 'not-found' };

  const pages = siteConfig.pages || {};

  for (const [pageName, pageConfig] of Object.entries(pages)) {
    const baseUrl = pageConfig.base_url.replace(/^\//, '');
    if (slug !== baseUrl && !slug.startsWith(baseUrl + '/')) continue;

    const common = {
      pageName,
      pageConfig,
      dataPath: pageConfig.data,
      layout: pageConfig.layout || '',
    };

    if (pageConfig.type === 'custom') {
      return { kind: 'render', props: { ...common, pageType: 'custom' } };
    }

    if (pageConfig.type === 'docs') {
      const allContent = await loadContent(common.dataPath, 'docs', {
        pattern: '**/*.{md,mdx}',
        sort: 'position',
        requirePositionPrefix: true,
      });
      if (slug === baseUrl) {
        return { kind: 'render', props: { ...common, pageType: 'docs-index', allContent } };
      }
      const docSlug = slug.slice(baseUrl.length + 1);
      const doc = allContent.find((d: any) => d.slug === docSlug);
      return { kind: 'render', props: { ...common, pageType: 'docs', doc, allContent } };
    }

    if (pageConfig.type === 'blog') {
      const allContent = await loadContent(common.dataPath, 'blog', {
        pattern: '*.{md,mdx}',
        sort: 'date',
        order: 'desc',
      });
      if (slug === baseUrl) {
        return { kind: 'render', props: { ...common, pageType: 'blog-index', allContent } };
      }
      const postSlug = slug.slice(baseUrl.length + 1);
      const post = allContent.find((p: any) => p.slug === postSlug);
      return { kind: 'render', props: { ...common, pageType: 'blog-post', post } };
    }

    if (pageConfig.type === 'issues') {
      const loaded = await loadIssues(common.dataPath);
      if (slug === baseUrl) {
        return {
          kind: 'render',
          props: { ...common, pageType: 'issues-index', issues: loaded.issues, vocabulary: loaded.vocabulary },
        };
      }
      const rest = slug.slice(baseUrl.length + 1);
      const parts = rest.split('/');
      const issueId = parts[0];
      const issue = await loadIssue(common.dataPath, issueId);
      if (!issue) return { kind: 'not-found' };

      if (parts.length === 1) {
        return { kind: 'render', props: { ...common, pageType: 'issues-detail', issue, vocabulary: loaded.vocabulary } };
      }

      // `issue.md` is rendered at the detail root, so `/<issue>/issue` is a
      // stale alias — canonicalize it to the detail page.
      if (parts.length === 2 && parts[1] === 'issue') {
        return {
          kind: 'render',
          props: { ...common, pageType: 'issues-detail', redirectTo: `${pageConfig.base_url}/${issueId}` },
        };
      }

      const subDoc = resolveSubDoc(issue, parts.slice(1));
      if (!subDoc) return { kind: 'not-found' };
      return { kind: 'render', props: { ...common, pageType: 'issues-subdoc', issue, vocabulary: loaded.vocabulary, subDoc } };
    }
  }

  return { kind: 'not-found' };
}

function resolveSubDoc(issue: any, parts: string[]): RouteProps['subDoc'] | null {
  const [id, ...rest] = parts;
  const section = sectionById(id);
  if (!section || !section.subDocKind) return null;

  // plans: a fixed two-level shape, not a free-form tree.
  //   /plans/<plan>          → the single plan page (canonical)
  //   /plans/<plan>/<stage>  → one stage on its own page (reachable, unlinked)
  if (section.reader === 'plan') {
    if (rest.length !== 1 && rest.length !== 2) return null;
    const plan = issue.plans?.find((p: any) => p.name === rest[0]);
    if (!plan) return null;
    if (rest.length === 1) return { kind: 'plan', plan };
    const stage = plan.stages.find((s: any) => s.name === rest[1]);
    return stage ? { kind: 'plan-stage', plan, stage } : null;
  }

  // Everything else: rest = [...groupPath, slug-or-name], groupPath is
  // 0–MAX_SUBFOLDER_DEPTH segments → rest length is 1 … MAX_SUBFOLDER_DEPTH + 1.
  // Subtasks key on `slug`, every other section on `name` — the only per-section
  // difference left, so it is the only branch.
  if (rest.length < 1 || rest.length > MAX_SUBFOLDER_DEPTH + 1) return null;
  const groupPath = rest.slice(0, -1);
  const tail = rest[rest.length - 1];
  const idKey = section.reader === 'subtask' ? 'slug' : 'name';
  const hit = (issue[section.field] as any[] | undefined)?.find(
    (e: any) => e[idKey] === tail
      && e.groupPath.length === groupPath.length
      && e.groupPath.every((g: string, i: number) => g === groupPath[i]),
  );
  if (!hit) return null;
  // The prop name IS the sub-doc kind — `{ kind: 'note', note }`. This used to
  // be a hand-written kind→prop map, which turned out to be the identity on
  // every entry: a per-section list to maintain that said nothing. Keeping the
  // two equal by construction is what lets the static-path builder emit the
  // identical prop shape without importing anything from here.
  return { kind: section.subDocKind, [section.subDocKind]: hit } as RouteProps['subDoc'];
}

// ============================================================================
// Render-time derivations — title, dev-toolbar content type, layout props bag.
// ============================================================================

export interface RenderPlan {
  title: string;
  contentType: 'docs' | 'blog' | 'custom' | undefined;
  layoutProps: Record<string, any>;
  /** File whose "open in editor" button should activate, if any. */
  editorPath?: string;
}

export function prepareRender(props: RouteProps): RenderPlan {
  const { pageType, pageConfig, dataPath, doc, post, issue, vocabulary, subDoc } = props;
  const baseUrl = pageConfig?.base_url;

  const contentType: RenderPlan['contentType'] =
    pageType === 'docs' || pageType === 'docs-index' ? 'docs'
    : pageType === 'blog-index' || pageType === 'blog-post' ? 'blog'
    : pageType === 'custom' ? 'custom'
    : undefined;

  let title = 'Page';
  let layoutProps: Record<string, any> = { dataPath, baseUrl };

  if (pageType === 'docs') {
    if (doc) {
      title = doc.data.title;
      layoutProps = {
        title: doc.data.title,
        description: doc.data.description,
        dataPath,
        baseUrl,
        currentSlug: doc.slug,
        content: doc.content,
        headings: doc.headings,
      };
    } else {
      // Doc not found (possibly deleted) — render an inline placeholder so the
      // sidebar still works; don't 404 because the user's file tree might be
      // mid-edit.
      title = 'Page Not Found';
      layoutProps = {
        title: 'Page Not Found',
        description: '',
        dataPath,
        baseUrl,
        currentSlug: '',
        content: '<p>This page does not exist or has been deleted.</p>',
        headings: [],
      };
    }
  } else if (pageType === 'blog-post' && post) {
    title = post.data.title;
    layoutProps = {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      author: post.data.author,
      tags: post.data.tags,
      content: post.content,
    };
  } else if (pageType === 'blog-index') {
    title = 'Blog';
  } else if (pageType === 'issues-index') {
    title = (vocabulary?.label as string) || 'Issues';
    layoutProps = { dataPath, baseUrl };
  } else if (pageType === 'issues-detail' && issue) {
    title = issue.meta.title;
    layoutProps = { issue, vocabulary, baseUrl };
  } else if (pageType === 'issues-subdoc' && issue && subDoc) {
    // The prop name is the sub-doc kind (see `resolveSubDoc`) and every entry
    // carries a `title` or a `name`, so the page title needs no per-section arm
    // — the previous ladder ended in a bare `subDoc.log.name`, which meant any
    // section someone forgot to add crashed here reading `.name` of undefined.
    // A stage is the one composite: it is titled inside its plan.
    const entry = (subDoc as Record<string, any>)[
      subDoc.kind === 'plan-stage' ? 'stage' : subDoc.kind
    ];
    const subTitle = subDoc.kind === 'plan-stage'
      ? `${subDoc.stage.title} · ${subDoc.plan.title}`
      : (entry.title ?? entry.name);
    title = `${subTitle} · ${issue.meta.title}`;
    layoutProps = { issue, vocabulary, baseUrl, subDoc };
  }

  const editorPath = doc?.filePath || post?.filePath;
  return { title, contentType, layoutProps, editorPath };
}
