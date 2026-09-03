/**
 * _frontmatter.mjs — the ONE frontmatter reader for every agent-ks command.
 *
 * **Why this file exists: so the plugin ships no npm dependencies.**
 *
 * `agent-ks` is the only plugin here that ever imported one. `gray-matter` was
 * pulled in by the tracker scripts, and it resolved through nothing the plugin
 * owns — there is no `package.json` and no `node_modules`, so `node` fails
 * outright and only `bun`'s auto-install made it work. That is a dependency on
 * bun HAVING A NETWORK, which nobody wrote down and the first offline run finds.
 *
 * `bun` ships `Bun.YAML`, and bun is already required, so the dependency buys
 * nothing that is not already in the runtime.
 *
 * It also collapses a duplicate: docs/blog parsed frontmatter with a hand-rolled
 * line regex that read every value as a string, so `labels: [a, b]` arrived as
 * the literal text `"[a, b]"`. Both callers now share one real YAML parse.
 *
 * **Shape is gray-matter's `{ data, content }` on purpose** — it kept the swap a
 * rename at seven call sites, and it is what let `fixtures/frontmatter.test.mjs`
 * compare the two over every file in the tracker and demand they agree.
 */

/**
 * Split a document into its frontmatter data and its body.
 *
 * Returns `{ data, content }`. `data` is always a plain object — a document with
 * no frontmatter, an empty block, or a scalar/array at the top level all yield
 * `{}`, because every caller here reads named fields off it.
 *
 * **Malformed YAML inside a real `---` block THROWS**, as gray-matter did. The
 * call sites catch it and report "malformed frontmatter" against the file; if
 * this returned `{}` instead, a broken block would read as an absent one and the
 * validator would go quiet on exactly the files that need it.
 */
export function readFrontmatter(text) {
  // Deliberately gray-matter's delimiter rule rather than a tidier one, because
  // the corpus is already written against it: the close is the first `\n---`
  // ANYWHERE, not a line that reads exactly `---`. So `--- ` closes the block and
  // leaves the space in the body. Both were found by the differential test.
  if (!OPEN_RE.test(text)) return { data: {}, content: text };

  const close = text.indexOf('\n---', OPEN_LEN);
  if (close === -1) return { data: {}, content: text };

  const parsed = Bun.YAML.parse(text.slice(OPEN_LEN, close));
  const data =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};

  // One line break after the close delimiter belongs to the delimiter, not the
  // body. An empty block (`---\n---`) reaches here with close === OPEN_LEN.
  let content = text.slice(close + 4);
  if (content.startsWith('\r\n')) content = content.slice(2);
  else if (content.startsWith('\n')) content = content.slice(1);

  return { data, content };
}

const OPEN_RE = /^---[ \t]*\r?\n/;
const OPEN_LEN = 3;

/** `readFrontmatter(text).data`, for the majority of call sites that ignore the body. */
export function frontmatterData(text) {
  return readFrontmatter(text).data;
}
