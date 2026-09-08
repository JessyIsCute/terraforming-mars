import {expect} from 'chai';
import {InSpire} from '../../../src/server/cards/pathfinders/InSpire';
import {Tag} from '../../../src/common/cards/Tag';
import {RegolithEaters} from '../../../src/server/cards/base/RegolithEaters';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {testGame} from '../../TestGame';
import {runAllActions, fakeCard} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('InSpire', () => {
  let card: InSpire;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new InSpire();
    [game, player] = testGame(1);
    player.playedCards.push(card);
  });

  it('starts with 43 M€ and 3 M€ production', () => {
    const corp = new InSpire();
    const [g, p] = testGame(1);
    p.playCorporationCard(corp);
    runAllActions(g);
    expect(p.megaCredits).eq(43);
    expect(p.production.megacredits).eq(3);
  });

  it('auto-adds a resource when this card holds none of that type yet', () => {
    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;

    // A second Building tag now offers a real choice, proving the first one was stored.
    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    expect(options.options.map((o) => o.title)).deep.eq(['Add steel to InSpire', 'Take steel from InSpire']);
  });

  it('stops offering "add" at the cap of 2, and auto-redistributes once full', () => {
    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    runAllActions(game); // auto-add: 0 -> 1

    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb(); // Add: 1 -> 2

    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    runAllActions(game);
    // At the cap, "add" is no longer legal - only "take" is, so it resolves without a choice.
    expect(player.popWaitingFor()).is.undefined;
    expect(player.production.steel).eq(1);
  });

  it('redistributing a standard-resource type increases production', () => {
    card.onCardPlayed(player, fakeCard({tags: [Tag.POWER]}));
    runAllActions(game); // auto-add energy: 0 -> 1

    card.onCardPlayed(player, fakeCard({tags: [Tag.POWER]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[1].cb(); // Take

    expect(player.production.energy).eq(1);
  });

  it('redistributing a card-resource type adds it to an eligible played card', () => {
    const microbeCard = new RegolithEaters();
    player.playedCards.push(microbeCard);

    card.onCardPlayed(player, fakeCard({tags: [Tag.MICROBE]}));
    runAllActions(game); // auto-add microbe: 0 -> 1

    card.onCardPlayed(player, fakeCard({tags: [Tag.MICROBE]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[1].cb(); // Take
    runAllActions(game);

    expect(microbeCard.resourceCount).eq(1);
  });

  it('without an eligible card, a card-resource type just keeps auto-adding up to the cap', () => {
    card.onCardPlayed(player, fakeCard({tags: [Tag.ANIMAL]}));
    runAllActions(game); // stored 0 -> 1, auto-added (the only legal option at 0 anyway)
    expect(player.popWaitingFor()).is.undefined;

    card.onCardPlayed(player, fakeCard({tags: [Tag.ANIMAL]}));
    runAllActions(game);
    // No eligible Animal-resource card exists, so "take" isn't offered even at stored=1 -
    // it just adds again instead, up to the cap.
    expect(player.popWaitingFor()).is.undefined;

    card.onCardPlayed(player, fakeCard({tags: [Tag.ANIMAL]}));
    runAllActions(game);
    // Now at the cap (2) with still no eligible card - nothing legal to do, so this no-ops.
    expect(player.popWaitingFor()).is.undefined;
  });

  it('once an eligible card exists, taking becomes an option again', () => {
    player.playedCards.push(new Fish());
    card.onCardPlayed(player, fakeCard({tags: [Tag.ANIMAL]}));
    runAllActions(game); // stored 0 -> 1, auto-added (still the only option at stored=0)

    card.onCardPlayed(player, fakeCard({tags: [Tag.ANIMAL]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    expect(options.options).has.lengthOf(2);
  });

  it('Jovian and Venus both trigger the floater rule', () => {
    player.playedCards.push(new Dirigibles());

    card.onCardPlayed(player, fakeCard({tags: [Tag.JOVIAN]}));
    runAllActions(game); // auto-add: 0 -> 1

    card.onCardPlayed(player, fakeCard({tags: [Tag.VENUS]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    expect(options.options.map((o) => o.title)).deep.eq(['Add a floater to InSpire', 'Take a floater from InSpire']);
  });

  it('a card with both Jovian and Venus tags triggers the floater rule twice', () => {
    player.playedCards.push(new Dirigibles());

    card.onCardPlayed(player, fakeCard({tags: [Tag.JOVIAN, Tag.VENUS]}));
    runAllActions(game); // first trigger auto-adds: 0 -> 1

    // The second trigger (still queued from the same onCardPlayed call) now offers a choice.
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb(); // Add: 1 -> 2
    expect(player.popWaitingFor()).is.undefined;
  });

  it('the Science tag redistributes into M€ production', () => {
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    runAllActions(game); // auto-add: 0 -> 1

    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    const before = player.production.megacredits;
    options.options[1].cb(); // Take

    expect(player.production.megacredits).eq(before + 1);
  });
});
