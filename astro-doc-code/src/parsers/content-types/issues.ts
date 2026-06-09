/**
 * Issues Parser
 *
 * Used to render per-issue markdown (issue.md, comments/NNN_*.md, supporting docs).
 * Issue *loading* — scanning folders, reading settings.json — lives in
 * `src/loaders/issues.ts`, not here. This parser only handles the markdown
 * → HTML step so we can reuse the existing renderer + postprocessors.
 */

import path from 'path';
import type { FileType, FrontmatterSchema } from '../types';
import { BaseContentParser } from '../core/base-parser';
import { createAssetEmbedPreprocessor } from '../preprocessors/asset-embed';
import { headingIdsPostprocessor } from '../postprocessors/heading-ids';
import { internalLinksPostprocessor } from '../postprocessors/internal-links';
import { issueBodyLinksPostprocessor } from '../postprocessors/issue-body-links';
import { issueAssetSrcPostprocessor } from '../postprocessors/issue-asset-src';
import { externalLinksPostprocessor } from '../postprocessors/external-links';

export class IssuesParser extends BaseContentParser {
  constructor() {
    super('blog'); // reuse 'blog' ContentType for pipeline purposes; issues are not a registered ContentType

    this.pipeline
      // `[[path]]` content embeds, resolved with the issue-folder convention
      // (`./`/`../` file-relative, bare name → `<dir>/assets/<name>`).
      .addPreprocessor(createAssetEmbedPreprocessor({
        resolvePath: (filePath, assetPath) => this.getAssetPath(filePath, assetPath),
      }))
      .addPostprocessor(headingIdsPostprocessor)
      .addPostprocessor(internalLinksPostprocessor)
      // Issues-only: re-root relative links in the root `issue.md` so they
      // survive the detail-page URL collapse (`<issue-id>/issue.md` → `/<issue-id>`).
      .addPostprocessor(issueBodyLinksPostprocessor)
      // Issues-only: relative <img src> → absolute /_issue-assets/… URLs
      // (issue folders aren't served at any browser-relative position).
      .addPostprocessor(issueAssetSrcPostprocessor)
      .addPostprocessor(externalLinksPostprocessor);
  }

  parseFilename(filename: string) {
    return { date: null, slug: filename };
  }

  getAssetPath(filePath: string, assetRelPath: string): string {
    const dir = path.dirname(filePath);
    if (assetRelPath.startsWith('./') || assetRelPath.startsWith('../')) {
      return path.resolve(dir, assetRelPath);
    }
    return path.join(dir, 'assets', assetRelPath);
  }

  getFrontmatterSchema(): FrontmatterSchema {
    return { required: [], optional: ['title', 'description', 'draft'] };
  }

  generateSlug(relativePath: string, _fileType: FileType): string {
    return relativePath
      .replace(/\\/g, '/')
      .replace(/\.(mdx|md)$/, '');
  }
}

export function createIssuesParser(): IssuesParser {
  return new IssuesParser();
}
