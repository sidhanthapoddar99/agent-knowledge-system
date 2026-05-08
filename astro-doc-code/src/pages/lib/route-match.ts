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
import { loadIssues, loadIssue } from '@loaders/issues';

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
  doc?: any;
  post?: any;
  issue?: any;
  vocabulary?: any;
  issues?: any[];
  allContent?: any[];
  subDoc?:
    | { kind: 'subtask'; subtask: any }
    | { kind: 'note'; note: any }
    | { kind: 'log'; log: any };
}

export type RouteResolution =
  | { kind: 'render'; props: RouteProps }
  | { kind: 'not-found' };

/** Internal prefixes that `[...slug].astro` should never render. */
function isInternalSlug(slug: string): boolean {
  return slug.startsWith('api/') || slug === 'api' || slug.startsWith('_') || slug === 'editor';
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

      const subDoc = resolveSubDoc(issue, parts.slice(1));
      if (!subDoc) return { kind: 'not-found' };
      return { kind: 'render', props: { ...common, pageType: 'issues-subdoc', issue, vocabulary: loaded.vocabulary, subDoc } };
    }
  }

  return { kind: 'not-found' };
}

function resolveSubDoc(issue: any, parts: string[]): RouteProps['subDoc'] | null {
  const [kind, ...rest] = parts;
  // subtasks / notes / agent-log: rest = [...groupPath, slug-or-name],
  // groupPath is 0–2 segments.
  if (
    (kind === 'subtasks' || kind === 'notes' || kind === 'agent-log')
    && rest.length >= 1 && rest.length <= 3
  ) {
    const groupPath = rest.slice(0, -1);
    const tail = rest[rest.length - 1];
    const matchPath = (gp: string[]) =>
      gp.length === groupPath.length && gp.every((g, i) => g === groupPath[i]);
    if (kind === 'subtasks') {
      const s = issue.subtasks.find((st: any) => st.slug === tail && matchPath(st.groupPath));
      return s ? { kind: 'subtask', subtask: s } : null;
    }
    if (kind === 'notes') {
      const n = issue.notes.find((nt: any) => nt.name === tail && matchPath(nt.groupPath));
      return n ? { kind: 'note', note: n } : null;
    }
    const log = issue.agentLogs.find((l: any) => l.name === tail && matchPath(l.groupPath));
    return log ? { kind: 'log', log } : null;
  }
  return null;
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
    const subTitle = subDoc.kind === 'subtask' ? subDoc.subtask.title
      : subDoc.kind === 'note' ? subDoc.note.name
      : subDoc.log.name;
    title = `${subTitle} · ${issue.meta.title}`;
    layoutProps = { issue, vocabulary, baseUrl, subDoc };
  }

  const editorPath = doc?.filePath || post?.filePath;
  return { title, contentType, layoutProps, editorPath };
}
