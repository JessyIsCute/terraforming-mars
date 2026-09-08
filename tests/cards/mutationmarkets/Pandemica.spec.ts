import {expect} from 'chai';
import {Pandemica} from '../../../src/server/cards/mutationmarkets/Pandemica';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';
import {InfectionName} from '../../../src/common/mutationmarkets/InfectionName';
import {SerializedCard} from '../../../src/server/SerializedCard';

describe('Pandemica', () => {
  let card: Pandemica;
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new Pandemica();
    [game, player, player2] = testGame(2, {mutationMarketsExpansion: true, underworldExpansion: true});
  });

  it('starts with 38 M€ and 1 corruption', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(player.underworldData.corruption).eq(1);
  });

  it('canAct requires corruption', () => {
    player2.cardsInHand.push(fakeCard());
    expect(card.canAct(player)).is.false;

    player.underworldData.corruption = 1;
    expect(card.canAct(player)).is.true;
  });

  it('canAct requires at least one opponent with cards in hand', () => {
    player.underworldData.corruption = 1;
    player2.cardsInHand = [];
    expect(card.canAct(player)).is.false;

    player2.cardsInHand.push(fakeCard());
    expect(card.canAct(player)).is.true;
  });

  it('action: spends 1 corruption, reveals 2 cards, and infects the chosen one', () => {
    player.underworldData.corruption = 1;
    const cardA = fakeCard({cost: 10});
    const cardB = fakeCard({cost: 10});
    player2.cardsInHand = [cardA, cardB];

    const selectPlayer = cast(card.action(player), SelectPlayer);
    expect(selectPlayer.players).to.have.members([player2]);
    expect(player.underworldData.corruption).eq(0); // spent immediately, not deferred

    const selectCard = cast(selectPlayer.cb(player2), SelectCard);
    expect(selectCard.cards).to.have.members([cardA, cardB]);

    const target = selectCard.cards[0];
    const orOptions = cast(selectCard.cb([target]), OrOptions);
    expect(orOptions.options).to.have.length(3); // one per InfectionName

    orOptions.options[0].cb(undefined);

    expect(target.infections).to.have.length(1);
  });

  it('offers the 3 infections in InfectionName enum order, applying the chosen one', () => {
    player.underworldData.corruption = 1;
    const targetCard = fakeCard({cost: 10, baseCost: 10});
    player2.cardsInHand = [targetCard];

    const selectPlayer = cast(card.action(player), SelectPlayer);
    const selectCard = cast(selectPlayer.cb(player2), SelectCard);
    const orOptions = cast(selectCard.cb([targetCard]), OrOptions);
    // InfectionName enum order (COST_INFLATION first) drives the OrOptions build order --
    // the actual cost-math effect of Cost Inflation is unit-tested in InfectionEffects.spec.ts;
    // FakeCard's `cost` is a plain field, not a getter composed with InfectionEffects like
    // the real Card class, so it can't be observed via `targetCard.cost` here.
    orOptions.options[0].cb(undefined);

    expect(targetCard.infections).to.deep.eq([{infection: InfectionName.COST_INFLATION}]);
  });

  it('does not offer a targeted opponent with no cards in hand', () => {
    // canAct is the real gate against this in normal play; action() itself just
    // reflects whatever targets() computes, which is empty here.
    player.underworldData.corruption = 1;
    player2.cardsInHand = [];
    const selectPlayer = cast(card.action(player), SelectPlayer);
    expect(selectPlayer.players).to.have.length(0);
  });

  describe('3+ player targeting rotation', () => {
    let player3: TestPlayer;

    beforeEach(() => {
      [game, player, player2, player3] = testGame(3, {mutationMarketsExpansion: true, underworldExpansion: true});
      player.playedCards.push(card);
      player.underworldData.corruption = 5;
      player2.cardsInHand = [fakeCard(), fakeCard()];
      player3.cardsInHand = [fakeCard(), fakeCard()];
    });

    function targetAndInfect(opponent: TestPlayer) {
      const selectPlayer = cast(card.action(player), SelectPlayer);
      const selectCard = cast(selectPlayer.cb(opponent), SelectCard);
      const orOptions = cast(selectCard.cb([selectCard.cards[0]]), OrOptions);
      orOptions.options[0].cb(undefined);
    }

    it('excludes the previously-targeted opponent on the next action', () => {
      let selectPlayer = cast(card.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player2, player3]);

      targetAndInfect(player2);

      selectPlayer = cast(card.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player3]);
    });

    it('rotates back once the other opponent has also been targeted', () => {
      targetAndInfect(player2);
      targetAndInfect(player3);

      const selectPlayer = cast(card.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player2]);
    });

    it('falls back to allowing the last target again if nobody else has cards', () => {
      targetAndInfect(player2);
      player3.cardsInHand = []; // only the last-targeted opponent still has cards

      const selectPlayer = cast(card.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player2]);
    });

    it('serializes and deserializes the last-targeted player id, restoring the exclusion', () => {
      targetAndInfect(player2);

      const serialized = {name: card.name} as SerializedCard;
      card.serialize(serialized);
      expect(serialized.pandemicaLastTargetId).eq(player2.id);

      const restored = new Pandemica();
      restored.deserialize(serialized);

      const selectPlayer = cast(restored.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player3]);
    });
  });

  describe('2-player targeting', () => {
    it('does not exclude the only opponent after targeting them once', () => {
      player.underworldData.corruption = 5;
      player2.cardsInHand = [fakeCard(), fakeCard()];

      let selectPlayer = cast(card.action(player), SelectPlayer);
      const selectCard = cast(selectPlayer.cb(player2), SelectCard);
      const orOptions = cast(selectCard.cb([selectCard.cards[0]]), OrOptions);
      orOptions.options[0].cb(undefined);

      selectPlayer = cast(card.action(player), SelectPlayer);
      expect(selectPlayer.players).to.have.members([player2]);
    });
  });
});
