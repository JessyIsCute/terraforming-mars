import {expect} from 'chai';
import {MutationMarkets} from '../../src/server/mutationmarkets/MutationMarkets';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../src/common/mutationmarkets/MutationDefinitions';
import {Tag} from '../../src/common/cards/Tag';
import {IGame} from '../../src/server/IGame';
import {IProjectCard} from '../../src/server/cards/IProjectCard';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';

describe('MutationMarkets bidding', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;
  let cardA: IProjectCard; // slot 1: Gigantic Undertakings only
  let cardB: IProjectCard; // slot 2: Tag Diversifier + Gigantic Undertakings
  let cardC: IProjectCard; // slot 3: Tag Diversifier + Mini Mutation
  let cardD: IProjectCard; // slot 4: Mini Mutation only

  beforeEach(() => {
    [game, player, player2] = testGame(2, {mutationMarketsExpansion: true});
    player.megaCredits = 50;
    player2.megaCredits = 50;
    const data = game.mutationMarketData!;

    cardA = fakeCard({cost: 14, tags: []});
    cardB = fakeCard({cost: 14, tags: [Tag.SCIENCE]});
    cardC = fakeCard({cost: 10, tags: [Tag.PLANT]});
    cardD = fakeCard({cost: 10, tags: []});
    data.projectSlots = [fakeCard(), cardA, cardB, cardC, cardD, fakeCard()];
    data.projectAuctions = new Array(6).fill(undefined);
    data.alignedRow = [undefined, {mutation: MutationName.TAG_DIVERSIFIER}, undefined];
    data.offsetRow = [undefined, {mutation: MutationName.GIGANTIC_UNDERTAKINGS}, {mutation: MutationName.MINI_MUTATION}, undefined];

    // player: qualifies for Tag Diversifier (5 unique tags) -- covers slots 2 and 3.
    for (const tag of [Tag.SCIENCE, Tag.BUILDING, Tag.PLANT, Tag.ANIMAL, Tag.SPACE]) {
      player.playedCards.push(fakeCard({tags: [tag]}));
    }
    // player2: qualifies for Gigantic Undertakings (slots 1,2) and Mini Mutation (slots 3,4).
    player2.expensiveCardsPlayed = 2;
    player2.cheapCardsPlayed = 7;
  });

  it('biddableSlots respects requirement satisfaction and active-slot-only', () => {
    expect(MutationMarkets.biddableSlots(game, player)).to.have.members([2, 3]);
    expect(MutationMarkets.biddableSlots(game, player2)).to.have.members([1, 2, 3, 4]);
  });

  it('minimumBidFor is the higher of the covering mutations\' minimums', () => {
    const data = game.mutationMarketData!;
    expect(MutationMarkets.minimumBidFor(data, 1)).to.eq(MUTATION_DEFINITIONS[MutationName.GIGANTIC_UNDERTAKINGS].minimumBid);
    expect(MutationMarkets.minimumBidFor(data, 2)).to.eq(Math.max(
      MUTATION_DEFINITIONS[MutationName.TAG_DIVERSIFIER].minimumBid,
      MUTATION_DEFINITIONS[MutationName.GIGANTIC_UNDERTAKINGS].minimumBid));
  });

  it('placeBid escrows M€ and rejects a bid below the minimum/current high', () => {
    const startingMc = player.megaCredits;
    expect(() => MutationMarkets.placeBid(game, player, 2, 1)).to.throw(); // below the minimum (2)
    MutationMarkets.placeBid(game, player, 2, 2); // exactly the minimum
    expect(player.megaCredits).to.eq(startingMc - 2);
    expect(game.mutationMarketData!.projectAuctions[2]!.highBidder).to.eq(player.id);

    expect(() => MutationMarkets.placeBid(game, player2, 2, 2)).to.throw(); // must strictly exceed the current high
  });

  it('outbidding keeps the previous bidder\'s M€ escrowed (only refunded when the auction resolves)', () => {
    const data = game.mutationMarketData!;
    const startingMc = player.megaCredits;
    MutationMarkets.placeBid(game, player, 3, 2);
    expect(player.megaCredits).to.eq(startingMc - 2);

    MutationMarkets.placeBid(game, player2, 3, 5);
    expect(player.megaCredits).to.eq(startingMc - 2); // still escrowed, not refunded yet
    expect(data.projectAuctions[3]!.highBidder).to.eq(player2.id);
    expect(data.projectAuctions[3]!.escrow[player2.id]).to.eq(5);

    MutationMarkets.resolveAuction(game, 3);
    expect(player.megaCredits).to.eq(startingMc); // now refunded, having lost the auction
  });

  it('a same-player re-bid only charges the incremental difference', () => {
    const startingMc = player2.megaCredits;
    MutationMarkets.placeBid(game, player2, 1, 2);
    expect(player2.megaCredits).to.eq(startingMc - 2);

    MutationMarkets.placeBid(game, player2, 1, 5);
    expect(player2.megaCredits).to.eq(startingMc - 5); // only 3 more deducted, not 5 more
  });

  it('resolveIfReturned fires only once the table has gone all the way around untouched', () => {
    const data = game.mutationMarketData!;
    MutationMarkets.placeBid(game, player, 3, 2);
    expect(data.projectAuctions[3]).is.not.undefined;

    // player2's turn starts without countering -- doesn't resolve (checkpoint is player's id).
    MutationMarkets.resolveIfReturned(game, player2);
    expect(data.projectAuctions[3]).is.not.undefined;

    // player's turn starts again, untouched in between -- resolves now.
    MutationMarkets.resolveIfReturned(game, player);
    expect(data.projectAuctions[3]).is.undefined;
    expect(player.cardsInHand).to.include(cardC);
  });

  it('an intervening bid updates the checkpoint and prevents resolution', () => {
    const data = game.mutationMarketData!;
    MutationMarkets.placeBid(game, player, 3, 2);
    MutationMarkets.placeBid(game, player2, 3, 3); // player2 also qualifies (Mini Mutation)

    // It's player's turn again, but they were outbid -- must not resolve to them.
    MutationMarkets.resolveIfReturned(game, player);
    expect(data.projectAuctions[3]).is.not.undefined;
    expect(data.projectAuctions[3]!.highBidder).to.eq(player2.id);
  });

  it('resolution refunds losers, grants the reward, applies the qualifying mutation, and delivers the card', () => {
    const player2StartingMc = player2.megaCredits;
    const playerStartingTr = player.terraformRating;
    MutationMarkets.placeBid(game, player2, 3, 4); // player2 loses
    MutationMarkets.placeBid(game, player, 3, 5); // player wins -- qualifies only for Tag Diversifier here

    MutationMarkets.resolveAuction(game, 3);

    expect(player2.megaCredits).to.eq(player2StartingMc); // fully refunded
    expect(player.cardsInHand).to.include(cardC);
    expect(cardC.mutations).has.lengthOf(1);
    expect(cardC.mutations![0].mutation).to.eq(MutationName.TAG_DIVERSIFIER);
    expect(player.terraformRating).to.eq(playerStartingTr + 1); // Tag Diversifier grants +1 TR
  });

  it('a winner qualifying for both covering mutations gets both applied', () => {
    // Make player2 qualify for Tag Diversifier too, on top of Gigantic Undertakings (slot 2).
    for (const tag of [Tag.SCIENCE, Tag.BUILDING, Tag.PLANT, Tag.ANIMAL, Tag.SPACE]) {
      player2.playedCards.push(fakeCard({tags: [tag]}));
    }
    MutationMarkets.placeBid(game, player2, 2, 2);
    MutationMarkets.resolveAuction(game, 2);

    expect(player2.cardsInHand).to.include(cardB);
    expect(cardB.mutations).has.lengthOf(2);
    const mutationNames = cardB.mutations!.map((m) => m.mutation);
    expect(mutationNames).to.have.members([MutationName.TAG_DIVERSIFIER, MutationName.GIGANTIC_UNDERTAKINGS]);
  });

  it('generation end sweeps any still-open auction before shifting', () => {
    const data = game.mutationMarketData!;
    MutationMarkets.placeBid(game, player, 3, 2);

    MutationMarkets.onGenerationEnd(game);

    expect(player.cardsInHand).to.include(cardC);
    expect(data.projectAuctions.every((auction) => auction === undefined)).is.true;
  });

  it('an open auction stays attached to its card when another slot is claimed and everything shifts', () => {
    const data = game.mutationMarketData!;
    MutationMarkets.placeBid(game, player, 3, 2); // auction on cardC at slot 3

    MutationMarkets.claimProjectSlot(game, 1); // claims slot 1, sliding 2,3,4,5 down to 1,2,3,4

    // The auction should have followed cardC from slot 3 down to slot 2.
    expect(data.projectSlots[2]).to.eq(cardC);
    expect(data.projectAuctions[2]).is.not.undefined;
    expect(data.projectAuctions[2]!.highBidder).to.eq(player.id);
    expect(data.projectAuctions[3]).is.undefined;
  });
});
