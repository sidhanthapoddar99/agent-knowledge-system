#!/usr/bin/env bun
/**
 * Validate the three independent release streams without publishing anything.
 *
 * GitHub validates workflow syntax only after a push. This local gate parses the
 * YAML and checks the repository-specific contract: exact tag namespaces,
 * independent version declarations and notes, immutable subtree identity for
 * metadata-only releases, and binary assets only for the Rust CLI.
 */

import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const yaml = createRequire(path.join(REPO, 'agent-ks-engine', 'package.json'))('js-yaml');
const read = (relative) => fs.readFileSync(path.join(REPO, relative), 'utf8');
const parse = (relative) => yaml.load(read(relative));
const LEGACY_CLI_PREFIX = ['agent-ks', 'v'].join('-');
const LEGACY_ENGINE_NOTES = ['agent-ks-engine', 'releases'].join('/');
const LEGACY_PLUGIN_NOTES = ['plugins/agent-ks', 'releases'].join('/');
const RELEASE_CONTROL = 'scripts/release/release_control.py';
const RELEASE_CONTROL_TEST = 'scripts/release/test_release_control.py';
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function exactReleaseTrigger(workflow, expectedTag, file) {
  const trigger = workflow.on;
  check(trigger && Object.keys(trigger).length === 1 && trigger.push, `${file}: release workflow must trigger only on push`);
  check(
    trigger?.push && Object.keys(trigger.push).length === 1,
    `${file}: tag push must be the only push selector`
  );
  check(
    JSON.stringify(trigger?.push?.tags) === JSON.stringify([expectedTag]),
    `${file}: expected only tag ${expectedTag}`
  );
}

function movingAliasContract(workflow, file, product, alias, publishStepName) {
  const triggerPrefix = workflow?.on?.push?.tags?.[0]?.replace(/\*$/, '') ?? '';
  check(!alias.startsWith(triggerPrefix), `${file}: ${alias} must not match the release trigger`);
  check(workflow?.concurrency?.group === `agent-ks-${product}-release`, `${file}: product release concurrency is required`);
  check(workflow?.concurrency?.['cancel-in-progress'] === false, `${file}: release runs must queue instead of cancelling`);

  const steps = workflow?.jobs?.publish?.steps ?? [];
  const publishIndex = steps.findIndex((step) => step.name === publishStepName);
  const aliasIndex = steps.findIndex((step) => step.name?.toLowerCase().includes('latest alias'));
  check(publishIndex >= 0, `${file}: publication step is missing`);
  check(aliasIndex > publishIndex, `${file}: latest alias must advance only after publication succeeds`);
  const aliasStep = steps[aliasIndex] ?? {};
  const aliasRun = String(aliasStep.run ?? '');
  check(aliasRun.includes(`${RELEASE_CONTROL} update-latest`), `${file}: shared release control must update the alias`);
  check(aliasRun.includes(`--product ${product}`), `${file}: alias update must be product-scoped`);
  check(aliasRun.includes('--release-tag "$GITHUB_REF_NAME"'), `${file}: alias update must validate the triggering tag`);
  check(aliasRun.includes('--repository "$GITHUB_REPOSITORY"'), `${file}: alias update must inspect repository releases`);
  check(aliasStep?.env?.GH_TOKEN === '${{ github.token }}', `${file}: alias update needs the workflow token`);
}

function stableNote(relative, version, product, heading = version) {
  const file = path.join(relative, `${version}.md`);
  const absolute = path.join(REPO, file);
  check(fs.existsSync(absolute), `${product}: missing release note ${file}`);
  if (!fs.existsSync(absolute)) return;
  const lines = fs.readFileSync(absolute, 'utf8').split(/\r?\n/);
  check(
    new RegExp(`^# ${heading.replaceAll('.', '\\.')} — .+`).test(lines[0]),
    `${file}: line 1 must be # ${heading} — <one line>`
  );
  check(lines.slice(1).some((line) => line.trim()), `${file}: release note needs a body`);
}

function subtreeAtHead(relative, product) {
  try {
    const id = childProcess
      .execFileSync('git', ['rev-parse', `HEAD:${relative}`], { cwd: REPO, encoding: 'utf8' })
      .trim();
    check(/^[0-9a-f]{40}$/.test(id), `${product}: ${relative} must resolve to a Git tree at HEAD`);
    return id;
  } catch {
    failures.push(`${product}: ${relative} must resolve to a Git tree at HEAD`);
    return 'unresolved';
  }
}

const files = {
  engine: '.github/workflows/agent-ks-engine-release.yml',
  plugin: '.github/workflows/agent-ks-plugin-release.yml',
  cliRelease: '.github/workflows/agent-ks-cli-release.yml',
  cliCi: '.github/workflows/agent-ks-cli.yml',
};
const engine = parse(files.engine);
const plugin = parse(files.plugin);
const cliRelease = parse(files.cliRelease);
const cliCi = parse(files.cliCi);

exactReleaseTrigger(engine, 'agent-ks-engine-v*', files.engine);
exactReleaseTrigger(plugin, 'agent-ks-plugin-v*', files.plugin);
exactReleaseTrigger(cliRelease, 'agent-ks-cli-v*', files.cliRelease);

check(!cliCi?.on?.push?.tags, `${files.cliCi}: branch CI must not trigger on tags`);
check(!cliCi?.jobs?.publish, `${files.cliCi}: branch CI must not contain a publish job`);
check(cliCi?.permissions?.contents === 'read', `${files.cliCi}: branch CI needs read-only contents permission`);

const engineText = read(files.engine);
const pluginText = read(files.plugin);
const cliReleaseText = read(files.cliRelease);
const releaseControlText = read(RELEASE_CONTROL);

movingAliasContract(engine, files.engine, 'engine', 'engine-latest', 'Create or update the release');
movingAliasContract(plugin, files.plugin, 'plugin', 'plugin-latest', 'Create or update the release');
movingAliasContract(cliRelease, files.cliRelease, 'cli', 'cli-latest', 'Publish versioned CLI release');

for (const [file, text, product] of [
  [files.engine, engineText, 'engine'],
  [files.plugin, pluginText, 'plugin'],
  [files.cliRelease, cliReleaseText, 'cli'],
]) {
  check(new RegExp(`release_title\\(['"]${product}['"]`).test(text), `${file}: product-first release title generation is required`);
}

for (const required of [
  'engine-latest',
  'plugin-latest',
  'cli-latest',
  '--force-with-lease=',
  'FETCH_HEAD^{commit}',
  'published_at',
  'prerelease',
  'draft',
  'version_at_alias',
]) {
  check(releaseControlText.includes(required), `${RELEASE_CONTROL}: missing ${required}`);
}

try {
  childProcess.execFileSync('python3', [RELEASE_CONTROL_TEST], {
    cwd: REPO,
    encoding: 'utf8',
    stdio: 'pipe',
  });
} catch (error) {
  const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
  failures.push(`${RELEASE_CONTROL_TEST}: failed${detail ? `\n${detail}` : ''}`);
}
for (const [file, text, productPath] of [
  [files.engine, engineText, 'agent-ks-engine'],
  [files.plugin, pluginText, 'plugins/agent-ks'],
]) {
  check(text.includes(`git', 'rev-parse', f'{commit}:${productPath}'`), `${file}: exact product subtree must be resolved`);
  check(text.includes('COMMIT_SHA='), `${file}: release metadata must expose the full commit SHA`);
  check(text.includes('TREE_ID='), `${file}: release metadata must expose the subtree tree ID`);
  check(text.includes('## Immutable source'), `${file}: release body must include immutable source metadata`);
  for (const forbidden of ['actions/upload-artifact', 'gh release upload', 'SHA256SUMS', 'tar -czf', 'zipfile']) {
    check(!text.includes(forbidden), `${file}: metadata-only release must not contain ${forbidden}`);
  }
}

check(engineText.includes('agent-ks-engine/src/loaders/engine-version.ts'), `${files.engine}: ENGINE_VERSION must be authoritative`);
check(engineText.includes("pathlib.Path('agent-ks-engine/release-notes')"), `${files.engine}: engine note path is wrong`);
check(pluginText.includes('plugins/agent-ks/.claude-plugin/plugin.json'), `${files.plugin}: Claude manifest must be validated`);
check(pluginText.includes('plugins/agent-ks/.codex-plugin/plugin.json'), `${files.plugin}: Codex manifest must be validated`);
check(pluginText.includes("pathlib.Path('plugins/agent-ks/release-notes')"), `${files.plugin}: plugin note path is wrong`);
check(cliReleaseText.includes("'agent-ks-cli-v' + version"), `${files.cliRelease}: CLI tag must match Cargo.toml`);
check(cliReleaseText.includes("pathlib.Path('agent-ks-cli/release-notes')"), `${files.cliRelease}: CLI note path is wrong`);
for (const required of ['actions/upload-artifact', 'actions/download-artifact', 'SHA256SUMS', 'gh release upload']) {
  check(cliReleaseText.includes(required), `${files.cliRelease}: CLI binary release must contain ${required}`);
}

const engineVersionMatch = read('agent-ks-engine/src/loaders/engine-version.ts').match(
  /export const ENGINE_VERSION = '([^']+)'/
);
check(engineVersionMatch, 'Engine: could not read ENGINE_VERSION');
const engineVersion = engineVersionMatch?.[1] ?? 'unknown';
if (engineVersionMatch) stableNote('agent-ks-engine/release-notes', engineVersion, 'Engine');

const claudeManifest = JSON.parse(read('plugins/agent-ks/.claude-plugin/plugin.json'));
const codexManifest = JSON.parse(read('plugins/agent-ks/.codex-plugin/plugin.json'));
check(claudeManifest.version === codexManifest.version, 'Plugin: Claude and Codex manifest versions differ');
check(/^\d+\.\d+\.\d+$/.test(claudeManifest.version), 'Plugin: stable semantic version required');
stableNote('plugins/agent-ks/release-notes', claudeManifest.version, 'Plugin');

const cargo = read('agent-ks-cli/Cargo.toml');
const cliVersionMatch = cargo.match(/^version\s*=\s*"([^"]+)"/m);
check(cliVersionMatch, 'CLI: could not read Cargo package version');
const cliVersion = cliVersionMatch?.[1] ?? 'unknown';
if (cliVersionMatch) stableNote('agent-ks-cli/release-notes', cliVersion, 'CLI', `agent-ks ${cliVersion}`);

const stalePrefixFiles = [
  'README.md',
  'RELEASING.md',
  'AGENTS.md',
  'agent-ks-cli/README.md',
  'agent-ks-cli/install.sh',
  'agent-ks-cli/src/update.rs',
  'agent-ks-cli/tests/install.py',
  'default-docs/data/dev-docs/20_development/10_native-toolkit.md',
  'default-docs/data/user-guide/05_getting-started/05_claude-skills.md',
  'default-docs/data/user-guide/05_getting-started/10_native-toolkit.md',
  'plugins/agent-ks/skills/agent-ks-cli/references/contract.md',
  'plugins/agent-ks/skills/agent-ks-cli/references/installation.md',
  'agent-ks-engine/release-notes/README.md',
  'plugins/agent-ks/release-notes/README.md',
];
for (const file of stalePrefixFiles) {
  check(!read(file).includes(LEGACY_CLI_PREFIX), `${file}: stale ambiguous CLI tag prefix`);
  check(!read(file).includes(LEGACY_ENGINE_NOTES), `${file}: stale engine release-note directory`);
  check(!read(file).includes(LEGACY_PLUGIN_NOTES), `${file}: stale plugin release-note directory`);
}

const engineTree = subtreeAtHead('agent-ks-engine', 'Engine');
const pluginTree = subtreeAtHead('plugins/agent-ks', 'Plugin');
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Release contracts passed: engine ${engineVersion} (${engineTree}), plugin ${claudeManifest.version} (${pluginTree}), CLI ${cliVersion}.`);
