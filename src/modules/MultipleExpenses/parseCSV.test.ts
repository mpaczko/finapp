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

  it("uses the negative expense column instead of the following account balance", () => {
    const result = parseCSV(
      "2026-09-28,27-09-2026,'12 1090 2835 0000 0001 5886 5644,MICHAŁ PĄCZKO UL. POPRZECZNA 9 46-050 TARNÓW OPOLSKI,PLN,\"5434,66\",\"5661,34\",3,\n27-09-2026,27-09-2026,Zakup BLIK PayPro S.A. Pastelowa 860-198 Poznan ref:95040219795,PayPro S.A. Pastelowa 860-198 Poznan,72 1090 1489 0000 0000 4800 3393,\"-123,97\",\"5661,34\",1,\n28-09-2026,28-09-2026,Zakup BLIK allegro.pl WIERZBIĘCICE 1b ref:95048583566,allegro.pl WIERZBIĘCICE 1b,72 1090 1489 0000 0000 4800 3393,\"-188,67\",\"5235,99\",2,",
    );

    expect(result.invalidRows).toEqual([]);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows.map((transaction) => transaction.cost)).toEqual([
      123.97,
      188.67,
    ]);
  });
});
