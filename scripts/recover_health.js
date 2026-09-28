const app = require('../server');
const srv = app.listen(5001, async () => {
  try {
    const r = await fetch('http://127.0.0.1:5001/api/health');
    const t = await r.text();
    console.log('HEALTH ' + r.status + ' ' + t.slice(0, 300));
  } catch (e) { console.log('HEALTH_FAIL ' + e.message); }
  srv.close(() => process.exit(0));
});
setTimeout(() => process.exit(1), 12000);
