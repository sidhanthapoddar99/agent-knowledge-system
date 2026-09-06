/**
 * Theme System Type Definitions
 */

/**
 * Theme manifest file (theme.yaml) structure
 */
export interface ThemeManifest {
  /** Display name of the theme */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Brief description of the theme */
  description?: string;

  /** Parent theme to extend (e.g., "@theme/default") or null for base theme */
  extends?: string | null;

  /** How child theme CSS interacts with parent CSS */
  override_mode?: 'merge' | 'override' | 'replace';

  /** Whether the theme supports dark mode */
  supports_dark_mode: boolean;

  /** List of CSS files to load (in order) */
  files: string[];

  /** Required CSS variables that must be defined */
  required_variables?: {
    colors?: string[];
    fonts?: string[];
    elements?: string[];
  };
}

/**
 * Loaded theme configuration
 */
export interface ThemeConfig {
  /** Theme name (from alias, e.g., "default" or "minimal") */
  name: string;

  /** Absolute path to theme directory */
  path: string;

  /** Parsed theme manifest */
  manifest: ThemeManifest;

  /** Combined CSS content from all theme files */
  css: string;

  /** Per-file CSS content map (filename → CSS), used for override mode filtering */
  cssPerFile: Map<string, string>;
}

/**
 * Theme validation error
 */
export interface ThemeValidationError {
  /** Type of validation error */
  type: 'missing-file' | 'missing-variable' | 'invalid-manifest' | 'circular-extends' | 'theme-not-found';

  /** Human-readable error message */
  message: string;

  /** File that caused the error (if applicable) */
  file?: string;

  /** CSS variable that's missing (if applicable) */
  variable?: string;

  /** Suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Result of theme validation
 */
export interface ThemeValidationResult {
  /** Whether the theme is valid */
  valid: boolean;

  /** List of validation errors */
  errors: ThemeValidationError[];

  /** List of non-fatal warnings */
  warnings: string[];
}

/**
 * Theme resolution result
 */
export interface ResolvedTheme {
  /** Absolute path to theme directory */
  path: string;

  /** Theme name extracted from alias */
  name: string;
}
