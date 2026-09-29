// Live-hosted checks: pages, API gating, and how the app behaves while
// DATABASE_URL is still missing on the Vercel deployment.
const BASE = process.argv[2] || 'https://kaalamithra-app.vercel.app';
async function hit(p, opts = {}) {
  try {
    const r = await fetch(BASE + p, { cache: 'no-store', redirect: 'manual', ...opts });
    const t = await r.text();
    return { status: r.status, body: t };
  } catch (e) {
    return { status: 0, body: 'FETCH_ERR ' + e.message };
  }
}
function show(label, r, n = 150) {
  console.log(label + ' -> ' + r.status + ' ' + r.body.replace(/\s+/g, ' ').slice(0, n));
}
(async () => {
  show('GET  /              ', await hit('/'), 60);
  show('GET  /welcome       ', await hit('/welcome'));
  show('GET  /login         ', await hit('/login'));
  show('GET  /client/login  ', await hit('/client/login'));
  show('GET  /admin/login   ', await hit('/admin/login'));
  show('GET  /api/health    ', await hit('/api/health'));
  show('GET  /api/inquiries ', await hit('/api/inquiries'));
  show('POST /api/inquiries ', await hit('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Live Probe', email: 'probe@example.com', phone: '+910000000000', company: 'Probe Co', service: 'General Service', budget: '<1L', details: 'verification probe — safe to delete' }),
  }));
  show('POST /api/auth/login', await hit('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@example.com', password: 'whatever' }),
  }));
  show('POST /api/setup     ', await hit('/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'wrong-key' }) }));
})();
