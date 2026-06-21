import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";
import PieChart from "../../ui/PieChart/PieChart";

import { categoryChartColors } from "../../lib/categoryColors";

const CategoriesSummaryTable = () => {
  const {
    summary,
    totals,
    editingCategory,
    inputValue,
    setEditingCategory,
    setInputValue,
    savePlannedValue,
    loading,
  } = useBudgetSummary();

  const dispatch = useAppDispatch();
  const setCategory = (category: string) =>
    dispatch(setSelectedCategory(category));

  const categoryColorMap = Object.fromEntries(
    summary.map((row, index) => [
      row.name,
      categoryChartColors[index % categoryChartColors.length],
    ]),
  );

  const actualChartData = summary
    .filter((row) => Number(row.actual) > 0)
    .map((row) => ({
      label: row.name,
      value: Number(row.actual),
      color: categoryColorMap[row.name] || "#cbd5e1",
    }));

  const plannedChartData = summary
    .filter((row) => Number(row.planned) > 0)
    .map((row) => ({
      label: row.name,
      value: Number(row.planned),
      color: categoryColorMap[row.name] || "#cbd5e1",
    }));

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">
        Podsumowanie wydatków według kategorii
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">⏳ Zapisuję zmiany...</div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PieChart
          title="Wydatki rzeczywiste"
          data={actualChartData}
          totalLabel={`Suma: ${summary
            .reduce((sum, row) => sum + Number(row.actual), 0)
            .toFixed(2)} zł`}
          className="min-h-[380px]"
        />

        <PieChart
          title="Wydatki planowane"
          data={plannedChartData}
          totalLabel={`Suma: ${summary
            .reduce((sum, row) => sum + Number(row.planned), 0)
            .toFixed(2)} zł`}
          className="min-h-[380px]"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm mt-6">
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 border-b border-slate-100">Kategoria</th>
              <th className="px-4 py-3 text-right border-b border-slate-100">
                Planowane
              </th>
              <th className="px-4 py-3 text-right border-b border-slate-100">
                Wydatki
              </th>
              <th className="px-4 py-3 text-right border-b border-slate-100">
                Różnica
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-900">
            {summary.map((row) => (
              <tr
                key={row.name}
                className="hover:bg-slate-50 transition-colors text-slate-900"
              >
                <td
                  className="px-4 py-3 border-b border-slate-100 cursor-pointer"
                  onClick={() => setCategory(row.name)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColorMap[row.name] || "#cbd5e1",
                      }}
                    />
                    <span className="font-medium">{row.name}</span>
                  </div>
                </td>
                <td
                  className="px-4 py-3 border-b border-slate-100 text-right cursor-pointer"
                  onClick={() => {
                    setEditingCategory(row.name);
                    setInputValue(row.planned.toString());
                  }}
                >
                  {editingCategory === row.name ? (
                    <input
                      type="number"
                      autoFocus
                      step="0.01"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => {
                        const newValue = parseFloat(inputValue) || 0;
                        savePlannedValue(row.name, newValue);
                        setEditingCategory(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newValue = parseFloat(inputValue) || 0;
                          savePlannedValue(row.name, newValue);
                          setEditingCategory(null);
                        }
                        if (e.key === "Escape") setEditingCategory(null);
                      }}
                      className="w-24 px-2 py-1 border rounded text-right"
                    />
                  ) : (
                    `${row.planned} zł`
                  )}
                </td>
                <td
                  className={`px-4 py-3 border-b border-slate-100 text-right font-semibold ${
                    Number(row.actual) > Number(row.planned)
                      ? "text-red-500"
                      : Number(row.actual) === Number(row.planned)
                        ? "text-indigo-600"
                        : "text-green-600"
                  }`}
                >
                  {row.actual} zł
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right">
                  {(Number(row.planned) - Number(row.actual)).toFixed(2)} zł
                </td>
              </tr>
            ))}

            <tr className="bg-slate-100 text-slate-900 font-semibold">
              <td className="px-4 py-3">Suma</td>
              <td className="px-4 py-3 text-right">{totals.planned} zł</td>
              <td className="px-4 py-3 text-right">{totals.actual} zł</td>
              <td className="px-4 py-3 text-right">{totals.diff} zł</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesSummaryTable;
