const http = require('http');
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
  // Parent: scrub DATABASE_URL by running the child with a clean env that
  // keeps only what Node needs (+ ADMIN_SETUP_KEY for the guard test).
  // DOTENV_CONFIG_PATH points nowhere so dotenv cannot reload .env.
  const { spawnSync } = require('child_process');
  const keep = {};
  for (const k of ['PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'ADMIN_SETUP_KEY']) {
    if (process.env[k]) keep[k] = process.env[k];
  }
  if (!keep.ADMIN_SETUP_KEY) keep.ADMIN_SETUP_KEY = 'verify-child-key';
  // dotenv@17 auto-injects via preload: the ONLY reliable scrub is a null config
  // path + no-override. Deleting DATABASE_URL from env alone is NOT enough.
  keep.DOTENV_CONFIG_PATH = 'NUL';
  keep.DOTENV_CONFIG_OVERRIDE = 'false';
  keep.DOTENV_CONFIG_QUIET = 'true';
  const r = spawnSync(process.execPath, ['scripts/verify_nodb_child.js'], {
    cwd: __dirname + '/..', env: keep, encoding: 'utf8', timeout: 30000,
  });
  console.log(r.stdout);
  if (r.stderr) console.log('STDERR: ' + String(r.stderr).slice(-500));
  process.exit(r.status || 0);
})();
