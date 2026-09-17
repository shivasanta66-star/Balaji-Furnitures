'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'enquiries.json');

const STORE_WHATSAPP = process.env.STORE_WHATSAPP || '919937601505';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_COOKIE = 'bf_admin';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/* The 10 categories, mirroring the recovered DCLogic data exactly. */
const CATEGORIES = [
  'Beds',
  'Almirah & Wardrobes',
  'Sofa Sets',
  'Dining Sets',
  'Mattresses',
  'Study & Office',
  'Plastic & Steel Furniture',
  'Mandir',
  'TV Units',
  'Chairs'
];

/* ------------------------------------------------------------------ utils */

const CONTROL_CHARS = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]', 'g');

/** Strip control characters, keeping ordinary text plus newlines and tabs. */
function stripControl(value) {
  return String(value).replace(CONTROL_CHARS, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitise(value) {
  return escapeHtml(stripControl(value).trim());
}

/** ISO-8601 timestamp in Asia/Kolkata (+05:30). */
function istTimestamp(date = new Date()) {
  const ist = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);
  return ist.toISOString().replace('Z', '+05:30');
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* ------------------------------------------------- enquiry store (locked) */

let writeChain = Promise.resolve();

async function readEnquiries() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/** Serialises read-modify-write so concurrent requests cannot clobber each other. */
function mutateEnquiries(fn) {
  const next = writeChain.then(async () => {
    const list = await readEnquiries();
    const result = await fn(list);
    await fsp.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(list, null, 2) + '\n', 'utf8');
    await fsp.rename(tmp, DATA_FILE);
    return result;
  });
  // Keep the chain alive even if this mutation rejects.
  writeChain = next.catch(() => {});
  return next;
}

/* ----------------------------------------------------------- rate limiting */

const RATE_WINDOW_MS = 60 * 60 * 1000;

/* Two separate caps, both per IP per hour:
   - SAVED_MAX is the "5 submissions" cap, counting only enquiries actually stored,
     so a customer who mistypes their phone number is not locked out.
   - ATTEMPT_MAX is a wider guard so the endpoint cannot simply be hammered. */
const SAVED_MAX = 5;
const ATTEMPT_MAX = 30;

const saved = new Map();
const attempts = new Map();

function recent(map, ip, now) {
  return (map.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
}

function tooMany(res, times, now) {
  const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - times[0])) / 1000);
  res.set('Retry-After', String(retryAfter));
  return res.status(429).json({
    success: false,
    error: 'Too many enquiries from this connection. Please call or message us on WhatsApp instead.'
  });
}

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const recentSaved = recent(saved, ip, now);
  if (recentSaved.length >= SAVED_MAX) return tooMany(res, recentSaved, now);

  const recentAttempts = recent(attempts, ip, now);
  if (recentAttempts.length >= ATTEMPT_MAX) return tooMany(res, recentAttempts, now);

  recentAttempts.push(now);
  attempts.set(ip, recentAttempts);
  req.rateLimitIp = ip;
  next();
}

function recordSaved(ip) {
  const now = Date.now();
  const times = recent(saved, ip, now);
  times.push(now);
  saved.set(ip, times);
}

/* Drop stale buckets so the maps cannot grow without bound. */
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const map of [saved, attempts]) {
    for (const [ip, times] of map) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length) map.set(ip, kept);
      else map.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

/* ------------------------------------------------------------------- mail */

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function notifyOwner(enquiry) {
  const subject = `New enquiry: ${enquiry.category} - ${enquiry.name}`;
  const text = [
    'New enquiry from the Balaji Furnitures website.',
    '',
    `Name:     ${enquiry.name}`,
    `Phone:    ${enquiry.phone}`,
    `Category: ${enquiry.category}`,
    `Message:  ${enquiry.message || '(none)'}`,
    `Received: ${enquiry.timestamp} (IST)`,
    `Id:       ${enquiry.id}`
  ].join('\n');

  if (!transporter || !process.env.OWNER_EMAIL) {
    console.log('[enquiry] SMTP not configured - logging instead:\n' + text);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.OWNER_EMAIL,
      replyTo: process.env.OWNER_EMAIL,
      subject,
      text
    });
  } catch (err) {
    // A mail failure must never lose the enquiry - it is already on disk.
    console.error('[enquiry] email notification failed:', err.message);
    console.log('[enquiry] unsent notification:\n' + text);
  }
}

/* --------------------------------------------------------------- app setup */

app.set('trust proxy', 1);
app.disable('x-powered-by');

/* Allow the inline JSON-LD blocks by hash rather than opening up script-src. */
function inlineScriptHashes(dir) {
  const hashes = new Set();
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      hashes.add("'sha256-" + crypto.createHash('sha256').update(m[1], 'utf8').digest('base64') + "'");
    }
  }
  return Array.from(hashes);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      scriptSrc: ["'self'", ...inlineScriptHashes(PUBLIC_DIR)],
      styleSrc: ["'self'"],
      styleSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ['https://www.google.com'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(compression());
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

/* ----------------------------------------------------------- admin session */

function issueToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(String(expires)).digest('hex');
  return `${expires}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== 'string') return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig) return false;
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(expires).digest('hex');
  return timingSafeEqual(sig, expected);
}

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ success: false, error: 'Admin access is not configured on this server.' });
  }
  if (verifyToken(req.cookies[ADMIN_COOKIE])) return next();
  return res.status(401).json({ success: false, error: 'Not signed in.' });
}

app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ success: false, error: 'Admin access is not configured on this server.' });
  }
  const supplied = typeof req.body.password === 'string' ? req.body.password : '';
  const suppliedHash = crypto.createHash('sha256').update(supplied).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
  if (!timingSafeEqual(suppliedHash, expectedHash)) {
    return res.status(401).json({ success: false, error: 'Wrong password.' });
  }
  res.cookie(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS
  });
  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE);
  res.json({ success: true });
});

app.get('/api/admin/session', (req, res) => {
  res.json({
    success: true,
    signedIn: verifyToken(req.cookies[ADMIN_COOKIE]),
    configured: Boolean(ADMIN_PASSWORD)
  });
});

/* --------------------------------------------------------------- enquiries */

app.post('/api/enquiry', rateLimit, async (req, res) => {
  const body = req.body || {};

  const name = sanitise(body.name || '');
  const phone = stripControl(body.phone || '').trim();
  const category = stripControl(body.category || '').trim();
  const message = sanitise(body.message || '');

  if (!name) {
    return res.status(400).json({ success: false, error: 'Please tell us your name.' });
  }
  if (name.length > 100) {
    return res.status(400).json({ success: false, error: 'That name is too long.' });
  }
  if (!/^[6-9][0-9]{9}$/.test(phone)) {
    return res.status(400).json({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ success: false, error: 'Choose one of the listed categories.' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ success: false, error: 'Please keep your message under 1000 characters.' });
  }

  const enquiry = {
    id: crypto.randomUUID(),
    timestamp: istTimestamp(),
    name,
    phone,
    category,
    message,
    status: 'new'
  };

  try {
    await mutateEnquiries((list) => { list.push(enquiry); });
  } catch (err) {
    console.error('[enquiry] could not save:', err.message);
    return res.status(500).json({ success: false, error: 'We could not save your enquiry. Please call or WhatsApp us.' });
  }

  recordSaved(req.rateLimitIp);

  // Notification must not hold up the response, and must never fail the request.
  notifyOwner(enquiry).catch((err) => console.error('[enquiry] notify error:', err.message));

  const lines = [
    'Enquiry from website:',
    'Name: ' + stripControl(body.name || '').trim(),
    'Phone: ' + phone,
    'Category: ' + category,
    'Message: ' + stripControl(body.message || '').trim()
  ];
  const waLink = 'https://wa.me/' + STORE_WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));

  res.status(201).json({ success: true, waLink });
});

app.get('/api/enquiries', requireAdmin, async (req, res) => {
  try {
    const list = await readEnquiries();
    res.json({ success: true, enquiries: list.slice().reverse() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not read enquiries.' });
  }
});

const STATUSES = ['new', 'contacted', 'closed'];

app.patch('/api/enquiries/:id', requireAdmin, async (req, res) => {
  const status = typeof req.body.status === 'string' ? req.body.status : '';
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be new, contacted or closed.' });
  }
  try {
    const updated = await mutateEnquiries((list) => {
      const row = list.find((e) => e.id === req.params.id);
      if (!row) return null;
      row.status = status;
      row.updatedAt = istTimestamp();
      return row;
    });
    if (!updated) return res.status(404).json({ success: false, error: 'No enquiry with that id.' });
    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not update the enquiry.' });
  }
});

/** CSV cell escaping, including a guard against spreadsheet formula injection. */
function csvCell(value) {
  let s = String(value == null ? '' : value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

app.get('/api/enquiries.csv', requireAdmin, async (req, res) => {
  try {
    const list = await readEnquiries();
    const header = ['id', 'timestamp', 'name', 'phone', 'category', 'message', 'status'];
    const rows = list.map((e) => header.map((k) => csvCell(e[k])).join(','));
    const csv = [header.join(','), ...rows].join('\r\n') + '\r\n';
    res.type('text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="balaji-enquiries.csv"');
    res.send('﻿' + csv);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not export enquiries.' });
  }
});

/* ------------------------------------------------------------------ static */

app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (/\.(woff2|svg|png|jpg|jpeg|webp|ico)$/i.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(css|js)$/i.test(filePath)) {
      /* Revalidate rather than cache for a day: the HTML and the stylesheet
         change together, and a stale stylesheet renders new markup unstyled. */
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Not found.' });
  }
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server]', err);
  res.status(500).json({ success: false, error: 'Something went wrong.' });
});

async function start() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(DATA_FILE);
  } catch {
    await fsp.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
  app.listen(PORT, () => {
    console.log(`Balaji Furnitures running on http://localhost:${PORT}`);
    if (!ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD is not set - /admin.html is disabled.');
    if (!transporter) console.warn('SMTP is not configured - enquiries will be logged to the console.');
  });
}

if (require.main === module) start();

module.exports = { app, CATEGORIES, istTimestamp, sanitise, csvCell };
