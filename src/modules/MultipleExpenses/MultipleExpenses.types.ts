export type Transaction = {
  id: string;
  date: string;
  name: string;
  category: string;
  cost: number;
};

export type CsvIssue = {
  line: number;
  reason: string;
  fileName?: string;
};

export type CsvParseResult = {
  validRows: Transaction[];
  invalidRows: CsvIssue[];
  warnings: CsvIssue[];
};
