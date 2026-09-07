import {expect} from 'chai';
import {FacilitySharing} from '../../../../src/server/cards/conglomerates/teamActions/FacilitySharing';
import {Steelworks} from '../../../../src/server/cards/base/Steelworks';
import {SpaceMirrors} from '../../../../src/server/cards/base/SpaceMirrors';
import {UnitedNationsMarsInitiative} from '../../../../src/server/cards/corporation/UnitedNationsMarsInitiative';
import {FullAccessCooperation} from '../../../../src/server/cards/conglomerates/FullAccessCooperation';
import {IGame} from '../../../../src/server/IGame';
import {testGame} from '../../../TestGame';
import {TestPlayer} from '../../../TestPlayer';
import {cast} from '../../../../src/common/utils/utils';
import {SelectOption} from '../../../../src/server/inputs/SelectOption';
import {OrOptions} from '../../../../src/server/inputs/OrOptions';
import {ConglomeratesExpansion} from '../../../../src/server/conglomerates/ConglomeratesExpansion';

describe('FacilitySharing', () => {
  let card: FacilitySharing;
  let game: IGame;
  let player: TestPlayer;
  let teammate: TestPlayer;
  let steelworks: Steelworks;

  beforeEach(() => {
    card = new FacilitySharing();
    [game, player, , teammate] = testGame(4, {conglomeratesExpansion: true});
    steelworks = new Steelworks();
    teammate.playedCards.push(steelworks);
    player.conglomeratesData.coordination = 5;
  });

  it('cannot act if the actor cannot pay the borrowed card\'s cost', () => {
    player.energy = 3;
    expect(card.canAct(player)).is.false;
  });

  it('cannot act without enough coordination', () => {
    player.energy = 4;
    player.conglomeratesData.coordination = 0;
    expect(card.canAct(player)).is.false;
  });

  it('cannot act on a card already used by the teammate this generation', () => {
    player.energy = 4;
    teammate.actionsThisGeneration.add(steelworks.name);
    expect(card.canAct(player)).is.false;
  });

  it('lets the actor use the teammate\'s card, spending the actor\'s own resources', () => {
    player.energy = 4;
    expect(card.canAct(player)).is.true;

    // A single sharable card collapses straight to that card's own action (undefined here,
    // since Steelworks resolves immediately with no further input).
    expect(card.action(player)).is.undefined;

    expect(player.energy).to.eq(0);
    expect(player.steel).to.eq(2);
    expect(teammate.steel).to.eq(0);
    expect(teammate.actionsThisGeneration.has(steelworks.name)).is.true;
    expect(player.conglomeratesData.coordination).to.eq(4);
    expect(ConglomeratesExpansion.getTeamActionCost(player, 'facilitySharing')).to.eq(2);
  });

  it('offers a choice when more than one card is sharable', () => {
    player.energy = 4;
    player.megaCredits = 7;
    const spaceMirrors = new SpaceMirrors();
    teammate.playedCards.push(spaceMirrors);

    const result = cast(card.action(player), OrOptions);
    expect(result.options).to.have.length(2);

    // Use Space Mirrors, the second offered option.
    cast(result.options[1], SelectOption).cb(undefined);
    game.deferredActions.runNext();

    expect(player.megaCredits).to.eq(0);
    expect(player.production.energy).to.eq(1);
    expect(teammate.actionsThisGeneration.has(spaceMirrors.name)).is.true;
    // The unused Steelworks option was not consumed.
    expect(player.energy).to.eq(4);
    expect(teammate.actionsThisGeneration.has(steelworks.name)).is.false;
  });

  describe('with Full Access Cooperation', () => {
    it('does not offer the teammate\'s corporation action without it', () => {
      teammate.playedCards.push(new UnitedNationsMarsInitiative());
      player.hasIncreasedTerraformRatingThisGeneration = true;
      player.megaCredits = 3;

      // Steelworks isn't sharable (player has no energy), so only the corp action would show.
      expect(card.canAct(player)).is.false;
    });

    it('lets Facility Sharing reach the teammate\'s corporation action', () => {
      teammate.playedCards.push(new UnitedNationsMarsInitiative());
      teammate.playedCards.push(new FullAccessCooperation());
      player.hasIncreasedTerraformRatingThisGeneration = true;
      player.megaCredits = 3;

      expect(card.canAct(player)).is.true;
      // UnitedNationsMarsInitiative.action() defers the payment/TR increase and returns
      // undefined itself, so a single sharable option collapses straight through to that.
      expect(card.action(player)).is.undefined;
      game.deferredActions.runNext();

      expect(player.megaCredits).to.eq(0);
      expect(player.terraformRating).to.eq(21);
    });

    it('gives the teammate 2 MC when their action card is used through Facility Sharing', () => {
      teammate.playedCards.push(new FullAccessCooperation());
      player.energy = 4;
      const teammateMcBefore = teammate.megaCredits;

      card.action(player);

      expect(teammate.megaCredits).to.eq(teammateMcBefore + 2);
    });
  });
});
