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
        <h2 className="text-xl font-semibold text-slate-900">
          Podsumowanie ogólne wybranego miesiąca
        </h2>
      </div>

      {loading ? (
        <TableSkeleton rows={2} columns={3} className="min-h-[180px]" />
      ) : (
        <table className="w-full table-fixed overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="w-1/3 px-4 py-3 border-b border-slate-100">
                Łączna suma oszczędnośći na stan poprzedniego miesiąca
              </th>
              <th className="w-1/3 px-4 py-3 border-b border-slate-100">
                Saldo w danym miesiącu
              </th>
              <th className="w-1/3 px-4 py-3 border-b border-slate-100">
                Planowany stan oszczędnośći pod koniec miesiąca
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap">
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
                      className="rounded p-1 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </td>

              <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-cyan-600 tabular-nums whitespace-nowrap">
                {formatSummaryCurrency(totals.savingsCurrent, showValues)}
              </td>

              <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-indigo-700 tabular-nums whitespace-nowrap">
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
