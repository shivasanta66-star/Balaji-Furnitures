# scripts/

## install-photos.mjs

Installs real photos into the site's 29 image slots.

```bash
cp scripts/photos.example.json scripts/photos.json
# edit scripts/photos.json — set each slot to a URL or a local file path
node scripts/install-photos.mjs
```

Each source is centre-cropped to that slot's aspect ratio, resized to the exact
dimensions the markup declares, written to `public/images/<slot>.jpg`, and
registered in `public/js/photos.js`. Slots left blank keep their branded SVG
placeholder, so you can add photos a few at a time and re-run it.

Values can be either form:

```json
{
  "hero-photo": "https://images.unsplash.com/photo-XXXXXXXX",
  "cat-beds":   "/home/me/Downloads/bed.jpg"
}
```

Cropping runs through headless Chromium (already installed for the test suite) —
no ImageMagick or sharp needed. Re-running is safe: it merges with whatever was
installed before.

### Licensing

Only use photos you have the right to publish commercially. Unsplash, Pexels and
Pixabay licences permit it. **Pinterest does not** — its images are third-party
copyrighted work that Pinterest neither owns nor can license to you, and it
blocks hotlinking, so those images break as well as expose the shop to takedowns.
