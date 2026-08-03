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
import { planStageAliasUrl, sourceFormSlug, canonicalContentUrl } from './route-match';

type Props = Record<string, unknown>;
type PathEntry = { params: { slug: string | undefined }; props: Props };

/**
 * Emit the SOURCE-FORM address of a doc/post as a redirect to its canonical
 * slug — `/user-guide/19_issues/01_overview` → `/user-guide/issues/overview`.
 *
 * Content here is authored against the file tree, so a correct relative link
 * names the file's real path; docs strip `NN_` prefixes and blog strips the
 * date, which would otherwise make every such link a 404. The clean slug stays
 * canonical and this is only an alias, so there is still exactly one URL to
 * write down. Mirrors the server-mode branch in `route-match.ts` — the two must
 * agree.
 *
 * No alias when the two spellings coincide (a file with no prefix), and none
 * when the source form is already some other document's canonical slug — a
 * duplicate entry here fails the whole build, and a real page must win over an
 * alias to one.
 */
function addSourceFormAlias(
  paths: PathEntry[], common: Props, baseUrl: string, basePath: string,
  item: any, pageType: 'docs' | 'blog-post', canonical: Set<string>,
): void {
  const source = sourceFormSlug(item);
  if (!source || source === item.slug || canonical.has(source)) return;
  paths.push({
    params: { slug: `${baseUrl}/${source}` },
    props: { ...common, pageType, redirectTo: canonicalContentUrl(basePath, item.slug) },
  });
}

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
      const docSlugs = new Set(content.map((d: any) => d.slug));
      for (const doc of content) {
        paths.push({
          params: { slug: `${baseUrl}/${doc.slug}` },
          props: { ...common, pageType: 'docs', doc, allContent: content },
        });
        addSourceFormAlias(paths, common, baseUrl, pageConfig.base_url, doc, 'docs', docSlugs);
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
      const postSlugs = new Set(posts.map((p: any) => p.slug));
      for (const post of posts) {
        paths.push({
          params: { slug: `${baseUrl}/${post.slug}` },
          props: { ...common, pageType: 'blog-post', post },
        });
        addSourceFormAlias(paths, common, baseUrl, pageConfig.base_url, post, 'blog-post', postSlugs);
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
              // `overview.md` IS the plan's body, rendered at the plan's own
              // URL — so the file has a real path and no page. Same collapse
              // as `issue.md` at the detail root, and the same answer.
              paths.push({
                params: { slug: [baseUrl, issue.id, section.id, plan.name, 'overview'].filter(Boolean).join('/') },
                props: {
                  ...common,
                  pageType: 'issues-detail',
                  redirectTo: `${pageConfig.base_url}/${issue.id}/${section.id}/${plan.name}`,
                },
              });
              // A stage gets no PAGE of its own — the plan page renders every
              // stage inline under an anchored heading. It keeps an ADDRESS,
              // because a stage is a file and a relative markdown link to one
              // resolves to this path; see `planStageAliasTarget`.
              for (const stage of plan.stages) {
                paths.push({
                  params: { slug: [baseUrl, issue.id, section.id, plan.name, stage.name].filter(Boolean).join('/') },
                  props: {
                    ...common,
                    pageType: 'issues-detail',
                    redirectTo: planStageAliasUrl(pageConfig.base_url, issue.id, section.id, plan.name, stage.anchor),
                  },
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
