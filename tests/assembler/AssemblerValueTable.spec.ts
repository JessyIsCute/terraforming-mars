import {expect} from 'chai';
import {buildValueTable, describeSpec} from '../../src/server/assembler/AssemblerValueTable';
import * as V from '../../src/server/assembler/AssemblerValues';
import {Tag} from '../../src/common/cards/Tag';

describe('AssemblerValueTable', () => {
  const table = buildValueTable();

  it('every row fills every column', () => {
    for (const s of table.sections) {
      expect(s.numeric, s.title).has.length(s.columns.length);
      for (const row of s.rows) {
        expect(row, s.title).has.length(s.columns.length);
      }
    }
  });

  it('shows the generator\'s own numbers', () => {
    const resources = table.sections.find((s) => s.title === 'Resources')!;
    expect(resources.rows.find((r) => r[0] === 'Titanium')).deep.eq(['Titanium', String(V.STOCK_VALUE.titanium), String(V.PRODUCTION_VALUE.titanium), 'Metal']);
    const effects = table.sections.find((s) => s.title === 'One-off effects')!;
    expect(effects.rows.find((r) => r[0] === 'Place an ocean tile')?.[1]).eq(String(V.OCEAN_VALUE));
  });

  it('lists every printed card with its preset', () => {
    const printed = table.sections.find((s) => s.title.startsWith('Printed'))!;
    expect(printed.rows).has.length(14);
    expect(printed.rows.find((r) => r[0] === 'Bargain Bin')?.[3]).eq('Low complexity, cost at most 8 M€');
    for (const row of printed.rows) {
      expect(row[2], row[0]).is.not.empty;
    }
  });

  it('describes presets in words', () => {
    expect(describeSpec({})).eq('Random');
    expect(describeSpec({tags: [Tag.SCIENCE], minCost: 10, maxCost: 20, costAdjust: -5, categories: ['cooling']}))
      .eq('At least 1 science tag, cost 10–20 M€, then −5 M€, with Cooling');
  });
  it('lists single values to rate, with unique keys', () => {
    const {rateable} = buildValueTable();
    expect(rateable.length).gt(30);
    expect(new Set(rateable.map((r) => r.key)).size).eq(rateable.length);
    expect(rateable.find((r) => r.key === 'stock.steel')?.value).eq(2);
    expect(rateable.find((r) => r.key === 'req.tags.3')?.value).eq(5.2);
    for (const r of rateable) {
      expect(r.value, r.key).gt(0);
    }
  });
});
