const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const timer = setTimeout(()=>{ console.log('DB_TIMEOUT'); process.exit(1); }, 9000);
(async()=>{
  try{
    const c = await pool.connect();
    try{
      const u = await c.query('SELECT count(*)::int AS users FROM users');
      const i = await c.query('SELECT count(*)::int AS inquiries FROM inquiries');
      const admins = await c.query("SELECT id,email,role,is_active FROM users WHERE role='admin' ORDER BY id");
      const recent = await c.query('SELECT id,name,email,created_at FROM users ORDER BY id DESC LIMIT 5');
      console.log(JSON.stringify({ ok:true, users:u.rows[0].users, inquiries:i.rows[0].inquiries, admins:admins.rows, recent:recent.rows }, null, 2));
    } finally { c.release(); }
  }catch(e){ console.log('DB_FAIL: '+e.message); process.exitCode = 1; }
  clearTimeout(timer);
  await pool.end();
})();
