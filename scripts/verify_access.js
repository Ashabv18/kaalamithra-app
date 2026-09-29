try { require('dotenv').config({ quiet: true }); } catch (e) { /* no .env — live-mode only */ }
const http = require('http');
// Point the suite at any running instance (local :5000, a clone on :5055, ...).
const HOST = process.env.KM_HOST || '127.0.0.1';
const PORT = Number(process.env.KM_PORT || 5000);
function req(method, p, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(data); }
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const q = http.request({ host: HOST, port: PORT, path: p, method, timeout: 8000, headers }, (r) => {
      let b = '';
      const cookies = r.headers['set-cookie'] || [];
      r.on('data', (c) => b += c.toString());
      r.on('end', () => {
        let j = null; try { j = JSON.parse(b); } catch (e) { /* html page */ }
        // keep FULL body for assertions; show() prints a truncated preview
        resolve({ status: r.statusCode, body: b, full: b, json: j, cookies });
      });
    });
    q.on('timeout', () => { q.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
    q.on('error', (e) => resolve({ status: 0, body: 'ERR ' + e.message }));
    q.end(data);
  });
}
function show(label, r, expect) {
  const ok = expect ? expect(r) : r.status < 500;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + ' -> ' + r.status + ' ' + r.body.replace(/\s+/g, ' ').slice(0, 160));
  return { r, ok };
}
(async () => {
  let allOk = true;
  const ck = (x) => { allOk = allOk && x.ok; return x.r; };
  console.log('--- 1. DB health ---');
  ck(show('GET /api/health (db connected)', await req('GET', '/api/health'), (r) => r.status === 200 && r.json && r.json.db === 'connected'));
  console.log('--- 2. Pages ---');
  ck(show('GET / (logo app)', await req('GET', '/'), (r) => r.status === 200 && /km-logo|KAALA/i.test(r.body)));
  ck(show('GET /images/km-logo.png', await req('GET', '/images/km-logo.png'), (r) => r.status === 200));
  ck(show('GET /welcome', await req('GET', '/welcome'), (r) => r.status === 200));
  ck(show('GET /login', await req('GET', '/login'), (r) => r.status === 200));
  console.log('--- 3. Admin access ---');
  const adminLogin = ck(show('POST /api/auth/login admin (Admin@123)', await req('POST', '/api/auth/login', { email: 'admin@kaalamithra-ai.com', password: 'Admin@123' }), (r) => r.status === 200 && r.json && r.json.token));
  const adminTok = adminLogin.json && adminLogin.json.token;
  ck(show('POST /api/admin/login admin', await req('POST', '/api/admin/login', { email: 'admin@kaalamithra-ai.com', password: 'Admin@123' }), (r) => r.status === 200));
  ck(show('GET /api/admin/inquiries as admin', await req('GET', '/api/admin/inquiries', null, adminTok), (r) => r.status === 200));
  ck(show('GET /api/admin/stats as admin', await req('GET', '/api/admin/stats', null, adminTok), (r) => r.status === 200 && r.json && r.json.success === true));
  ck(show('GET /api/admin/submissions as admin', await req('GET', '/api/admin/submissions', null, adminTok), (r) => r.status === 200 && r.json && Array.isArray(r.json.data)));
  ck(show('GET /api/admin/me as admin', await req('GET', '/api/admin/me', null, adminTok), (r) => r.status === 200 && r.json && r.json.user && r.json.user.role === 'admin'));
  console.log('--- 4. Client access ---');
  const ts = Date.now();
  const email = 'verify.client.' + ts + '@example.com';
  const signup = ck(show('POST /api/auth/signup client', await req('POST', '/api/auth/signup', { name: 'Verify Client', email, phone: '+919876543210', password: 'Client1234' }), (r) => r.status === 201 && r.json && r.json.token));
  const clientTok = signup.json && signup.json.token;
  ck(show('POST /api/client/login client', await req('POST', '/api/client/login', { email, password: 'Client1234' }), (r) => r.status === 200));
  ck(show('GET /api/client/profile as client', await req('GET', '/api/client/profile', null, clientTok), (r) => r.status === 200));
  const inq = ck(show('POST /api/inquiries as client', await req('POST', '/api/inquiries', { name: 'Verify Client', email, phone: '+919876543210', service: 'Cloud', message: 'db access check ' + ts }, clientTok), (r) => r.status === 201));
  ck(show('GET /api/client/inquiries shows new inquiry', await req('GET', '/api/client/inquiries', null, clientTok), (r) => r.status === 200 && r.json && r.json.data.some((x) => x.id === (inq.json && inq.json.data && inq.json.data.id))));
  console.log('--- 5. Access control (must deny) ---');
  ck(show('client token on admin route -> 403', await req('GET', '/api/admin/stats', null, clientTok), (r) => r.status === 403));
  ck(show('no token on admin route -> 401', await req('GET', '/api/admin/stats'), (r) => r.status === 401));
  ck(show('admin token on client route -> 403', await req('GET', '/api/client/profile', null, adminTok), (r) => r.status === 403));
  ck(show('no token on protected route -> 401', await req('GET', '/api/inquiries'), (r) => r.status === 401));
  ck(show('wrong password -> 401', await req('POST', '/api/auth/login', { email: 'admin@kaalamithra-ai.com', password: 'Wrong1' }), (r) => r.status === 401));
  // Cleanup: remove probe rows (this run + any earlier aborted runs) so counts return to baseline.
  const { getPool } = require('../lib/db');
  try {
    const pool = getPool();
    if (!pool) throw new Error('no DATABASE_URL in this shell');
    const dInq = await pool.query("DELETE FROM inquiries WHERE email LIKE 'verify.client.%' RETURNING id");
    const dUsr = await pool.query("DELETE FROM users WHERE email LIKE 'verify.client.%' RETURNING id");
    console.log('CLEANUP removed inquiries=' + dInq.rowCount + ' users=' + dUsr.rowCount);
    const left = await pool.query("SELECT count(*)::int AS n FROM pg_stat_user_tables WHERE relname IN ('users','inquiries','schema_migrations')");
    console.log('CORE_TABLES_PRESENT=' + left.rows[0].n + '/3');
    await pool.end();
  } catch (e) { console.log('CLEANUP_FAIL ' + e.message); allOk = false; }
  console.log(allOk ? 'ALL_ACCESS_CHECKS_PASSED' : 'SOME_CHECKS_FAILED');
  process.exit(allOk ? 0 : 1);
})();
