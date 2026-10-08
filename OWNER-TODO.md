# Things only the shop can fix

The code and wording are done. What's left needs someone from the shop.

## 1. Real photos (most important)

The product and category pictures are catalogue-style renders, not photos of
the shop. Anyone who has visited will notice. Take them on a phone:

- The shop front from the road, with the board visible (use it as the hero photo)
- One photo per category, taken in the showroom: beds, almirahs, sofas,
  dining sets, mattresses, study tables, plastic/steel, mandir, TV units, chairs
- A close-up of teak and sheesham grain, for the About page
- Akhil inside the shop, to replace the passport-style photo

Daylight, no filters. A bit of the real shop in the background is fine.
It makes the photos look real.

Install them with `scripts/install-photos.mjs`. Instructions are in
`scripts/README.md`.

## 2. Akhil's note, in his own words

`public/index.html` and `public/about.html` (search for `owner-quote`).
The current text only uses facts the site already had, but Akhil should
say it his way. Odia or Hindi words he would really use are fine.

## 3. Check these claims are true

They were on the site before the rewrite. If any is wrong, change it or
delete it. A wrong promise does more damage than a missing one.

| Claim | Where |
|---|---|
| One-year warranty on furniture | `public/js/data.js` (serviceCards, faqs) |
| Free delivery and fitting within 25 km | `data.js`, `shipping-delivery-policy.html` |
| EMI on some items | `data.js` (faqs), `index.html` (offer) |
| Exchange old furniture | `data.js`, `index.html` (offer) |
| Custom pieces in 2–3 weeks, free home measuring | `index.html`, `data.js` |
| Polish and repair, also for furniture bought elsewhere | `data.js` (serviceCards) |
| Most sofas, dining sets and chairs are sheesham | `data.js` (woodTypes) |
| Mattress brands: Kurlon, Duroflex, Springwel | `data.js` (featured, brands) |

## 4. The four guessed products

In `public/js/data.js` under `extraProducts`: moulded chair and steel stool,
wooden mandir, TV unit, dining chair pair. The names and descriptions are
guesses. Replace them with things actually in the shop.

## 5. Nice to have

- Prices or "starting from" prices. Real shops show them, and a site with
  none can look like a template.
- A Google Maps review count or a couple of real customer names (with permission).
- An Instagram or Facebook page link, if the shop has one (`socialLinks` in `data.js`).
