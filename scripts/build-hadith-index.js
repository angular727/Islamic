const fs=require('fs');
(async()=>{
 const r=await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info.json');
 const info=await r.json();
 const keep=['bukhari','muslim','abudawud','tirmidhi','nasai','ibnmajah','malik','nawawi','qudsi'];
 const out={};
 for(const k of keep){
  const m=info[k].metadata; const secs=[];
  for(const [n,name] of Object.entries(m.sections)){
   if(n==='0'||!name) continue;
   const d=(m.section_details||{})[n]||{};
   secs.push({id:+n,name,first:d.hadithnumber_first??null,last:d.hadithnumber_last??null});
  }
  out[k]={name:m.name,sections:secs};
 }
 fs.writeFileSync('src/assets/data/hadith-books.json',JSON.stringify(out));
 console.log(Object.entries(out).map(([k,v])=>k+':'+v.sections.length).join(' '));
})();
