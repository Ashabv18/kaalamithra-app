// End-to-end field-flow test: client fills EVERY available form field -> PostgreSQL -> Admin API.
// Asserts the admin sees byte-exact values for every field, status defaults to 'New',
// empty optionals return '' (UI renders "Not provided"), and clients cannot read admin data.
const http = require('http');
require('dotenv').config();
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
const PASS = []; const FAIL = [];
function check(name, cond, extra) { (cond ? PASS : FAIL).push(name + (extra ? ' :: ' + extra : '')); }
(async () => {
  // ---- 1) CLIENT LOGIN ----
  const cli = await call('/api/client/login', 'POST', { email: 'testclient1801@example.com', password: 'Client1234' });
  check('client login', cli.status === 200, 'status=' + cli.status);
  const ct = JSON.parse(cli.body).token;
  const CH = { Authorization: 'Bearer ' + ct };

  // ---- 2) CLIENT SUBMITS EVERY AVAILABLE FORM FIELD (exact values, incl. ₹ and multi-line text) ----
  const SENT = {
    name: 'Rahul Kumar', email: 'rahul.kumar@example.com', phone: '9876543210',
    company: 'ABC Technologies', service: 'Full Stack Web & Mobile', budget: '₹50,000',
    details: 'I need an e-commerce website with payment gateway.\nTimeline: 6 weeks.\nPlease contact me after 6 PM.',
    nda: true
  };
  const sub = await call('/api/inquiries', 'POST', Object.assign({}, SENT, { message: SENT.details }), CH);
  check('client inquiry submit (all fields)', sub.status === 201, sub.body.slice(0, 120));
  const submittedId = JSON.parse(sub.body).data.id;

  // ---- 3) DATABASE: verify the row stores every field EXACTLY ----
  const db = (await pool.query('SELECT * FROM inquiries WHERE id=$1', [submittedId])).rows[0];
  check('DB name exact', db.name === SENT.name, JSON.stringify(db.name));
  check('DB email exact', db.email === SENT.email, JSON.stringify(db.email));
  check('DB phone exact', db.phone === SENT.phone, JSON.stringify(db.phone));
  check('DB company exact', db.company === SENT.company, JSON.stringify(db.company));
  check('DB service exact', db.service === SENT.service, JSON.stringify(db.service));
  check('DB budget exact (₹ kept)', db.budget === SENT.budget, JSON.stringify(db.budget));
  check('DB details exact (multi-line kept)', db.details === SENT.details, JSON.stringify(db.details).slice(0, 60));
  check('DB nda_requested true', db.nda_requested === true, String(db.nda_requested));
  check('DB status defaults New', db.status === 'New', String(db.status));
  check('DB user_id = logged-in client (from JWT, not body)', db.user_id === JSON.parse(cli.body).user.id, 'user_id=' + db.user_id);
  // ---- 4) ADMIN LOGIN + READS THE SAME ROW ----
  const ad = await call('/api/admin/login', 'POST', { email: 'bvasha2004@gmail.com', password: 'Admin@12345' });
  check('admin login', ad.status === 200, 'status=' + ad.status);
  const H = { Authorization: 'Bearer ' + JSON.parse(ad.body).token };

  const list = JSON.parse((await call('/api/admin/inquiries', 'GET', null, H)).body);
  const row = list.data.find((x) => x.id === submittedId);
  check('admin list contains the inquiry', !!row);
  check('admin sees name exactly', row && row.name === SENT.name, JSON.stringify(row && row.name));
  check('admin sees email exactly', row && row.email === SENT.email);
  check('admin sees phone exactly', row && row.phone === SENT.phone, JSON.stringify(row && row.phone));
  check('admin sees company exactly', row && row.company === SENT.company, JSON.stringify(row && row.company));
  check('admin sees service exactly', row && row.service === SENT.service, JSON.stringify(row && row.service));
  check('admin sees budget exactly', row && row.budget === SENT.budget, JSON.stringify(row && row.budget));
  check('admin sees requirements/message exactly', row && row.details === SENT.details, JSON.stringify(row && row.details).slice(0, 70));
  check('admin sees status New', row && row.status === 'New', JSON.stringify(row && row.status));
  check('admin sees nda yes', row && row.nda_requested === true, String(row && row.nda_requested));
  check('admin sees owning client account (join)', row && row.owner_email === 'testclient1801@example.com', JSON.stringify(row && row.owner_email));

  const det = JSON.parse((await call('/api/admin/inquiries/' + submittedId, 'GET', null, H)).body).data;
  check('admin detail name exact', det.name === SENT.name);
  check('admin detail details exact', det.details === SENT.details);
  check('admin detail status exact', det.status === 'New');
  check('admin detail nda exact', det.nda_requested === true);
  // ---- 5) ANONYMOUS MINIMAL SUBMISSION: optional fields empty -> API returns '' -> UI shows Not provided ----
  const min = await call('/api/inquiries', 'POST', { name: 'Empty Optional Test', email: 'empty.optional@example.com', details: 'Only required fields filled.' });
  check('anonymous minimal submit', min.status === 201, min.body.slice(0, 100));
  const minId = JSON.parse(min.body).data.id;
  const minRow = JSON.parse((await call('/api/admin/inquiries/' + minId, 'GET', null, H)).body).data;
  check('empty phone returned as empty string', minRow.phone === '', JSON.stringify(minRow.phone));
  check('empty company returned as empty string', minRow.company === '', JSON.stringify(minRow.company));
  check('empty optional -> no client account', minRow.owner_email == null, JSON.stringify(minRow.owner_email));
  check('nda defaults false when unchecked', minRow.nda_requested === false, String(minRow.nda_requested));

  // ---- 6) SEARCH / FILTERS ----
  const byQ = JSON.parse((await call('/api/admin/inquiries?q=Rahul', 'GET', null, H)).body);
  check('search by name finds it', byQ.data.some((x) => x.id === submittedId), 'count=' + byQ.count);
  const byMail = JSON.parse((await call('/api/admin/inquiries?q=rahul.kumar@example.com', 'GET', null, H)).body);
  check('search by email finds it', byMail.data.some((x) => x.id === submittedId));
  const byPhone = JSON.parse((await call('/api/admin/inquiries?q=9876543210', 'GET', null, H)).body);
  check('search by phone finds it', byPhone.data.some((x) => x.id === submittedId));
  const bySvc = JSON.parse((await call('/api/admin/inquiries?service=' + encodeURIComponent(SENT.service), 'GET', null, H)).body);
  check('filter by service finds it', bySvc.data.some((x) => x.id === submittedId));
  const bySt = JSON.parse((await call('/api/admin/inquiries?status=New', 'GET', null, H)).body);
  check('filter status=New finds both', bySt.data.some((x) => x.id === submittedId) && bySt.data.some((x) => x.id === minId), 'count=' + bySt.count);
  const noSt = JSON.parse((await call('/api/admin/inquiries?status=Closed', 'GET', null, H)).body);
  check('filter status=Closed -> 0 rows (no invented data)', noSt.count === 0);
  const stats = JSON.parse((await call('/api/admin/stats', 'GET', null, H)).body);
  check('stats byStatus includes New', (stats.byStatus || []).some((x) => x.status === 'New'), JSON.stringify(stats.byStatus));

  // ---- 7) SECURITY: client must NOT read admin data ----
  const blocked = await call('/api/admin/inquiries', 'GET', null, CH);
  check('client blocked from admin API', blocked.status === 403, 'status=' + blocked.status);

  console.log('PASSED ' + PASS.length + ':');
  PASS.forEach((p) => console.log('  OK  ' + p));
  if (FAIL.length) { console.log('FAILED ' + FAIL.length + ':'); FAIL.forEach((f) => console.log('  XX  ' + f)); await pool.end(); process.exit(1); }
  await pool.end();
  process.exit(0);
})().catch(async (e) => { console.log('FATAL ' + e.message); process.exit(1); });



