export const SUMMARY_VISIBILITY_STORAGE_KEY = "finapp.summaryVisibility";

export const parseSummaryVisibilitySetting = (
  value: string | null,
): boolean => {
  if (value === null) return false;

  return value === "true";
};

const parseCurrencyNumber = (
  value: number | string | null | undefined,
): number => {
  if (value === null || value === undefined) return 0;

  const normalized = String(value)
    .replace(/zł/gi, "")
    .replace(/\s+/g, "")
    .replace(",", ".")
    .trim();

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const maskCurrencyValue = (value: number | string): string => {
  const num = parseCurrencyNumber(value);

  if (!Number.isFinite(num)) {
    return "****.** zł";
  }

  return "****.** zł";
};

export const formatSummaryCurrency = (
  value: number | string | null | undefined,
  visible: boolean,
): string => {
  if (!visible) {
    return maskCurrencyValue(value ?? 0);
  }

  const numericValue = parseCurrencyNumber(value);
  if (!Number.isFinite(numericValue)) {
    return "0.00 zł";
  }

  return `${numericValue.toFixed(2)} zł`;
};
