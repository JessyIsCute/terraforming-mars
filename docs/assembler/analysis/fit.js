// Fit a value per effect from card costs: cost = intercept + sum(value_i * feature_i), ridge regression.
// Usage: node fit.js [official|all] [anchored]
const cards = require('./cards.json');
const scope = process.argv[2] || 'official';
const anchored = (process.argv[3]||'').includes('anchored');
const fixedIntercept = (process.argv[3]||'').includes('fixed');
const opts = {active: false};
const OFFICIAL = new Set(['base', 'corpera', 'promo', 'venus', 'colonies', 'prelude', 'prelude2', 'turmoil']);
const R = {megacredits: 'mc', steel: 'steel', titanium: 'ti', plants: 'plant', energy: 'energy', heat: 'heat'};
const SUPPORTED = new Set(['production', 'stock', 'global', 'tr', 'drawCard', 'tile', 'city', 'ocean', 'greenery',
  'addResourcesToAnyCard', 'addResources', 'removeAnyPlants', 'decreaseAnyProduction']);
const ANCHORS = {'stock.mc': 1, 'stock.steel': 2, 'stock.ti': 3, 'stock.plant': 2.3, 'stock.heat': 1.2, 'stock.energy': 1.2,
  'prod.energy': 7, 'prod.steel': 7, 'prod.ti': 10, 'vp': 5};

function features(c) {
  if (['prelude', 'corporation', 'ceo', 'standard_project', 'standard_action'].includes(c.type)) return undefined;
  if (!opts.active && (c.overrides.length > 0 || c.action || c.type === 'active')) return undefined;
  if (typeof c.cost !== 'number') return undefined;
  if (c.vp !== undefined && typeof c.vp !== 'number') return undefined;
  const b = c.behavior || {};
  const f = {};
  const add = (k, v) => { f[k] = (f[k] || 0) + v; };
  for (const key of Object.keys(b)) if (!SUPPORTED.has(key)) return undefined;
  for (const [part, pre] of [['production', 'prod'], ['stock', 'stock']]) {
    for (const [r, v] of Object.entries(b[part] || {})) {
      if (typeof v !== 'number' || R[r] === undefined) return undefined;
      add(`${pre}.${R[r]}`, v);
    }
  }
  if (b.tr !== undefined) { if (typeof b.tr !== 'number') return undefined; add('tr', b.tr); }
  for (const [g, v] of Object.entries(b.global || {})) add(`global.${g}`, v);
  if (b.drawCard !== undefined) { const n = typeof b.drawCard === 'number' ? b.drawCard : b.drawCard.count; if (typeof n !== 'number') return undefined; add('drawCard', n); }
  if (b.ocean) add('ocean', b.ocean.count ?? 1);
  if (b.greenery) add('greenery', 1);
  if (b.city) add('city', 1);
  if (b.tile) add('specialTile', 1);
  for (const a of [].concat(b.addResourcesToAnyCard || [])) { const n = a.count ?? 1; if (typeof n !== 'number') return undefined; add('cardResource', n); }
  if (b.addResources !== undefined) { if (typeof b.addResources !== 'number') return undefined; add('cardResource', b.addResources); }
  if (b.removeAnyPlants) add('attack.removePlants', b.removeAnyPlants);
  if (b.decreaseAnyProduction) add('attack.decreaseProd', b.decreaseAnyProduction.count ?? 1);
  if (typeof c.vp === 'number' && c.vp !== 0) add('vp', c.vp);
  for (const t of c.tags || []) add(`tag.${t}`, 1);
  if ((c.tags || []).length >= 2) add('multiTagBonus', (c.tags.length - 1));
  if ((c.tags || []).length === 0 && c.type !== 'event') add('noTags', 1);
  if (c.type === 'event') add('isEvent', 1);
  for (const r of c.requirements || []) {
    if (r.tag) add('req.tag', Math.pow(r.count ?? 1, Number(process.env.REQEXP || 1)));
    else if (r.oxygen !== undefined || r.temperature !== undefined || r.oceans !== undefined || r.venus !== undefined) {
      const frac = r.oxygen !== undefined ? r.oxygen / 14 : r.temperature !== undefined ? (r.temperature + 30) / 38 : r.oceans !== undefined ? r.oceans / 9 : r.venus / 30;
      if (r.max) add('req.globalMax(early=1)', 1 - frac); else add('req.globalMin(late=1)', frac);
    }
    else add('req.other', 1);
  }
  return f;
}

const rows = [];
for (const c of cards) {
  if (scope === 'official' && !OFFICIAL.has(c.module)) continue;
  const f = features(c);
  if (f) rows.push({c, f});
}
const keys = [...new Set(rows.flatMap((r) => Object.keys(r.f)))].filter((k) => !(anchored && k in ANCHORS)).sort();
const cols = fixedIntercept ? keys : ['intercept', ...keys];
const X = rows.map((r) => cols.map((k) => (k === 'intercept' ? 1 : r.f[k] || 0)));
const y = rows.map((r) => r.c.cost + (fixedIntercept ? 3 : 0) - (anchored ? Object.entries(ANCHORS).reduce((s, [k, v]) => s + (r.f[k] || 0) * v, 0) : 0));

// ridge: (X'X + lambda*I) w = X'y, no penalty on intercept
const n = cols.length, lambda = 0.3;
const A = Array.from({length: n}, () => new Array(n).fill(0)), bvec = new Array(n).fill(0);
for (let i = 0; i < X.length; i++) for (let a = 0; a < n; a++) { bvec[a] += X[i][a] * y[i]; for (let b2 = 0; b2 < n; b2++) A[a][b2] += X[i][a] * X[i][b2]; }
for (let a = fixedIntercept ? 0 : 1; a < n; a++) A[a][a] += lambda;
for (let p = 0; p < n; p++) {
  let m = p; for (let r = p + 1; r < n; r++) if (Math.abs(A[r][p]) > Math.abs(A[m][p])) m = r;
  [A[p], A[m]] = [A[m], A[p]]; [bvec[p], bvec[m]] = [bvec[m], bvec[p]];
  for (let r = 0; r < n; r++) { if (r === p) continue; const k = A[r][p] / A[p][p]; for (let c2 = p; c2 < n; c2++) A[r][c2] -= k * A[p][c2]; bvec[r] -= k * bvec[p]; }
}
const w = bvec.map((v, i) => v / A[i][i]);
const count = (k) => rows.filter((r) => r.f[k]).length;
console.log(`scope=${scope} anchored=${anchored} cards=${rows.length}`);
cols.forEach((k, i) => console.log(`${k.padEnd(22)} ${w[i].toFixed(2).padStart(7)}   (n=${k === 'intercept' ? rows.length : count(k)})`));
const pred = (r) => (fixedIntercept ? -3 : 0) + cols.reduce((s, k, i) => s + w[i] * (k === 'intercept' ? 1 : r.f[k] || 0), 0) + (anchored ? Object.entries(ANCHORS).reduce((s, [k, v]) => s + (r.f[k] || 0) * v, 0) : 0);
const res = rows.map((r) => ({name: r.c.name, module: r.c.module, cost: r.c.cost, pred: pred(r)})).map((r) => ({...r, d: r.pred - r.cost}));
const mae = res.reduce((s, r) => s + Math.abs(r.d), 0) / res.length;
console.log(`mean abs error ${mae.toFixed(2)} MC`);
res.sort((a, b) => b.d - a.d);
console.log('UNDERCOSTED (strong for their price):', res.slice(0, 12).map((r) => `${r.name} ${r.cost}->${r.pred.toFixed(1)}`).join(' | '));
console.log('OVERCOSTED (weak for their price):', res.slice(-12).map((r) => `${r.name} ${r.cost}->${r.pred.toFixed(1)}`).join(' | '));
if (process.argv[4]) require('fs').writeFileSync(process.argv[4], JSON.stringify({cols, w, res}, null, 1));
