// Tiny probe: wait for the restarted backend, confirm it serves the logo app at /.
const http = require('http');
function get(p) {
  return new Promise((resolve) => {
    const q = http.get({ host: '127.0.0.1', port: 5000, path: p, timeout: 4000 }, (r) => {
      let b = '';
      r.on('data', (c) => (b += c));
      r.on('end', () => resolve({ status: r.statusCode, body: b }));
    });
    q.on('timeout', () => { q.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
    q.on('error', (e) => resolve({ status: 0, body: 'ERR ' + e.message }));
  });
}
(async () => {
  for (let i = 0; i < 15; i++) {
    const r = await get('/');
    if (r.status) {
      console.log('/ -> ' + r.status + ' ' + (/km-logo|KAALA/i.test(r.body) ? 'LOGO-APP' : 'WELCOME-PAGE') + ' bytes=' + r.body.length);
      const h = await get('/api/health');
      console.log('/api/health -> ' + h.status + ' ' + h.body.slice(0, 120));
      process.exit(0);
    }
    await new Promise((r2) => setTimeout(r2, 1000));
  }
  console.log('SERVER_NOT_UP');
  process.exit(1);
})();
