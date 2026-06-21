import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useEffect, useState, useMemo } from "react";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseDialog from "../ExpenseDialog";
import Pagination from "../../ui/Pagination/Pagination";

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
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    minCost: "",
    maxCost: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }));
  }, [category]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    await supabase.from("expenses").delete().eq("id", id);
    onDelete();
  };

  const filteredExpenses = expenses.items.filter((el) => {
    const nameSearch = filters.name.toLowerCase();
    const matchesName = nameSearch
      ? el.name.toLowerCase().includes(nameSearch)
      : true;

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

    return (
      matchesName && matchesSearch && matchesStart && matchesEnd && matchesCost
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE),
  );
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
    <div className="overflow-x-auto p-4 min-h-[720px]">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">Moje wydatki</h2>

      <div className="mb-4">
        <ExpenseFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-full table-fixed">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="w-[34%] px-4 py-3">Nazwa</th>
              <th className="w-[24%] px-4 py-3">Kategoria</th>
              <th className="w-[20%] px-4 py-3">Data</th>
              <th className="w-[10%] px-4 py-3">Koszt</th>
              <th className="w-[12%] px-4 py-3 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedExpenses.map((el) => {
              const dateKey = getDateKey(el.date);
              const rowBg = rowColorByDate.get(dateKey) ?? "bg-white";

              return (
                <tr
                  key={el.id}
                  className={`${rowBg} transition-colors hover:bg-slate-50`}
                >
                  <td className="px-4 py-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-900">
                    <span className="block truncate">{el.name}</span>
                  </td>
                  <td className="px-4 py-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-900">
                    <span className="block truncate">{el.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {format(new Date(el.date), "dd.MM.yyyy", { locale: pl })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {el.cost.toFixed(2)} zł
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                      <ExpenseDialog
                        expense={el}
                        isEdit
                        triggerLabel="Edytuj"
                      />
                      <button
                        onClick={() => handleDelete(el.id)}
                        className="px-2 py-1 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Pokazano {paginatedExpenses.length} z {filteredExpenses.length}{" "}
          wydatków
        </p>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ElementsTable;
