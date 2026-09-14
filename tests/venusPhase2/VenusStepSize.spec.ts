import {expect} from 'chai';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {setVenusScaleLevel} from '../TestingUtils';
import {GrantVenusAltTrackBonusDeferred} from '../../src/server/venusNext/GrantVenusAltTrackBonusDeferred';
import {cast} from '@/common/utils/utils';

describe('Venus Phase 2 step size', () => {
  let game: IGame;
  let player: TestPlayer;

  it('moves the track by 1 per raise, not the official 2', () => {
    [game, player] = testGame(1, {venusPhase2Expansion: true});
    setVenusScaleLevel(game, 10);
    game.increaseVenusScaleLevel(player, 1);
    expect(game.getVenusScaleLevel()).to.eq(11);
  });

  it('without Venus Phase 2, still moves by the official 2', () => {
    [game, player] = testGame(1, {});
    setVenusScaleLevel(game, 10);
    game.increaseVenusScaleLevel(player, 1);
    expect(game.getVenusScaleLevel()).to.eq(12);
  });

  it('the draw-a-card bonus at 8 still fires at the same absolute value', () => {
    [game, player] = testGame(1, {venusPhase2Expansion: true});
    setVenusScaleLevel(game, 7);
    player.cardsInHand = [];
    game.increaseVenusScaleLevel(player, 1);
    expect(game.getVenusScaleLevel()).to.eq(8);
    expect(player.cardsInHand).has.length(1);
  });

  it('the TR bonus at 16 still fires at the same absolute value', () => {
    [game, player] = testGame(1, {venusPhase2Expansion: true});
    setVenusScaleLevel(game, 15);
    const trBefore = player.terraformRating;
    game.increaseVenusScaleLevel(player, 1);
    expect(game.getVenusScaleLevel()).to.eq(16);
    // +1 for the raise itself, +1 for the bonus.
    expect(player.terraformRating).to.eq(trBefore + 2);
  });

  it('grants 1 TR per raise, same as before (unaffected by the smaller step)', () => {
    [game, player] = testGame(1, {venusPhase2Expansion: true});
    setVenusScaleLevel(game, 0);
    const trBefore = player.terraformRating;
    game.increaseVenusScaleLevel(player, 1);
    expect(player.terraformRating).to.eq(trBefore + 1);
  });

  // altVenusBoard grants "1 wild resource per 2 track units" based on absolute track position
  // (Game.ts's minimalBaseline/maximumBaseline), a pacing constant that predates Venus Phase 2
  // and is independent of the raise step size. Before Venus Phase 2, every raise moved the track
  // by exactly 2, so a raise's start/end were always both even or both odd relative to that
  // pacing -- the division by 2 was always a whole number. Venus Phase 2's 1-unit step breaks
  // that assumption: a raise can now land on an odd track value, which would otherwise divide
  // unevenly. Game.ts now floors the result (see the comment at its `standardResourcesGranted`
  // line) so this combination degrades gracefully -- a raise that only completes half of a
  // 2-unit interval grants nothing yet, rather than handing GainResources an unsatisfiable
  // fractional count -- instead of leaving players stuck unable to submit the resulting prompt.
  describe('combined with altVenusBoard', () => {
    it('a multi-unit raise that still crosses a full 2-unit interval in one call grants the resource, unaffected', () => {
      // `increments` counts raw track units here (Venus Phase 2's step is 1), so increments=2
      // still raises 16->18 in a single call, exactly like an official 2-unit-step raise would --
      // confirming the floor fix only changes behavior for the fractional case, not this one.
      [game, player] = testGame(1, {venusPhase2Expansion: true, altVenusBoard: true});
      setVenusScaleLevel(game, 16);
      game.increaseVenusScaleLevel(player, 2);
      expect(game.getVenusScaleLevel()).to.eq(18);
      const deferred = cast(game.deferredActions.pop(), GrantVenusAltTrackBonusDeferred);
      expect(deferred.standardResourceCount).to.eq(1);
      expect(deferred.wildResource).is.false;
    });

    it('a 1-unit raise that only half-completes a 2-unit interval grants nothing (floored, not fractional)', () => {
      [game, player] = testGame(1, {venusPhase2Expansion: true, altVenusBoard: true});
      setVenusScaleLevel(game, 17);
      game.increaseVenusScaleLevel(player, 1);
      expect(game.getVenusScaleLevel()).to.eq(18);
      // (18-17)/2 = 0.5, floored to 0 -- and since grantWildResource is also false here, no
      // deferred action is created at all.
      expect(game.deferredActions.pop()).is.undefined;
    });

    it('crossing 16-18 one unit at a time never grants the resource an official 2-unit raise would have', () => {
      // Contrast with AltVenusTrackBonuses.spec.ts's "16-18 grants standard resource": an
      // official (2-unit-step) raise from 16 sees minimalBaseline=16, maximumBaseline=18, a full
      // 2-unit interval, and grants 1 resource. A Venus Phase 2 player crossing the same span one
      // unit at a time never sees a full 2-unit interval in a single raise -- because
      // minimalBaseline re-anchors to the *current* track value on every call -- so both raises
      // floor to 0 and the resource is never granted. This is the known minor gap documented
      // above: not a crash, but a real pacing difference for this fan-expansion combination.
      [game, player] = testGame(1, {venusPhase2Expansion: true, altVenusBoard: true});
      setVenusScaleLevel(game, 16);
      game.increaseVenusScaleLevel(player, 1); // 16 -> 17.
      expect(game.deferredActions.pop()).is.undefined;
      game.increaseVenusScaleLevel(player, 1); // 17 -> 18.
      expect(game.deferredActions.pop()).is.undefined;
    });
  });
});
