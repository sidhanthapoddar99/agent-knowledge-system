// Loaders - Data and configuration loading modules

// Path resolver
export {
  paths,
  resolvePath,
  getConfigPath,
  getLayoutPath,
  initPaths,
  getUserPaths,
  getPathsByCategory,
  getPathCategory,
  isInitialized,
  type PathCategory,
} from './paths';

// Config loader
export {
  loadSiteConfig,
  loadNavbarConfig,
  loadFooterConfig,
  getPages,
  getPage,
  getThemePaths,
  resolvePageUrl,
  processCopyright,
  validateRoutes,
  type SiteConfig,
  type SiteMetadata,
  type PageConfig,
  type PageType,
  type NavbarConfig,
  type NavItem,
  type FooterConfig,
  type FooterColumn,
  type FooterLink,
  type SocialLink,
} from './config';

// Data loader
export {
  loadContent,
  loadFile,
  loadSettings,
  loadContentWithSettings,
  DataLoaderError,
  type LoadedContent,
  type LoadOptions,
  type ContentSettings,
  type Heading,
} from './data';

// Alias resolver
export {
  isAliasPath,
  extractPrefix,
  resolveAlias,
  resolveAliasPath,
  resolveLayoutPath,
  getLayoutType,
  getLayoutName,
  getAliasMap,
  type AliasPrefix,
  type ResolvedAlias,
} from './alias';

// Theme loader
export {
  resolveThemeName,
  getThemeCSS,
  loadThemeConfig,
  getAvailableThemes,
} from './theme';

// Issue date cache (derived from git history)
export {
  getIssueDate,
  getAllIssueDates,
  invalidateIssueDateCache,
  getIssueDateWatchPaths,
} from './issue-dates';

// Cache manager (unified caching with mtime-based validation)
export {
  getCached,
  setCache,
  clearCache,
  clearAllCaches,
  onFileChange,
  onFileAdd,
  onFileDelete,
  getCacheStats as getUnifiedCacheStats,
  getHitRate,
  invalidateAll,
  invalidateSidebarCache,
  clearThemeCache,
  clearSettingsCache,
} from './cache-manager';

// Error/warning utilities (from old cache for backward compatibility)
export {
  addError,
  addWarning,
  getErrors,
  getWarnings,
  getAllIssues,
  getErrorCount,
  getWarningCount,
  getCacheStats,
  isCacheInitialized,
  type ContentError,
  type ContentWarning,
  type ErrorType,
  type WarningType,
} from './cache';

// Parser system (re-exported for convenience)
export {
  getParser,
  createParser,
  type ContentType,
} from '../parsers';
