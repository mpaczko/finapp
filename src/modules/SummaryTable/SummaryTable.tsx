import { useBudgetSummary } from "../../hooks/useBudgetSummary";

const SummaryTable = () => {
  const {
    totals,
    loading,
    editingIncome,
    incomeInputValue,
    setEditingIncome,
    setIncomeInputValue,
    saveIncomeValue,
  } = useBudgetSummary();

  return (
    <div className="p-4 flex flex-col gap-4 items-start">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">
        Podsumowanie ogólne wybranego miesiąca
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">⏳ Ładowanie danych...</div>
      )}

      <table className="inline-table table-fixed border border-slate-100 bg-white rounded-xl shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Przychód netto
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Rzeczywiste wydatki
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Różnica (przychód - rzeczywiste)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className="px-4 py-3 border-b border-slate-100 font-semibold text-green-500 cursor-pointer"
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
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-red-600">
              {totals.actual} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-amber-600">
              {totals.diffIncomeActual} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="inline-table table-fixed border border-slate-100 bg-white rounded-xl shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Przychód netto
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Planowane wydatki
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Różnica (przychód - planowane)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-green-700">
              {totals.income} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-orange-600">
              {totals.planned} zł
            </td>
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-amber-600">
              {totals.diffIncomePlanned} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="inline-table table-fixed border border-slate-100 bg-white rounded-xl shadow-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Łączna suma oszczędnośći na stan poprzedniego miesiąca
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
              Oszczędności obecnie
            </th>
            <th className="px-4 py-3 border-b border-slate-100 w-[300px]">
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
            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-green-700">
              {totals.previous_month_savings.toFixed(2)} zł
            </td>

            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-cyan-500">
              {totals.savingsCurrent} zł
            </td>

            <td className="px-4 py-3 border-b border-slate-100 font-semibold text-indigo-700">
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
