import { useBudgetSummary } from "../../hooks/useBudgetSummary";

const SummaryTable = () => {
  const {
    totals,
    loading,
    editingIncome,
    incomeInputValue,
    editingPreviousMonthSavings,
    previousMonthSavingsInputValue,
    setEditingIncome,
    setIncomeInputValue,
    setEditingPreviousMonthSavings,
    setPreviousMonthSavingsInputValue,
    saveIncomeValue,
    savePreviousMonthSavingsValue,
  } = useBudgetSummary();

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold text-slate-900 pt-3 pb-2">
        Podsumowanie ogólne wybranego miesiąca
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">⏳ Ładowanie danych...</div>
      )}

      <table className="w-full table-fixed overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Przychód netto
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Rzeczywiste wydatki
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Różnica (przychód - rzeczywiste)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap cursor-pointer"
              onClick={() => {
                setEditingIncome(true);
                setIncomeInputValue(totals.income);
              }}
            >
              {editingIncome ? (
                <input
                  type="number"
                  autoFocus
                  step="0.01"
                  value={incomeInputValue}
                  onChange={(e) => setIncomeInputValue(e.target.value)}
                  onBlur={() => {
                    const newValue = parseFloat(incomeInputValue) || 0;
                    saveIncomeValue(newValue);
                    setEditingIncome(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const newValue = parseFloat(incomeInputValue) || 0;
                      saveIncomeValue(newValue);
                      setEditingIncome(false);
                    }
                    if (e.key === "Escape") setEditingIncome(false);
                  }}
                  className="w-32 px-2 py-1 border rounded text-right"
                />
              ) : (
                `${totals.income} zł`
              )}
            </td>
            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-rose-600 tabular-nums whitespace-nowrap">
              {totals.actual} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-amber-700 tabular-nums whitespace-nowrap">
              {totals.diffIncomeActual} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full table-fixed overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Przychód netto
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Planowane wydatki
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Różnica (przychód - planowane)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap">
              {totals.income} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-orange-600 tabular-nums whitespace-nowrap">
              {totals.planned} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-sky-700 tabular-nums whitespace-nowrap">
              {totals.diffIncomePlanned} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full table-fixed overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Łączna suma oszczędnośći na stan poprzedniego miesiąca
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Oszczędności obecnie
            </th>
            <th className="w-1/3 px-4 py-3 border-b border-slate-100">
              Planowany stan oszczędnośći pod koniec miesiąca
            </th>
            {/* <th className="px-4 py-3 border-b border-slate-100 w-[300px] text-left whitespace-nowrap">
              Szacowana wartość inwestycji
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px] text-left whitespace-nowrap">
              Oszczędności łącznie
            </th> */}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-emerald-700 tabular-nums whitespace-nowrap cursor-pointer"
              onClick={() => {
                setEditingPreviousMonthSavings(true);
                setPreviousMonthSavingsInputValue(
                  totals.previous_month_savings.toFixed(2),
                );
              }}
            >
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
                `${totals.previous_month_savings.toFixed(2)} zł`
              )}
            </td>

            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-cyan-600 tabular-nums whitespace-nowrap">
              {totals.savingsCurrent} zł
            </td>

            <td className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-indigo-700 tabular-nums whitespace-nowrap">
              {totals.savingsEndMonth} zł
            </td>

            {/* <td className="px-4 py-2 border-b font-semibold text-purple-700">
              {totalInvestments} zł
            </td>

            <td className="px-4 py-2 border-b font-semibold text-blue-700">
              {totalSavings} zł
            </td> */}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
