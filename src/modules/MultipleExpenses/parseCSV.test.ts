import { describe, expect, it } from "vitest";

import { parseCSV } from "./parseCSV";

describe("parseCSV", () => {
  it("parses common Polish bank exports and detects a category", () => {
    const result = parseCSV("Data;Opis;Kwota\n12.09.2026;Biedronka;12,50 PLN");

    expect(result.invalidRows).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]).toMatchObject({
      date: "2026-09-12",
      name: "Biedronka",
      cost: 12.5,
      category: "jedzenie",
    });
  });

  it("reports malformed rows without rejecting valid transactions", () => {
    const result = parseCSV(
      "Data,Opis,Kwota\n2026-09-12,Uber,15.00\nnie-data,Bez daty,10",
    );

    expect(result.validRows).toHaveLength(1);
    expect(result.invalidRows).toEqual([
      {
        line: 3,
        reason:
          "Nieprawidłowa data (obsługiwane: RRRR-MM-DD, DD-MM-RRRR, DD.MM.RRRR).",
      },
    ]);
  });

  it("prefers a currency-marked card payment from the description over an account balance", () => {
    const result = parseCSV(
      "Data,Opis,Kwota\n01.09.2026,VB DEBIT 423725******3832 PŁATNOŚĆ KARTĄ 19.72 PLN JMP S.A. BIEDRONKA,3833.07",
    );

    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]).toMatchObject({
      cost: 19.72,
      category: "jedzenie",
    });
  });
});
