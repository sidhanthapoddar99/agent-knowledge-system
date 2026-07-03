/**
 * Asset Embed Preprocessor
 * Handles [[path]] syntax for embedding file contents
 *
 * Features:
 * - [[./path/to/file]] embeds the raw file content
 * - \[[path]] escapes the syntax (shows literal [[path]])
 * - Works both inline and in code blocks
 * - Skips documentation examples (paths with spaces or commas)
 */

import fs from 'fs';
import path from 'path';
import type { Processor, ProcessContext } from '../types';
import { addError } from '../../loaders/cache';
import { toAliasPath } from '../../loaders/paths';

export interface AssetEmbedOptions {
  /** Custom asset path resolver */
  resolvePath?: (filePath: string, assetPath: string, context: ProcessContext) => string;
}

/**
 * Helper to get line number from content offset
 */
function getLineNumber(content: string, offset: number): number {
  return content.slice(0, offset).split('\n').length;
}

/**
 * Find the line number of a pattern in content
 */
function findLineOfPattern(content: string, pattern: string): number {
  const index = content.indexOf(pattern);
  if (index === -1) return 1;
  return content.slice(0, index).split('\n').length;
}

/**
 * Create an asset embed preprocessor
 */
export function createAssetEmbedPreprocessor(options: AssetEmbedOptions = {}): Processor {
  return {
    name: 'asset-embed',
    process(content: string, context: ProcessContext): string {
      const { fileDir } = context;
      const resolvePath = options.resolvePath || defaultResolvePath;
      const originalContent = content; // Keep original for line number calculation
      const frontmatterOffset = context.frontmatterLineCount || 0; // Offset for accurate line numbers

      // Step 1: Protect fenced code blocks (track their positions)
      const codeBlocks: { content: string; startLine: number }[] = [];
      let result = content.replace(/(`{3,}|~{3,})[\s\S]*?\1/g, (match, _fence, offset) => {
        codeBlocks.push({
          content: match,
          startLine: getLineNumber(originalContent, offset) + frontmatterOffset,
        });
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
      });

      // Step 2: Protect inline code
      const inlineCode: string[] = [];
      result = result.replace(/`[^`]+`/g, (match) => {
        inlineCode.push(match);
        return `__INLINE_CODE_${inlineCode.length - 1}__`;
      });

      // Step 3: Protect escaped \[[...]]
      const escaped: string[] = [];
      result = result.replace(/\\\[\[([^\]]+)\]\]/g, (_match, inner) => {
        escaped.push(inner);
        return `__ESCAPED_ASSET_${escaped.length - 1}__`;
      });

      // Step 4: Replace [[path]] with file content
      // Use a manual approach to get match offset for line numbers
      const regex4 = /\[\[([^\]]+)\]\]/g;
      let match4;
      const replacements: { start: number; end: number; replacement: string }[] = [];

      while ((match4 = regex4.exec(result)) !== null) {
        const fullMatch = match4[0];
        const assetPath = match4[1];
        const offset = match4.index;
        const trimmedPath = assetPath.trim();
        const absolutePath = resolvePath(context.filePath, trimmedPath, context);
        // Find actual line by searching for this pattern in original content
        const lineNumber = findLineOfPattern(originalContent, fullMatch) + frontmatterOffset;

        try {
          if (!fs.existsSync(absolutePath)) {
            const aliasPath = toAliasPath(context.filePath);
            addError({
              file: aliasPath,
              line: lineNumber,
              type: 'asset-missing',
              message: `File not found: ${trimmedPath}`,
              suggestion: 'Create the file or update the embed path',
            });
            console.warn(`[asset-embed] ${aliasPath}:${lineNumber} - File not found: ${trimmedPath}`);
            // Keep original match
          } else {
            const fileContent = fs.readFileSync(absolutePath, 'utf-8').trimEnd();
            replacements.push({ start: offset, end: offset + fullMatch.length, replacement: fileContent });
          }
        } catch (error) {
          const aliasPath = toAliasPath(context.filePath);
          addError({
            file: aliasPath,
            line: lineNumber,
            type: 'asset-missing',
            message: `Error reading file: ${trimmedPath}`,
            suggestion: 'Check file permissions and path',
          });
          console.error(`[asset-embed] ${aliasPath}:${lineNumber} - Error reading file: ${trimmedPath}`, error);
        }
      }

      // Apply replacements in reverse order to preserve offsets
      for (let i = replacements.length - 1; i >= 0; i--) {
        const { start, end, replacement } = replacements[i];
        result = result.slice(0, start) + replacement + result.slice(end);
      }

      // Step 5: Restore escaped [[...]]
      result = result.replace(/__ESCAPED_ASSET_(\d+)__/g, (_match, index) => {
        return `[[${escaped[parseInt(index)]}]]`;
      });

      // Step 6: Restore inline code
      result = result.replace(/__INLINE_CODE_(\d+)__/g, (_match, index) => {
        return inlineCode[parseInt(index)];
      });

      // Step 7: Restore and process code blocks
      result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
        const blockData = codeBlocks[parseInt(index)];
        let block = blockData.content;
        const blockStartLine = blockData.startLine;

        // Process [[path]] inside code blocks (for actual embedding)
        // Skip escaped \[[path]] patterns - they won't match this regex
        const regex7 = /(?<!\\)\[\[([^\]]+)\]\]/g;
        let match7;
        const blockReplacements: { start: number; end: number; replacement: string }[] = [];

        while ((match7 = regex7.exec(block)) !== null) {
          const fullMatch = match7[0];
          const assetPath = match7[1];
          const offset = match7.index;
          const trimmedPath = assetPath.trim();

          // Skip documentation examples (contain spaces, commas, or aren't
          // file-relative — only ./ and ../ paths embed inside fences)
          if (
            trimmedPath.includes(' ') ||
            trimmedPath.includes(',') ||
            !(trimmedPath.startsWith('./') || trimmedPath.startsWith('../'))
          ) {
            continue;
          }

          // Find actual line by searching for this pattern in original content
          const lineNumber = findLineOfPattern(originalContent, fullMatch) + frontmatterOffset;

          const absolutePath = resolvePath(context.filePath, trimmedPath, context);

          try {
            if (!fs.existsSync(absolutePath)) {
              const aliasPath = toAliasPath(context.filePath);
              addError({
                file: aliasPath,
                line: lineNumber,
                type: 'asset-missing',
                message: `File not found: ${trimmedPath}`,
                suggestion: 'Create the file or update the embed path',
              });
              console.warn(`[asset-embed] ${aliasPath}:${lineNumber} - File not found: ${trimmedPath}`);
            } else {
              const fileContent = fs.readFileSync(absolutePath, 'utf-8').trimEnd();
              blockReplacements.push({ start: offset, end: offset + fullMatch.length, replacement: fileContent });
            }
          } catch {
            // Keep original on error
          }
        }

        // Apply replacements in reverse order
        for (let i = blockReplacements.length - 1; i >= 0; i--) {
          const { start, end, replacement } = blockReplacements[i];
          block = block.slice(0, start) + replacement + block.slice(end);
        }

        // Strip escape backslash from \[[path]] patterns (for documentation display)
        block = block.replace(/\\(\[\[[^\]]+\]\])/g, '$1');

        return block;
      });

      return result;
    },
  };
}

/**
 * Default path resolver - resolves relative to file directory
 */
function defaultResolvePath(filePath: string, assetPath: string, _context: ProcessContext): string {
  const fileDir = path.dirname(filePath);
  return path.resolve(fileDir, assetPath);
}

/**
 * Blog-specific path resolver
 * Resolves [[asset.jpg]] to assets/<filename>/asset.jpg
 */
export function createBlogAssetResolver(): AssetEmbedOptions['resolvePath'] {
  return (filePath: string, assetPath: string, _context: ProcessContext): string => {
    const blogDir = path.dirname(filePath);
    const filename = path.basename(filePath, path.extname(filePath));

    // If path already starts with ./ or ../, use default resolution
    if (assetPath.startsWith('./') || assetPath.startsWith('../')) {
      return path.resolve(blogDir, assetPath);
    }

    // Otherwise, resolve to assets/<filename>/<assetPath>
    return path.join(blogDir, 'assets', filename, assetPath);
  };
}

// Default preprocessor instance for docs
export const assetEmbedPreprocessor = createAssetEmbedPreprocessor();
