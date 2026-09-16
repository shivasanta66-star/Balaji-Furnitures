# Balaji Furnitures

Website for Balaji Furnitures — solid wood furniture showroom, Main Road, Jharigam,
Nabarangpur, Odisha 764076.

Rebuilt from a Claude Design export into plain HTML, CSS and vanilla JS on the front end
with a Node.js + Express back end. No React, no build step, no Tailwind.

## Quick start

```bash
npm install
cp .env.example .env     # then edit it, see below
npm start                # http://localhost:3000
```

`npm run dev` restarts on file changes. `npm test` runs the API smoke tests.

## Configuration

Everything lives in `.env` (copy it from `.env.example`):

| Variable | What it does |
| --- | --- |
| `STORE_PHONE` | Shop phone, digits only with country code |
| `STORE_WHATSAPP` | WhatsApp number used to build `wa.me` links |
| `OWNER_EMAIL` | Where enquiry notifications are sent |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Mail server for notifications |
| `ADMIN_PASSWORD` | Password for `/admin.html`. **The panel is disabled until you set this.** |
| `SESSION_SECRET` | Signs the admin session cookie. Set a long random value in production. |
| `PORT` | Defaults to 3000 |

If SMTP is not configured, enquiries are still saved and the notification is printed to
the server console instead — submitting always succeeds either way.

Change `ADMIN_PASSWORD` and `SESSION_SECRET` from `change-me` before deploying. Run with
`NODE_ENV=production` behind HTTPS so the session cookie gets the `Secure` flag.

## Layout

```
balaji-furnitures/
├─ public/
│  ├─ index.html          home — the full original page
│  ├─ products.html       10 categories, filterable, reads ?category=<slug>
│  ├─ about.html          owner story, wood types, brands, service
│  ├─ contact.html        address, hours, map, enquiry form
│  ├─ admin.html          enquiry inbox (password gated)
│  ├─ 404.html            not-found page in the site's own style
│  ├─ css/style.css       all extracted CSS
│  ├─ css/fonts.css       the 29 @font-face blocks, self-hosted
│  ├─ js/data.js          data arrays recovered from the design bundle
│  ├─ js/photos.js        generated slot -> real photo map
│  ├─ js/main.js          all page behaviour
│  ├─ js/products.js      category filtering
│  ├─ js/admin.js         admin panel
│  ├─ fonts/              11 woff2 files, self-hosted
│  ├─ images/             29 SVG fallbacks + favicon (live images come from placehold.co)
│  ├─ robots.txt
│  └─ sitemap.xml
├─ scripts/install-photos.mjs   installs real photos into the 29 slots
├─ extracted/             provenance from the original bundle, not served
├─ test/smoke.test.js
├─ server.js
├─ data/enquiries.json    enquiry store (git-ignored)
├─ .env.example
└─ package.json
```

## API

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/enquiry` | public | Save an enquiry. Returns `{ success, waLink }`. |
| `POST /api/admin/login` | public | Exchange the password for a session cookie. |
| `POST /api/admin/logout` | public | Clear the session. |
| `GET /api/admin/session` | public | Whether the caller is signed in. |
| `GET /api/enquiries` | admin | All enquiries, newest first. |
| `PATCH /api/enquiries/:id` | admin | Set status: `new` → `contacted` → `closed`. |
| `GET /api/enquiries.csv` | admin | CSV export. |

`POST /api/enquiry` validates server-side: name required (max 100), phone must match
`^[6-9][0-9]{9}$`, category must be one of the 10 known categories, message max 1000
characters. All input is HTML-escaped and stripped of control characters before storage.

Rate limiting is per IP per hour, with two caps: **5 saved enquiries** (the headline
limit) and 30 total requests. Rejected submissions count only against the wider cap, so
a customer who mistypes their phone number a few times is not locked out for an hour.

Enquiries append to `data/enquiries.json` with an `id`, an IST timestamp and
`status: "new"`. Writes are serialised and go through a temp file + rename, so
concurrent submissions cannot clobber each other.

## Admin panel

Open `/admin.html` and sign in with `ADMIN_PASSWORD`. The password is only ever compared
on the server; it never reaches client JavaScript. The session is an HMAC-signed,
HttpOnly, SameSite=strict cookie valid for 8 hours.

The table shows date, name, click-to-call phone, category, message and status, with a
status filter, name/phone search, a per-row "Mark contacted" button, a CSV export and a
count of new enquiries.

## Images

Every image on the site is currently a remote placeholder from
[placehold.co](https://placehold.co), tinted to the brand palette and requested at
the exact size that slot needs:

| Slot | Size |
| --- | --- |
| `hero-photo` | 1600x900 |
| `owner-photo`, `cat-*` (10) | 600x600 |
| `custom-orders`, `feat-*` (6) | 800x600 |
| `gallery-1` … `gallery-10` | 800x800 |

The URLs are generated in `public/js/main.js` (`placeholderUrl`), except for five
`<img>` tags written straight into `index.html` and `about.html`, which carry a
`data-slot` attribute.

Because these load from another host, `placehold.co` is allowed in the
`img-src` Content-Security-Policy directive in `server.js`. If you move to a
different placeholder service, update that directive too or the images will be
blocked.

### Putting real photos in

```bash
cp scripts/photos.example.json scripts/photos.json
# edit scripts/photos.json — point each slot at a URL or a local file
node scripts/install-photos.mjs
```

The script centre-crops each source to that slot's aspect ratio, resizes it to the
exact dimensions the markup declares (so nothing shifts while loading), writes
`public/images/<slot>.jpg`, and registers it in `public/js/photos.js`. Any slot
with a real photo stops using placehold.co automatically; the rest keep the
placeholder, so you can add photos a few at a time and re-run it. Cropping uses
headless Chromium — no ImageMagick or sharp needed.

Only use photos you may publish commercially. Unsplash, Pexels and Pixabay
licences allow it. **Pinterest does not** — its images are third-party
copyrighted work that Pinterest neither owns nor can license on, and it blocks
hotlinking, so they break as well as exposing the shop to takedown requests.

### If placehold.co is unreachable

Every image the site renders carries a `data-slot` attribute, and `main.js` listens
for image load failures. When one fails — CDN outage, an offline machine, a strict
network, an embedded preview that blocks other origins — it swaps in
`public/images/<slot>.svg`, the branded placeholder built from the original design.
Those use the same walnut ground and brass text at the same dimensions, so the page
still reads correctly rather than showing broken-image icons.

To drop the remote host altogether and use those SVGs directly, change `imgSrc()` in
`public/js/main.js` to return `'images/' + slotId + '.svg'` and revert the five
`data-slot` tags in `index.html` and `about.html`.

## Notes on the rebuild

- **Design is unchanged.** Every section was pixel-diffed against a render of the
  original bundle at 1440px, 768px and 375px. All of them come back byte-identical
  apart from two deliberate changes: the reviews carousel (requested) and the active
  nav link, which now highlights in brass.
- **Fonts are self-hosted.** Nothing is fetched from Google. The 29 `@font-face`
  blocks keep their original weights and `unicode-range` values; only the `url()`
  targets changed.
- **No prices anywhere.** Enquiry only, by design.
- The site is mobile-first and tested at 375px, 768px and 1440px. The 768px breakpoint
  matches the original `matchMedia('(max-width: 768px)')` exactly.

### Two values worth checking before launch

- The JSON-LD `geo` coordinates on `index.html` and `contact.html` (`19.16, 82.26`) are
  approximate for Jharigam. Replace them with the showroom's exact pin from Google Maps.
- `aggregateRating` is derived from the five reviews carried over from the design (all
  five stars). Update it to match the real Google rating and review count — search
  engines treat a rating that contradicts the linked profile as spam.

The Facebook and Instagram links in the footer are still `#`, as they were in the
original design. Point them at real profiles or remove them.
