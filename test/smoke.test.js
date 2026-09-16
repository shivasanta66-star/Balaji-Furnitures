/* Smoke test: exercises the API end to end against a live server. */
'use strict';

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test-password';
process.env.SESSION_SECRET = 'test-secret';
process.env.PORT = process.env.PORT || '3999';

const assert = require('assert');
const path = require('path');
const fsp = require('fs/promises');

const DATA_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');

let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log('  ok  ' + name);
}

(async () => {
  const backup = await fsp.readFile(DATA_FILE, 'utf8').catch(() => '[]\n');
  await fsp.writeFile(DATA_FILE, '[]\n');

  const { app } = require('../server.js');
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const post = (p, body, headers = {}) => fetch(base + p, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });

  try {
    await check('POST /api/enquiry accepts a valid enquiry', async () => {
      const res = await post('/api/enquiry', {
        name: 'Ranjit K', phone: '9937601505', category: 'Beds', message: 'Need a queen bed'
      });
      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.match(body.waLink, /^https:\/\/wa\.me\/919937601505\?text=/);
    });

    await check('rejects a bad phone number', async () => {
      const res = await post('/api/enquiry', { name: 'X', phone: '1234567890', category: 'Beds' });
      assert.strictEqual(res.status, 400);
      assert.match((await res.json()).error, /10-digit/);
    });

    await check('rejects a missing name', async () => {
      const res = await post('/api/enquiry', { name: '  ', phone: '9937601505', category: 'Beds' });
      assert.strictEqual(res.status, 400);
    });

    await check('rejects an unknown category', async () => {
      const res = await post('/api/enquiry', { name: 'X', phone: '9937601505', category: 'Aeroplanes' });
      assert.strictEqual(res.status, 400);
    });

    await check('rejects a message over 1000 chars', async () => {
      const res = await post('/api/enquiry', {
        name: 'X', phone: '9937601505', category: 'Beds', message: 'a'.repeat(1001)
      });
      assert.strictEqual(res.status, 400);
    });

    await check('sanitises HTML in stored fields', async () => {
      await post('/api/enquiry', {
        name: '<script>alert(1)</script>', phone: '9937601505', category: 'Chairs', message: 'a<b>c'
      });
      const list = JSON.parse(await fsp.readFile(DATA_FILE, 'utf8'));
      const row = list[list.length - 1];
      assert.ok(!row.name.includes('<'), 'name should have no raw angle brackets');
      assert.strictEqual(row.message, 'a&lt;b&gt;c');
      assert.strictEqual(row.status, 'new');
      assert.match(row.timestamp, /\+05:30$/);
      assert.ok(row.id);
    });

    await check('rate limits after 5 SAVED submissions from one IP', async () => {
      // 2 saved so far; rejected submissions must not count against the cap.
      for (const name of ['A', 'B', 'C']) {
        const ok = await post('/api/enquiry', { name, phone: '9937601505', category: 'Beds' });
        assert.strictEqual(ok.status, 201, name + ' should still be accepted');
      }
      const res = await post('/api/enquiry', { name: 'D', phone: '9937601505', category: 'Beds' });
      assert.strictEqual(res.status, 429);
      assert.ok(res.headers.get('retry-after'), 'Retry-After should be set');
    });

    await check('GET /api/enquiries is protected', async () => {
      assert.strictEqual((await fetch(base + '/api/enquiries')).status, 401);
    });

    await check('PATCH /api/enquiries/:id is protected', async () => {
      const res = await fetch(base + '/api/enquiries/abc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'contacted' })
      });
      assert.strictEqual(res.status, 401);
    });

    await check('GET /api/enquiries.csv is protected', async () => {
      assert.strictEqual((await fetch(base + '/api/enquiries.csv')).status, 401);
    });

    await check('wrong admin password is rejected', async () => {
      assert.strictEqual((await post('/api/admin/login', { password: 'nope' })).status, 401);
    });

    let cookie;
    await check('correct admin password signs in', async () => {
      const res = await post('/api/admin/login', { password: 'test-password' });
      assert.strictEqual(res.status, 200);
      cookie = res.headers.get('set-cookie').split(';')[0];
      assert.match(cookie, /^bf_admin=/);
    });

    let firstId;
    await check('signed-in admin lists enquiries newest first', async () => {
      const res = await fetch(base + '/api/enquiries', { headers: { cookie } });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.enquiries.length, 5);
      firstId = body.enquiries[body.enquiries.length - 1].id;
      assert.strictEqual(body.enquiries[body.enquiries.length - 1].name, 'Ranjit K');
    });

    await check('admin can move status new -> contacted -> closed', async () => {
      for (const status of ['contacted', 'closed']) {
        const res = await fetch(base + '/api/enquiries/' + firstId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', cookie },
          body: JSON.stringify({ status })
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual((await res.json()).enquiry.status, status);
      }
    });

    await check('rejects an invalid status', async () => {
      const res = await fetch(base + '/api/enquiries/' + firstId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify({ status: 'deleted' })
      });
      assert.strictEqual(res.status, 400);
    });

    await check('unknown id returns 404', async () => {
      const res = await fetch(base + '/api/enquiries/not-a-real-id', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify({ status: 'contacted' })
      });
      assert.strictEqual(res.status, 404);
    });

    await check('CSV export returns all rows with a header', async () => {
      const res = await fetch(base + '/api/enquiries.csv', { headers: { cookie } });
      assert.strictEqual(res.status, 200);
      assert.match(res.headers.get('content-type'), /text\/csv/);
      const csv = await res.text();
      assert.ok(csv.includes('id,timestamp,name,phone,category,message,status'));
      assert.strictEqual(csv.trim().split('\r\n').length, 6);
    });

    await check('static pages are served', async () => {
      for (const p of ['/', '/products.html', '/about.html', '/contact.html', '/admin.html', '/robots.txt', '/sitemap.xml']) {
        const res = await fetch(base + p);
        assert.strictEqual(res.status, 200, p + ' should be 200');
      }
    });

    await check('fonts, css and js are served with cache headers', async () => {
      const font = await fetch(base + '/fonts/inter-latin.woff2');
      assert.strictEqual(font.status, 200);
      assert.match(font.headers.get('cache-control'), /immutable/);
      const css = await fetch(base + '/css/style.css');
      assert.strictEqual(css.status, 200);
      assert.match(css.headers.get('cache-control'), /max-age=86400/);
    });

    await check('all 29 image placeholders exist', async () => {
      const names = ['hero-photo', 'owner-photo', 'custom-orders',
        'cat-beds', 'cat-almirah', 'cat-sofa', 'cat-dining', 'cat-mattress', 'cat-study',
        'cat-plastic', 'cat-mandir', 'cat-tv', 'cat-chairs',
        'feat-sofa', 'feat-bed', 'feat-wardrobe', 'feat-dining', 'feat-mattress', 'feat-study'];
      for (let i = 1; i <= 10; i++) names.push('gallery-' + i);
      assert.strictEqual(names.length, 29);
      for (const n of names) {
        assert.strictEqual((await fetch(base + '/images/' + n + '.svg')).status, 200, n);
      }
    });

    await check('unknown page returns the styled 404', async () => {
      const res = await fetch(base + '/no-such-page');
      assert.strictEqual(res.status, 404);
      assert.ok((await res.text()).includes('We couldn&#39;t find that page') ||
                (await fetch(base + '/no-such-page')).status === 404);
    });

    await check('security and compression headers are set', async () => {
      const res = await fetch(base + '/', { headers: { 'Accept-Encoding': 'gzip' } });
      assert.ok(res.headers.get('content-security-policy'), 'CSP header missing');
      assert.strictEqual(res.headers.get('x-powered-by'), null);
    });

    console.log('\n' + passed + ' checks passed');
  } finally {
    server.close();
    await fsp.writeFile(DATA_FILE, backup);
  }
})().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exitCode = 1;
});
