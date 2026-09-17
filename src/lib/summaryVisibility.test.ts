import { describe, expect, it } from "vitest";
import {
  formatSummaryCurrency,
  maskCurrencyValue,
  parseSummaryVisibilitySetting,
} from "./summaryVisibility";

describe("summaryVisibility", () => {
  it("masks numeric currency values with asterisks", () => {
    expect(maskCurrencyValue(2000)).toBe("****.** zł");
    expect(maskCurrencyValue("1234.56")).toBe("****.** zł");
    expect(maskCurrencyValue("1234,56 zł")).toBe("****.** zł");
  });

  it("formats currency strings with suffix safely", () => {
    expect(formatSummaryCurrency("1234,56 zł", true)).toBe("1234.56 zł");
    expect(formatSummaryCurrency("4321.00 zł", true)).toBe("4321.00 zł");
  });

  it("parses persisted localStorage setting safely", () => {
    expect(parseSummaryVisibilitySetting("true")).toBe(true);
    expect(parseSummaryVisibilitySetting("false")).toBe(false);
    expect(parseSummaryVisibilitySetting("invalid")).toBe(false);
    expect(parseSummaryVisibilitySetting(null)).toBe(false);
  });
});
