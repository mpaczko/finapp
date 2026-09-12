import { useAppSelector } from "../../store/reduxHook";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useEffect, useState, useMemo } from "react";
import ExpenseFilters from "./ExpenseFilters";
import DeferredExpenseDialog from "../ExpenseDialog/DeferredExpenseDialog";
import Pagination from "../../ui/Pagination/Pagination";
import { useDeleteExpenseMutation, useExpensesQuery } from "../../features/expenses/queries";

const ROW_COLORS = ["bg-white", "bg-gray-100"];
const ROWS_PER_PAGE_OPTIONS = [8, 15, 20, 50] as const;
type RowsPerPage = (typeof ROWS_PER_PAGE_OPTIONS)[number];
const DEFAULT_ROWS_PER_PAGE: RowsPerPage = 8;
const ROWS_PER_PAGE_STORAGE_KEY = "allExpensesRowsPerPage";

const getDateKey = (date: string | Date) =>
  format(new Date(date), "yyyy-MM-dd");

const isRowsPerPageOption = (value: number): value is RowsPerPage =>
  ROWS_PER_PAGE_OPTIONS.some((option) => option === value);

const getInitialRowsPerPage = (): RowsPerPage => {
  if (typeof window === "undefined") return DEFAULT_ROWS_PER_PAGE;

  try {
    const savedValue = Number(
      window.localStorage.getItem(ROWS_PER_PAGE_STORAGE_KEY),
    );

    return isRowsPerPageOption(savedValue)
      ? savedValue
      : DEFAULT_ROWS_PER_PAGE;
  } catch {
    return DEFAULT_ROWS_PER_PAGE;
  }
};

const ElementsTable = () => {
  const category = useAppSelector((state) => state.config.selectedCategory);
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const { data: expenses = [] } = useExpensesQuery(selectedMonth);
  const deleteExpenseMutation = useDeleteExpenseMutation(selectedMonth);

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    minCost: "",
    maxCost: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] =
    useState<RowsPerPage>(getInitialRowsPerPage);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }));
  }, [category]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ROWS_PER_PAGE_STORAGE_KEY,
        rowsPerPage.toString(),
      );
    } catch {
      // Ignore storage errors; pagination still works for the current session.
    }
  }, [rowsPerPage]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    await deleteExpenseMutation.mutateAsync(id);
  };

  const filteredExpenses = useMemo(() => {
    const nameSearch = filters.name.toLowerCase();
    const categorySearch = filters.category.toLowerCase();
    const min = Number.parseFloat(filters.minCost.replace(",", ".")) || 0;
    const max =
      Number.parseFloat(filters.maxCost.replace(",", ".")) || Infinity;
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        (!nameSearch || expense.name.toLowerCase().includes(nameSearch)) &&
        (!categorySearch ||
          expense.category.toLowerCase().includes(categorySearch)) &&
        (!startDate || expenseDate >= startDate) &&
        (!endDate || expenseDate <= endDate) &&
        expense.cost >= min &&
        expense.cost <= max
      );
    });
  }, [expenses, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / rowsPerPage),
  );
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
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
    <div className="flex min-h-[720px] min-w-0 flex-col gap-4 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800">Moje wydatki</h2>

      <ExpenseFilters filters={filters} onFilterChange={setFilters} />

      <div className="mx-auto max-w-[1360px] overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full min-w-[680px] table-fixed">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="w-[26%] px-4 py-3">Nazwa</th>
              <th className="w-[23%] px-4 py-3">Kategoria</th>
              <th className="w-[14%] px-2 py-3 whitespace-nowrap">Data</th>
              <th className="w-[13%] px-2 py-3 whitespace-nowrap">Koszt</th>
              <th className="w-[24%] px-2 py-3 text-center whitespace-nowrap">
                Akcje
              </th>
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
                  <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-900">
                    {format(new Date(el.date), "dd.MM.yyyy", { locale: pl })}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-900">
                    {el.cost.toFixed(2)} zł
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <DeferredExpenseDialog
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Pokazano {paginatedExpenses.length} z {filteredExpenses.length}{" "}
          wydatków
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Wiersze:</span>
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              {ROWS_PER_PAGE_OPTIONS.map((option) => {
                const isActive = rowsPerPage === option;

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setRowsPerPage(option)}
                    className={`px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ElementsTable;
