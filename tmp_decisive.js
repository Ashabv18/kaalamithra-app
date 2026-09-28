const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repo = 'C:/Users/Lenovo/Downloads/kaalamithra-push/repo';
const roots = [
  'C:/Users/Lenovo/Downloads/kaalamithra-complete',
  'C:/Users/Lenovo/Downloads/kaalamithra-complete (1)',
];

function ls(p){
  try{
    return fs.readdirSync(p).map(f=>path.join(p,f)).filter(f=>{
      try{ return fs.statSync(f).isFile(); }catch(e){ return false; }
    }).map(f=>f+' ['+fs.statSync(f).size+'B]');
  }catch(e){ return []; }
}

function walk(dir){
  const out=[];
  function rec(d){
    try{
      for(const e of fs.readdirSync(d,{withFileTypes:true})){
        const p=path.join(d,e.name);
        if(e.isDirectory()) rec(p);
        else out.push(p+' ['+fs.statSync(p).size+'B]');
      }
    }catch(e){}
  }
  rec(dir);
  return out;
}

console.log('=== REPO app/images ===');
console.log(ls(path.join(repo,'app/images')).join('\n')||'(empty)');
console.log('\n=== REPO root files (first 40) ===');
console.log(ls(repo).slice(0,40).join('\n'));
console.log('\n=== Any PNG/JPG across the two complete copies ===');
const pngs=new Set();
for(const r of roots){
  for(const f of walk(r)){
    if(/(png|jpg)$/i.test(path.extname(f))) pngs.add(f);
  }
}
console.log([...pngs].join('\n'));
console.log('\n=== Hash of both repo app/index.html copies ===');
const repoHtml=path.join(repo,'app','index.html');
console.log('repo:', repoHtml, 'sha256='+crypto.createHash('sha256').update(fs.readFileSync(repoHtml)).digest('hex'));
for(const r of roots){
  const f=path.join(r,'kaalamithra-complete','app','index.html');
  try{
    console.log(r+':', f, 'sha256='+crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'));
  }catch(e){ console.log(r+': MISSING'); }
}
console.log('\n=== Every "KAALA MITHRA" / "Kaala Mithra" occurrence (repo + copies) ===');
const needles=[/KAALA MITHRA/g,/Kaala Mithra/g,/KAALAMITHRA/g];
for(const root of [repo,...roots]){
  walk(root).forEach(f=>{
    if(!/\.html?$/i.test(f)) return;
    try{
      const txt=fs.readFileSync(f,'utf8');
      needles.forEach(n=>{
        let m; let lineNo=0;
        txt.split('\n').forEach((line,i)=>{
          while((m=n.exec(line))){
            console.log(f+':'+(i+1)+' ['+n.source+'] -> "'+line.trim().slice(0,120)+'"');
          }
        });
      });
    }catch(e){}
  });
}
