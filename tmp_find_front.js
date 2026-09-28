const fs=require('fs'),path=require('path');
const dl='C:\\Users\\Lenovo\\Downloads';
console.log('--- kaalamithra dirs ---');
fs.readdirSync(dl,{withFileTypes:true}).filter(e=>/kaala/i.test(e.name)).forEach(e=>console.log((e.isDirectory()?'[DIR] ':'[FILE] ')+e.name));
function walk(d,depth){ if(depth>4) return; let ents=[]; try{ents=fs.readdirSync(d,{withFileTypes:true})}catch(e){return}
 for(const e of ents){ const p=path.join(d,e.name); if(e.isDirectory()){ if(/kaala/i.test(p)||depth<2) walk(p,depth+1);} else if(/index\.html$/i.test(e.name)&&/kaala/i.test(p)){ try{console.log('INDEX '+p+' bytes='+fs.statSync(p).size)}catch(_){} } }}
walk(dl,0);
const cands=[
 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html',
 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\kaalamithra-complete\\app\\index.html',
];
for(const p of cands){ try{const t=fs.readFileSync(p,'utf8'); console.log('=== HEAD '+p+' ==='); console.log(t.slice(0,3000)); console.log('=== gate/logo lines ==='); t.split(/\r?\n/).forEach((l,i)=>{ if(/KAALA|gate-logo|material-symbols-outlined.*hub|hub<\/span>|<img/i.test(l)) console.log((i+1)+': '+l.slice(0,300)); }); break;}catch(e){console.log('MISS '+p)}}
