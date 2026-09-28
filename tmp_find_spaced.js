const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo/app/index.html';
const html = fs.readFileSync(path, 'utf8');

const re = /.{0,40}KAALA MITHRA.{0,40}/g;
let m;
let count = 0;
while ((m = re.exec(html)) !== null) {
  count++;
  console.log('--- OCCURRENCE', count, '---');
  console.log(JSON.stringify(m[0]));
  console.log('AT INDEX:', m.index);
}
console.log('TOTAL:', count);
