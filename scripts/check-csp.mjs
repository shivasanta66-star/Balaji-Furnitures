#!/usr/bin/env node
/*
 * netlify.toml pins sha256 hashes for the inline JSON-LD blocks. Editing one of
 * those blocks changes its hash, and the browser then silently drops the block —
 * the page still renders, but the structured data search engines read is gone.
 * This recomputes the hashes and fails if netlify.toml has drifted.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const wanted = new Set();

for (const file of fs.readdirSync(path.join(ROOT, 'public'))) {
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(ROOT, 'public', file), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    wanted.add("'sha256-" + crypto.createHash('sha256').update(m[1], 'utf8').digest('base64') + "'");
  }
}

const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const missing = [...wanted].filter((h) => !toml.includes(h));

if (missing.length) {
  console.error('\n  netlify.toml CSP is out of date. Missing hash(es):\n');
  missing.forEach((h) => console.error('    ' + h));
  console.error('\n  Replace the script-src hashes in netlify.toml with:\n');
  console.error('    ' + [...wanted].join(' ') + '\n');
  process.exit(1);
}
console.log(`  ok  netlify.toml CSP covers all ${wanted.size} inline script blocks`);
