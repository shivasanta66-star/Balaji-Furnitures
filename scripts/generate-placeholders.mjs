#!/usr/bin/env node
/*
 * Draws the 29 placeholder images as SVG, one per image slot.
 *
 *   node scripts/generate-placeholders.mjs
 *
 * Flat illustrations in the site's own palette, so the page reads as designed
 * rather than as a grid of grey boxes, and every file is local — no third-party
 * host, no network. Replace any of them with a real photo using
 * scripts/install-photos.mjs.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images');

const C = {
  walnut: '#3E2A1E',
  teak: '#6B4226',
  brass: '#C89B3C',
  ivory: '#FAF6EF',
  sand: '#EDE3D4',
  charcoal: '#241C16',
  muted: '#6E6259'
};

/* A slightly darker teak for shadowed faces, and a lighter one for tops. */
const TEAK_DARK = '#57351E';
const TEAK_LIGHT = '#8A5A34';
const SAND_DARK = '#DFD0BA';

/* ---------------------------------------------------------------- helpers */

const rect = (x, y, w, h, fill, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;

/** Wraps a drawing in a full SVG document sized for the slot. */
function svg(w, h, vbW, vbH, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="${title}">
<rect width="${vbW}" height="${vbH}" fill="${C.sand}"/>
${body}
</svg>
`;
}

/** Floor band plus a soft contact shadow under the piece. */
const floor = (vbW, vbH, y) =>
  rect(0, y, vbW, vbH - y, C.ivory) +
  `<ellipse cx="${vbW / 2}" cy="${y + 6}" rx="${vbW * 0.34}" ry="7" fill="${C.walnut}" opacity="0.10"/>`;

/* ------------------------------------------------------------- furniture */
/* Each piece draws inside a 400x300 box with the floor line at y=250,
   then gets scaled by the viewBox to whatever the slot needs. */

function bed() {
  return [
    rect(74, 96, 30, 136, C.walnut, 4),                 // headboard
    rect(80, 104, 18, 60, TEAK_LIGHT, 3),               // headboard panel
    rect(100, 150, 228, 34, C.ivory, 8),                // mattress
    rect(100, 178, 228, 22, C.teak, 4),                 // base rail
    rect(112, 156, 52, 22, C.sand, 5),                  // pillow
    rect(170, 156, 52, 22, C.sand, 5),                  // pillow
    rect(232, 152, 96, 30, SAND_DARK, 5),               // folded throw
    rect(104, 200, 12, 32, TEAK_DARK, 2),               // legs
    rect(312, 200, 12, 32, TEAK_DARK, 2)
  ].join('');
}

function wardrobe() {
  return [
    rect(126, 70, 148, 162, C.teak, 4),                 // carcass
    rect(132, 78, 64, 146, TEAK_LIGHT, 2),              // left door
    rect(204, 78, 64, 146, TEAK_LIGHT, 2),              // right door
    rect(192, 132, 5, 26, C.brass, 2),                  // handles
    rect(203, 132, 5, 26, C.brass, 2),
    rect(132, 186, 136, 2, TEAK_DARK),                  // drawer line
    rect(122, 224, 156, 8, TEAK_DARK, 2)                // plinth
  ].join('');
}

function sofa() {
  return [
    rect(88, 150, 224, 54, C.teak, 8),                  // body
    rect(96, 126, 208, 34, C.sand, 8),                  // back cushions
    rect(104, 154, 88, 26, C.ivory, 6),                 // seat cushions
    rect(200, 154, 88, 26, C.ivory, 6),
    rect(76, 138, 26, 62, TEAK_DARK, 8),                // arms
    rect(298, 138, 26, 62, TEAK_DARK, 8),
    rect(112, 130, 30, 26, C.brass, 4),                 // accent pillow
    rect(258, 130, 30, 26, C.brass, 4),
    rect(96, 200, 12, 32, TEAK_DARK, 2),                // legs
    rect(292, 200, 12, 32, TEAK_DARK, 2)
  ].join('');
}

function diningSet() {
  /* Seen from the side: a back post with two rails, a seat, and legs that
     reach the same baseline as every other piece. */
  const chair = (x, flip = false) => {
    const post = flip ? x + 27 : x;
    return rect(post, 116, 8, 58, TEAK_DARK, 2) +     // back post
           rect(x, 116, 35, 7, C.teak, 2) +           // top rail
           rect(x, 134, 35, 6, C.teak, 2) +           // mid rail
           rect(x - 2, 162, 39, 10, C.teak, 2) +      // seat
           rect(x + 2, 172, 6, 60, TEAK_DARK, 1) +    // legs
           rect(x + 27, 172, 6, 60, TEAK_DARK, 1);
  };
  return [
    chair(96), chair(272, true),
    rect(130, 140, 140, 12, C.ivory, 3),                // table top
    rect(130, 152, 140, 6, TEAK_LIGHT),                 // apron
    rect(140, 158, 10, 48, C.teak, 2),                  // legs
    rect(250, 158, 10, 48, C.teak, 2),
    rect(184, 120, 12, 20, C.brass, 3),                 // vase
    rect(178, 116, 24, 6, C.sand, 3)
  ].join('');
}

function mattressStack() {
  return [
    rect(96, 178, 208, 46, C.teak, 5),                  // base, down to the plinth
    rect(104, 150, 192, 30, C.ivory, 6),                // middle
    rect(112, 122, 176, 30, C.sand, 6),                 // top
    rect(120, 132, 160, 3, C.brass, 2),                 // quilting line
    rect(112, 160, 176, 3, C.brass, 2),
    rect(104, 224, 200, 8, TEAK_DARK, 2)                // plinth, flush under the base
  ].join('');
}

function studyDesk() {
  return [
    rect(96, 148, 176, 12, C.ivory, 3),                 // desk top
    rect(96, 160, 176, 8, TEAK_LIGHT),
    rect(104, 168, 12, 64, C.teak, 2),                  // legs
    rect(252, 168, 12, 64, C.teak, 2),
    rect(200, 168, 64, 34, C.teak, 2),                  // drawer unit
    rect(214, 182, 26, 5, C.brass, 2),                  // drawer pull
    rect(298, 112, 8, 64, TEAK_DARK, 2),                // chair back post
    rect(268, 112, 38, 7, C.teak, 2),                   // top rail
    rect(268, 130, 38, 6, C.teak, 2),                   // mid rail
    rect(264, 176, 46, 10, C.teak, 2),                  // chair seat
    rect(268, 186, 6, 46, TEAK_DARK, 1),                // legs
    rect(300, 186, 6, 46, TEAK_DARK, 1),
    rect(118, 118, 34, 30, C.brass, 2),                 // books
    rect(156, 126, 22, 22, C.sand, 2)
  ].join('');
}

function plasticChair() {
  return [
    `<path d="M152 104 h96 a8 8 0 0 1 8 8 v58 a8 8 0 0 1 -8 8 h-96 a8 8 0 0 1 -8 -8 v-58 a8 8 0 0 1 8 -8 Z" fill="${C.ivory}" stroke="${C.muted}" stroke-width="3"/>`,
    rect(162, 120, 76, 7, SAND_DARK, 3),                // back slots
    rect(162, 136, 76, 7, SAND_DARK, 3),
    rect(162, 152, 76, 7, SAND_DARK, 3),
    `<path d="M138 176 h124 a7 7 0 0 1 7 7 v10 a7 7 0 0 1 -7 7 h-124 a7 7 0 0 1 -7 -7 v-10 a7 7 0 0 1 7 -7 Z" fill="${C.ivory}" stroke="${C.muted}" stroke-width="3"/>`,
    `<path d="M146 200 l-8 32" stroke="${C.muted}" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    `<path d="M254 200 l8 32" stroke="${C.muted}" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    `<path d="M160 214 h80" stroke="${C.muted}" stroke-width="6" stroke-linecap="round" fill="none"/>`
  ].join('');
}

function mandir() {
  return [
    `<path d="M200 74 L262 132 L138 132 Z" fill="${C.brass}"/>`,   // dome
    rect(196, 62, 8, 14, C.brass, 3),                   // finial
    rect(146, 132, 108, 90, C.teak, 3),                 // body
    rect(160, 146, 80, 62, TEAK_LIGHT, 3),              // inner alcove
    `<path d="M200 156 c7 9 9 14 9 19 a9 9 0 0 1 -18 0 c0 -5 2 -10 9 -19 Z" fill="${C.brass}"/>`,  // diya flame
    `<path d="M184 180 h32 l-6 12 h-20 Z" fill="${C.brass}"/>`,    // diya bowl
    rect(138, 222, 124, 10, TEAK_DARK, 2)               // plinth
  ].join('');
}

function tvUnit() {
  return [
    rect(126, 92, 148, 84, C.charcoal, 4),              // screen
    rect(134, 100, 132, 68, C.muted, 2),
    rect(190, 176, 20, 10, C.charcoal, 2),              // stand
    rect(104, 186, 192, 34, C.teak, 3),                 // cabinet
    rect(114, 194, 80, 18, TEAK_LIGHT, 2),              // drawers
    rect(206, 194, 80, 18, TEAK_LIGHT, 2),
    rect(142, 201, 24, 4, C.brass, 2),
    rect(234, 201, 24, 4, C.brass, 2),
    rect(112, 220, 12, 12, TEAK_DARK, 2),
    rect(276, 220, 12, 12, TEAK_DARK, 2)
  ].join('');
}

function singleChair() {
  return [
    rect(166, 96, 68, 10, C.teak, 3),                   // top rail
    rect(166, 116, 68, 8, C.teak, 3),                   // mid rail
    rect(160, 96, 10, 84, TEAK_DARK, 2),                // stiles
    rect(230, 96, 10, 84, TEAK_DARK, 2),
    rect(152, 172, 96, 14, C.ivory, 4),                 // seat
    rect(158, 186, 10, 46, C.teak, 2),                  // legs
    rect(232, 186, 10, 46, C.teak, 2),
    rect(166, 208, 68, 6, TEAK_DARK, 2)                 // stretcher
  ].join('');
}

function customOrders() {
  return [
    rect(88, 182, 224, 16, TEAK_LIGHT, 2),              // workbench top
    rect(88, 198, 224, 10, C.teak),
    rect(106, 208, 14, 24, TEAK_DARK, 2),               // bench legs
    rect(280, 208, 14, 24, TEAK_DARK, 2),

    // measured drawing of a wardrobe, pinned to the bench
    rect(104, 92, 148, 90, C.ivory, 3),
    `<rect x="104" y="92" width="148" height="90" rx="3" fill="none" stroke="${C.muted}" stroke-width="2"/>`,
    `<rect x="126" y="108" width="72" height="50" fill="none" stroke="${C.teak}" stroke-width="3"/>`,
    `<path d="M162 108 v50" stroke="${C.teak}" stroke-width="3"/>`,
    // dimension line with end ticks
    `<path d="M126 170 h72" stroke="${C.muted}" stroke-width="2"/>`,
    `<path d="M126 166 v8 M198 166 v8" stroke="${C.muted}" stroke-width="2"/>`,

    // brass folding ruler lying on the bench
    `<path d="M262 178 h44 v8 h-44 Z" fill="${C.brass}"/>`,
    `<path d="M272 178 v8 M282 178 v8 M292 178 v8" stroke="${C.walnut}" stroke-width="1.5" opacity="0.6"/>`,

    // offcut of timber
    rect(258, 156, 48, 16, C.teak, 2),
    rect(258, 156, 48, 5, TEAK_LIGHT, 2)
  ].join('');
}

/** Owner slot: a monogram, never an invented likeness of a real person. */
function monogram() {
  return [
    `<circle cx="200" cy="200" r="150" fill="${C.walnut}"/>`,
    `<circle cx="200" cy="200" r="130" fill="none" stroke="${C.brass}" stroke-width="4" opacity="0.7"/>`,
    `<text x="200" y="228" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-size="104" font-weight="600" fill="${C.brass}">AS</text>`,
    `<text x="200" y="272" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="3" fill="${C.sand}" opacity="0.85">OWNER PHOTO</text>`
  ].join('');
}

/** Wide showroom scene for the hero, drawn in a 640x360 box.
 *
 *  The hero is the one slot whose shape moves: object-fit:cover renders it at
 *  about 2.77:1 on a desktop and 0.6:1 on a phone. Composed naively, the desktop
 *  crop cuts the top off and the phone crop cuts both sides off. So everything
 *  that matters sits inside the region that survives both:
 *
 *    vertical   y 64..296   (what a 2.77:1 crop of 16:9 leaves)
 *    horizontal x 212..428  (what a 0.6:1 crop leaves)
 *
 *  The sofa fills that intersection, so a phone shows a complete piece. The
 *  wardrobe and table sit outside it as set dressing that only wide screens see,
 *  and every piece is grounded on the same floor line at y=250.
 */
function showroom() {
  return [
    rect(0, 0, 640, 250, C.walnut),                                  // wall
    rect(0, 250, 640, 110, '#4A3325'),                               // floor

    // pendant light, kept inside the vertical safe band
    rect(318, 64, 4, 26, C.brass),                                   // cord
    `<circle cx="320" cy="104" r="16" fill="${C.brass}"/>`,
    `<path d="M320 118 L404 250 L236 250 Z" fill="${C.brass}" opacity="0.09"/>`, // light pool

    // framed art, clear of the top crop and of the wardrobe below it
    rect(58, 72, 92, 50, TEAK_DARK, 3),
    rect(66, 80, 76, 34, C.teak, 2),
    rect(496, 72, 92, 50, TEAK_DARK, 3),
    rect(504, 80, 76, 34, C.teak, 2),

    // wardrobe, left — only wide screens see it
    rect(54, 132, 104, 118, C.teak, 3),
    rect(60, 140, 44, 102, TEAK_LIGHT, 2),
    rect(110, 140, 44, 102, TEAK_LIGHT, 2),
    rect(100, 182, 4, 20, C.brass, 2),
    rect(110, 182, 4, 20, C.brass, 2),

    // dining table, right — likewise
    rect(470, 178, 120, 10, C.ivory, 3),
    rect(470, 188, 120, 6, TEAK_LIGHT),
    rect(482, 194, 8, 56, C.teak, 2),
    rect(570, 194, 8, 56, C.teak, 2),
    rect(524, 156, 10, 22, C.brass, 3),

    // sofa, centred so it survives the phone crop whole
    rect(216, 164, 24, 58, TEAK_DARK, 8),                            // arms
    rect(400, 164, 24, 58, TEAK_DARK, 8),
    rect(228, 176, 184, 50, C.teak, 8),                              // body
    rect(236, 152, 168, 32, C.sand, 8),                              // back
    rect(244, 180, 76, 24, C.ivory, 6),                              // seats
    rect(330, 180, 74, 24, C.ivory, 6),
    rect(236, 222, 10, 28, TEAK_DARK, 2),                            // legs
    rect(396, 222, 10, 28, TEAK_DARK, 2),

    `<ellipse cx="320" cy="250" rx="180" ry="10" fill="#000" opacity="0.14"/>`
  ].join('');
}

/* ------------------------------------------------------------ slot wiring */

const SCENE = {
  bed, wardrobe, sofa, diningSet, mattressStack, studyDesk,
  plasticChair, mandir, tvUnit, singleChair, customOrders, monogram, showroom
};

/** slot -> [width, height, scene, label] */
const SLOTS = {
  'hero-photo':    [1600, 900, 'showroom',     'Balaji Furnitures showroom'],
  'owner-photo':   [600, 600, 'monogram',      'Owner portrait placeholder'],
  'custom-orders': [800, 600, 'customOrders',  'Custom orders'],

  'cat-beds':      [600, 600, 'bed',           'Beds'],
  'cat-almirah':   [600, 600, 'wardrobe',      'Almirah and wardrobes'],
  'cat-sofa':      [600, 600, 'sofa',          'Sofa sets'],
  'cat-dining':    [600, 600, 'diningSet',     'Dining sets'],
  'cat-mattress':  [600, 600, 'mattressStack', 'Mattresses'],
  'cat-study':     [600, 600, 'studyDesk',     'Study and office'],
  'cat-plastic':   [600, 600, 'plasticChair',  'Plastic and steel furniture'],
  'cat-mandir':    [600, 600, 'mandir',        'Mandir'],
  'cat-tv':        [600, 600, 'tvUnit',        'TV units'],
  'cat-chairs':    [600, 600, 'singleChair',   'Chairs'],

  'feat-sofa':     [800, 600, 'sofa',          'Sheesham wood sofa set'],
  'feat-bed':      [800, 600, 'bed',           'Solid teak bed'],
  'feat-wardrobe': [800, 600, 'wardrobe',      'King wardrobe'],
  'feat-dining':   [800, 600, 'diningSet',     '6-seater dining set'],
  'feat-mattress': [800, 600, 'mattressStack', 'Orthopedic spring mattress'],
  'feat-study':    [800, 600, 'studyDesk',     'Study table and chair']
};

/* The gallery cycles the pieces so the grid does not read as one repeated image. */
const GALLERY = ['sofa', 'bed', 'diningSet', 'wardrobe', 'mattressStack',
                 'studyDesk', 'singleChair', 'tvUnit', 'mandir', 'plasticChair'];
GALLERY.forEach((scene, i) => {
  SLOTS[`gallery-${i + 1}`] = [800, 800, scene, `Showroom photo ${i + 1}`];
});

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let n = 0;

  for (const [slot, [w, h, sceneName, label]] of Object.entries(SLOTS)) {
    const draw = SCENE[sceneName];
    if (!draw) throw new Error(`No scene named ${sceneName} for ${slot}`);

    let doc;
    if (sceneName === 'showroom') {
      doc = svg(w, h, 640, 360, draw(), label);
    } else if (sceneName === 'monogram') {
      /* The owner slot is cropped to a circle by CSS, so it needs a square
         viewBox — a 4:3 one letterboxes with bare bands top and bottom. */
      doc = svg(w, h, 400, 400, rect(0, 0, 400, 400, C.sand) + draw(), label);
    } else if (w === h) {
      /* A square slot used to crop 50 units off each side of the 400-wide
         drawing, which cut the arms off the sofa and the headboard off the bed.
         Use a square viewBox instead: the whole piece fits, with the same
         margin on every side, and the baseline drops to 300. */
      doc = svg(w, h, 400, 400,
        floor(400, 400, 300) + `<g transform="translate(0,68)">${draw()}</g>`,
        label);
    } else {
      doc = svg(w, h, 400, 300, floor(400, 300, 232) + draw(), label);
    }

    await fs.writeFile(path.join(OUT, `${slot}.svg`), doc);
    n++;
  }
  console.log(`Wrote ${n} placeholder illustrations to public/images/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
