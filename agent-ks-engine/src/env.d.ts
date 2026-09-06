/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    layoutOverride?: string;
  }
}

interface ImportMetaEnv {
  readonly CONFIG_DIR: string;  // Bootstrap: path to config dir containing site.yaml
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
