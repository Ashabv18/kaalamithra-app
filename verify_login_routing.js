// Verifies the "one Login button" behaviour:
//   * the live frontend gate shows a generic LOGIN panel (no separate client/admin choice)
//   * admin credentials -> role='admin' + a token that works on /admin/dashboard?token=...
//   * any other account   -> role='client' and is refused by the admin APIs
// Usage: node verify_login_routing.js     (backend must already be listening)
require('dotenv').config();
const fs = require('fs');

const BASE = 'http://localhost:' + (process.env.PORT || 5000);
// The public gate must call the API origin (cross-origin from the marketing site).
const GATE_API_TARGET = process.env.GATE_API || 'http://127.0.0.1:' + (process.env.PORT || 5000);
const GATE_FILE = process.env.GATE_FILE ||
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kaalamithra-ai.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
// Unique throwaway client so repeated runs never collide.
const CLIENT_EMAIL = 'client.check.' + Date.now() + '@example.com';
const CLIENT_PASSWORD = 'Client@12345';

let failed = 0;
function check(ok, label, extra) {
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (extra ? '  -> ' + extra : ''));
}

async function postJson(path, payload, headers) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    body: JSON.stringify(payload)
  });
  return { status: r.status, body: await r.text() };
}

(async () => {
  console.log('=== Login routing check @ ' + BASE + ' ===\n');

  // ---------- 1. Frontend gate: generic LOGIN + role branch ----------
  try {
    const html = fs.readFileSync(GATE_FILE, 'utf8');
    check(/<h1[^>]*>LOGIN<\/h1>/.test(html), 'GATE  panel heading is generic LOGIN');
    check(html.indexOf('CLIENT LOGIN') === -1, 'GATE  no leftover "CLIENT LOGIN" heading');
    check(/encodeURIComponent\(res\.d\.token\)/.test(html), 'GATE  hands the token to the admin dashboard');
    check(/GATE_API\s*\+\s*'\/admin\/dashboard\?token='/.test(html), 'GATE  redirects straight to /admin/dashboard?token=...');
    check(html.indexOf("role === 'admin'") !== -1, "GATE  branches on role === 'admin'");
    // The gate resolves its API origin at runtime so the same build works locally and when
    // deployed: localhost -> the local API, otherwise window.KM_API_BASE / same-origin.
    check(html.indexOf("'" + GATE_API_TARGET + "'") !== -1,
      'GATE  falls back to the local API when served locally', GATE_API_TARGET);
    check(/window\.KM_API_BASE/.test(html), 'GATE  API origin is configurable for deployment (window.KM_API_BASE)');
    check(/location\.origin/.test(html), 'GATE  defaults to same-origin /api when deployed');
  } catch (e) {
    check(false, 'GATE  read frontend gate file', e.message);
  }

  // ---------- 1b. The page the browser actually loads must be that same patched gate ----------
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/kaalamithra-complete/app/index.html';
  try {
    const r = await fetch(FRONTEND_URL);
    const html = await r.text();
    check(r.status === 200, 'SERVED frontend reachable', FRONTEND_URL + ' -> ' + r.status);
    check(/<h1[^>]*>LOGIN<\/h1>/.test(html), 'SERVED gate heading is generic LOGIN');
    check(html.indexOf('CLIENT LOGIN') === -1, 'SERVED gate has no leftover "CLIENT LOGIN"');
    check(html.indexOf("role === 'admin'") !== -1, "SERVED gate branches on role === 'admin'");
    check(html.indexOf(GATE_API_TARGET) !== -1, 'SERVED gate targets the backend', GATE_API_TARGET);
  } catch (e) {
    check(false, 'SERVED frontend reachable', FRONTEND_URL + ' -> ' + e.message);
  }

  // ---------- 1c. The backend's own /login page obeys the SAME single-login rule ----------
  try {
    const r = await fetch(BASE + '/login');
    const html = await r.text();
    check(r.status === 200, 'BACKEND GET /login', BASE + '/login -> ' + r.status);
    check(/<title>Login\s/.test(html), 'BACKEND /login title is generic "Login"');
    check(html.indexOf('CLIENT LOGIN') === -1, 'BACKEND /login has no leftover "CLIENT LOGIN"');
    check(html.indexOf("'/api/auth/login'") !== -1, 'BACKEND /login posts to the single /api/auth/login');
    check(html.indexOf("role === 'admin'") !== -1, "BACKEND /login branches on role === 'admin'");
    check(html.indexOf("/admin/dashboard?token=") !== -1, 'BACKEND /login hands the token to /admin/dashboard');
    check(html.indexOf("go('/client/dashboard')") !== -1, 'BACKEND /login sends every other account to the web app');
  } catch (e) {
    check(false, 'BACKEND GET /login', e.message);
  }

  // ---------- 1d. Both redirect targets actually exist ----------
  for (const path of ['/admin/dashboard', '/client/dashboard']) {
    try {
      const r = await fetch(BASE + path, { redirect: 'manual' });
      const body = await r.text();
      check(r.status === 200 && /<html/i.test(body), 'BACKEND GET ' + path + ' reachable', r.status);
    } catch (e) {
      check(false, 'BACKEND GET ' + path, e.message);
    }
  }

  // ---------- 2. Admin credentials through the SINGLE login endpoint ----------
  let adminToken = null;
  try {
    const r = await postJson('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const json = JSON.parse(r.body);
    adminToken = json.token || null;
    check(r.status === 200 && json.success === true, 'ADMIN POST /api/auth/login', r.status + ' ' + (json.message || json.error || ''));
    check(json.role === 'admin', "ADMIN login returns role='admin'", String(json.role));
    check(!!adminToken, 'ADMIN login returns a token');
  } catch (e) {
    check(false, 'ADMIN POST /api/auth/login', e.message);
  }

  // ---------- 3. That token must work on the admin dashboard (Bearer hand-off) ----------
  if (adminToken) {
    try {
      const r = await fetch(BASE + '/api/admin/me', { headers: { Authorization: 'Bearer ' + adminToken } });
      const json = await r.json();
      check(r.status === 200 && json.success === true, 'ADMIN GET /api/admin/me (Bearer hand-off)',
        r.status + ' ' + JSON.stringify(json.user || json).slice(0, 120));
    } catch (e) {
      check(false, 'ADMIN GET /api/admin/me', e.message);
    }
    try {
      const r = await fetch(BASE + '/admin/dashboard?token=' + encodeURIComponent(adminToken), { redirect: 'manual' });
      const body = await r.text();
      check(r.status === 200 && /<html/i.test(body), 'ADMIN GET /admin/dashboard?token=... (hand-off URL)',
        r.status + ' ' + (body.match(/<title>([^<]*)<\/title>/i) || [, ''])[1]);
    } catch (e) {
      check(false, 'ADMIN GET /admin/dashboard?token=...', e.message);
    }
  }

  // ---------- 4. A normal account stays in the public web app ----------
  let clientToken = null;
  try {
    await postJson('/api/auth/signup', {
      name: 'Client Check', email: CLIENT_EMAIL, phone: '+91 90000 00000', password: CLIENT_PASSWORD
    });
    const r = await postJson('/api/auth/login', { email: CLIENT_EMAIL, password: CLIENT_PASSWORD });
    const json = JSON.parse(r.body);
    clientToken = json.token || null;
    check(r.status === 200 && json.success === true, 'CLIENT POST /api/auth/login', r.status + ' ' + (json.message || json.error || ''));
    check(json.role === 'client', "CLIENT login returns role='client' (no redirect)", String(json.role));
  } catch (e) {
    check(false, 'CLIENT POST /api/auth/login', e.message);
  }

  // ---------- 5. Client token must be refused by the admin API ----------
  if (clientToken) {
    try {
      const r = await fetch(BASE + '/api/admin/me', { headers: { Authorization: 'Bearer ' + clientToken } });
      const json = await r.json();
      check(r.status === 403 && json.success === false, 'GUARD client token on /api/admin/me', r.status + ' ' + (json.error || ''));
    } catch (e) {
      check(false, 'GUARD client token on /api/admin/me', e.message);
    }
  }

  console.log('\n' + (failed === 0 ? 'ALL CHECKS PASSED' : failed + ' CHECK(S) FAILED'));
  process.exit(failed === 0 ? 0 : 1);
})();
