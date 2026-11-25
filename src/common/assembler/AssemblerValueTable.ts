/**
 * Assembler (fan): the value table shown on the card generator page, built on the server from the
 * generator's own numbers (src/server/assembler/AssemblerValues.ts), so the page can't drift.
 */
export type ValueTableSection = {
  title: string,
  /** One or two sentences above the table. */
  intro?: string,
  columns: ReadonlyArray<string>,
  /** Columns to right-align (numbers). Same length as `columns`. */
  numeric: ReadonlyArray<boolean>,
  rows: ReadonlyArray<ReadonlyArray<string>>,
};

/** One number from the table that the rating mode asks about. */
export type RateableValue = {
  /** Stable id, e.g. 'stock.steel', 'tag.science', 'req.tags.3'. */
  key: string,
  /** What it is, e.g. "1 steel (in stock)". */
  label: string,
  /** The table's value in M€. Costs (requirements, drawbacks) are positive: how much they take off. */
  value: number,
  /** Section it belongs to, for grouping. */
  group: string,
};

export type AssemblerValueTableModel = {
  sections: ReadonlyArray<ValueTableSection>,
  rateable: ReadonlyArray<RateableValue>,
};
