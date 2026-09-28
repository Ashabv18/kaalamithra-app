// Verify the separately-served marketing frontend (Live Server / run_frontend_server.js on :5500)
// is reachable from the browser's point of view and is wired to THIS backend (PORT from .env).
// Usage: node verify_frontend_5500.js
require('dotenv').config();

const API_PORT = process.env.PORT || 5000;
const CANDIDATES = [
  'http://127.0.0.1:5500/kaalamithra-complete/app/index.html',
  'http://127.0.0.1:5500/kaalamithra-complete/app/',
  'http://127.0.0.1:5500/'
];

(async () => {
  console.log('=== Frontend :5500 checks (backend expected on :' + API_PORT + ') ===\n');
  let ok = false;

  for (const url of CANDIDATES) {
    try {
      const r = await fetch(url, { redirect: 'manual' });
      const body = await r.text();
      const title = (body.match(/<title>([^<]*)<\/title>/i) || [, ''])[1].trim();
      console.log('HTTP ' + r.status + '  ' + url + '  ' + (title ? '[title] ' + title : ''));
      if (r.status !== 200) continue;
      ok = true;
      const bases = Array.from(new Set((body.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+/g) || [])));
      console.log('        API origins referenced: ' + (bases.length ? bases.join(', ') : '(none — same-origin calls)'));
      console.log('        references localhost:' + API_PORT + ' -> ' +
        (body.includes('localhost:' + API_PORT) || body.includes('127.0.0.1:' + API_PORT) ? 'yes' : 'no'));
      console.log('        has auth gate:      -> ' + (/id=["']auth-gate["']/.test(body) ? 'yes' : 'no'));
      console.log('        has inquiry form:   -> ' + (/<\s*form/i.test(body) ? 'yes' : 'no'));
    } catch (e) {
      console.log('SKIP  ' + url + '  -> ' + e.message);
    }
  }

  console.log('\n' + (ok ? 'FRONTEND :5500 IS SERVING' : 'FRONTEND :5500 NOT SERVING'));
  process.exit(ok ? 0 : 1);
})();
