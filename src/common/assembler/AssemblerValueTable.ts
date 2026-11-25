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

export type AssemblerValueTableModel = {
  sections: ReadonlyArray<ValueTableSection>,
};
