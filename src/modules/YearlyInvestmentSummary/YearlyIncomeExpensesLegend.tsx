import {
  formatChartValue,
  series,
  type SeriesKey,
} from "./yearlyIncomeExpensesChartConfig";

type YearlyIncomeExpensesLegendProps = {
  totals: number[];
  averages: number[];
  showValues: boolean;
  visibility: Record<SeriesKey, boolean>;
  onToggle: (key: SeriesKey) => void;
};

const YearlyIncomeExpensesLegend = ({
  totals,
  averages,
  showValues,
  visibility,
  onToggle,
}: YearlyIncomeExpensesLegendProps) => (
  <div
    className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
    aria-label="Legenda wykresu"
  >
    {series.map(({ key, label, color }, index) => (
      <button
        key={key}
        type="button"
        onClick={() => onToggle(key)}
        className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-xs transition hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary ${
          visibility[key] ? "text-muted" : "opacity-45"
        }`}
        aria-pressed={visibility[key]}
        aria-label={`${visibility[key] ? "Ukryj" : "Pokaż"} serię: ${label}`}
        title={`${visibility[key] ? "Ukryj" : "Pokaż"}: ${label}`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            visibility[key] ? "" : "ring-1 ring-current"
          }`}
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className={visibility[key] ? "" : "line-through"}>{label}:</span>
        <span className="font-semibold text-foreground-soft">
          {formatChartValue(totals[index], showValues)}
        </span>
        <span className="text-muted">
          śr. {formatChartValue(averages[index], showValues)}
        </span>
      </button>
    ))}
  </div>
);

export default YearlyIncomeExpensesLegend;
