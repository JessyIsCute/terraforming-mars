// Prototype Assembler generator: builds random cards from the value table (../value-table.md)
// and prices them. Standalone (no game code), seeded, so the same seed gives the same cards.
//   node demo-generate.js [seed]
// Prints markdown. Not the real implementation: that will emit CustomCardDefinitions (Behavior + renderData).

const seed0 = Number(process.argv[2] ?? 42);
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rnd = mulberry32(seed0);
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const weighted = (pairs) => { const t = pairs.reduce((s, p) => s + p[1], 0); let r = rnd() * t; for (const [v, w] of pairs) { if ((r -= w) < 0) return v; } return pairs[0][0]; };

// ---- value table -------------------------------------------------------------------------------
const STOCK = {megacredits: 1, steel: 2, titanium: 3, plants: 2.3, heat: 1.2, energy: 1.2};
const PROD = {megacredits: 4, steel: 7, titanium: 10, plants: 6, energy: 6, heat: 4.5};
const NAME = {megacredits: 'M€', steel: 'steel', titanium: 'titanium', plants: 'plants', heat: 'heat', energy: 'energy'};
const TAG = {science: 3.7, jovian: 4.2, venus: 3.6, earth: 3.4, space: 3, building: 2.5, plant: 2.1, microbe: 1.9, animal: 1.3, power: 1.2, city: 0.9, wild: 6};
const TAG_SHARE = {building: .31, space: .26, earth: .16, science: .15, venus: .11, plant: .11, power: .11, microbe: .09, jovian: .07, city: .07, animal: .04};
const TAG_WEIGHT = [['building', 31], ['space', 26], ['earth', 16], ['science', 15], ['venus', 11], ['plant', 11], ['power', 11], ['microbe', 9], ['jovian', 7], ['city', 7], ['animal', 4], ['wild', 1.5]];
const T = {tr: 9, temperature: 8.5, oxygen: 8.5, venus: 9, ocean: 11, greenery: 14, city: 8, vp: 5, draw: 3};
const GLOBAL = {
  oxygen: {start: 0, max: 14, unit: '%', step: 1},
  temperature: {start: -30, max: 8, unit: ' °C', step: 2},
  oceans: {start: 0, max: 9, unit: ' oceans', step: 1},
  venus: {start: 0, max: 30, unit: '% Venus', step: 2},
};

// ---- parts: each returns {text, value, kind} ---------------------------------------------------
// kind: 'play' (once, on play), 'effect' (makes the card blue), 'bad' (negative)
const an = (t) => (/^[aeiou]/.test(t) ? `an ${t}` : `a ${t}`);
const goodParts = [
  [() => { const r = pick(Object.keys(STOCK)); const n = r === 'megacredits' ? int(2, 8) : int(1, 5); return {text: `Gain ${n} ${NAME[r]}.`, value: STOCK[r] * n}; }, 10],
  [() => { const r = weighted([['megacredits', 4], ['steel', 2], ['titanium', 1], ['plants', 2], ['energy', 2], ['heat', 2]]); const n = r === 'megacredits' ? int(1, 3) : int(1, 2); return {text: `Increase your ${NAME[r]} production ${n} step${n > 1 ? 's' : ''}.`, value: PROD[r] * n, prod: r}; }, 10],
  [() => ({text: 'Raise your TR 1 step.', value: T.tr}), 3],
  [() => { const g = pick(['temperature', 'oxygen', 'venus']); return {text: `Raise ${g === 'venus' ? 'Venus' : g} 1 step.`, value: T[g]}; }, 4],
  [() => ({text: 'Place an ocean tile.', value: T.ocean}), 2],
  [() => ({text: 'Place a greenery tile and raise oxygen 1 step.', value: T.greenery}), 1.5],
  [() => ({text: 'Place a city tile.', value: T.city, city: true}), 1.5],
  [() => { const n = int(1, 2); return {text: `Draw ${n} card${n > 1 ? 's' : ''}.`, value: T.draw * n}; }, 4],
  [() => { const n = int(1, 2); return {text: `${n} VP.`, value: T.vp * n, vp: true}; }, 4],
];
const effectParts = [
  [() => { const r = pick(['steel', 'titanium', 'plants', 'heat', 'megacredits']); const n = r === 'megacredits' ? 2 : 1; const one = STOCK[r] * n; return {text: `Action: gain ${n} ${NAME[r]}.`, value: one * 4, kind: 'effect', note: `${one.toFixed(1)} × 4 uses`}; }, 3],
  [() => { const out = pick([['steel', 2], ['titanium', 1], ['plants', 2], ['megacredits', 4]]); const one = STOCK[out[0]] * out[1] - STOCK.energy * 2; return {text: `Action: spend 2 energy to gain ${out[1]} ${NAME[out[0]]}.`, value: one * 4, kind: 'effect', note: `${one.toFixed(1)} × 4 uses`}; }, 3],
  [() => { const g = pick(['temperature', 'oxygen']); const one = T[g] - STOCK.heat * 8 * 0 - 4 * 2; return {text: `Action: spend 4 energy and 4 M€ to raise ${g} 1 step.`, value: (T[g] - 4 * STOCK.energy - 4) * 2, kind: 'effect', note: `${(T[g] - 4 * STOCK.energy - 4).toFixed(1)} × 2 uses (conversion)`}; }, 2],
  [() => { const x = int(1, 2); return {text: `Effect: when you play a card, you pay ${x} M€ less for it.`, value: 8 * x, kind: 'effect', note: `${x} × 8 cards`}; }, 1],
  [() => { const t = pick(['space', 'building', 'earth', 'science', 'jovian', 'venus', 'plant']); const x = int(2, 3); const v = x * 8 * TAG_SHARE[t] * 2; return {text: `Effect: when you play ${an(t)} tag, you pay ${x} M€ less for it.`, value: v, kind: 'effect', note: `${x} × 8 × ${TAG_SHARE[t]} × 2`, synergyTag: t}; }, 3],
  [() => { const t = pick(['space', 'building', 'earth', 'science', 'plant', 'microbe']); const g = pick([['megacredits', 2], ['plants', 1], ['steel', 1], ['heat', 2]]); const per = STOCK[g[0]] * g[1]; const n = 8 * TAG_SHARE[t] * 2; return {text: `Effect: when you play ${an(t)} tag, gain ${g[1]} ${NAME[g[0]]}.`, value: per * n, kind: 'effect', note: `${per.toFixed(1)} × ${n.toFixed(1)} triggers`, synergyTag: t}; }, 3],
];
const badParts = [
  [() => { const r = weighted([['megacredits', 4], ['energy', 3], ['heat', 1], ['plants', 1]]); const n = r === 'megacredits' ? int(1, 2) : 1; return {text: `Decrease your ${NAME[r]} production ${n} step${n > 1 ? 's' : ''}.`, value: -PROD[r] * n, kind: 'bad'}; }, 5],
  [() => { const r = pick(['megacredits', 'plants', 'heat', 'steel']); const n = r === 'megacredits' ? int(3, 6) : int(2, 4); return {text: `Lose ${n} ${NAME[r]}.`, value: -STOCK[r] * n, kind: 'bad'}; }, 3],
  [() => ({text: '−1 VP.', value: -T.vp, kind: 'bad'}), 2],
  [() => ({text: 'Effect: your standard projects cost 2 M€ more.', value: -2.3 * 2, kind: 'bad', blue: true}), 1.5],
  [() => { const t = pick(['space', 'building', 'earth', 'science']); return {text: `Effect: your ${t} cards cost 1 M€ more.`, value: -8 * TAG_SHARE[t], kind: 'bad', blue: true}; }, 1.5],
  [() => ({text: 'Effect: your project cards cost 1 M€ more.', value: -8, kind: 'bad', blue: true}), 0.7],
];
const attackParts = [
  [() => { const n = int(2, 4); return {text: `Remove up to ${n} plants from any player.`, value: 0.3 * n}; }, 1],
  [() => { const r = pick(['megacredits', 'heat', 'plants']); return {text: `Decrease any player's ${NAME[r]} production 1 step.`, value: 2.5}; }, 1],
];

function requirement() {
  if (rnd() < 0.55) {
    const g = pick(Object.keys(GLOBAL)); const G = GLOBAL[g];
    const isMax = rnd() < 0.25;
    const steps = (G.max - G.start) / G.step;
    const at = G.start + G.step * int(isMax ? 1 : 2, Math.floor(steps * (isMax ? 0.5 : 0.75)));
    const frac = (at - G.start) / (G.max - G.start);
    const v = isMax ? -2.5 * (1 - frac) : -6 * frac;
    return {text: isMax ? `Requires ${at}${G.unit} or less.` : `Requires ${at}${G.unit} or more.`, value: v};
  }
  const t = weighted([['science', 4], ['earth', 2], ['jovian', 1], ['building', 2], ['space', 2], ['plant', 1], ['venus', 1], ['power', 1]]);
  const n = weighted([[1, 3], [2, 4], [3, 3], [4, 1], [5, 0.5]]);
  return {text: `Requires ${n} ${t} tag${n > 1 ? 's' : ''}.`, value: -Math.pow(n, 1.5), synergyTag: t};
}

// ---- build one card ----------------------------------------------------------------------------
// complexity: number of good parts / effects / bad parts / tags
const PROFILE = {
  low: {good: [1, 1], effect: 0, bad: [0, 0], tags: [1, 1], reqChance: 0.15},
  mid: {good: [2, 3], effect: 0.3, bad: [0, 1], tags: [1, 2], reqChance: 0.35},
  high: {good: [2, 3], effect: 1, bad: [1, 2], tags: [2, 3], reqChance: 0.5},
};
let serial = 0;
function makeCard(complexity, forceReq) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const P = PROFILE[complexity];
    const parts = [];
    const nGood = int(...P.good);
    for (let i = 0; i < nGood; i++) parts.push(weighted(rnd() < 0.1 ? attackParts : goodParts)());
    if (rnd() < P.effect) parts.push(weighted(effectParts)());
    const nBad = int(...P.bad);
    for (let i = 0; i < nBad; i++) parts.push(weighted(badParts)());
    // no duplicate texts, no "gain X production" + "decrease X production" of the same resource
    const texts = parts.map((p) => p.text);
    if (new Set(texts).size !== texts.length) continue;
    const blue = parts.some((p) => p.kind === 'effect' || p.blue);
    const hasLasting = blue || parts.some((p) => p.prod || p.vp || p.city);
    const type = blue ? 'Active (blue)' : (!hasLasting && rnd() < 0.6 ? 'Event (red)' : 'Automated (green)');

    // tags: prefer one that fits the parts (energy production -> power, city -> city, a tag the effect needs)
    const tags = [];
    const nTags = int(...P.tags);
    const hint = parts.find((p) => p.prod === 'energy') ? 'power' : parts.find((p) => p.city) ? 'city' : parts.find((p) => p.prod === 'plants') ? 'plant' : parts.find((p) => p.synergyTag)?.synergyTag;
    if (hint && rnd() < 0.7) tags.push(hint);
    while (tags.length < nTags) { const t = weighted(TAG_WEIGHT); if (!tags.includes(t)) tags.push(t); }

    const req = (forceReq || rnd() < P.reqChance) ? requirement() : undefined;
    if (req?.synergyTag && tags.includes(req.synergyTag) === false && rnd() < 0.5) tags[tags.length - 1] = req.synergyTag; // science-req cards tend to be science cards

    // price it
    const partsValue = parts.reduce((s, p) => s + p.value, 0);
    const tagVals = tags.map((t) => TAG[t]).sort((a, b) => b - a);
    let tagValue = tagVals.reduce((s, v, i) => s + v * (i ? 0.75 : 1), 0);
    if (type.startsWith('Event')) tagValue = tagValue * 0.25 + 0.5; // tags on events don't stay in play
    const reqValue = req ? req.value : 0;
    let value = partsValue + tagValue + reqValue;
    let cost = value - 3;
    // building/space payment grows with the cost (1 + 5% / 10% of cost)
    const payPct = (tags.includes('space') ? 0.10 : 0) + (tags.includes('building') ? 0.05 : 0);
    const payFlat = (tags.includes('space') ? 1 : 0) + (tags.includes('building') ? 1 : 0);
    if (payPct) { cost = (cost + payFlat) / (1 - payPct); value = cost + 3; }
    cost = Math.round(cost);
    if (value < 3 || cost < 1 || cost > 40) continue; // free-but-bad or absurd cards get rerolled
    if (partsValue <= 0) continue;
    serial++;
    return {id: `ASM-${String(serial).padStart(2, '0')}`, complexity, type, tags, req, parts, partsValue, tagValue, reqValue, payFlat, payPct, value, cost};
  }
  throw new Error('could not build a card');
}

const plan = [['low', false], ['low', false], ['low', false], ['mid', false], ['mid', false], ['mid', false], ['high', false], ['high', false], ['high', false], ['mid', true], ['low', true], ['high', true]];
const cards = plan.map(([c, r]) => makeCard(c, r));
const fmt = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);
console.log(`Seed ${seed0}\n`);
for (const c of cards) {
  console.log(`### ${c.id} · ${c.complexity}${c.req && ['ASM-10', 'ASM-11', 'ASM-12'].includes(c.id) ? ' · guaranteed requirement' : ''} — **${c.cost} M€**`);
  console.log(`${c.type} · tags: ${c.tags.join(', ')}${c.req ? ` · ${c.req.text}` : ''}\n`);
  for (const p of c.parts) console.log(`- ${p.text}  _(${fmt(p.value)}${p.note ? `: ${p.note}` : ''})_`);
  const pay = c.payPct ? ` + payment ${c.payFlat} + ${(c.payPct * 100).toFixed(0)}% of cost` : '';
  console.log(`\nValue: parts ${fmt(c.partsValue)}, tags ${fmt(c.tagValue)}${c.req ? `, requirement ${fmt(c.reqValue)}` : ''}${pay} = ${c.value.toFixed(1)} → cost ${c.cost}\n`);
}

// ---- --html out.html: the same cards drawn as cards ---------------------------------------------
const htmlOut = process.argv[process.argv.indexOf('--html') + 1];
if (process.argv.includes('--html') && htmlOut) {
  const nameRnd = mulberry32(seed0 * 7919);
  const npick = (a) => a[Math.floor(nameRnd() * a.length)];
  const THEME = [
    [/ocean/i, ['Aquifer', 'Ice Cap Melt', 'Hydro Basin']], [/greenery|plants production/i, ['Greenhouse', 'Lichen Fields', 'Bio-Dome']],
    [/energy production|energy to/i, ['Reactor', 'Power Grid', 'Fusion Cell']], [/temperature|heat/i, ['Thermal Vent', 'Heat Sink', 'Solar Lens']],
    [/oxygen|Venus/i, ['Atmo Shaper', 'Cloud Seeder', 'Air Forge']], [/Draw/i, ['Archive', 'Think Tank', 'Data Relay']],
    [/titanium|steel/i, ['Foundry', 'Ore Smelter', 'Mass Driver']], [/M€/i, ['Exchange', 'Trade Office', 'Holding']],
  ];
  const PREFIX = ['Assembled', 'Modular', 'Patchwork', 'Salvaged', 'Prototype', 'Scrapbuilt', 'Jury-rigged', 'Composite'];
  const nameOf = (c) => { const all = c.parts.map((p) => p.text).join(' '); const t = THEME.find(([re]) => re.test(all)); return `${npick(PREFIX)} ${npick(t ? t[1] : ['Contraption'])}`; };
  const TAGCOL = {science: '#e8e8e8', jovian: '#d98c3f', venus: '#7fb0d8', earth: '#3f7fd9', space: '#222', building: '#8a5a2b', plant: '#3e9b3e', microbe: '#9cc43c', animal: '#2f6b2f', power: '#8e3fd9', city: '#777', wild: 'conic-gradient(#e33,#ec3,#3c3,#3ce,#33e,#c3e,#e33)', event: '#222'};
  const TAGTXT = {science: '#333', jovian: '#fff', venus: '#fff', earth: '#fff', space: '#fff', building: '#fff', plant: '#fff', microbe: '#222', animal: '#fff', power: '#fff', city: '#fff', wild: '#fff', event: '#ffd23f'};
  const TAGSYM = {science: '⚛', jovian: '♃', venus: '♀', earth: '⊕', space: '★', building: '⌂', plant: '❦', microbe: '✲', animal: '🐾', power: 'ϟ', city: '▣', wild: '?', event: '⚡'};
  const TYPE = {'Event (red)': ['#c0392b', '#f6d6d2'], 'Active (blue)': ['#2b6cb0', '#d6e6f6'], 'Automated (green)': ['#2f855a', '#d4eedd']};
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const section = (c, kind) => c.parts.filter((p) => kind === 'effect' ? (p.kind === 'effect' || p.blue) : !(p.kind === 'effect' || p.blue));
  const line = (p) => `<li class="${p.value < 0 ? 'bad' : ''}"><span>${esc(p.text)}</span><b>${p.value >= 0 ? '+' : '−'}${Math.abs(p.value).toFixed(1)}</b></li>`;
  const cardHtml = (c) => {
    const [band, body] = TYPE[c.type];
    const tags = (c.type.startsWith('Event') ? [...c.tags, 'event'] : c.tags);
    const eff = section(c, 'effect'), play = section(c, 'play');
    const guaranteed = ['ASM-10', 'ASM-11', 'ASM-12'].includes(c.id);
    return `<div class="card" style="--band:${band};--body:${body}">
  <div class="top"><div class="cost">${c.cost}</div><div class="tags">${tags.map((t) => `<span class="tag" title="${t}" style="background:${TAGCOL[t]};color:${TAGTXT[t]}">${TAGSYM[t]}</span>`).join('')}</div></div>
  ${c.req ? `<div class="req">${esc(c.req.text.replace(/^Requires /, '').replace(/\.$/, ''))}</div>` : '<div class="req empty"></div>'}
  <div class="title">${esc(nameOf(c))}</div>
  <div class="art"><span>${c.id}</span><span class="cx cx-${c.complexity}">${c.complexity}${guaranteed ? ' · req' : ''}</span></div>
  ${eff.length ? `<div class="effect"><ul>${eff.map(line).join('')}</ul></div>` : ''}
  <ul class="play">${play.map(line).join('')}</ul>
  <div class="foot">parts ${fmt(c.partsValue)} · tags ${fmt(c.tagValue)}${c.req ? ` · req ${fmt(c.reqValue)}` : ''}${c.payPct ? ` · pay ${c.payFlat}+${(c.payPct * 100).toFixed(0)}%` : ''}<br>value ${c.value.toFixed(1)} − 3 = <b>${c.cost} M€</b></div>
</div>`;
  };
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Assembler demo cards · seed ${seed0}</title><style>
body{margin:0;padding:24px;background:#1d1b22;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#222}
h1{color:#f0e6d8;font-size:20px;margin:0 0 4px}p.sub{color:#b9ad9c;margin:0 0 20px;font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}
.card{background:var(--body);border:3px solid var(--band);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 14px #0008;min-height:360px}
.top{display:flex;justify-content:space-between;align-items:center;background:var(--band);padding:6px 8px}
.cost{width:36px;height:36px;border-radius:7px;background:linear-gradient(#ffe27a,#d9a514);border:2px solid #7a5a00;display:grid;place-items:center;font-weight:800;font-size:18px;color:#3b2a00}
.tags{display:flex;gap:3px}.tag{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:14px;border:2px solid #0006}
.req{margin:6px 8px 0;align-self:flex-start;background:#ffd23f;border:1px solid #a07c00;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:700;color:#4a3800}.req.empty{visibility:hidden}
.title{margin:6px 8px 4px;background:#fff8;border:1px solid #0003;border-radius:4px;padding:3px 6px;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:.3px;text-align:center}
.art{margin:0 8px;height:44px;border-radius:6px;background:repeating-linear-gradient(135deg,#0001 0 8px,#0000 8px 16px),var(--band);opacity:.85;display:flex;justify-content:space-between;align-items:flex-end;padding:4px 7px;color:#fff;font-size:11px;font-weight:700}
.cx{background:#0005;border-radius:3px;padding:0 5px}
ul{list-style:none;margin:0;padding:0}li{display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:1.3;padding:3px 0;border-bottom:1px dashed #0002}
li b{font-variant-numeric:tabular-nums;color:#2f6f2f;white-space:nowrap}li.bad b{color:#b02a2a}li.bad span{color:#7a1f1f}
.effect{margin:8px 8px 0;background:#fff9;border:1px solid #2b6cb055;border-radius:6px;padding:2px 7px}
.play{margin:6px 8px 0;flex:1}
.foot{margin:8px 0 0;padding:6px 8px;background:#0000000d;border-top:1px solid #0002;font-size:10.5px;color:#555;line-height:1.45}
</style></head><body><h1>Assembler — demo cards (seed ${seed0})</h1>
<p class="sub">Generated by docs/assembler/analysis/demo-generate.js from docs/assembler/value-table.md. Cards 1–3 low, 4–6 mid, 7–9 high complexity, 10–12 with a guaranteed requirement. Numbers on the right are each part's value in M€; red is a bad effect.</p>
<div class="grid">${cards.map(cardHtml).join('\n')}</div></body></html>`;
  require('fs').writeFileSync(htmlOut, html);
}
