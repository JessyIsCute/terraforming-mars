import {expect} from 'chai';
import {
  SimpleBoardCodecError,
  decodeSimpleBoard,
  encodeSimpleBoard,
  validateSimpleBoard,
} from '../../../src/common/boards/simpleBoardCodec';
import {blankSimpleBoard} from '../../../src/common/boards/SimpleCustomBoardDefinition';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {bytesToBase64url} from '../../../src/common/utils/base64url';

describe('simpleBoardCodec', () => {
  it('round-trips a blank Moon board', () => {
    const def = blankSimpleBoard('moon', 'Test Moon');
    const decoded = decodeSimpleBoard(encodeSimpleBoard(def));
    expect(decoded).to.deep.eq(def);
    expect(decoded.spaces).to.have.length(35);
  });

  it('round-trips a blank Venus Phase 2 board', () => {
    const def = blankSimpleBoard('venusPhase2', 'Test Venus');
    const decoded = decodeSimpleBoard(encodeSimpleBoard(def));
    expect(decoded).to.deep.eq(def);
    expect(decoded.spaces).to.have.length(30);
  });

  it('round-trips varied space types and bonuses on Moon', () => {
    const def = blankSimpleBoard('moon', 'Varied');
    def.spaces[0].spaceType = SpaceType.LUNAR_MINE;
    def.spaces[0].bonus = [SpaceBonus.TITANIUM, SpaceBonus.TITANIUM];
    def.spaces[1].bonus = [SpaceBonus.STEEL, SpaceBonus.DRAW_CARD];

    const decoded = decodeSimpleBoard(encodeSimpleBoard(def));
    expect(decoded).to.deep.eq(def);
  });

  it('round-trips varied space types on Venus', () => {
    const def = blankSimpleBoard('venusPhase2', 'Varied');
    def.spaces[0].spaceType = SpaceType.GASLIGHT;

    const decoded = decodeSimpleBoard(encodeSimpleBoard(def));
    expect(decoded).to.deep.eq(def);
  });

  it('rejects a Moon-only space type on a Venus board', () => {
    const def = blankSimpleBoard('venusPhase2', 'Bad');
    def.spaces[0].spaceType = SpaceType.LUNAR_MINE;
    expect(() => validateSimpleBoard(def)).to.throw(SimpleBoardCodecError);
  });

  it('rejects a Venus-only space type on a Moon board', () => {
    const def = blankSimpleBoard('moon', 'Bad');
    def.spaces[0].spaceType = SpaceType.GASLIGHT;
    expect(() => validateSimpleBoard(def)).to.throw(SimpleBoardCodecError);
  });

  it('rejects a name that is too long', () => {
    const def = blankSimpleBoard('moon', 'x'.repeat(25));
    expect(() => validateSimpleBoard(def)).to.throw(SimpleBoardCodecError);
  });

  it('rejects an empty name', () => {
    const def = blankSimpleBoard('moon', '');
    expect(() => validateSimpleBoard(def)).to.throw(SimpleBoardCodecError);
  });

  it('rejects a definition with the wrong number of spaces', () => {
    const def = blankSimpleBoard('moon', 'Short');
    def.spaces.pop();
    expect(() => validateSimpleBoard(def)).to.throw(SimpleBoardCodecError);
  });

  it('rejects a code with the wrong prefix', () => {
    expect(() => decodeSimpleBoard('NOTACODE')).to.throw(SimpleBoardCodecError);
  });

  it('rejects a garbled code after the prefix', () => {
    expect(() => decodeSimpleBoard('TMBS1!!!not-valid-base64!!!')).to.throw(SimpleBoardCodecError);
  });

  it('rejects a decoded wire payload with an unknown board type', () => {
    // Craft a code decode would otherwise accept structurally, but with a board type that isn't
    // 'moon'/'venusPhase2' -- this can't happen through encodeSimpleBoard's typed input, only via
    // a hand-crafted or future-version code, so build the wire payload directly.
    const wire = {v: 1, t: 'mars', n: 'Test', s: []};
    const bytes = new TextEncoder().encode(JSON.stringify(wire));
    const code = 'TMBS1' + bytesToBase64url(bytes);
    expect(() => decodeSimpleBoard(code)).to.throw(SimpleBoardCodecError);
  });
});
