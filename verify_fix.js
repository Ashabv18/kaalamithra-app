var bcrypt = require('bcryptjs');
var dotenv = require('dotenv');
var { Pool } = require('pg');

dotenv.config();
var pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT id, email, role, is_active, password_hash FROM users WHERE LOWER(email) = LOWER($1)', ['bvasha2004@gmail.com'])
  .then(function(r) {
    console.log('=== USER CHECK ===');
    console.log('Rows:', r.rowCount);
    if (r.rowCount > 0) {
      var u = r.rows[0];
      console.log('id:', u.id);
      console.log('email:', u.email);
      console.log('role:', u.role);
      console.log('is_active:', u.is_active);
      console.log('hash starts with $2b:', u.password_hash && u.password_hash.startsWith('$2b$'));
      bcrypt.compare('Asha@2004', u.password_hash).then(function(match) {
        console.log('bcrypt.compare("Asha@2004", hash):', match);
        if (!match) {
          console.log('PASSWORD MISMATCH - resetting...');
          return bcrypt.hash('Asha@2004', 10).then(function(hash) {
            return pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, u.id]).then(function() {
              console.log('Password reset OK');
              return bcrypt.compare('Asha@2004', hash);
            });
          });
        }
      }).then(function(v) {
        if (v !== undefined && v !== null) console.log('After reset verify:', v);
        process.exit(0);
      });
    } else {
      console.log('User NOT FOUND');
      process.exit(0);
    }
  })
  .catch(function(e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  });
