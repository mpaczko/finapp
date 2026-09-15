import { format, parse } from "date-fns";
import { v4 as uuid } from "uuid";

import {
  CsvParseResult,
  Transaction,
} from "./MultipleExpenses.types";

const CATEGORY_MAP: Record<string, string> = {
  biedronka: "jedzenie",
  lidl: "jedzenie",
  auchan: "jedzenie",
  carrefour: "jedzenie",
  "żabka": "jedzenie",
  zabka: "jedzenie",
  uber: "transport",
  bolt: "transport",
  orlen: "transport",
  shell: "transport",
  czynsz: "czynsz",
};

function detectCategory(description: string): string {
  const normalized = description.toLowerCase();

  for (const key in CATEGORY_MAP) {
    if (normalized.includes(key)) return CATEGORY_MAP[key];
  }

  return "inne";
}

export function parseCSV(csv: string): CsvParseResult {
  const lines = csv
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const validRows: Transaction[] = [];

  for (const line of lines.slice(1)) {
    const columns = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) ?? [];
    if (columns.length < 3) continue;

    // This is the original CSV-import calculation, restored verbatim:
    // the transaction amount is third from the end, with a comma decimal
    // separator converted before parseFloat.
    const rawAmount = columns[columns.length - 3]
      .replace(/"/g, "")
      .replace(",", ".");
    const cost = Math.abs(parseFloat(rawAmount));
    const name = columns[2].trim();
    const parsedDate = parse(columns[1], "dd-MM-yyyy", new Date());

    validRows.push({
      id: uuid(),
      name,
      cost,
      category: detectCategory(name),
      date: format(parsedDate, "yyyy-MM-dd"),
    });
  }

  return { validRows, invalidRows: [], warnings: [] };
}
