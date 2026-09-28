const fs=require('fs'),path=require('path'),http=require('http');
const dl='C:\\Users\\Lenovo\\Downloads';
try{
  console.log('--- Downloads top ---');
  fs.readdirSync(dl,{withFileTypes:true}).forEach(e=>console.log((e.isDirectory()?'[DIR] ':'[FILE] ')+e.name));
}catch(e){console.log('DL ERR '+e.message)}
const candidates=[
 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete (1)\\kaalamithra-complete\\app\\index.html',
 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\kaalamithra-complete\\app\\index.html',
 'C:\\Users\\Lenovo\\Downloads\\kaalamithra-complete\\app\\index.html',
];
console.log('--- candidates ---');
candidates.forEach(p=>{try{const s=fs.statSync(p);console.log('FOUND '+p+' bytes='+s.size)}catch(e){console.log('MISS '+p)}});
console.log('--- image files in Downloads root ---');
try{fs.readdirSync(dl).filter(f=>/\.(png|jpg|jpeg|webp)$/i.test(f)).forEach(f=>{try{const s=fs.statSync(path.join(dl,f));console.log(f+' bytes='+s.size)}catch(e){}})}catch(e){}
function health(){return new Promise(res=>{const q=http.get('http://127.0.0.1:5000/api/health',{timeout:4000},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res('HEALTH '+r.statusCode+' '+d.slice(0,600)))});q.on('error',e=>res('HEALTH ERR '+e.message));q.on('timeout',()=>{q.destroy();res('HEALTH TIMEOUT')})})}
health().then(m=>console.log(m));
