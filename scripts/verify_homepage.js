const http = require('http');
function get(port, p, opts) {
  return new Promise((resolve) => {
    const q = http.get({ host: '127.0.0.1', port, path: p, timeout: 5000 }, (r) => {
      let n = 0; let head = '';
      r.on('data', (c) => { n += c.length; if (head.length < 300) head += c.toString().slice(0, 300 - head.length); });
      r.on('end', () => resolve(p + ' -> ' + r.statusCode + ' bytes=' + n + ' body=' + head.slice(0, 220).replace(/\s+/g, ' ')));
    });
    q.on('timeout', () => { q.destroy(); resolve(p + ' TIMEOUT'); });
    q.on('error', (e) => resolve(p + ' ERR ' + e.message));
  });
}
function post(port, p, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const q = http.request({ host: '127.0.0.1', port, path: p, method: 'POST', timeout: 8000,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (r) => {
      let b = '';
      r.on('data', (c) => b += c.toString());
      r.on('end', () => resolve(p + ' -> ' + r.statusCode + ' body=' + b.slice(0, 300).replace(/\s+/g, ' ')));
    });
    q.on('timeout', () => { q.destroy(); resolve(p + ' TIMEOUT'); });
    q.on('error', (e) => resolve(p + ' ERR ' + e.message));
    q.end(data);
  });
}
(async () => {
  const app = require('../server');
  const srv = app.listen(5002, async () => {
    console.log(await get(5002, '/'));
    console.log(await get(5002, '/images/km-logo.png'));
    // No-DATABASE_URL boot simulation happens on Vercel; locally DATABASE_URL
    // exists, so health must be 200 and setup must refuse a bad key (proves guard).
    console.log(await get(5002, '/api/health'));
    console.log(await post(5002, '/api/setup', { key: 'wrong-key' }));
    console.log(await post(5002, '/api/auth/login', { email: 'admin@kaalamithra-ai.com', password: 'wrong' }));
    srv.close(() => process.exit(0));
  });
  setTimeout(() => { console.log('VERIFY_TIMEOUT'); process.exit(1); }, 25000);
})();

