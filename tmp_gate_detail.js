const fs=require('fs');
const p='C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html';
const t=fs.readFileSync(p,'utf8');
function show(re,label){ console.log('=== '+label+' ==='); const idx=t.search(re); if(idx<0){console.log('NOT FOUND');return} console.log(t.slice(Math.max(0,idx-500),idx+2500)); console.log('\n');}
show(/KAALAMITHRA/,'first brand');
show(/gate-login-msg|Cannot reach the sign-in service/,'red error text');
show(/gateSubmitLogin|KM_API_BASE|127\.0\.0\.1:5000/,'api base / login fn');
show(/hub<\/span>/,'hub icon box');
// logo files
['C:\\Users\\Lenovo\\Downloads\\kaalamithra-logo.png','C:\\Users\\Lenovo\\Downloads\\image-2.png','C:\\Users\\Lenovo\\Downloads\\image-1.png'].forEach(f=>{try{const b=fs.readFileSync(f); const isPng=b.slice(0,8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])); let d='n/a'; if(isPng) d=b.readUInt32BE(16)+'x'+b.readUInt32BE(20); console.log(f+' bytes='+b.length+' png='+isPng+' dims='+d)}catch(e){console.log(f+' MISS')}});
