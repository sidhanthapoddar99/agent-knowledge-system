---
title: "HTML elements: inputs, messages and the sandbox"
---

An HTML element is a library file that runs as its own small page: a widget such as a key and value table, or a device view that shows a screenshot inside a phone. Your artifact page loads it in an `<iframe>` and talks to it in two ways: inputs in its address, and messages. This page is for both sides: artifact authors who use HTML elements, and library authors who write them.

## The sandbox

agentks serves every library `.html` and `.svg` file with the header `Content-Security-Policy: sandbox allow-scripts`. The browser then gives the element its own opaque origin, even when you open it directly. So an element:

- can run its own scripts;
- cannot read the page around it, your site's cookies or your browser storage;
- can talk to your page only through its address and through messages.

A library is code someone else wrote, so it runs with no access to your site. Your own artifact pages are different: they run unsandboxed, because they are your code.

## Inputs in the address

Pass an element's inputs as query parameters:

```html
<iframe style="width:100%;height:160px;border:0"
  src="/_lib/default/callout-card?tone=info&title=Heads%20up&body=The%20server%20restarts%20at%20midnight"></iframe>
```

Every element opens with a comment that lists its inputs, and its manifest description names the main ones. `agentks library show <alias>` prints the descriptions.

**Pass full URLs.** A URL input resolves against the element's own address, not against your page. So a relative path such as `./assets/app.png` would point inside `/_lib/`. Build the full URL first:

```html
<iframe id="phone" style="width:320px;height:600px;border:0"></iframe>
<script>
  const shot = new URL("./assets/app.png", location.href);
  document.getElementById("phone").src =
    "/_lib/default/phone-view?theme=dark&src=" + encodeURIComponent(shot);
</script>
```

## Messages

Your page and the element can also exchange messages with `postMessage`. Because the element's origin is opaque, your page posts with the target `"*"`. The element checks the shape of every message and ignores anything else.

| Message | From → to | What it does |
|---|---|---|
| `{ type: "agentks:element:ready" }` | element → your page | Says the element is listening, so your page can send |
| `{ type: "agentks:element:data", data }` | your page → element | Sends input data, for example the rows of a table |
| `{ type: "agentks:element:theme", mode, tokens }` | your page → element | Switches to `"light"` or `"dark"`. `tokens` can map theme variable names to your site's values |

```html
<iframe id="table" src="/_lib/default/kv-table" style="width:100%;height:220px;border:0"></iframe>
<script>
  const table = document.getElementById("table");
  addEventListener("message", (event) => {
    if (event.source !== table.contentWindow) return;
    if (event.data?.type !== "agentks:element:ready") return;
    table.contentWindow.postMessage(
      { type: "agentks:element:data", data: { rows: { version: "1.0.0" } } }, "*");
  });
</script>
```

## Theme mode

An element starts in the mode that `?theme=light` or `?theme=dark` names, and without it in the reader's system setting. A `theme` message from your page switches it at any time.

An element styles itself with the site's theme variable names, such as `--color-text-primary`. It carries its own light and dark values for them, because a sandboxed element cannot read your page's CSS. Send the `theme` message with `tokens` when you want it to use your site's exact values.

## Device views and screen frames

A device view such as `phone-view` shows its `src` input on its screen.

- By default, `src` is shown as an image.
- With `kind=page`, `src` is shown as a page, in a nested frame that is sandboxed too.
- `src` must be an `http(s)` URL. An image may also be a `data:image` URL.

This screen is the only thing an HTML element ever loads from outside itself, and only because your page asked for it.

## Size and errors

- An element fills its iframe. You set the size on the `<iframe>`.
- Bad input shows a visible error inside the element, never a blank or stale frame.

## Writing an HTML element

If you build a library, an HTML element you write must follow these rules, so it works in the sandbox and in every theme:

- **Self-contained.** Inline all CSS and JavaScript in the one file. It loads no other file, makes no network request and uses no storage. The one exception is a screen's `src`, as above.
- **Inputs** come from query parameters, and optionally from the `agentks:element:data` message.
- **Messages.** Check the shape of every message you receive and ignore the rest. Post `agentks:element:ready` once you listen.
- **Theme.** Read `?theme=` and the `agentks:element:theme` message, and fall back to the system setting. Style only with theme variable names from [the theme contract](../45_themes-and-layouts/15_theme-contract.md), with built-in light and dark values.
- **URLs.** Resolve URL inputs against your own address.
- **Errors.** Show bad input as a visible error.
- **Size.** Fill the iframe. Give nothing a fixed outer size.
- **Documented.** Open the file with a comment that starts with the element's name and lists every input and message.

[Building a library](./35_building-a-library.md) covers the rest: where the file goes, the manifest entry, and the checks.
