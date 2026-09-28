const fs = require('fs');
const r = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo';
const top = fs.readdirSync(r);
console.log('REPO ROOT:', top.join(', '));
console.log('--- has index.html at root?', top.includes('index.html'));
console.log('--- app/:', fs.readdirSync(r + '/app').slice(0, 40).join(', '));
console.log('--- app/images/:', fs.readdirSync(r + '/app/images').join(', '));
const have = ['vercel.json', 'package.json', 'next.config.js', 'next.config.mjs', 'app.js', 'app.py', 'Dockerfile', 'docker-compose.yml', 'README.md'];
have.forEach(f => console.log(f + ':', top.includes(f) ? fs.statSync(r + '/' + f).size + ' bytes' : 'MISSING'));
console.log('');
console.log('==== commitmsg.txt ====');
try { console.log(fs.readFileSync('C:/Users/Lenovo/Downloads/kaalamithra-push/commitmsg.txt', 'utf8').substring(0, 600)); } catch (e) { console.log('missing'); }
console.log('==== commitmsg2.txt ====');
try { console.log(fs.readFileSync('C:/Users/Lenovo/Downloads/kaalamithra-push/commitmsg2.txt', 'utf8').substring(0, 600)); } catch (e) { console.log('missing'); }
