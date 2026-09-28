const http = require('http');
function get(port, p) {
  return new Promise((resolve) => {
    const q = http.get({ host: '127.0.0.1', port, path: p, timeout: 5000 }, (r) => {
      let n = 0; let head = '';
      r.on('data', (c) => { n += c.length; if (head.length < 160) head += c.toString().slice(0, 160 - head.length); });
      r.on('end', () => resolve(p + ' -> ' + r.statusCode + ' bytes=' + n + ' type=' + r.headers['content-type'] + ' head=' + head.slice(0, 80).replace(/\s+/g, ' ')));
    });
    q.on('timeout', () => { q.destroy(); resolve(p + ' TIMEOUT'); });
    q.on('error', (e) => resolve(p + ' ERR ' + e.message));
  });
}
(async () => {
  // Fresh instance on 5002 (does not clash with the detached :5000 server).
  const app = require('../server');
  const srv = app.listen(5002, async () => {
    console.log(await get(5002, '/'));
    console.log(await get(5002, '/images/km-logo.png'));
    console.log(await get(5002, '/app'));
    console.log(await get(5002, '/welcome'));
    console.log(await get(5002, '/login'));
    console.log(await get(5002, '/api/health'));
    console.log(await get(5002, '/api/auth/me'));
    srv.close(() => process.exit(0));
  });
  setTimeout(() => { console.log('VERIFY_TIMEOUT'); process.exit(1); }, 20000);
})();
