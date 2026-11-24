// Read-only: dump every project card's cost/tags/behavior from the live build, for value fitting.
const B = '/opt/terraforming-mars/build/src/server/cards/';
const {ALL_MODULE_MANIFESTS} = require(B + 'AllManifests.js');
const {Card} = require(B + 'Card.js');
const {ActionCard} = require(B + 'ActionCard.js');

const out = [];
const custom = ['bespokePlay', 'play', 'bespokeCanPlay', 'canPlay', 'action', 'canAct', 'onCardPlayed',
  'onTilePlaced', 'getCardDiscount', 'onProductionPhase', 'onIncreaseTerraformRating', 'getVictoryPoints',
  'onResourceAdded', 'onColonyAdded', 'onDiscard', 'onStandardProject'];
for (const manifest of ALL_MODULE_MANIFESTS) {
  for (const [name, spec] of [...Object.entries(manifest.projectCards ?? {}), ...Object.entries(manifest.corporationCards ?? {}), ...Object.entries(manifest.preludeCards ?? {})]) {
    let card;
    try { card = new spec.Factory(); } catch (e) { continue; }
    const overrides = [];
    let p = Object.getPrototypeOf(card);
    while (p && p !== Card.prototype && p !== ActionCard.prototype && p !== Object.prototype) {
      for (const m of custom) if (Object.prototype.hasOwnProperty.call(p, m)) overrides.push(m);
      p = Object.getPrototypeOf(p);
    }
    if (card.constructor.name === "ProxyCard" || String(name).includes(":proxy")) continue;
    let vp; try { vp = card.victoryPoints; } catch (e) { continue; }
    out.push({
      module: manifest.module, name, type: card.type, cost: card.cost, tags: card.tags,
      behavior: card.behavior, action: card.properties?.action, vp, cardDiscount: card.cardDiscount, firstAction: card.firstAction, startingMegaCredits: card.startingMegaCredits,
      requirements: card.requirements, resourceType: card.resourceType,
      overrides: [...new Set(overrides)],
      compat: spec.compatibility, instantiate: spec.instantiate,
      description: (()=>{try{const d=card.metadata?.description;return typeof d==="string"?d:d?.text;}catch(e){return undefined;}})(),

    });
  }
}
require('fs').writeFileSync('/tmp/assembler/cards.json', JSON.stringify(out, null, 1));
console.log(out.length, 'cards;', out.filter((c) => c.overrides.length === 0 && !c.action).length, 'with no custom code and no action');
