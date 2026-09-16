#!/usr/bin/env node
/*
 * Install real photos into the site's 29 image slots.
 *
 *   1. Edit scripts/photos.json — map a slot name to a URL or a local file path.
 *   2. node scripts/install-photos.mjs
 *
 * Each photo is centre-cropped to that slot's aspect ratio, resized to the exact
 * dimensions the markup declares (so nothing shifts while loading), saved as
 * public/images/<slot>.jpg, and registered in public/js/photos.js. Slots you
 * leave out keep their branded SVG placeholder.
 *
 * Cropping runs through headless Chromium (already present for the test suite),
 * so there is no ImageMagick or sharp dependency.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const MAP_FILE = path.join(ROOT, 'scripts', 'photos.json');
const PHOTOS_JS = path.join(ROOT, 'public', 'js', 'photos.js');
const PAGES = ['public/index.html', 'public/about.html'];

/* Target size per slot. These match the width/height in the markup exactly. */
const SLOTS = {
  'hero-photo': [1600, 900],
  'owner-photo': [600, 600],
  'custom-orders': [800, 600],
  'cat-beds': [600, 600], 'cat-almirah': [600, 600], 'cat-sofa': [600, 600],
  'cat-dining': [600, 600], 'cat-mattress': [600, 600], 'cat-study': [600, 600],
  'cat-plastic': [600, 600], 'cat-mandir': [600, 600], 'cat-tv': [600, 600],
  'cat-chairs': [600, 600],
  'feat-sofa': [800, 600], 'feat-bed': [800, 600], 'feat-wardrobe': [800, 600],
  'feat-dining': [800, 600], 'feat-mattress': [800, 600], 'feat-study': [800, 600]
};
for (let i = 1; i <= 10; i++) SLOTS[`gallery-${i}`] = [800, 800];

const QUALITY = 0.82;

function bail(msg) {
  console.error('\n  ' + msg + '\n');
  process.exit(1);
}

async function loadChromium() {
  /* Playwright is CommonJS, so from ESM its exports may arrive on `default`. */
  const pick = (mod) => mod?.chromium || mod?.default?.chromium;

  /* Local dependency first, then a global install (absolute paths need file:// in ESM). */
  try {
    const found = pick(await import('playwright'));
    if (found) return found;
  } catch { /* fall through */ }

  try {
    const { execSync } = await import('node:child_process');
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const found = pick(await import(pathToFileURL(path.join(root, 'playwright', 'index.js')).href));
    if (found) return found;
  } catch { /* fall through */ }

  bail('Could not load Playwright. Install it with:  npm i -D playwright');
}

/** Read a source image as a data: URI, from a URL or a local path. */
async function readSource(src) {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
    const type = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
    if (!type.startsWith('image/')) throw new Error(`${src} returned ${type}, not an image`);
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString('base64')}`;
  }
  const abs = path.isAbsolute(src) ? src : path.join(ROOT, src);
  const buf = await fs.readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const type = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                 '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }[ext];
  if (!type) throw new Error(`Unsupported file type: ${ext || abs}`);
  return `data:${type};base64,${buf.toString('base64')}`;
}

/** Centre-crop to the target aspect ratio, resize, return a JPEG buffer. */
async function crop(page, dataUri, [w, h]) {
  const out = await page.evaluate(async ([uri, w, h, q]) => {
    const im = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('image failed to decode'));
      i.src = uri;
    });
    if (!im.naturalWidth || !im.naturalHeight) throw new Error('image has no intrinsic size');
    const scale = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const sw = w / scale, sh = h / scale;
    const sx = (im.naturalWidth - sw) / 2, sy = (im.naturalHeight - sh) / 2;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.fillStyle = '#3E2A1E';
    g.fillRect(0, 0, w, h);
    g.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    return cv.toDataURL('image/jpeg', q);
  }, [dataUri, w, h, QUALITY]);
  return Buffer.from(out.split(',')[1], 'base64');
}

async function main() {
  let map;
  try {
    map = JSON.parse(await fs.readFile(MAP_FILE, 'utf8'));
  } catch (err) {
    bail(err.code === 'ENOENT'
      ? `No ${path.relative(ROOT, MAP_FILE)}. Copy scripts/photos.example.json to it and add your sources.`
      : `${path.relative(ROOT, MAP_FILE)} is not valid JSON: ${err.message}`);
  }

  const entries = Object.entries(map).filter(([, v]) => v && String(v).trim());
  const unknown = entries.filter(([slot]) => !SLOTS[slot]).map(([s]) => s);
  if (unknown.length) bail(`Unknown slot name(s): ${unknown.join(', ')}\nValid slots: ${Object.keys(SLOTS).join(', ')}`);
  if (!entries.length) bail('Nothing to do — every entry in photos.json is empty.');

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const installed = {};
  const failed = [];

  for (const [slot, src] of entries) {
    try {
      const jpeg = await crop(page, await readSource(src), SLOTS[slot]);
      await fs.writeFile(path.join(IMAGES, `${slot}.jpg`), jpeg);
      installed[slot] = `${slot}.jpg`;
      const [w, h] = SLOTS[slot];
      console.log(`  ok    ${slot.padEnd(15)} ${w}x${h}  ${(jpeg.length / 1024).toFixed(0)} KB`);
    } catch (err) {
      failed.push([slot, err.message]);
      console.log(`  FAIL  ${slot.padEnd(15)} ${err.message}`);
    }
  }

  await browser.close();

  if (Object.keys(installed).length) {
    /* Merge with anything installed on a previous run. */
    let existing = {};
    try {
      const prev = await fs.readFile(PHOTOS_JS, 'utf8');
      const m = prev.match(/window\.BF_PHOTOS\s*=\s*(\{[\s\S]*?\});/);
      if (m) existing = JSON.parse(m[1]);
    } catch { /* first run */ }

    const merged = { ...existing, ...installed };
    await fs.writeFile(PHOTOS_JS,
      '/* Generated by scripts/install-photos.mjs — do not edit by hand.\n' +
      '   Maps an image slot to a real photo filename in /images.\n' +
      '   Any slot not listed here falls back to its <slot>.svg placeholder. */\n' +
      'window.BF_PHOTOS = ' + JSON.stringify(merged, null, 2) + ';\n');

    /* The few <img> tags written straight into the HTML. */
    for (const rel of PAGES) {
      const file = path.join(ROOT, rel);
      let html = await fs.readFile(file, 'utf8');
      const before = html;
      for (const [slot, name] of Object.entries(merged)) {
        html = html.replace(
          new RegExp(`(<img data-slot="${slot}" src="images/)[^"]+(")`, 'g'),
          `$1${name}$2`);
      }
      if (html !== before) {
        await fs.writeFile(file, html);
        console.log(`  updated ${rel}`);
      }
    }
    console.log(`\n  ${Object.keys(merged).length} of 29 slots now use real photos.`);
  }

  if (failed.length) {
    console.log(`\n  ${failed.length} failed — those slots keep their placeholder.`);
    process.exitCode = 1;
  }
}

main().catch((err) => bail(err.stack || err.message));
