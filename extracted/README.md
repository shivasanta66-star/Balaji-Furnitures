# Extraction artifacts

Recovered from `Balaji_Furnitures__standalone_.html` (a Claude Design export). Kept for
provenance only — nothing here is served. The live site is in `../public`.

| File | What it is |
| --- | --- |
| `original-template.html` | The full `__bundler/template` JSON string, decoded. Contains the rendered markup with `{{ }}` bindings, `<x-dc>`, `<sc-for>`, `<sc-if>`, `<image-slot>`, all inline CSS and the original JSON-LD. |
| `original-dclogic.js` | The `class Component extends DCLogic` block verbatim — state, data arrays and handlers. |
| `original-fontface.css` | The 29 `@font-face` blocks as they appeared, still pointing at manifest UUIDs. |

## What the bundle contained

- `__bundler/template` — 51,393 chars: rendered HTML + inline CSS + the DCLogic class
- `__bundler/manifest` — 15 base64 assets: 4 gzipped JS chunks (2 of them React/ReactDOM
  UMD, per `__bundler/ext_resources`) and 11 uncompressed woff2 fonts
- `__bundler/ext_resources` — the React CDN URL mapping
- `__bundler/page_order` — empty

## Where it went

- The 11 woff2 files -> `public/fonts/`, renamed `<family>-<subset>.woff2`.
  The 29 `@font-face` blocks are reproduced in `public/css/fonts.css` with only the
  `url()` targets rewritten; weights and `unicode-range` values are untouched.
- The inline CSS -> `public/css/style.css` as classes.
- The DCLogic data arrays -> `public/js/data.js`, verbatim.
- The DCLogic state machine -> `public/js/main.js` as vanilla JS.
- The 29 `<image-slot>` elements -> real `<img>` tags with placeholders in `public/images/`.

The 4 JS chunks are the proprietary DCLogic runtime and React; none of it is carried
over, which is the point of the rebuild.
