const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function sha1(p){ try{ const b=fs.readFileSync(p); return crypto.createHash('sha1').update(b).digest('hex').slice(0,12)+' size='+b.length; }catch(e){ return 'MISSING('+e.code+')'; } }
function checkHtml(p){
  let out = { file:p, sha:sha1(p) };
  try{
    const h = fs.readFileSync(p,'utf8');
    out.lines = h.split('\n').length;
    out.kmLogo = h.includes('images/km-logo.png');
    out.logoPng = h.includes('images/logo.png');
    out.spaced = (h.match(/KAALA MITHRA/g)||[]).length;
    out.nospace = (h.match(/KAALAMITHRA/g)||[]).length;
    out.hub = h.includes('>hub<');
    out.gate = h.includes('auth-gate')||h.includes('Gate.init');
    out.mtime = fs.statSync(p).mtime.toISOString();
  }catch(e){ out.err=e.message; }
  return out;
}
const cands = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-app\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-ai-tech-solution\\app\\index.html',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-src\\app\\index.html',
];
console.log('=== FRONTEND COPIES ===');
for(const c of cands) console.log(JSON.stringify(checkHtml(c)));
console.log('\n=== IMAGES DIRS ===');
const imgDirs = [
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-push\\repo\\app\\images',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\images',
  'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\app\\images',
];
for(const d of imgDirs){ try{ console.log(d+' => '+fs.readdirSync(d).filter(f=>/logo|hero|qr/i.test(f)).join(' | ')); }catch(e){ console.log(d+' MISSING'); } }
console.log('\n=== DOWNLOADS LOGO SOURCES ===');
for(const f of ['kaalamithra-logo.png','image-1.png','image-2.png']){ const p=path.join('C:\\Users\\Lenovo\\Downloads',f); console.log(f+' '+sha1(p)); }
console.log('\n=== BACKUP FILES ===');
for(const c of cands){ for(const ext of ['.logo_bak','.pre_authgate.bak']){ const p=c+ext; if(fs.existsSync(p)) console.log('BACKUP '+p+' '+sha1(p)); } }
console.log('\n=== BACKEND TRACKED STATE ===');
for(const p of ['C:\\Users\\Lenovo\\backend\\public\\login.html','C:\\Users\\Lenovo\\backend\\public\\welcome.html']){ console.log(p+' '+sha1(p)); }
