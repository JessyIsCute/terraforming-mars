const fs=require('fs'); const src=fs.readFileSync('fit.js','utf8');
const R = {megacredits:'mc',steel:'steel',titanium:'ti',plants:'plant',energy:'energy',heat:'heat'};
const SUPPORTED = new Set(['production','stock','global','tr','drawCard','tile','city','ocean','greenery','addResourcesToAnyCard','addResources','removeAnyPlants','decreaseAnyProduction']);
const opts={active:false};
eval(src.slice(src.indexOf('function features'), src.indexOf('const rows = []')).replace('function features','globalThis.features = function'));
const T = { // proposed table, value scale (worth = cost + 3)
 'stock.mc':1,'stock.steel':2,'stock.ti':3,'stock.plant':2.3,'stock.heat':1.2,'stock.energy':1.2,
 'prod.mc':4,'prod.steel':7,'prod.ti':10,'prod.plant':6,'prod.energy':6,'prod.heat':4.5,
 'tr':9,'global.temperature':8.5,'global.oxygen':8.5,'global.venus':9,'ocean':11,'greenery':14,'city':8,'tag.city':2,'specialTile':2.5,
 'vp':5,'drawCard':3,'cardResource':1.5,'attack.removePlants':0.3,'attack.decreaseProd':2.5,
 'tag.building':1,'tag.space':1,'tag.science':2,'tag.earth':1.5,'tag.jovian':2.5,'tag.venus':1,'tag.plant':1,'tag.microbe':1.5,'tag.animal':1.5,'tag.power':1,'tag.wild':3,
 'multiTagBonus':-0.25,'noTags':0,'isEvent':0,
 'req.globalMin(late=1)':-12,'req.globalMax(early=1)':-2.5,'req.tag':-1,'req.other':-3,
};
const OFFICIAL=new Set(['base','corpera','promo','venus','colonies','prelude','prelude2','turmoil']);
const cards=require('./cards.json'); const res=[];
for(const c of cards){ if(!OFFICIAL.has(c.module))continue; const f=features(c); if(!f)continue;
  let multi=0; let v=0; for(const [k,x] of Object.entries(f)){ if(k==='multiTagBonus'){continue;} v+=(T[k]??0)*x; }
  // extra tags beyond the first count 75%
  const tags=(c.tags||[]); if(tags.length>1){ const tv=tags.map(t=>T['tag.'+t]??0).sort((a,b)=>b-a); v-=tv.slice(1).reduce((s,x)=>s+x*0.25,0); }
  res.push({n:c.name,cost:c.cost,gen:Math.max(0,Math.round(v-3))}); }
const mae=res.reduce((s,r)=>s+Math.abs(r.gen-r.cost),0)/res.length;
const bias=res.reduce((s,r)=>s+(r.gen-r.cost),0)/res.length;
console.log(`cards=${res.length} MAE=${mae.toFixed(2)} bias=${bias.toFixed(2)} within2=${(res.filter(r=>Math.abs(r.gen-r.cost)<=2).length/res.length*100).toFixed(0)}%`);
for(const n of ['Lichen','Power Plant','Mine','Asteroid','Comet','Kelp Farming','Heather','Grass','Moss','Nitrophilic Moss','Mangrove','Trees','Big Asteroid','Deimos Down','Geothermal Power','Solar Power','Acquired Company','Domed Crater','Noctis City','Lunar Beam','Interstellar Colony Ship','Methane From Titan','Io Mining Industries','Strip Mine','Bushes','Fueled Generators','Rad-Chem Factory','Tectonic Stress Power'])
 { const r=res.find(x=>x.n===n); if(r)console.log(`${n.padEnd(26)} real ${String(r.cost).padStart(2)}  table ${String(r.gen).padStart(2)}`); }
