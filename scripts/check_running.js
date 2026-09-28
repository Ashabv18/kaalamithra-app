const http = require('http');
function get(url) {
  return new Promise((resolve) => {
    const q = http.get(url, { timeout: 5000 }, (r) => {
      let n = 0; let head = '';
      r.on('data', (c) => { n += c.length; if (head.length < 200) head += c.toString().slice(0, 200 - head.length); });
      r.on('end', () => resolve(url + ' -> ' + r.statusCode + ' bytes=' + n + ' type=' + r.headers['content-type'] + ' head=' + head.slice(0, 80).replace(/\s+/g, ' ')));
    });
    q.on('timeout', () => { q.destroy(); resolve(url + ' TIMEOUT'); });
    q.on('error', (e) => resolve(url + ' ERR ' + e.message));
  });
}
(async () => {
  console.log(await get('http://127.0.0.1:5000/api/health'));
  console.log(await get('http://127.0.0.1:5000/welcome'));
  console.log(await get('http://127.0.0.1:5500/kaalamithra-complete/app/index.html'));
  console.log(await get('http://127.0.0.1:5500/kaalamithra-complete/app/images/km-logo.png'));
  process.exit(0);
})();
