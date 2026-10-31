import { Eye, EyeOff } from "lucide-react";

type YearlyIncomeExpensesChartControlsProps = {
  showMonthlyValues: boolean;
  showAverage: boolean;
  onToggleMonthlyValues: () => void;
  onToggleAverage: () => void;
};

const YearlyIncomeExpensesChartControls = ({
  showMonthlyValues,
  showAverage,
  onToggleMonthlyValues,
  onToggleAverage,
}: YearlyIncomeExpensesChartControlsProps) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={onToggleMonthlyValues}
      className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground-soft transition hover:bg-surface-subtle"
      aria-pressed={showMonthlyValues}
      aria-label={
        showMonthlyValues
          ? "Ukryj kwoty na wykresie"
          : "Pokaż kwoty na wykresie"
      }
    >
      {showMonthlyValues ? (
        <EyeOff size={14} aria-hidden="true" />
      ) : (
        <Eye size={14} aria-hidden="true" />
      )}
      {showMonthlyValues ? "Ukryj kwoty" : "Pokaż kwoty"}
    </button>
    <button
      type="button"
      onClick={onToggleAverage}
      className="rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground-soft transition hover:bg-surface-subtle"
      aria-pressed={showAverage}
    >
      {showAverage ? "Ukryj średnie" : "Pokaż średnie"}
    </button>
  </div>
);

export default YearlyIncomeExpensesChartControls;
