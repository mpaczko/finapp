import { useState } from "react";
import { useAppSelector } from "../../store/reduxHook";

interface CategorySummary {
  name: string;
  actual: number;
  planned: number;
}

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
  const expenses = useAppSelector((state) => state.expenses);
  const categories = useAppSelector((state) => state.categories.items);

  const [plannedMap, setPlannedMap] = useState<Record<string, number>>({});

  const summary: CategorySummary[] = categories.map((cat) => {
    const actualSum = expenses.items
      .filter((exp) => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.cost, 0);

    return {
      name: cat.name,
      planned: plannedMap[cat.name] ?? 0,
      actual: actualSum,
    };
  });

  const handlePlannedChange = (category: string, value: string) => {
    const numeric = parseFloat(value.replace(",", "."));
    setPlannedMap((prev) => ({
      ...prev,
      [category]: isNaN(numeric) ? 0 : numeric,
    }));
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">
        Podsumowanie wydatków według kategorii
      </h2>
      <table className="min-w-[50%] border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b">Kategoria</th>
            <th className="px-4 py-2 border-b">Planowane</th>
            <th className="px-4 py-2 border-b">Wydatki</th>
            <th className="px-4 py-2 border-b">Różnica</th>
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
              <td className="px-4 py-2 border-b">{row.name}</td>
              <td className="px-4 py-2 border-b">
                <input
                  type="number"
                  step="0.01"
                  value={row.planned}
                  onChange={(e) =>
                    handlePlannedChange(row.name, e.target.value)
                  }
                  className="w-24 px-2 py-1 border rounded text-right"
                />
              </td>
              <td className="px-4 py-2 border-b">{row.actual.toFixed(2)} zł</td>
              <td className="px-4 py-2 border-b">
                {(row.planned - row.actual).toFixed(2)} zł
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesSummaryTable;
