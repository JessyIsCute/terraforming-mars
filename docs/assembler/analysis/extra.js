const fs=require('fs');
const src=fs.readFileSync('fit.js','utf8');
const featSrc=src.slice(src.indexOf('function features'), src.indexOf('const rows = []'));
const R = {megacredits:'mc',steel:'steel',titanium:'ti',plants:'plant',energy:'energy',heat:'heat'};
const SUPPORTED = new Set(['production','stock','global','tr','drawCard','tile','city','ocean','greenery','addResourcesToAnyCard','addResources','removeAnyPlants','decreaseAnyProduction']);
const opts={active:true};
eval(featSrc.replace('function features','globalThis.features = function'));
const cards=require('./cards.json'); const {cols,w}=require('./fit-free.json');
const W=Object.fromEntries(cols.map((k,i)=>[k,w[i]]));
const OFFICIAL=new Set(['base','corpera','promo','venus','colonies','prelude','prelude2','turmoil']);
// implied value of the effect/action part of official blue cards
const imp=[];
for(const c of cards){ if(!OFFICIAL.has(c.module)||c.type!=='active')continue;
  const f=features(c); if(!f)continue; let known=0, unknown=[];
  for(const [k,v] of Object.entries(f)){ if(W[k]===undefined)unknown.push(k); else known+=W[k]*v; }
  imp.push({name:c.name,cost:c.cost,effect:+(c.cost+3-known).toFixed(1),desc:(c.description||'').slice(0,110)});
}
imp.sort((a,b)=>b.effect-a.effect);
console.log('ACTIVE CARDS: implied value of their effect/action (cost+3 minus tags/vp/etc)');
for(const x of imp) console.log(`${String(x.effect).padStart(5)}  ${x.name} (${x.cost})  ${x.desc}`);
// identical features, different cost
const g={};
for(const c of cards){ opts.active=false; const f=features(c); if(!f)continue; const key=JSON.stringify(Object.entries(f).sort()); (g[key]=g[key]||[]).push(c); }
console.log('\nSAME EFFECTS, DIFFERENT COST');
for(const [k,list] of Object.entries(g)){ const costs=new Set(list.map(c=>c.cost)); if(list.length>1&&costs.size>1) console.log(list.map(c=>`${c.name}[${c.module}] ${c.cost}`).join('  vs  '),'   ',k.slice(0,120)); }
