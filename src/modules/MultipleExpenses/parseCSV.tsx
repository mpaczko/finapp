import { parse, format } from "date-fns";
import { Transaction } from "./MultipleExpenses.types";
import { v4 as uuid } from "uuid";

const CATEGORY_MAP: Record<string, string> = {
  biedronka: "jedzenie",
  lidl: "jedzenie",
  auchan: "jedzenie",
  carrefour: "jedzenie",
  żabka: "jedzenie",
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
    if (normalized.includes(key)) {
      return CATEGORY_MAP[key];
    }
  }

  return "inne";
}

export function parseCSV(csv: string): Transaction[] {
  const lines = csv
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const dataLines = lines.slice(1);

  const result: Transaction[] = [];

  for (const line of dataLines) {
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    if (cols.length < 3) continue;

    const rawAmount = cols[cols.length - 3].replace(/"/g, "").replace(",", ".");

    const cost = Math.abs(parseFloat(rawAmount));
    const name = cols[2].trim();

    const parsedDate = parse(cols[1], "dd-MM-yyyy", new Date());
    const formattedDate = format(parsedDate, "yyyy-MM-dd");

    result.push({
      id: uuid(),
      name,
      cost,
      category: detectCategory(name),
      date: formattedDate,
    });
  }

  return result;
}
