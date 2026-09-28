var fs = require('fs');
var idx = 'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)/kaalamithra-complete/app/index.html';
var c = fs.readFileSync(idx, 'utf8');

// Check all fixes
var checks = [
  ['Login redirect to client front page', c.indexOf("role=client") >= 0],
  ['Signup redirect to login', c.indexOf("Please login") >= 0],
  ['togglePass function', c.indexOf("function togglePass") >= 0],
  ['eye icon on gate-pass', c.indexOf('onclick="togglePass(\'gate-pass\')"') >= 0 || c.indexOf("togglePass('gate-pass')") >= 0],
  ['eye icon on gate-pass2', c.indexOf("togglePass('gate-pass2')") >= 0],
  ['eye icon on gate-pass3', c.indexOf("togglePass('gate-pass3')") >= 0],
  ['eye-on spans', c.indexOf('eye-on') >= 0],
  ['eye-off spans', c.indexOf('eye-off') >= 0],
];

console.log('=== VERIFICATION ===');
checks.forEach(function(check) {
  console.log(check[0] + ': ' + (check[1] ? 'PASS' : 'FAIL'));
});

// Show the key sections
var s1 = c.indexOf('function gateSubmitLogin');
var e1 = c.indexOf('function gateSubmitSignup');
if (s1 >= 0 && e1 > s1) {
  var loginFn = c.slice(s1, e1);
  // Find the redirect line
  var redirectIdx = loginFn.indexOf('window.location.href');
  if (redirectIdx >= 0) {
    console.log('\nLogin redirect found at offset', redirectIdx);
    console.log('Context:', loginFn.substring(redirectIdx - 100, redirectIdx + 100));
  }
}
