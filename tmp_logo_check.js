const fs=require('fs'),path=require('path');
const front='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
// Check logo candidates: user 2nd image is the KAALA MITHRA rounded rect logo.
// We have: kaalamithra-logo.png (666x375), image-1.png (832x491), image-2.png (716x1600 portrait)
const cands=['C:\\Users\\Lenovo\\Downloads\\kaalamithra-logo.png','C:\\Users\\Lenovo\\Downloads\\image-1.png','C:\\Users\\Lenovo\\Downloads\\image-2.png','C:\\Users\\Lenovo\\Downloads\\annadatha logo.jpg'];
cands.forEach(f=>{try{const s=fs.statSync(f);console.log(f+' EXISTS bytes='+s.size)}catch(e){console.log(f+' MISS')}});
// Check app/images dir
const imgdir='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\images';
try{console.log('images dir: '+fs.readdirSync(imgdir).slice(0,30).join(', '))}catch(e){console.log('images dir ERR '+e.message)}
// Show exact brand block to replace
const t=fs.readFileSync(front,'utf8');
const i=t.indexOf('<span class="material-symbols-outlined text-white text-[30px]">hub</span>');
console.log('--- context ---');
console.log(t.slice(i-600,i+900));
