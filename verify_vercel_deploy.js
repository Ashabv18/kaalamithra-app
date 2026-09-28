// Verifies the public Vercel deployment of the Kaala Mithra frontend:
//   * the project root forwards to the app
//   * the deployed gate is the single-LOGIN build (role-based routing)
//   * the API origin is resolved at runtime, so the same build works locally and hosted
//   * the referenced static assets are actually deployed
// Usage: node verify_vercel_deploy.js            (override with DEPLOY_URL=...)
// Note: this checks the FRONTEND deployment only. Sign-in needs the API to be reachable —
// see "Where the deployed page sends its API calls" at the end of this script's output.
const DEPLOY_URL = (process.env.DEPLOY_URL || 'https://kaalamithra-app-development.vercel.app').replace(/\/+$/, '');

let failed = 0;
function check(ok, label, extra) {
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (extra ? '  -> ' + extra : ''));
}

async function get(pathname) {
  const r = await fetch(DEPLOY_URL + pathname, { cache: 'no-store' });
  return { status: r.status, body: await r.text(), headers: r.headers };
}

(async () => {
  console.log('=== Vercel deployment check @ ' + DEPLOY_URL + ' ===\n');

  // ---------- 1. project root ----------
  try {
    const r = await get('/');
    check(r.status === 200, 'ROOT  GET /', r.status);
    check(/\.\/app\//.test(r.body), 'ROOT  forwards to ./app/');
  } catch (e) {
    check(false, 'ROOT  GET /', e.message);
  }

  // ---------- 2. the app itself ----------
  let appHtml = '';
  try {
    const r = await get('/app/');
    appHtml = r.body;
    check(r.status === 200, 'APP   GET /app/', r.status);
    check(/<h1[^>]*>LOGIN<\/h1>/.test(appHtml), 'APP   single LOGIN panel (no client/admin split)');
    check(appHtml.indexOf('CLIENT LOGIN') === -1, 'APP   no leftover "CLIENT LOGIN"');
    check(appHtml.indexOf("role === 'admin'") !== -1, "APP   routes admins via role === 'admin'");
    check(/GATE_API\s*\+\s*'\/admin\/dashboard\?token='/.test(appHtml), 'APP   hands the token to /admin/dashboard');
    check(/encodeURIComponent\(res\.d\.token\)/.test(appHtml), 'APP   token is URL-encoded on hand-off');
    check(/Kaala Mithra|Kaalamithra/i.test(appHtml), 'APP   serves real app content');
  } catch (e) {
    check(false, 'APP   GET /app/', e.message);
  }

  // ---------- 3. deployable API origin ----------
  if (appHtml) {
    check(/var GATE_API = \(function \(\)/.test(appHtml), 'API   origin resolved at runtime');
    check(appHtml.indexOf("'http://127.0.0.1:5000'") !== -1, 'API   localhost fallback present (local dev unaffected)');
    check(/window\.KM_API_BASE/.test(appHtml), 'API   configurable via window.KM_API_BASE');
    check(/location\.origin/.test(appHtml), 'API   defaults to same-origin /api when hosted');
  }

  // ---------- 4. static assets referenced by the page ----------
  if (appHtml) {
    const qrs = Array.from(new Set(appHtml.match(/images\/(qr-[0-9]+\.png)/g) || []))
      .map((s) => '/' + s.replace(/^images/, 'app/images'));
    for (const p of qrs) {
      try {
        const r = await get(p);
        check(r.status === 200, 'ASSET ' + p, r.status);
      } catch (e) {
        check(false, 'ASSET ' + p, e.message);
      }
    }
  }

  // ---------- 5. what the deployed page will call ----------
  console.log('\n--- Where the deployed page sends its API calls ---');
  const configured = (appHtml.match(/window\.KM_API_BASE\s*=\s*['"]([^'"]+)['"]/) || [, ''])[1];
  if (configured) {
    console.log('  window.KM_API_BASE is set  -> ' + configured);
  } else {
    console.log('  window.KM_API_BASE is NOT set in the deployed HTML, so hosted calls go to the');
    console.log('  page\'s own origin: ' + DEPLOY_URL + '/api  (same-origin).');
    console.log('  Sign-in therefore works on the deployment only once the Express API is reachable');
    console.log('  there — deploy the backend and set window.KM_API_BASE to its URL, or proxy /api.');
  }

  console.log('\n' + (failed ? failed + ' CHECK(S) FAILED' : 'ALL CHECKS PASSED'));
  process.exit(failed ? 1 : 0);
})();
