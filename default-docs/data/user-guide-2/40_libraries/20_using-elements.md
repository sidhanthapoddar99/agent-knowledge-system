---
title: "Using elements in artifacts"
---

An artifact page loads a library element from one address: `/_lib/<alias>/<element>`. This page shows how to use icons, images and widgets that way, what each category offers an artifact, and how agentks checks the names you use. An artifact page is a self-contained HTML page in one of your sections; [writing content](../10_writing-content/01_overview.md) covers how to add one.

## The address

agentks serves every element your libraries offer at `/_lib/<alias>/<element>`:

- `<alias>` is the key in your `dep.yaml`, such as `default`.
- `<element>` is the element's name, such as `server`. The address has no category and no file extension.
- The content type comes from the file, so an SVG arrives as an image and an HTML widget as a page.

```html
<img src="/_lib/default/server" alt="Server" width="24" height="24">
```

`_lib` is reserved: no section of your site can use it as its URL.

## What each category offers an artifact

| Category | In an artifact |
|---|---|
| `icons` | An image, a CSS mask, or inline SVG (below) |
| `illustrations`, `backgrounds`, `annotations` | An SVG image |
| `frames` | An SVG image. The default library also offers each device as a `-view` widget, which shows a screenshot or a page inside the device |
| `images` | An image: WebP, AVIF, PNG or JPEG |
| `fonts` | A WOFF2 font file |
| `widgets` | Interactive HTML in an `<iframe>`: see [HTML elements](./25_html-elements.md) |
| `charts`, `layouts`, `slides`, `animations`, `transitions`, `styles` | Not served. These are data for video artifacts |
| `scripts` | Not used by artifacts |

## Icons that follow your theme

Library icons draw with `currentColor`, so they take the colour of the text around them. Through a plain `<img>`, though, an SVG cannot see the page's colours and draws black. For an icon that follows light and dark mode, use a CSS mask or insert the SVG inline:

```html
<!-- A CSS mask: the icon takes the element's text colour. -->
<span style="display:inline-block;width:24px;height:24px;background:currentColor;
  mask:url(/_lib/default/server) center/contain no-repeat"></span>

<!-- Or fetch the SVG and insert it inline. -->
<span id="server-icon"></span>
<script>
  fetch("/_lib/default/server").then((r) => r.text()).then((svg) => {
    document.getElementById("server-icon").innerHTML = svg;
  });
</script>
```

## Widgets

A widget is a small interactive HTML page, such as a key and value table or a phone that shows a screenshot. Load it in an `<iframe>` and pass its inputs in the address:

```html
<iframe id="phone" style="width:320px;height:600px;border:0"></iframe>
<script>
  // Pass a full URL: a relative one would resolve against the widget's own address.
  const shot = new URL("./assets/app.png", location.href);
  document.getElementById("phone").src =
    "/_lib/default/phone-view?theme=dark&src=" + encodeURIComponent(shot);
</script>
```

Widgets run sandboxed. [HTML elements](./25_html-elements.md) explains their inputs, the messages they understand, and what the sandbox means.

## Video artifacts

A video artifact names elements as `alias:element`, for example `default:server`, in the fields its format gives for them. The data categories (`charts`, `layouts`, `slides`, `animations`, `transitions` and `styles`) exist for videos.

## Never in markdown

A markdown page never names a library element: no `alias:element`, and no `/_lib/` address. Keep markdown plain, so it reads the same in Obsidian, an editor or `cat`. When a page needs library pieces, put that part in an artifact page and link to it.

## Check your references

```bash
agentks check libraries
```

This command reads your files; it needs no running server. It checks every library your project uses, every `/_lib/` address in your artifact pages, and every element your video artifacts name. For an unknown alias or element, it names the page, the line and the name. A page never renders with a blank in place of a missing element: agentks reports the error instead.

## Publishing

When you publish, the static build copies every element your pages use into the output, at the same `/_lib/` address. The published site then needs no library at run time. [Publishing](../55_publishing/01_overview.md) covers the build.
