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
import { loadIssues, SUBDOC_SECTIONS } from '@loaders/issues';

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
        // Canonical redirect: `/<issue>/issue` → `/<issue>` (issue.md is the body).
        paths.push({
          params: { slug: `${baseUrl}/${issue.id}/issue` },
          props: { ...common, pageType: 'issues-detail', redirectTo: `${pageConfig.base_url}/${issue.id}` },
        });
        // One loop over the section registry, instead of one hand-written loop
        // per section. A section added to the registry gets its sub-doc URLs
        // here for free — which is the point: the old shape failed by emitting
        // nothing, silently, for whichever section someone forgot.
        for (const section of SUBDOC_SECTIONS) {
          if (section.reader === 'plan') {
            for (const plan of issue.plans) {
              paths.push({
                params: { slug: [baseUrl, issue.id, section.id, plan.name].filter(Boolean).join('/') },
                props: { ...common, pageType: 'issues-subdoc', issue, vocabulary, subDoc: { kind: 'plan', plan } },
              });
              // Individual stage pages stay reachable — the sub-doc machinery
              // gives every markdown file a route for free. Nothing links to
              // them; the single plan page is canonical.
              for (const stage of plan.stages) {
                paths.push({
                  params: { slug: [baseUrl, issue.id, section.id, plan.name, stage.name].filter(Boolean).join('/') },
                  props: { ...common, pageType: 'issues-subdoc', issue, vocabulary, subDoc: { kind: 'plan-stage', plan, stage } },
                });
              }
            }
            continue;
          }

          const idKey = section.reader === 'subtask' ? 'slug' : 'name';
          for (const entry of (issue as any)[section.field] as any[]) {
            const slugPath = [baseUrl, issue.id, section.id, ...entry.groupPath, entry[idKey]]
              .filter(Boolean).join('/');
            paths.push({
              params: { slug: slugPath },
              props: {
                ...common, pageType: 'issues-subdoc', issue, vocabulary,
                subDoc: { kind: section.subDocKind, [section.subDocKind!]: entry },
              },
            });
          }
        }
      }
    }
  }

  return paths;
}
