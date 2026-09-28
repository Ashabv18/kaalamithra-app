var bcrypt = require('bcryptjs');
var dotenv = require('dotenv');
var { Pool } = require('pg');
dotenv.config();
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT id, email, role, is_active, password_hash FROM users WHERE LOWER(email) = LOWER($1)', ['bvasha2004@gmail.com'])
  .then(function(r) {
    console.log('Rows:', r.rowCount);
    if (r.rows[0]) {
      var u = r.rows[0];
      console.log('role:', u.role, 'active:', u.is_active, 'bcrypt:', u.password_hash && u.password_hash.startsWith('$2b$'));
      bcrypt.compare('Asha@2004', u.password_hash).then(function(match) {
        console.log('password matches:', match);
        process.exit(0);
      });
    } else { console.log('User not found'); process.exit(0); }
  })
  .catch(function(e) { console.error('ERROR:', e.message); process.exit(1); });