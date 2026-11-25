/**
 * Assembler demo: creates a solo game whose player holds 12 freshly assembled cards
 * (3 low, 3 mid, 3 high complexity, 3 with a guaranteed requirement) and saves it to the
 * local database, so the real client can show them.
 *
 *   LOCAL_FS_DB=1 npx tsx src/server/tools/assembler_demo.ts [seed]
 *   LOCAL_FS_DB=1 npx tsx src/server/tools/assembler_demo.ts pack [seed]
 *       (the printed Assembler cards, plus one card made by each preset they use)
 *   LOCAL_FS_DB=1 npm start      then open the printed URL
 *
 * Never run this against a production database.
 */
import {Database} from '../database/Database';
import {globalInitialize} from '../globalInitialize';
import {Game} from '../Game';
import {Player} from '../Player';
import {GameId, PlayerId, SpectatorId} from '../../common/Types';
import {AssemblerExpansion} from '../assembler/AssemblerExpansion';
import {AssemblerComplexity} from '../assembler/AssembledCardDefinition';
import {estimateContentHeight} from '../assembler/AssemblerRender';
import {AssembleSpec} from '../assembler/AssembleSpec';
import {ASSEMBLER_CARD_MANIFEST} from '../cards/assembler/AssemblerCardManifest';
import {OPEN_SOURCE_BLUEPRINTS_DISCOUNT, OPEN_SOURCE_BLUEPRINTS_PRESET} from '../cards/assembler/OpenSourceBlueprints';
import {Tag} from '../../common/cards/Tag';
import {IProjectCard} from '../cards/IProjectCard';

const PLAN: Array<[AssemblerComplexity, boolean]> = [
  ['low', false], ['low', false], ['low', false],
  ['mid', false], ['mid', false], ['mid', false],
  ['high', false], ['high', false], ['high', false],
  ['mid', true], ['low', true], ['high', true],
];

/** One card from each preset the printed cards use, labelled for the console. */
const PACK_PRESETS: Array<[string, AssembleSpec]> = [
  ['Research Prototype: science tag', {tags: [Tag.SCIENCE]}],
  ['Open Source Blueprints: yours', {...OPEN_SOURCE_BLUEPRINTS_PRESET, costAdjust: -OPEN_SOURCE_BLUEPRINTS_DISCOUNT}],
  ['Open Source Blueprints: theirs', OPEN_SOURCE_BLUEPRINTS_PRESET],
  ['Quad-Core Chassis: 4 tags', {tagCount: 4}],
  ['Specialized Fabricator: jovian', {tags: [Tag.JOVIAN]}],
  ['Venture Prototype: high', {complexity: 'high'}],
  ['Bargain Bin: simple, <= 8', {complexity: 'low', maxCost: 8}],
];

async function main() {
  const pack = process.argv[2] === 'pack';
  const seedArg = pack ? process.argv[3] : process.argv[2];
  if (process.env.POSTGRES_HOST !== undefined) {
    throw new Error('Refusing to run the Assembler demo against PostgreSQL.');
  }
  globalInitialize();
  const seed = Number(seedArg ?? 0.42);
  const suffix = (pack ? 'pack' : '') + String(seed).replace(/\D/g, '');
  const db = Database.getInstance();
  await db.initialize();

  const player = new Player('Assembler Demo', 'red', false, 0, `passemblerdemo${suffix}` as PlayerId);
  const game = Game.newInstance(`gassemblerdemo${suffix}` as GameId, [player], player, `sassemblerdemo${suffix}` as SpectatorId, pack ? {assemblerExpansion: true} : {}, seed);

  // Finish the initial selection: first corporation, keep no project cards.
  player.process({
    type: 'initialCards',
    responses: [
      {type: 'card', cards: [player.dealtCorporationCards[0].name]},
      {type: 'card', cards: []},
    ],
  });

  const labels = new Map<string, string>();
  if (pack) {
    const printed: Array<IProjectCard> = Object.values(ASSEMBLER_CARD_MANIFEST.projectCards).map((spec) => new spec.Factory());
    player.cardsInHand.push(...printed);
    for (const [label, spec] of PACK_PRESETS) {
      const {card, definition} = AssemblerExpansion.create(game, spec);
      labels.set(definition.name, label);
      player.cardsInHand.push(card);
    }
  } else {
    for (const [complexity, forceRequirement] of PLAN) {
      const {card} = AssemblerExpansion.create(game, {complexity, forceRequirement});
      player.cardsInHand.push(card);
    }
  }
  // Enough of everything that most cards show as playable.
  player.megaCredits = 150;
  player.steel = 10;
  player.titanium = 10;
  player.plants = 10;
  player.energy = 10;
  player.heat = 10;
  player.production.override({megacredits: 5, steel: 2, titanium: 2, plants: 2, energy: 3, heat: 2});

  await db.saveGame(game);
  console.log(`Saved ${game.id} with ${game.assembledCards.length} assembled cards.`);
  for (const def of game.assembledCards) {
    if (pack && !labels.has(def.name)) {
      continue; // seeded into the deck at setup, not in hand
    }
    const label = labels.get(def.name) ?? '';
    console.log(`  ${def.complexity.padEnd(4)} ${String(def.cost).padStart(2)} M€  ${def.title} [${def.tags.join(', ')}]  ${label}  (${def.name}, est. height ${estimateContentHeight(def)}px)`);
  }
  console.log(`Open: http://localhost:8080/player?id=${player.id}`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});
