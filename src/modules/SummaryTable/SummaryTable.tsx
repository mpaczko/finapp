import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { Pencil } from "lucide-react";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";

const SummaryTable = () => {
  const {
    totals,
    loading,
    editingPreviousMonthSavings,
    previousMonthSavingsInputValue,
    setEditingPreviousMonthSavings,
    setPreviousMonthSavingsInputValue,
    savePreviousMonthSavingsValue,
  } = useBudgetSummary();

  const [showValues] = useSummaryVisibility();

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Podsumowanie ogólne wybranego miesiąca
        </h2>
      </div>

      {loading ? (
        <TableSkeleton rows={2} columns={3} className="min-h-[180px]" />
      ) : (
        <table className="w-full table-fixed overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-sm">
          <thead>
            <tr className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th className="w-1/3 px-4 py-3 border-b border-border-soft">
                Łączna suma oszczędnośći na stan poprzedniego miesiąca
              </th>
              <th className="w-1/3 px-4 py-3 border-b border-border-soft">
                Saldo w danym miesiącu
              </th>
              <th className="w-1/3 px-4 py-3 border-b border-border-soft">
                Planowany stan oszczędnośći pod koniec miesiąca
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 border-b border-border-soft text-sm font-bold text-success tabular-nums whitespace-nowrap">
                {editingPreviousMonthSavings ? (
                  <input
                    type="number"
                    autoFocus
                    step="0.01"
                    value={previousMonthSavingsInputValue}
                    onChange={(e) =>
                      setPreviousMonthSavingsInputValue(e.target.value)
                    }
                    onBlur={() => {
                      const newValue =
                        parseFloat(previousMonthSavingsInputValue) || 0;
                      savePreviousMonthSavingsValue(newValue);
                      setEditingPreviousMonthSavings(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const newValue =
                          parseFloat(previousMonthSavingsInputValue) || 0;
                        savePreviousMonthSavingsValue(newValue);
                        setEditingPreviousMonthSavings(false);
                      }
                      if (e.key === "Escape") {
                        setEditingPreviousMonthSavings(false);
                      }
                    }}
                    className="w-32 px-2 py-1 border rounded text-right"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      {formatSummaryCurrency(
                        totals.previous_month_savings,
                        showValues,
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label="Edytuj oszczędności z poprzedniego miesiąca"
                      title="Edytuj"
                      onClick={() => {
                        setEditingPreviousMonthSavings(true);
                        setPreviousMonthSavingsInputValue(
                          totals.previous_month_savings.toFixed(2),
                        );
                      }}
                      className="rounded p-1 text-success transition hover:bg-success-surface hover:text-success focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </td>

              <td className="px-4 py-3 border-b border-border-soft text-sm font-bold text-info tabular-nums whitespace-nowrap">
                {formatSummaryCurrency(totals.savingsCurrent, showValues)}
              </td>

              <td className="px-4 py-3 border-b border-border-soft text-sm font-bold text-feature tabular-nums whitespace-nowrap">
                {formatSummaryCurrency(totals.savingsEndMonth, showValues)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SummaryTable;
