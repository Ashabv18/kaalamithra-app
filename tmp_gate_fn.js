const fs=require('fs');
const p='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
const t=fs.readFileSync(p,'utf8');
let i=t.indexOf('var Gate = {');
console.log(t.slice(i,i+8000));
