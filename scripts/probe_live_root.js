// Diagnose the live Vercel homepage 500: print status, headers, body.
const BASE = process.argv[2] || 'https://kaalamithra-app.vercel.app';
(async () => {
  for (const p of ['/', '/app', '/call.html']) {
    try {
      const r = await fetch(BASE + p, { cache: 'no-store', redirect: 'manual' });
      const t = await r.text();
      console.log('=== ' + p + ' -> ' + r.status + ' ' + (r.headers.get('location') || '') + ' len=' + t.length);
      console.log('   content-type: ' + r.headers.get('content-type'));
      console.log('   x-vercel-error: ' + (r.headers.get('x-vercel-error') || '-'));
      console.log('   body: ' + t.replace(/\s+/g, ' ').slice(0, 400));
    } catch (e) {
      console.log('=== ' + p + ' FETCH_ERR ' + e.message);
    }
  }
})();
