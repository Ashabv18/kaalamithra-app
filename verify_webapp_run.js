// Smoke-test the running Kaalamithra web app (pages + API + auth round-trip).
// Usage: node verify_webapp_run.js     (server must already be listening)
require('dotenv').config();

const BASE = 'http://localhost:' + (process.env.PORT || 5000);
const PAGES = ['/', '/welcome', '/login', '/signup', '/client/login', '/client/dashboard', '/admin/login', '/admin/dashboard'];
const APIS = ['/api', '/api/health'];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kaalamithra-ai.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

let failed = 0;
function check(ok, label, extra) {
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (extra ? '  -> ' + extra : ''));
}

async function get(path) {
  const r = await fetch(BASE + path, { redirect: 'manual' });
  return { status: r.status, body: await r.text() };
}

async function postJson(path, payload) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { status: r.status, body: await r.text() };
}

(async () => {
  console.log('=== Kaalamithra web app smoke test @ ' + BASE + ' ===\n');

  for (const p of PAGES) {
    try {
      const r = await get(p);
      const title = (r.body.match(/<title>([^<]*)<\/title>/i) || [, ''])[1].trim();
      const isHtml = /<html/i.test(r.body);
      check(r.status === 200 && isHtml, 'PAGE  GET ' + p, r.status + ' ' + (title || '(no title)'));
    } catch (e) {
      check(false, 'PAGE  GET ' + p, e.message);
    }
  }

  for (const p of APIS) {
    try {
      const r = await get(p);
      check(r.status === 200 && /"success"\s*:\s*true/.test(r.body), 'API   GET ' + p, r.status + ' ' + r.body.replace(/\s+/g, ' ').slice(0, 140));
    } catch (e) {
      check(false, 'API   GET ' + p, e.message);
    }
  }

  // Protected route must stay protected without a session.
  try {
    const r = await get('/api/inquiries');
    check(r.status === 401, 'GUARD GET /api/inquiries (no session)', r.status + ' (expected 401)');
  } catch (e) {
    check(false, 'GUARD GET /api/inquiries', e.message);
  }

  // Inquiry form endpoint is reachable and validates input (no row written for an invalid payload).
  try {
    const r = await postJson('/api/inquiries', { name: '', email: '', details: '' });
    const json = JSON.parse(r.body);
    check(r.status === 400 && json.success === false, 'FORM  POST /api/inquiries (invalid payload)', r.status + ' ' + (json.error || ''));
  } catch (e) {
    check(false, 'FORM  POST /api/inquiries', e.message);
  }

  // Auth round-trip: admin login -> token -> admin-only stats endpoint.
  let token = null;
  try {
    const r = await postJson('/api/admin/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const json = JSON.parse(r.body);
    token = json.token || null;
    check(r.status === 200 && !!token, 'AUTH  POST /api/admin/login', r.status + ' ' + (json.message || json.error || ''));
  } catch (e) {
    check(false, 'AUTH  POST /api/admin/login', e.message);
  }

  if (token) {
    try {
      const r = await fetch(BASE + '/api/admin/stats', { headers: { Authorization: 'Bearer ' + token } });
      const json = await r.json();
      check(r.status === 200 && json.success === true, 'AUTH  GET /api/admin/stats (Bearer)', r.status + ' ' + JSON.stringify(json.data || json).slice(0, 140));
    } catch (e) {
      check(false, 'AUTH  GET /api/admin/stats', e.message);
    }
  }

  console.log('\n' + (failed === 0 ? 'ALL CHECKS PASSED' : failed + ' CHECK(S) FAILED'));
  process.exit(failed === 0 ? 0 : 1);
})();
