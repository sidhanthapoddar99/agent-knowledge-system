/**
 * Build the full `getStaticPaths()` result for `[...slug].astro`.
 *
 * One entry per user-visible URL: custom page root, docs index + each doc,
 * blog index + each post, issues index + each issue + each sub-doc (subtask /
 * note / agent-log entry).
 *
 * The resulting `props` on each path line up with the fields `[...slug].astro`
 * destructures so the server-mode branch and the static-mode branch feed the
 * same rendering code downstream.
 */
import { loadContent } from '@loaders/index';
import { loadIssues } from '@loaders/issues';

type Props = Record<string, unknown>;
type PathEntry = { params: { slug: string | undefined }; props: Props };

export async function buildStaticPaths(siteConfig: { pages?: Record<string, any> }): Promise<PathEntry[]> {
  const pages = siteConfig.pages || {};
  const paths: PathEntry[] = [];

  for (const [pageName, pageConfig] of Object.entries(pages)) {
    const baseUrl = pageConfig.base_url.replace(/^\//, '');
    const dataPath = pageConfig.data;
    const layout = pageConfig.layout || '';
    const common = { pageName, pageConfig, dataPath, layout };

    if (pageConfig.type === 'custom') {
      paths.push({
        params: { slug: baseUrl || undefined },
        props: { ...common, pageType: 'custom' },
      });
    } else if (pageConfig.type === 'docs') {
      const content = await loadContent(dataPath, 'docs', {
        pattern: '**/*.{md,mdx}',
        sort: 'position',
        requirePositionPrefix: true,
      });
      paths.push({
        params: { slug: baseUrl || undefined },
        props: { ...common, pageType: 'docs-index', allContent: content },
      });
      for (const doc of content) {
        paths.push({
          params: { slug: `${baseUrl}/${doc.slug}` },
          props: { ...common, pageType: 'docs', doc, allContent: content },
        });
      }
    } else if (pageConfig.type === 'blog') {
      const posts = await loadContent(dataPath, 'blog', {
        pattern: '*.{md,mdx}',
        sort: 'date',
        order: 'desc',
      });
      paths.push({
        params: { slug: baseUrl || undefined },
        props: { ...common, pageType: 'blog-index', allContent: posts },
      });
      for (const post of posts) {
        paths.push({
          params: { slug: `${baseUrl}/${post.slug}` },
          props: { ...common, pageType: 'blog-post', post },
        });
      }
    } else if (pageConfig.type === 'issues') {
      const { issues, vocabulary } = await loadIssues(dataPath);
      paths.push({
        params: { slug: baseUrl || undefined },
        props: { ...common, pageType: 'issues-index', issues, vocabulary },
      });
      for (const issue of issues) {
        paths.push({
          params: { slug: `${baseUrl}/${issue.id}` },
          props: { ...common, pageType: 'issues-detail', issue, vocabulary },
        });
        for (const s of issue.subtasks) {
          const slugPath = [baseUrl, issue.id, 'subtasks', ...s.groupPath, s.slug].filter(Boolean).join('/');
          paths.push({
            params: { slug: slugPath },
            props: { ...common, pageType: 'issues-subdoc', issue, vocabulary, subDoc: { kind: 'subtask', subtask: s } },
          });
        }
        for (const n of issue.notes) {
          const slugPath = [baseUrl, issue.id, 'notes', ...n.groupPath, n.name].filter(Boolean).join('/');
          paths.push({
            params: { slug: slugPath },
            props: { ...common, pageType: 'issues-subdoc', issue, vocabulary, subDoc: { kind: 'note', note: n } },
          });
        }
        for (const log of issue.agentLogs) {
          const slugPath = [baseUrl, issue.id, 'agent-log', ...log.groupPath, log.name].filter(Boolean).join('/');
          paths.push({
            params: { slug: slugPath },
            props: { ...common, pageType: 'issues-subdoc', issue, vocabulary, subDoc: { kind: 'log', log } },
          });
        }
      }
    }
  }

  return paths;
}
