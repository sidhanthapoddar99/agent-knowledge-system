/**
 * Processing Pipeline
 * Orchestrates preprocessors and postprocessors around content rendering
 */

import type { Processor, ProcessContext } from '../types';

export class ProcessingPipeline {
  private preprocessors: Processor[] = [];
  private postprocessors: Processor[] = [];

  /**
   * Add a preprocessor to run before markdown rendering
   */
  addPreprocessor(processor: Processor): this {
    this.preprocessors.push(processor);
    return this;
  }

  /**
   * Add a postprocessor to run after HTML rendering
   */
  addPostprocessor(processor: Processor): this {
    this.postprocessors.push(processor);
    return this;
  }

  /**
   * Get all registered preprocessors
   */
  getPreprocessors(): readonly Processor[] {
    return this.preprocessors;
  }

  /**
   * Get all registered postprocessors
   */
  getPostprocessors(): readonly Processor[] {
    return this.postprocessors;
  }

  /**
   * Run all preprocessors on content
   */
  async preprocess(content: string, context: ProcessContext): Promise<string> {
    let result = content;

    for (const processor of this.preprocessors) {
      try {
        result = await processor.process(result, context);
      } catch (error) {
        console.error(`[pipeline] Preprocessor "${processor.name}" failed:`, error);
        throw error;
      }
    }

    return result;
  }

  /**
   * Run all postprocessors on content
   */
  async postprocess(content: string, context: ProcessContext): Promise<string> {
    let result = content;

    for (const processor of this.postprocessors) {
      try {
        result = await processor.process(result, context);
      } catch (error) {
        console.error(`[pipeline] Postprocessor "${processor.name}" failed:`, error);
        throw error;
      }
    }

    return result;
  }

  /**
   * Process content through the full pipeline
   * @param raw - Raw markdown content
   * @param context - Processing context
   * @param render - Render function (markdown to HTML)
   */
  async process(
    raw: string,
    context: ProcessContext,
    render: (content: string) => string | Promise<string>
  ): Promise<string> {
    // Run preprocessors
    const preprocessed = await this.preprocess(raw, context);

    // Render markdown to HTML
    const rendered = await render(preprocessed);

    // Run postprocessors
    const postprocessed = await this.postprocess(rendered, context);

    return postprocessed;
  }
}

/**
 * Create a new processing pipeline with default configuration
 */
export function createPipeline(): ProcessingPipeline {
  return new ProcessingPipeline();
}
