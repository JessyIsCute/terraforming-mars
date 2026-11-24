// For each tag: how many cards reward having it (requirements, discounts, per-tag counts) and how strongly.
const cards=require('./cards.json');
const OFFICIAL=new Set(['base','corpera','promo','venus','colonies','prelude','prelude2','turmoil']);
const scope=process.argv[2]||'official';
const pool=cards.filter(c=>scope==='all'||OFFICIAL.has(c.module));
const tags=['building','space','science','power','earth','jovian','venus','plant','microbe','animal','city','wild','moon','mars','crime'];
const S={}; for(const t of tags)S[t]={own:0,req:0,reqTags:0,disc:0,discMC:0,count:0,corp:0};
for(const c of pool){
  for(const t of c.tags||[]) if(S[t]) S[t].own++;
  for(const r of c.requirements||[]) if(r.tag&&S[r.tag]){S[r.tag].req++;S[r.tag].reqTags+=r.count??1;}
  for(const d of [].concat(c.cardDiscount||[])) if(d.tag&&S[d.tag]){S[d.tag].disc++;S[d.tag].discMC+=d.amount;}
  const js=JSON.stringify([c.behavior,c.action,c.vp]);
  for(const t of tags) if(js.includes(`"tag":"${t}"`)||js.includes(`"tag":["${t}`)){S[t].count++; if(c.type==='corporation')S[t].corp++;}
}
console.log(`scope=${scope} pool=${pool.length} (project ${pool.filter(c=>!['corporation','prelude'].includes(c.type)).length})`);
console.log('tag        ownTag  reqCards(avgN) discountCards  perTagCards(corps)');
for(const t of tags){const s=S[t]; if(!s.own&&!s.req&&!s.count)continue; console.log(`${t.padEnd(10)} ${String(s.own).padStart(5)}   ${String(s.req).padStart(4)} (${s.req?(s.reqTags/s.req).toFixed(1):'-'})        ${String(s.disc).padStart(3)}           ${String(s.count).padStart(3)} (${s.corp})`);}
