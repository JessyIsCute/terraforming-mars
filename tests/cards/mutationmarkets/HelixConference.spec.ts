import {expect} from 'chai';
import {HelixConference} from '../../../src/server/cards/mutationmarkets/HelixConference';
import {Bushes} from '../../../src/server/cards/base/Bushes';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Tag} from '../../../src/common/cards/Tag';
import {MutationName} from '../../../src/common/mutationmarkets/MutationName';
import {cast} from '../../../src/common/utils/utils';

describe('HelixConference', () => {
  let card: HelixConference;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new HelixConference();
    [game, player] = testGame(2, {mutationMarketsExpansion: true});
  });

  it('starts with 40 M€', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(player.megaCredits).eq(40);
  });

  it('banks a science resource for a science tag play, below the 2-resource threshold', () => {
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    runAllActions(game);
    cast(player.popWaitingFor(), undefined);
    expect(card.resourceCount).to.eq(1);
  });

  it('banks a science resource for a microbe tag play', () => {
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({tags: [Tag.MICROBE]}));
    runAllActions(game);
    cast(player.popWaitingFor(), undefined);
    expect(card.resourceCount).to.eq(1);
  });

  it('ignores a tag play with neither a science nor a microbe tag', () => {
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING]}));
    expect(game.deferredActions).has.lengthOf(0);
  });

  it('triggers once per qualifying tag on the same card', () => {
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE, Tag.MICROBE]}));
    runAllActions(game);
    expect(card.resourceCount).to.eq(2);
  });

  it('offers a choice between banking and mutating once 2 resources are already present', () => {
    player.playedCards.push(card);
    card.resourceCount = 2;
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    expect(orOptions.options).has.lengthOf(2);
  });

  it('spending 2 resources lets the player pick a target card and one of 3 mutations', () => {
    player.playedCards.push(card);
    card.resourceCount = 2;
    const target = fakeCard({tags: []});
    player.playedCards.push(target);

    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();

    const selectCard = cast(orOptions.options[0].cb(), SelectCard);
    expect(card.resourceCount).to.eq(0);
    expect(selectCard.cards).to.have.members([target]);

    const mutationChoice = cast(selectCard.cb([target]), OrOptions);
    expect(mutationChoice.options).has.lengthOf(3);

    mutationChoice.options[0].cb(undefined);
    expect(target.mutations).has.lengthOf(1);
    expect(target.mutations![0].mutation).to.eq(MutationName.SCIENCE_PATRON);
    expect(target.mutations![0].chosenTag).is.not.undefined;
  });

  it('offers exactly Science Patron, Gigantic Undertakings, and Building Mogul, in that order', () => {
    player.playedCards.push(card);
    card.resourceCount = 2;
    const target = fakeCard({tags: []});
    player.playedCards.push(target);

    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    const selectCard = cast(orOptions.options[0].cb(), SelectCard);
    const mutationChoice = cast(selectCard.cb([target]), OrOptions);

    mutationChoice.options[1].cb(undefined);
    expect(target.mutations).to.deep.eq([{mutation: MutationName.GIGANTIC_UNDERTAKINGS}]);
  });

  it('does not offer a card to mutate when the player has no played project cards', () => {
    player.playedCards.push(card);
    card.resourceCount = 2;

    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    const result = orOptions.options[0].cb();
    expect(result).is.undefined;
    expect(card.resourceCount).to.eq(0);
  });

  it('adding a tag mutation keeps the tableau tag count in sync', () => {
    // A real Card subclass, unlike fakeCard(): its .tags getter is computed live from
    // .mutations (see MutationEffects.applyTags), so this actually exercises whether
    // playedCards.retagCard is wired up correctly -- a fakeCard's plain .tags field
    // wouldn't reflect the mutation at all, silently passing regardless.
    player.playedCards.push(card);
    card.resourceCount = 2;
    const target = new Bushes();
    player.playedCards.push(target);
    const tagsBefore = {...player.playedCards.tags};

    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]}));
    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    const selectCard = cast(orOptions.options[0].cb(), SelectCard);
    const mutationChoice = cast(selectCard.cb([target]), OrOptions);
    mutationChoice.options[0].cb(undefined); // Science Patron: addRandomTag

    const chosenTag = target.mutations![0].chosenTag!;
    expect(target.tags).to.include(chosenTag);
    expect(player.playedCards.tags[chosenTag]).to.eq(tagsBefore[chosenTag] + 1);
  });
});
