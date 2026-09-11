import { v4 as uuid } from "uuid";

import {
  CsvIssue,
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

const DATE_HEADERS = ["data", "date", "transaction date", "booking date"];
const NAME_HEADERS = [
  "opis",
  "description",
  "nazwa",
  "title",
  "merchant",
  "beneficiary",
  "counterparty",
];
const AMOUNT_HEADERS = ["kwota", "amount", "value", "transaction amount"];

type CsvRecord = { fields: string[]; line: number };

function detectCategory(description: string): string {
  const normalized = description.toLowerCase();

  for (const key in CATEGORY_MAP) {
    if (normalized.includes(key)) return CATEGORY_MAP[key];
  }

  return "inne";
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findColumn(headers: string[], candidates: string[], fallback: number) {
  const index = headers.findIndex((header) =>
    candidates.some((candidate) => header === candidate || header.includes(candidate)),
  );
  return index >= 0 ? index : fallback;
}

function detectDelimiter(header: string) {
  const delimiters = [",", ";", "\t"] as const;
  return delimiters.reduce((best, delimiter) => {
    const count = header.split(delimiter).length - 1;
    return count > best.count ? { delimiter, count } : best;
  }, { delimiter: "," as string, count: -1 }).delimiter;
}

/** Parses RFC-4180-style records, including escaped quotes and line breaks in quotes. */
function readCsvRecords(input: string, delimiter: string): { records: CsvRecord[]; error?: CsvIssue } {
  const records: CsvRecord[] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;

  const pushRecord = () => {
    fields.push(field);
    if (fields.some((value) => value.trim() !== "")) records.push({ fields, line: recordLine });
    fields = [];
    field = "";
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char === '"') {
      if (inQuotes && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      fields.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      pushRecord();
      line += 1;
      recordLine = line;
      continue;
    }

    if (char === "\n") line += 1;
    field += char;
  }

  if (inQuotes) return { records, error: { line: recordLine, reason: "Niezamknięty cudzysłów w pliku CSV." } };
  if (field !== "" || fields.length > 0) pushRecord();
  return { records };
}

function parseDate(value: string) {
  const match = value.trim().match(/^(\d{4}|\d{2})[.\-/](\d{1,2})[.\-/](\d{1,4})$/);
  if (!match) return undefined;

  const [, first, middle, last] = match;
  const year = first.length === 4 ? Number(first) : Number(last);
  const month = Number(middle);
  const day = first.length === 4 ? Number(last) : Number(first);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) return undefined;

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function parseAmount(value: string) {
  const withoutCurrency = value
    .replace(/\b(PLN|EUR|USD|GBP|zł)\b/gi, "")
    .trim();
  if (!/^-?[0-9\s\u00A0,.]+$/.test(withoutCurrency)) return undefined;

  let normalized = withoutCurrency.replace(/[\s\u00A0]/g, "");
  if (!normalized) return undefined;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    normalized = normalized.replace(decimalSeparator === "," ? /\./g : /,/g, "");
    normalized = normalized.replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = normalized.replace(",", ".");
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.abs(amount) : undefined;
}

export function parseCSV(csv: string): CsvParseResult {
  const input = csv.replace(/^\uFEFF/, "");
  const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
  const { records, error } = readCsvRecords(input, detectDelimiter(firstLine));
  const invalidRows: CsvIssue[] = error ? [error] : [];
  const warnings: CsvIssue[] = [];

  if (records.length === 0) {
    return { validRows: [], invalidRows: [{ line: 1, reason: "Plik CSV jest pusty." }], warnings };
  }
  if (error) return { validRows: [], invalidRows, warnings };

  const headers = records[0].fields.map(normalizeHeader);
  const dateColumn = findColumn(headers, DATE_HEADERS, 1);
  const nameColumn = findColumn(headers, NAME_HEADERS, 2);
  const amountColumn = findColumn(headers, AMOUNT_HEADERS, Math.max(headers.length - 3, 0));
  const validRows: Transaction[] = [];

  for (const record of records.slice(1)) {
    const name = (record.fields[nameColumn] ?? "").trim();
    const date = parseDate(record.fields[dateColumn] ?? "");
    const amount = parseAmount(record.fields[amountColumn] ?? "");

    if (!name) {
      invalidRows.push({ line: record.line, reason: "Brak opisu transakcji." });
      continue;
    }
    if (name.length > 100) {
      invalidRows.push({ line: record.line, reason: "Opis transakcji jest dłuższy niż 100 znaków." });
      continue;
    }
    if (!date) {
      invalidRows.push({ line: record.line, reason: "Nieprawidłowa data (obsługiwane: RRRR-MM-DD, DD-MM-RRRR, DD.MM.RRRR)." });
      continue;
    }
    if (amount === undefined) {
      invalidRows.push({ line: record.line, reason: "Nieprawidłowa kwota." });
      continue;
    }
    if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
      invalidRows.push({ line: record.line, reason: "Kwota może mieć maksymalnie dwa miejsca po przecinku." });
      continue;
    }

    validRows.push({ id: uuid(), name, cost: amount, category: detectCategory(name), date });
  }

  if (validRows.length === 0 && invalidRows.length === 0) {
    warnings.push({ line: 1, reason: "Nie znaleziono wierszy danych po nagłówku." });
  }

  return { validRows, invalidRows, warnings };
}
