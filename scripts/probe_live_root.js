// Diagnose the live Vercel homepage: poll "/" until it stops 500-ing (or timeout),
// printing status, headers and body snippet for / , /app and /api/health.
const BASE = process.argv[2] || 'https://kaalamithra-app.vercel.app';
const MODE = process.argv[3] || 'once'; // 'watch' polls until non-500
const DEADLINE = Date.now() + (MODE === 'watch' ? 240000 : 0);
async function hit(p) {
  const r = await fetch(BASE + p, { cache: 'no-store', redirect: 'manual' });
  const t = await r.text();
  return { p, status: r.status, type: r.headers.get('content-type'), id: r.headers.get('x-vercel-id'), body: t };
}
(async () => {
  for (;;) {
    const root = await hit('/');
    console.log(new Date().toISOString() + '  / -> ' + root.status +
      ' len=' + root.body.length + ' id=' + (root.id || '-') +
      ' body=' + root.body.replace(/\s+/g, ' ').slice(0, 160));
    if (root.status !== 500 || Date.now() > DEADLINE) break;
    await new Promise((r) => setTimeout(r, 10000));
  }
  for (const p of ['/app', '/call.html', '/api/health', '/api']) {
    try {
      const r = await hit(p);
      console.log('=== ' + p + ' -> ' + r.status + ' len=' + r.body.length + ' type=' + r.type);
      console.log('    ' + r.body.replace(/\s+/g, ' ').slice(0, 220));
    } catch (e) {
      console.log('=== ' + p + ' FETCH_ERR ' + e.message);
    }
  }
})();
