// Calibrate effects: how many uses an action gets, how many cards a discount hits.
// implied(effect) = cost + 3 - value(everything else on the card), using the check.js table.
const cards = require('./cards.json');
const OFFICIAL = new Set(['base', 'corpera', 'promo', 'venus', 'colonies', 'prelude', 'prelude2', 'turmoil']);
const T = {
  'stock.megacredits': 1, 'stock.steel': 2, 'stock.titanium': 3, 'stock.plants': 2.3, 'stock.heat': 1.2, 'stock.energy': 1.2,
  'prod.megacredits': 4, 'prod.steel': 7, 'prod.titanium': 10, 'prod.plants': 6, 'prod.energy': 6, 'prod.heat': 4.5,
  tr: 9, temperature: 8.5, oxygen: 8.5, venus: 9, ocean: 11, greenery: 14, city: 8, tile: 2.5, vp: 5, drawCard: 3, cardResource: 1.5,
};
const TAG = {building: 1, space: 1, science: 2, earth: 1.5, jovian: 2.5, venus: 1, plant: 1, microbe: 1.5, animal: 1.5, power: 1, city: 2, wild: 3};
const reqVal = (r) => {
  if (r.tag) return -Math.pow(r.count ?? 1, 1.5);
  if (r.oxygen !== undefined) return r.max ? -2.5 * (1 - r.oxygen / 14) : -6 * r.oxygen / 14;
  if (r.temperature !== undefined) return r.max ? -2.5 * (1 - (r.temperature + 30) / 38) : -6 * (r.temperature + 30) / 38;
  if (r.oceans !== undefined) return r.max ? -2.5 * (1 - r.oceans / 9) : -6 * r.oceans / 9;
  if (r.venus !== undefined) return r.max ? -2.5 * (1 - r.venus / 30) : -6 * r.venus / 30;
  return -3;
};
// value of a behavior block (play or one use of an action); undefined if it has parts we can't price
function val(b, card) {
  if (!b) return 0;
  let v = 0;
  for (const [k, x] of Object.entries(b)) {
    if (k === 'production' || k === 'stock') {
      for (const [r, n] of Object.entries(x)) { const p = T[`${k === 'production' ? 'prod' : 'stock'}.${r}`]; if (typeof n !== 'number' || p === undefined) return undefined; v += p * n; }
    } else if (k === 'spend') {
      for (const [r, n] of Object.entries(x)) {
        if (r === 'canUseSteel' || r === 'canUseTitanium') continue;
        if (r === 'resourcesHere') { v -= n * resWorth(card); continue; }
        const p = T[`stock.${r}`]; if (typeof n !== 'number' || p === undefined) return undefined; v -= p * n;
      }
    } else if (k === 'tr') { if (typeof x !== 'number') return undefined; v += T.tr * x; }
    else if (k === 'global') { for (const [g, n] of Object.entries(x)) v += T[g] * n; }
    else if (k === 'ocean') v += T.ocean * (x.count ?? 1);
    else if (k === 'greenery') v += T.greenery;
    else if (k === 'city') v += T.city;
    else if (k === 'tile') v += T.tile;
    else if (k === 'drawCard') { const n = typeof x === 'number' ? x : x.count; if (typeof n !== 'number') return undefined; v += T.drawCard * n; }
    else if (k === 'addResources') { if (typeof x !== 'number') return undefined; v += x * resWorth(card); }
    else if (k === 'addResourcesToAnyCard') { for (const a of [].concat(x)) { if (typeof (a.count ?? 1) !== 'number') return undefined; v += (a.count ?? 1) * T.cardResource; } }
    else if (k === 'or') { const opts = x.behaviors.map((o) => val(o, card)); if (opts.some((o) => o === undefined)) return undefined; v += Math.max(...opts); }
    else if (k === 'title') continue;
    else return undefined;
  }
  return v;
}
// a resource on a card that scores VP per resource is worth that VP
function resWorth(card) {
  const vp = card.vp;
  if (vp && typeof vp === 'object' && vp.resourcesHere !== undefined) return T.vp / (vp.per ?? 1) * (vp.each ?? 1);
  return T.cardResource;
}
function tagsVal(c) { const v = (c.tags || []).map((t) => TAG[t] ?? 0).sort((a, b) => b - a); return v.reduce((s, x, i) => s + (i ? 0.75 : 1) * x, 0); }
function rest(c) { // everything except the effect/action
  const play = val(c.behavior, c); if (play === undefined) return undefined;
  const vp = typeof c.vp === 'number' ? c.vp * T.vp : 0;
  return play + vp + tagsVal(c) + (c.requirements || []).reduce((s, r) => s + reqVal(r), 0);
}

const off = cards.filter((c) => OFFICIAL.has(c.module) && c.type === 'active' && typeof c.cost === 'number');
console.log('== ACTIONS (declarative): uses = implied value / value of one use');
const uses = [];
for (const c of off) {
  if (!c.action || c.cardDiscount) continue;
  const extra = c.overrides.filter((o) => !['action', 'canAct', 'getVictoryPoints'].includes(o));
  if (extra.length) continue;
  const r = rest(c), u = val(c.action, c);
  if (r === undefined || u === undefined || u <= 0.5) continue;
  const implied = c.cost + 3 - r;
  uses.push(implied / u);
  console.log(`${c.name.padEnd(28)} cost ${String(c.cost).padStart(2)}  one use ${u.toFixed(1).padStart(5)}  effect ${implied.toFixed(1).padStart(5)}  => uses ${(implied / u).toFixed(1)}`);
}
uses.sort((a, b) => a - b);
console.log(`median uses ${uses[Math.floor(uses.length / 2)].toFixed(1)} over ${uses.length} cards`);

console.log('\n== DISCOUNTS: cards hit = implied value / discount');
const pool = cards.filter((c) => OFFICIAL.has(c.module) && ['active', 'automated', 'event'].includes(c.type));
for (const c of off) {
  if (!c.cardDiscount || c.action) continue;
  const r = rest(c); if (r === undefined) continue;
  const implied = c.cost + 3 - r;
  for (const d of [].concat(c.cardDiscount)) {
    const share = d.tag ? pool.filter((x) => (x.tags || []).includes(d.tag)).length / pool.length : 1;
    console.log(`${c.name.padEnd(28)} cost ${String(c.cost).padStart(2)}  -${d.amount} on ${(d.tag ?? 'all').padEnd(8)} (${(share * 100).toFixed(0)}% of cards)  effect ${implied.toFixed(1).padStart(5)}  => cards hit ${(implied / d.amount).toFixed(1)}, i.e. ${(implied / d.amount / share).toFixed(1)} cards played`);
  }
}
console.log('\n== OTHER EFFECTS (coded): implied value');
for (const c of off) {
  if (c.cardDiscount) continue;
  if (c.action && !c.overrides.some((o) => !['action', 'canAct', 'getVictoryPoints'].includes(o))) continue;
  const r = rest(c); if (r === undefined) continue;
  console.log(`${(c.cost + 3 - r).toFixed(1).padStart(5)}  ${c.name} (${c.cost})  [${c.overrides.join(',')}]`);
}
