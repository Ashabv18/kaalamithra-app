const fs = require('fs');
const f = 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\app\\index.html';
const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
for (let i = 17; i <= 60; i++) {
  if (lines[i] === undefined) break;
  console.log(String(i + 1).padStart(4) + ': ' + lines[i]);
}
