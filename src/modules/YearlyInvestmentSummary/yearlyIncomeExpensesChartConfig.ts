import {
  formatSummaryCurrency,
  maskCurrencyValue,
} from "../../lib/summaryVisibility";

export type MonthlyOverview = {
  income: number;
  planned: number;
  actual: number;
  investments: number;
};

export const monthLabels = [
  "Sty",
  "Lut",
  "Mar",
  "Kwi",
  "Maj",
  "Cze",
  "Lip",
  "Sie",
  "Wrz",
  "Paź",
  "Lis",
  "Gru",
];

export const CHART_WIDTH = 960;
export const CHART_HEIGHT = 340;
export const PADDING = { top: 42, right: 18, bottom: 48, left: 58 };

export const series = [
  {
    key: "income",
    label: "Przychód",
    color: "var(--app-chart-income)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-income) 78%, var(--app-foreground))",
    dashArray: undefined,
  },
  {
    key: "planned",
    label: "Planowane wydatki",
    color: "var(--app-chart-planned)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-planned) 78%, var(--app-foreground))",
    dashArray: "8 5",
  },
  {
    key: "actual",
    label: "Rzeczywiste wydatki",
    color: "var(--app-chart-actual)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-actual) 78%, var(--app-foreground))",
    dashArray: "2 4",
  },
  {
    key: "investments",
    label: "Inwestycje",
    color: "var(--app-chart-investments)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-investments) 78%, var(--app-foreground))",
    dashArray: "10 3 2 3",
  },
] as const;

export type SeriesKey = (typeof series)[number]["key"];

export const formatChartValue = (value: number, showValues: boolean) =>
  showValues ? formatSummaryCurrency(value, true) : maskCurrencyValue(value);
