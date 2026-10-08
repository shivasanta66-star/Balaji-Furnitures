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

## 2. Akhil's note

`public/index.html` and `public/about.html` (search for `owner-quote`).
The note is now in simple words. Have Akhil read it out loud once and
change any line that doesn't sound like Akhil.

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

## 4. Four categories without real products

In `public/js/data.js` under `extraProducts`: plastic chairs and steel stools,
wooden mandir, TV unit, wooden chairs. They only name the kind of furniture
in the photo and ask the customer to check with the shop, because we don't
know the exact models yet. When you have real items (name, wood, size),
put them in there.

## 5. Nice to have

- Prices or "starting from" prices. Real shops show them, and a site with
  none can look like a template.
- A Google Maps review count or a couple of real customer names (with permission).
- An Instagram or Facebook page link, if the shop has one (`socialLinks` in `data.js`).
