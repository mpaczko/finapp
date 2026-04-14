import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";

const pastelColors = [
  "bg-pink-100",
  "bg-green-100",
  "bg-blue-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-orange-100",
  "bg-teal-100",
  "bg-indigo-100",
  "bg-rose-100",
  "bg-lime-100",
  "bg-cyan-100",
  "bg-fuchsia-100",
  "bg-amber-100",
  "bg-violet-100",
];

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

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">
        Podsumowanie wydatków według kategorii
      </h2>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">⏳ Zapisuję zmiany...</div>
      )}

      <table className="min-w-[50%] border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b">Kategoria</th>
            <th className="px-4 py-2 border-b text-right">Planowane</th>
            <th className="px-4 py-2 border-b text-right">Wydatki</th>
            <th className="px-4 py-2 border-b text-right">Różnica</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, index) => (
            <tr
              key={row.name}
              className={`hover:bg-gray-50 ${
                pastelColors[index % pastelColors.length]
              } text-gray-800`}
            >
              <td
                className="px-4 py-2 border-b cursor-pointer"
                onClick={() => setCategory(row.name)}
              >
                {row.name}
              </td>
              <td
                className="px-4 py-2 border-b text-right cursor-pointer"
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
                className={`px-4 py-2 border-b text-right font-semibold ${
                  Number(row.actual) > Number(row.planned)
                    ? "text-red-500"
                    : Number(row.actual) === Number(row.planned)
                      ? "text-indigo-600"
                      : "text-green-600"
                }`}
              >
                {row.actual} zł
              </td>
              <td className="px-4 py-2 border-b text-right">
                {(Number(row.planned) - Number(row.actual)).toFixed(2)} zł
              </td>
            </tr>
          ))}

          <tr className="font-semibold bg-gray-200 text-gray-900">
            <td className="px-4 py-2 border-t">Suma</td>
            <td className="px-4 py-2 border-t text-right">
              {totals.planned} zł
            </td>
            <td className="px-4 py-2 border-t text-right">
              {totals.actual} zł
            </td>
            <td className="px-4 py-2 border-t text-right">{totals.diff} zł</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesSummaryTable;
