const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)';
const PORT = 5500;
const HOST = '127.0.0.1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, urlPath);
  if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.stat(file, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); return res.end('not found: ' + urlPath); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(PORT, HOST, () => console.log('FRONTEND static on http://' + HOST + ':' + PORT + '/kaalamithra-complete/app/ (no-store; ROOT=' + ROOT + ')'));
function check(url) {
  return new Promise((resolve) => {
    http.get(url, { timeout: 4000 }, (r) => { let n = 0; r.on('data', (c) => n += c.length); r.on('end', () => resolve(url + ' -> ' + r.statusCode + ' bytes=' + n)); }).on('error', (e) => resolve(url + ' ERR ' + e.message));
  });
}
async function selftest() {
  await new Promise((r) => setTimeout(r, 500));
  const a = await check('http://127.0.0.1:5500/kaalamithra-complete/app/index.html');
  const b = await check('http://127.0.0.1:5500/kaalamithra-complete/app/images/km-logo.png');
  console.log(a + '\n' + b);
}
if (require.main === module) {
  if (process.argv[2] === 'serve') { console.log('serving...'); }
  else { selftest().then(() => process.exit(0)); }
}
module.exports = server;

