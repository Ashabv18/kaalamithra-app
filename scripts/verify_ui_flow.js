// Cookie + UI page flow test (what the browser actually does on /admin/* and /client/*).
try { require('dotenv').config({ quiet: true }); } catch (e) { /* live mode */ }
const http = require('http');
let COOKIE = '';
function req(method, p, body, extraHeaders) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = Object.assign({}, extraHeaders || {});
    if (data) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(data); }
    if (COOKIE) headers['Cookie'] = COOKIE;
    const q = http.request({ host: '127.0.0.1', port: 5000, path: p, method, timeout: 8000, headers }, (r) => {
      let b = '';
      r.on('data', (c) => (b += c));
      r.on('end', () => {
        const sc = r.headers['set-cookie'] || [];
        if (sc.length) COOKIE = sc.map((c) => c.split(';')[0]).join('; ');
        let j = null; try { j = JSON.parse(b); } catch (e) { /* html */ }
        resolve({ status: r.statusCode, body: b, json: j });
      });
    });
    q.on('timeout', () => { q.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
    q.on('error', (e) => resolve({ status: 0, body: 'ERR ' + e.message }));
    q.end(data);
  });
}
let ok = true;
function show(label, r, expect) {
  const pass = expect(r);
  if (!pass) ok = false;
  const preview = (r.body || '').replace(/\s+/g, ' ').slice(0, 110);
  console.log((pass ? 'PASS' : 'FAIL') + ' ' + label + ' -> ' + r.status + ' ' + preview);
}
(async () => {
  console.log('--- admin UI (cookie session, no Bearer) ---');
  COOKIE = '';
  show('GET /admin/login page', await req('GET', '/admin/login'), (r) => r.status === 200 && /<html/i.test(r.body));
  show('POST /api/admin/login (form login)', await req('POST', '/api/admin/login', { email: 'admin@kaalamithra-ai.com', password: 'Admin@123' }), (r) => r.status === 200 && r.json && r.json.success);
  show('session cookie issued', await req('GET', '/api/admin/me'), (r) => {
    const pass = r.status === 200 && r.json && r.json.user && r.json.user.role === 'admin' && /km_token=/.test(COOKIE);
    console.log((pass ? 'PASS' : 'FAIL') + ' cookie=' + COOKIE.slice(0, 30) + '...');
    return pass;
  });
  show('GET /admin/dashboard (as admin cookie)', await req('GET', '/admin/dashboard'), (r) => r.status === 200 && /<html/i.test(r.body));
  show('GET dashboard.js asset', await req('GET', '/admin/dashboard.js'), (r) => r.status === 200);
  show('GET /api/admin/stats (cookie)', await req('GET', '/api/admin/stats'), (r) => r.status === 200 && r.json.success);
  show('GET /api/admin/submissions?sort=oldest (cookie)', await req('GET', '/api/admin/submissions?sort=oldest'), (r) => r.status === 200 && Array.isArray(r.json.data));
  show('GET /api/admin/services + statuses', await req('GET', '/api/admin/services'), (r) => r.status === 200 && isList(r));
  show('GET /api/admin/inquiries/4 detail', await req('GET', '/api/admin/inquiries/4'), (r) => r.status === 200 && r.json.data && r.json.data.id === 4);
  show('GET /api/inquiries as admin sees ALL rows', await req('GET', '/api/inquiries'), (r) => r.status === 200 && r.json.count >= 4 && r.json.data.length === r.json.count);
  show('POST /api/admin/logout', await req('POST', '/api/admin/logout'), (r) => r.status === 200);
  show('after logout: /api/admin/stats -> 401', await req('GET', '/api/admin/stats'), (r) => r.status === 401);

  console.log('--- client UI ---');
  COOKIE = '';
  const ts = Date.now();
  const email = 'ui.client.' + ts + '@example.com';
  show('GET /client/login page', await req('GET', '/client/login'), (r) => r.status === 200 && /<html/i.test(r.body));
  show('POST /api/auth/signup (form signup)', await req('POST', '/api/auth/signup', { name: 'UI Client', email, phone: '+919000000000', password: 'Client1234' }), (r) => r.status === 201 && r.json && r.json.token);
  show('POST /api/client/login (form login)', await req('POST', '/api/client/login', { email, password: 'Client1234' }), (r) => r.status === 200 && r.json.success);
  show('GET /client/dashboard (as client cookie)', await req('GET', '/client/dashboard'), (r) => r.status === 200 && /<html/i.test(r.body));
  show('POST /api/inquiries (form submit)', await req('POST', '/api/inquiries', { name: 'UI Client', email, phone: '+919000000000', service: 'General Service', details: 'ui flow ' + ts }), (r) => r.status === 201 && r.json.data.id);
  show('GET /api/client/inquiries (own rows only)', await req('GET', '/api/client/inquiries'), (r) => r.status === 200 && r.json.data.length === 1 && r.json.data[0].email === email);
  show('GET /api/client/stats', await req('GET', '/api/client/stats'), (r) => r.status === 200 && r.json.success);
  show('client cannot read other rows via /api/inquiries', await req('GET', '/api/inquiries'), (r) => r.status === 200 ? r.json.data.every((x) => x.email === email) : r.status === 403);

  const { getPool } = require('../lib/db');
  try {
    const pool = getPool();
    if (!pool) throw new Error('no DATABASE_URL');
    const a = await pool.query("DELETE FROM inquiries WHERE email LIKE 'ui.client.%' OR email LIKE 'verify.client.%' RETURNING id");
    const b = await pool.query("DELETE FROM users WHERE email LIKE 'ui.client.%' OR email LIKE 'verify.client.%' RETURNING id");
    const h = await pool.query('SELECT count(*)::int AS i FROM inquiries');
    const u = await pool.query("SELECT count(*)::int AS n FROM users");
    console.log('CLEANUP removed inquiries=' + a.rowCount + ' users=' + b.rowCount + ' | baseline inquiries=' + h.rows[0].i + ' users=' + u.rows[0].n);
    await pool.end();
  } catch (e) { console.log('CLEANUP_FAIL ' + e.message); ok = false; }
  console.log(ok ? 'UI_FLOW_PASSED' : 'UI_FLOW_FAILED');
  process.exit(ok ? 0 : 1);
})();
function isList(r) { return r.json && Array.isArray(r.json.data); }
