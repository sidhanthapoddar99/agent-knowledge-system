/**
 * Code Block Protection
 * Utility to protect fenced code blocks and inline code from processing
 */

export interface ProtectedContent {
  /** Content with placeholders */
  content: string;
  /** Function to restore protected content */
  restore: (content: string) => string;
}

interface ProtectionState {
  codeBlocks: string[];
  inlineCode: string[];
}

/**
 * Protect code blocks and inline code from processing
 * Returns content with placeholders and a restore function
 */
export function protectCodeBlocks(content: string): ProtectedContent {
  const state: ProtectionState = {
    codeBlocks: [],
    inlineCode: [],
  };

  let result = content;

  // Protect fenced code blocks (``` and ~~~)
  result = result.replace(/(`{3,}|~{3,})[\s\S]*?\1/g, (match) => {
    state.codeBlocks.push(match);
    return `__CODE_BLOCK_${state.codeBlocks.length - 1}__`;
  });

  // Protect inline code (`...`)
  result = result.replace(/`[^`]+`/g, (match) => {
    state.inlineCode.push(match);
    return `__INLINE_CODE_${state.inlineCode.length - 1}__`;
  });

  return {
    content: result,
    restore: (processed: string) => restoreCodeBlocks(processed, state),
  };
}

/**
 * Restore protected code blocks
 */
function restoreCodeBlocks(content: string, state: ProtectionState): string {
  let result = content;

  // Restore inline code
  result = result.replace(/__INLINE_CODE_(\d+)__/g, (_match, index) => {
    return state.inlineCode[parseInt(index)];
  });

  // Restore code blocks
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return state.codeBlocks[parseInt(index)];
  });

  return result;
}

/**
 * Process content inside code blocks
 * Useful for embedding assets inside code blocks
 */
export function processInsideCodeBlocks(
  content: string,
  processor: (blockContent: string) => string
): string {
  return content.replace(/(`{3,}|~{3,})([\s\S]*?)\1/g, (match, fence, blockContent) => {
    return fence + processor(blockContent) + fence;
  });
}
