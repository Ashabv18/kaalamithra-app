const fs = require('fs');
// THE ACTUAL FILE the browser loads (per the address bar in your screenshots):
//   127.0.0.1:5500/kaalamithra-complete/app/index.html
// with the Live Server workspace root = C:/Users/Lenovo
const H = 'C:/Users/Lenovo/kaalamithra-complete/app/index.html';
try {
  const h = fs.readFileSync(H, 'utf8');
  console.log('SIZE=' + h.length);
  ['KAALAMITHRA', 'KaalaMithra', 'gate-email', 'gate-pass', 'autocomplete', 'value=', 'Forgot Password', 'gate-login-form', 'auth-gate', 'togglePass', 'localStorage'].forEach(function (k) {
    console.log(k + ' => ' + (h.split(k).length - 1));
  });
} catch (e) { console.log('READ FAIL: ' + e.message); }
