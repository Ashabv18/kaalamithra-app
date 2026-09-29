const http = require('http');
// Child: boots the app WITHOUT dotenv reload interference (parent scrubs env
// via DOTENV_CONFIG_PATH=NUL — dotenv@17 auto-injects otherwise).
function req(port, p, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const q = http.request({ host: '127.0.0.1', port, path: p, method: body ? 'POST' : 'GET', timeout: 8000,
      headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, (r) => {
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
  console.log('DATABASE_URL present in child: ' + Boolean(process.env.DATABASE_URL));
  const app = require('../server');
  const srv = app.listen(5003, async () => {
    console.log(await req(5003, '/'));
    console.log(await req(5003, '/api/health'));
    console.log(await req(5003, '/api/auth/login', { email: 'a@b.com', password: 'x' }));
    console.log(await req(5003, '/api/setup', { key: 'wrong' }));
    console.log(await req(5003, '/api/setup', { key: process.env.ADMIN_SETUP_KEY }));
    srv.close(() => process.exit(0));
  });
  setTimeout(() => { console.log('VERIFY_TIMEOUT'); process.exit(1); }, 25000);
})();
