import { useBudgetSummary } from "../../hooks/useBudgetSummary";

const SummaryTable = () => {
  const { totals, loading } = useBudgetSummary();

  const totalSavings = "76382.00";

  return (
    <div className="p-4 flex flex-col gap-4 items-start">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">
        Podsumowanie ogólne wybranego miesiąca
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">⏳ Ładowanie danych...</div>
      )}

      <table className="inline-table table-fixed border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b w-[300px]">Przychód netto</th>
            <th className="px-4 py-2 border-b w-[300px]">
              Rzeczywiste wydatki
            </th>
            <th className="px-4 py-2 border-b w-[300px]">
              Różnica (przychód - rzeczywiste)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border-b font-semibold text-green-500">
              {totals.income} zł
            </td>
            <td className="px-4 py-2 border-b font-semibold text-red-600">
              {totals.actual} zł
            </td>
            <td className="px-4 py-2 border-b font-semibold text-amber-600">
              {totals.diffIncomeActual} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="inline-table table-fixed border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b w-[300px]">Przychód netto</th>
            <th className="px-4 py-2 border-b w-[300px]">Planowane wydatki</th>
            <th className="px-4 py-2 border-b w-[300px]">
              Różnica (przychód - planowane)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border-b font-semibold text-green-700">
              {totals.income} zł
            </td>
            <td className="px-4 py-2 border-b font-semibold text-orange-600">
              {totals.planned} zł
            </td>
            <td className="px-4 py-2 border-b font-semibold text-amber-600">
              {totals.diffIncomePlanned} zł
            </td>
          </tr>
        </tbody>
      </table>

      <table className="inline-table table-fixed border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b w-[300px]">
              Łączna suma oszczędnośći na stan poprzedniego miesiąca
            </th>
            <th className="px-4 py-2 border-b w-[300px]">
              Oszczędności obecnie
            </th>
            <th className="px-4 py-2 border-b w-[300px]">
              Planowany stan oszczędnośći pod koniec miesiąca
            </th>
            <th className="px-4 py-2 border-b w-[300px] text-left whitespace-nowrap">
              Szacowana wartość inwestycji
            </th>
            <th className="px-4 py-2 border-b w-[300px] text-left whitespace-nowrap">
              Oszczędności łącznie
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border-b font-semibold text-green-700">
              {totals.previous_month_savings.toFixed(2)} zł
            </td>

            <td className="px-4 py-2 border-b font-semibold text-cyan-500">
              {totals.savingsCurrent} zł
            </td>

            <td className="px-4 py-2 border-b font-semibold text-indigo-700">
              {totals.savingsEndMonth} zł
            </td>

            <td className="px-4 py-2 border-b font-semibold text-purple-700">
              {/* TODO: szacowana wartość inwestycji */}
            </td>

            <td className="px-4 py-2 border-b font-semibold text-blue-700">
              {totalSavings} zł
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
