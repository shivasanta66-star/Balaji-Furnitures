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
│  ├─ images/             33 drawn SVG illustrations + favicon
│  ├─ robots.txt
│  └─ sitemap.xml
├─ netlify.toml           static deploy config (publish dir, headers)
├─ scripts/generate-placeholders.mjs  draws the 29 placeholder illustrations
├─ scripts/install-photos.mjs         installs real photos into the 29 slots
├─ scripts/check-csp.mjs              guards the netlify.toml CSP hashes
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

All 33 image slots are filled with flat SVG illustrations drawn in the site's own
palette — walnut, teak, brass, ivory and sand — one per category, so the page reads
as designed rather than as a grid of placeholder boxes.

They are generated, not hand-edited:

```bash
node scripts/generate-placeholders.mjs
```

Edit the drawing functions in that script to change them. Everything is local and
vector, so there is no third-party host to depend on, nothing to fetch at runtime,
and the artwork stays sharp at any size. Total weight is about 140 KB for all 33.

| Slot | Size | Drawing |
| --- | --- | --- |
| `hero-photo` | 1600x900 | showroom interior |
| `owner-photo` | 600x600 | monogram — stands in until the real photo is added |
| `custom-orders` | 800x600 | measured drawing on a workbench |
| `cat-*` (10) | 600x600 | the piece for that category |
| `feat-*` (10) | 800x600 | the product for that category |
| `gallery-1` … `gallery-10` | 800x800 | the pieces, cycled |

### Products

`data.js` holds two lists. `featured` is the six pieces the design bundle shipped,
and it is what the home page shows. `catalogue` is those six plus four more, one
for each category the bundle left empty — plastic and steel, mandir, TV units and
chairs — and it is what the products page shows.

On **All**, the products page lays the whole catalogue out in one grid, so the
cards run across the page. Pick a category and it swaps to that category's
heading, picture and pieces. Nothing is hidden with `[hidden]`; the page renders
the view it is on.

**The four added entries carry placeholder copy.** Their names, materials and
descriptions are reasonable guesses rather than the shop's own words, and a
material claim is a promise to a customer, so confirm or replace them in
`extraProducts` in `public/js/data.js` before relying on them.

### The owner's photo

`index.html` and `about.html` point at `images/owner-photo.jpg`. That file is
**not in the repo** — drop the real photo there and both pages pick it up with
no code change. Until then the pages fall back to the monogram, which is why a
404 for it shows in the browser console; nothing else breaks.

The photo is shown in a 180px circle, cropped with `object-fit: cover` and
framed just above centre (`object-position: 50% 10%`) so a portrait keeps the
whole head — a centred crop cuts the top of it off.

A portrait straight off a phone is far bigger than a 180px circle needs, so
run it through the installer below once it is in place; that writes a 600x600
version over it.

**The monogram is deliberate.** No drawn face stands in for a real person here.

### Putting real photos in

```bash
cp scripts/photos.example.json scripts/photos.json
# edit scripts/photos.json — point each slot at a URL or a local file
node scripts/install-photos.mjs
```

The script centre-crops each source to that slot's aspect ratio, resizes it to the
exact dimensions the markup declares (so nothing shifts while loading), writes
`public/images/<slot>.jpg`, and registers it in `public/js/photos.js`. Any slot with
a real photo stops using its illustration; the rest keep theirs, so photos can be
added a few at a time. If an installed photo is ever missing or corrupt, `main.js`
falls back to that slot's SVG rather than showing a broken image. Cropping uses
headless Chromium — no ImageMagick or sharp needed.

Only use photos you may publish commercially. Unsplash, Pexels and Pixabay licences
allow it. **Pinterest does not** — its images are third-party copyrighted work that
Pinterest neither owns nor can license on, and it blocks hotlinking, so they break
as well as exposing the shop to takedown requests.

## Deploying

### Netlify (static)

`netlify.toml` sets `publish = "public"`. Without it Netlify serves the repo root,
which has no `index.html`, and every path 404s.

Netlify serves files; it does not run Node. **`server.js` is not used there.** So:

| Works | Does not work |
| --- | --- |
| All five pages, images, fonts, styling | `POST /api/enquiry` — nothing is saved server-side |
| Category filtering, gallery, FAQ, carousel | `/admin.html` — no API to sign in against |
| WhatsApp and phone links | CSV export, email notifications |

The enquiry form degrades on purpose: with no API it opens WhatsApp with the
message pre-filled and says so plainly, rather than reporting an error. Customers
still reach the shop — that is how it works day to day anyway.

`netlify.toml` also declares the security headers helmet would otherwise set, and
the caching headers `server.js` sets. The CSP pins sha256 hashes for the inline
JSON-LD blocks, so **editing a JSON-LD block breaks it silently** — the page still
renders but the structured data is dropped. `npm test` runs `scripts/check-csp.mjs`
to catch that; run `npm run check:csp` on its own if you want just the check.

### Enquiries on Netlify

The enquiry form on `index.html` and `contact.html` is wired to **Netlify Forms**,
so submissions are captured without a server.

Where they land: Netlify dashboard → your site → **Forms** → `enquiry`. Turn on
email alerts under **Forms → Notifications** so a new enquiry reaches you without
opening the dashboard. Spam is filtered by a honeypot field (`bot-field`), hidden
from people and never shown; no third-party captcha is loaded.

The form still opens WhatsApp after submitting, so a customer reaches you the
moment they send, rather than waiting for you to check a dashboard.

**Netlify registers a form by scanning the deployed HTML at build time.** Both
forms carry `name="enquiry"`, `method="POST"`, `data-netlify="true"` and a hidden
`form-name` input, and all four fields are in the static HTML — so detection works
even though the category options are filled in by JavaScript. Submissions from
both pages land in the one `enquiry` form. If you rename the form, change it in
both files.

The site submits over AJAX rather than a page navigation, which keeps the inline
success message. `main.js` tries `POST /api/enquiry` first and falls back to
Netlify, so **the same build works both ways**: served by `server.js` it uses the
JSON store and admin panel; served statically it uses Netlify Forms. If neither
answers, the customer still goes to WhatsApp.

`/admin.html` needs the Express API and does nothing on Netlify. To get it, deploy
`server.js` to a host that runs Node (Render, Railway, Fly) — everything then works
as built, and the Netlify path stays as a fallback.

## Notes on the rebuild

- **Design is unchanged.** Every section was pixel-diffed against a render of the
  original bundle at 1440px, 768px and 375px. All of them come back byte-identical
  apart from two deliberate changes: the reviews carousel (requested) and the active
  nav link, which now highlights in brass.
- **Fonts are self-hosted.** Nothing is fetched from Google. The 29 `@font-face`
  blocks keep their original weights and `unicode-range` values; only the `url()`
  targets changed.
- **No prices anywhere.** Enquiry only, by design.
- **The floating round button dials the shop.** The design bundle had it open
  WhatsApp while showing a `☏` glyph, which reads as a telephone and renders
  differently on every platform. It is now a drawn handset wired to
  `tel:+919937601505`; WhatsApp is still one tap away in the header, the hero,
  every product card and the mobile bar.
- The site is mobile-first and tested at 375px, 768px and 1440px. The 768px breakpoint
  matches the original `matchMedia('(max-width: 768px)')` exactly.

### Two values worth checking before launch

- The JSON-LD `geo` coordinates on `index.html` and `contact.html` (`19.16, 82.26`) are
  approximate for Jharigam. Replace them with the showroom's exact pin from Google Maps.
- `aggregateRating` is derived from the five reviews carried over from the design (all
  five stars). Update it to match the real Google rating and review count — search
  engines treat a rating that contradicts the linked profile as spam.

### Footer social links

The footer icons are driven by `socialLinks` in `public/js/data.js`. WhatsApp and
Google are already wired to the shop's real number and review page. Facebook,
Instagram and YouTube are listed with an empty `url`, so their icons stay hidden —
**only entries with a url render**, which keeps dead links off a live site.

To add one, paste the profile address:

```js
{ name: 'Instagram', url: 'https://instagram.com/your-handle', icon: '...' },
```

The icon appears on every page footer on the next load. To drop a profile, clear
its `url` again.
