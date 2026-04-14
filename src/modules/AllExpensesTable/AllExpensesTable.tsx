import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useEffect, useState, useMemo } from "react";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseDialog from "../ExpenseDialog";

interface IProps {
  onDelete: () => Promise<void>;
}

const ROW_COLORS = ["bg-white", "bg-gray-100"];

const getDateKey = (date: string | Date) =>
  format(new Date(date), "yyyy-MM-dd");

const ElementsTable = ({ onDelete }: IProps) => {
  const expenses = useAppSelector((state) => state.expenses);
  const category = useAppSelector((state) => state.config.selectedCategory);

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minCost: "",
    maxCost: "",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }));
  }, [category]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    await supabase.from("expenses").delete().eq("id", id);
    onDelete();
  };

  const filteredExpenses = expenses.items.filter((el) => {
    const searchValue = filters.category.toLowerCase();
    const matchesSearch = searchValue
      ? el.category.toLowerCase().includes(searchValue)
      : true;

    const elDate = new Date(el.date);

    const matchesStart = filters.startDate
      ? elDate >= new Date(filters.startDate)
      : true;

    const matchesEnd = filters.endDate
      ? elDate <= new Date(filters.endDate)
      : true;

    const min = parseFloat(filters.minCost.replace(",", ".")) || 0;
    const max = parseFloat(filters.maxCost.replace(",", ".")) || Infinity;
    const matchesCost = el.cost >= min && el.cost <= max;

    return matchesSearch && matchesStart && matchesEnd && matchesCost;
  });

  const rowColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    let index = 0;

    filteredExpenses.forEach((el) => {
      const dateKey = getDateKey(el.date);

      if (!map.has(dateKey)) {
        map.set(dateKey, ROW_COLORS[index % ROW_COLORS.length]);
        index++;
      }
    });

    return map;
  }, [filteredExpenses]);

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">Moje wydatki</h2>

      <ExpenseFilters filters={filters} onFilterChange={setFilters} />

      <table className="min-w-[50%] border border-gray-200 rounded-xl shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2 border-b">Nazwa</th>
            <th className="px-4 py-2 border-b">Kategoria</th>
            <th className="px-4 py-2 border-b">Data</th>
            <th className="px-4 py-2 border-b">Koszt</th>
            <th className="px-4 py-2 border-b text-center">Akcje</th>
          </tr>
        </thead>

        <tbody>
          {filteredExpenses.map((el) => {
            const dateKey = getDateKey(el.date);
            const rowBg = rowColorByDate.get(dateKey) ?? "bg-white";

            return (
              <tr key={el.id} className={rowBg}>
                <td className="px-4 py-2 border-b">{el.name}</td>
                <td className="px-4 py-2 border-b">{el.category}</td>
                <td className="px-4 py-2 border-b">
                  {format(new Date(el.date), "dd.MM.yyyy", { locale: pl })}
                </td>
                <td className="px-4 py-2 border-b">{el.cost.toFixed(2)} zł</td>
                <td className="px-4 py-2 border-b text-center space-x-2">
                  <ExpenseDialog expense={el} isEdit triggerLabel="Edytuj" />
                  <button
                    onClick={() => handleDelete(el.id)}
                    className="px-2 py-1 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ElementsTable;
