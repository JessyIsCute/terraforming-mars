import {expect} from 'chai';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {IGame} from '../../src/server/IGame';
import {Terraformer} from '../../src/server/milestones/Terraformer';
import {milestoneManifest} from '../../src/server/milestones/Milestones';
import {Banker} from '../../src/server/awards/Banker';
import {Resource} from '../../src/common/Resource';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {cast} from '../../src/common/utils/utils';
import {runAllActions, fakeCard} from '../TestingUtils';
import {Server} from '../../src/server/models/ServerModel';
import {ConglomeratesExpansion} from '../../src/server/conglomerates/ConglomeratesExpansion';
import {Tag} from '../../src/common/cards/Tag';

describe('Conglomerates milestones and awards', () => {
  let game: IGame;
  let player1: TestPlayer;
  let player2: TestPlayer;
  let player3: TestPlayer;
  let player4: TestPlayer;

  beforeEach(() => {
    // Phase 1 pairs by table order: player1&player3 are a team, player2&player4 are a team.
    [game, player1, player2, player3, player4] = testGame(4, {conglomeratesExpansion: true});
  });

  describe('milestones', () => {
    it('costs 12 MC to claim, up from the base game\'s 8', () => {
      expect(player1.milestoneCost()).to.eq(12);
    });

    it('scales the threshold 1.5x rounded up and combines the whole team\'s score', () => {
      const milestone = new Terraformer();
      // Base threshold 35 -> ceil(52.5) = 53.
      player1.setTerraformRating(30);
      player3.setTerraformRating(22); // combined 52, just short
      expect(milestone.canClaim(player1)).is.false;

      player3.setTerraformRating(23); // combined 53
      expect(milestone.canClaim(player1)).is.true;
    });

    it('does not scale or combine for a teamless player', () => {
      const [, solo] = testGame(4);
      const milestone = new Terraformer();
      solo.setTerraformRating(35);
      expect(milestone.canClaim(solo)).is.true;
      solo.setTerraformRating(34);
      expect(milestone.canClaim(solo)).is.false;
    });

    it('pays 8 VP to the whole team, not 5 to just the claimer', () => {
      const milestone = new Terraformer();
      game.claimedMilestones.push({player: player1, milestone});

      expect(player1.getVictoryPoints().milestones).to.eq(8);
      expect(player3.getVictoryPoints().milestones).to.eq(8); // teammate sees it too
      expect(player2.getVictoryPoints().milestones).to.eq(0); // other team does not
    });

    it('the Terraformer53 variant shows the real scaled number and claims exactly like Terraformer', () => {
      const variant = milestoneManifest.createOrThrow('Terraformer53');
      expect(variant.description).to.eq('Have a terraform rating of 53 (or 39 with Turmoil) between you and your teammate');

      player1.setTerraformRating(30);
      player3.setTerraformRating(22); // combined 52, just short
      expect(variant.canClaim(player1)).is.false;

      player3.setTerraformRating(23); // combined 53
      expect(variant.canClaim(player1)).is.true;
      expect(variant.getScore(player1)).to.eq(player1.terraformRating);
    });

    it('Generalist2 requires the team\'s combined production to reach 2 of each resource', () => {
      const variant = milestoneManifest.createOrThrow('Generalist2');

      // player1 alone has 1 of everything -- not enough per-resource on its own.
      for (const resource of [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT]) {
        player1.production.add(resource, 1);
      }
      expect(variant.getScore(player1)).to.eq(0);
      expect(variant.canClaim(player1)).is.false;

      // player3 (teammate) makes up the other 1 of each -- combined team production hits 2.
      for (const resource of [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT]) {
        player3.production.add(resource, 1);
      }
      expect(variant.getScore(player1)).to.eq(6);
      expect(variant.canClaim(player1)).is.true;

      // player2 (other team) does not count toward player1's team.
      expect(variant.canClaim(player2)).is.false;
    });

    it('Diversifier10 unions the team\'s distinct tags instead of a 1.5x scale (which would be an unreachable 12)', () => {
      const variant = milestoneManifest.createOrThrow('Diversifier10');
      expect(variant.description).to.eq('Have 10 different tags in play between you and your teammate');

      // player1 alone: 6 distinct tags.
      player1.playedCards.push(fakeCard({tags: [Tag.BUILDING]}));
      player1.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
      player1.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
      player1.playedCards.push(fakeCard({tags: [Tag.POWER]}));
      player1.playedCards.push(fakeCard({tags: [Tag.EARTH]}));
      player1.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
      expect(variant.getScore(player1)).to.eq(6);
      expect(variant.canClaim(player1)).is.false;

      // player3 (teammate): 6 distinct tags, 2 of which (Building, Space) overlap with
      // player1's - a naive sum (6 + 6 = 12) would double-count those, but the real union
      // is only 10.
      player3.playedCards.push(fakeCard({tags: [Tag.BUILDING]}));
      player3.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
      player3.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
      player3.playedCards.push(fakeCard({tags: [Tag.MICROBE]}));
      player3.playedCards.push(fakeCard({tags: [Tag.ANIMAL]}));
      player3.playedCards.push(fakeCard({tags: [Tag.CITY]}));
      expect(variant.getScore(player1)).to.eq(10);
      expect(variant.canClaim(player1)).is.true;

      // player2 (other team) does not count toward player1's team.
      expect(variant.canClaim(player2)).is.false;
    });

    it('gives the claimer 1 Coordination when actually claimed', () => {
      player1.conglomeratesData.coordination = 5;
      player1.megaCredits = 20;
      player1.setTerraformRating(53); // solo already meets the (unscaled-for-solo) claim bar

      const actions = cast(player1.getActions(), OrOptions);
      const claimMilestoneAction = cast(actions.options.find((option) => option.title === 'Claim a milestone'), OrOptions);
      claimMilestoneAction.options[0].cb();
      runAllActions(game);

      // The default Tharsis board's Terraformer slot is swapped for its scaled sibling.
      expect(game.claimedMilestones.some((cm) => cm.milestone.name === 'Terraformer53' && cm.player === player1)).is.true;
      expect(player1.conglomeratesData.coordination).to.eq(6);
    });

    it('the client model includes each team\'s combined score alongside per-player scores', () => {
      player1.setTerraformRating(30);
      player3.setTerraformRating(15); // player1's team: 30 + 15 = 45
      player2.setTerraformRating(10);
      player4.setTerraformRating(5); // player2's team: 10 + 5 = 15

      const milestones = Server.getMilestones(game);
      const terraformer = milestones.find((m) => m.name === 'Terraformer53')!;

      expect(terraformer.teamScores).to.have.length(2);
      const team1 = terraformer.teamScores!.find((t) => t.playerColors.includes(player1.color))!;
      const team2 = terraformer.teamScores!.find((t) => t.playerColors.includes(player2.color))!;
      expect(team1.score).to.eq(45);
      expect(team2.score).to.eq(15);
      expect(team1.teamColor).to.eq(ConglomeratesExpansion.teamDisplayColor(player1));
      expect(team2.teamColor).to.eq(ConglomeratesExpansion.teamDisplayColor(player2));
    });

    it('does not include team scores when Conglomerates is off', () => {
      const [soloGame, solo] = testGame(4);
      solo.setTerraformRating(35);
      const milestones = Server.getMilestones(soloGame);
      const terraformer = milestones.find((m) => m.name === 'Terraformer')!;
      expect(terraformer.teamScores).is.undefined;
    });

    it('Generalist2\'s team score uses the already-combined value once, not summed twice', () => {
      const getScore = () => 4; // every team member reports the same already-combined value
      const teamScores = ConglomeratesExpansion.getTeamScores(game, getScore, true);
      expect(teamScores.every((t) => t.score === 4)).is.true; // not 8 (which a naive sum would give)
    });
  });

  describe('awards', () => {
    it('costs 12/18/24 to fund, up from the base game\'s 8/14/20', () => {
      expect(game.getAwardFundingCost()).to.eq(12);
      game.fundAward(player1, new Banker());
      expect(game.getAwardFundingCost()).to.eq(18);
    });

    it('pays 8 VP win-take-all to the team with the best combined score', () => {
      const award = new Banker();
      game.fundAward(player1, award);

      // player1 & player3's team: 4 + 3 = 7 combined M€ production.
      player1.production.add(Resource.MEGACREDITS, 4);
      player3.production.add(Resource.MEGACREDITS, 3);
      // player2 & player4's team: 2 + 2 = 4 combined.
      player2.production.add(Resource.MEGACREDITS, 2);
      player4.production.add(Resource.MEGACREDITS, 2);

      expect(player1.getVictoryPoints().awards).to.eq(8);
      expect(player3.getVictoryPoints().awards).to.eq(8);
      expect(player2.getVictoryPoints().awards).to.eq(0);
      expect(player4.getVictoryPoints().awards).to.eq(0);
    });

    it('splits the 8 VP to both teams on a tie', () => {
      const award = new Banker();
      game.fundAward(player1, award);

      player1.production.add(Resource.MEGACREDITS, 3);
      player3.production.add(Resource.MEGACREDITS, 3);
      player2.production.add(Resource.MEGACREDITS, 3);
      player4.production.add(Resource.MEGACREDITS, 3);

      expect(player1.getVictoryPoints().awards).to.eq(8);
      expect(player2.getVictoryPoints().awards).to.eq(8);
    });

    it('gives the funder 1 Coordination when actually funded', () => {
      player1.conglomeratesData.coordination = 5;
      player1.megaCredits = 30;
      game.awards = [new Banker()];

      const actions = cast(player1.getActions(), OrOptions);
      const fundAwardAction = cast(
        actions.options.find((option): option is OrOptions =>
          option instanceof OrOptions && option.options[0]?.title === 'Banker'),
        OrOptions,
      );
      fundAwardAction.options[0].cb();
      runAllActions(game);

      expect(game.hasBeenFunded(new Banker())).is.true;
      expect(player1.conglomeratesData.coordination).to.eq(6);
    });

    it('the client model includes each team\'s combined score alongside per-player scores', () => {
      game.awards = [new Banker()];
      player1.production.add(Resource.MEGACREDITS, 4);
      player3.production.add(Resource.MEGACREDITS, 3); // player1's team: 7 combined
      player2.production.add(Resource.MEGACREDITS, 2);
      player4.production.add(Resource.MEGACREDITS, 2); // player2's team: 4 combined

      const awards = Server.getAwards(game);
      const banker = awards.find((a) => a.name === 'Banker')!;

      expect(banker.teamScores).to.have.length(2);
      const team1 = banker.teamScores!.find((t) => t.playerColors.includes(player1.color))!;
      const team2 = banker.teamScores!.find((t) => t.playerColors.includes(player2.color))!;
      expect(team1.score).to.eq(7);
      expect(team2.score).to.eq(4);
    });

    it('does not include team scores when Conglomerates is off', () => {
      const [soloGame] = testGame(4);
      soloGame.awards = [new Banker()];
      const awards = Server.getAwards(soloGame);
      const banker = awards.find((a) => a.name === 'Banker')!;
      expect(banker.teamScores).is.undefined;
    });
  });
});
