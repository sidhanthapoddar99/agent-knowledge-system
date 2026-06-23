/**
 * Postprocessors module exports
 */

export {
  createHeadingIdsPostprocessor,
  headingIdsPostprocessor,
} from './heading-ids';

export {
  createExternalLinksPostprocessor,
  externalLinksPostprocessor,
  type ExternalLinksOptions,
} from './external-links';

export {
  internalLinksPostprocessor,
} from './internal-links';

export {
  createTableWrapPostprocessor,
  tableWrapPostprocessor,
} from './table-wrap';
