// Verifies the 4 role cases + the client session flow end-to-end, and that
// plain-text passwords are never stored. No password hashes are printed.
const http = require('http');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function call(path, method, body, headers) {
  return new Promise((resolve, reject) => {
    const b = body ? JSON.stringify(body) : null;
    const h = Object.assign({}, headers || {});
    if (b) { h['Content-Type'] = 'application/json'; h['Content-Length'] = Buffer.byteLength(b); }
    const r = http.request({ host: '127.0.0.1', port: 5000, path, method: method || 'GET', headers: h }, (res) => {
      let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (b) r.write(b);
    r.end();
  });
}
const ADMIN = { email: 'bvasha2004@gmail.com', password: 'Admin@12345' };
const CLIENT = { email: 'client@test.com', password: 'Client@12345' };
const PASS = []; const FAIL = [];
function check(name, cond, extra) { (cond ? PASS : FAIL).push(name + (extra ? ' :: ' + extra : '')); }

(async () => {
  // DB-side verification (no hashes printed)
  const u = (await pool.query("SELECT id, name, email, role, is_active, password_hash FROM users WHERE lower(email)='client@test.com'")).rows[0];
  check('client@test.com exists in users table', !!u, u ? 'id=' + u.id : 'missing');
  check('role is client', u && String(u.role).toLowerCase() === 'client', u && u.role);
  check('password is bcrypt ($2b$10$, len 60)', u && /^\$2b\$10\$/.test(u.password_hash) && u.password_hash.length === 60);
  check('bcrypt accepts Client@12345', !!(await bcrypt.compare('Client@12345', u.password_hash)));
  check('bcrypt rejects wrong password', !(await bcrypt.compare('WrongPass999', u.password_hash)));
  const plainScan = await pool.query("SELECT count(*)::int AS n FROM users WHERE password_hash LIKE '%Client@12345%' OR password_hash LIKE '%Admin@12345%'");
  check('no plain-text passwords stored in users', plainScan.rows[0].n === 0, 'matches=' + plainScan.rows[0].n);

  // CASE 2: CLIENT credentials on Client Login -> SUCCESS
  const c1 = await call('/api/client/login', 'POST', CLIENT);
  const c1d = c1.status === 200 ? JSON.parse(c1.body) : {};
  check('CASE 2: client login success', c1.status === 200 && c1d.success && c1d.user.role.toLowerCase() === 'client',
    'status=' + c1.status + ' role=' + (c1d.user && c1d.user.role));
  const CH = { Authorization: 'Bearer ' + (c1d.token || '') };
  const me = await call('/api/client/me', 'GET', null, CH);
  check('client session /api/client/me', me.status === 200 && JSON.parse(me.body).user.email === CLIENT.email);
  const inq = await call('/api/client/inquiries', 'GET', null, CH);
  check('client own inquiries list', inq.status === 200, 'status=' + inq.status);
  // wrong password on client login -> generic 401 (never leaks which part failed)
  const bad = await call('/api/client/login', 'POST', { email: CLIENT.email, password: 'WrongPass999' });
  check('client login wrong password -> 401', bad.status === 401 && JSON.parse(bad.body).error === 'Invalid email or password.', bad.body.slice(0, 80));

  // CASE 3: ADMIN credentials on Client Login -> DENIED
  const c3 = await call('/api/client/login', 'POST', ADMIN);
  check('CASE 3: admin on client login DENIED', c3.status === 403, 'status=' + c3.status + ' ' + JSON.parse(c3.body).error);

  // CASE 4: CLIENT credentials on Admin Login -> DENIED
  const c4 = await call('/api/admin/login', 'POST', CLIENT);
  check('CASE 4: client on admin login DENIED', c4.status === 403, 'status=' + c4.status + ' ' + JSON.parse(c4.body).error);

  // CASE 1: ADMIN credentials on Admin Login -> SUCCESS
  const a1 = await call('/api/admin/login', 'POST', ADMIN);
  const a1d = a1.status === 200 ? JSON.parse(a1.body) : {};
  check('CASE 1: admin login success', a1.status === 200 && a1d.success && a1d.user.role.toLowerCase() === 'admin',
    'status=' + a1.status + ' role=' + (a1d.user && a1d.user.role));
  const H = { Authorization: 'Bearer ' + (a1d.token || '') };
  const adminData = await call('/api/admin/inquiries', 'GET', null, H);
  check('admin can read inquiry data', adminData.status === 200, 'status=' + adminData.status);

  // Gate flow (the app's CLIENT LOGIN panel posts to /api/auth/login) also works for clients
  const gate = await call('/api/auth/login', 'POST', CLIENT);
  check('gate /api/auth/login works for client', gate.status === 200 && JSON.parse(gate.body).user.role.toLowerCase() === 'client', 'status=' + gate.status);
  const gateAdmin = await call('/api/auth/login', 'POST', ADMIN);
  check('gate /api/auth/login returns admin role (app routes by role)', gateAdmin.status === 200 && JSON.parse(gateAdmin.body).user.role.toLowerCase() === 'admin', 'status=' + gateAdmin.status);

  // Pages exist
  const pgA = await call('/admin/login', 'GET'); const pgC = await call('/client/login', 'GET'); const pgD = await call('/client/dashboard', 'GET');
  check('pages: /admin/login 200', pgA.status === 200);
  check('pages: /client/login 200', pgC.status === 200);
  check('pages: /client/dashboard 200', pgD.status === 200);

  console.log('PASSED ' + PASS.length + ':');
  PASS.forEach((p) => console.log('  OK  ' + p));
  if (FAIL.length) { console.log('FAILED ' + FAIL.length + ':'); FAIL.forEach((f) => console.log('  XX  ' + f)); await pool.end(); process.exit(1); }
  await pool.end(); process.exit(0);
})().catch(async (e) => { console.log('FATAL ' + e.message); await pool.end(); process.exit(1); });
