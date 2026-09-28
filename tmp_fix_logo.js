const fs=require('fs'),path=require('path');
// The user's 2nd image = rounded-rect KAALA MITHRA logo (white bg, brain icon, blue/pink/orange text).
// Best match in Downloads: kaalamithra-logo.png (666x375 landscape ~ matches 2nd image aspect).
// image-1.png is also landscape 832x491; image-2.png is portrait 716x1600 (not it).
// Copy kaalamithra-logo.png -> app/images/km-logo.png and swap the hub box for <img>.
const front='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
const src='C:\\Users\\Lenovo\\Downloads\\kaalamithra-logo.png';
const dstDir='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\images';
const dst=path.join(dstDir,'km-logo.png');
fs.mkdirSync(dstDir,{recursive:true});
fs.copyFileSync(src,dst);
console.log('COPIED km-logo.png bytes='+fs.statSync(dst).size);
let html=fs.readFileSync(front,'utf8');
const oldBlock='<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-container via-secondary to-tertiary shadow-lg flex items-center justify-center">\r\n          <span class="material-symbols-outlined text-white text-[30px]">hub</span>\r\n        </div>';
if(!html.includes(oldBlock)){ console.log('PATTERN NOT FOUND - trying LF variant'); }
const newBlock='<img src="images/km-logo.png" alt="Kaalamithra logo" class="h-16 w-auto rounded-2xl shadow-lg bg-white object-contain px-2 py-1" />';
if(html.includes(oldBlock)){ html=html.replace(oldBlock,newBlock); console.log('REPLACED hub box with logo img'); }
else { const old2=oldBlock.replace(/\r\n/g,'\n'); const html2=html.replace(/\r\n/g,'\n'); if(html2.includes(old2)){ html=html2.replace(old2,newBlock.replace(/\r\n/g,'\n')); console.log('REPLACED via LF'); } else { console.log('STILL NOT FOUND'); process.exit(1);} }
// keep backup once
try{fs.writeFileSync(front+'.logo_bak',fs.readFileSync(front,'utf8'));}catch(e){}
fs.writeFileSync(front,html,'utf8');
console.log('SAVED. verify: '+ (html.includes('images/km-logo.png')?'LOGO IMG PRESENT':'MISSING'));
console.log(html.includes('>hub<')?'hub still present':'hub gone (gate) OK');
