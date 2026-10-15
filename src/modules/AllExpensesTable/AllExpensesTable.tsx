import { useAppSelector } from "../../store/reduxHook";
import { useEffect, useState, useMemo, useRef } from "react";
import { X } from "lucide-react";
import ExpenseFilters from "./ExpenseFilters";
import ExpensesTable from "./ExpensesTable";
import EmptyState from "./EmptyState";
import Pagination from "../../ui/Pagination/Pagination";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";
import {
  useDeleteExpenseMutation,
  useExpensesQuery,
  useSaveExpenseMutation,
} from "../../features/expenses/queries";
import type { Expense } from "../../lib/expensesApi";
import { Button } from "../../ui/Button";

const ROW_COLORS = ["bg-surface", "bg-surface-muted"];
const ROWS_PER_PAGE_OPTIONS = [8, 15, 20, 50] as const;
type RowsPerPage = (typeof ROWS_PER_PAGE_OPTIONS)[number];
const DEFAULT_ROWS_PER_PAGE: RowsPerPage = 8;
const ROWS_PER_PAGE_STORAGE_KEY = "allExpensesRowsPerPage";
const UNDO_DELETE_TIMEOUT_MS = 5_000;

const getDateKey = (date: string | Date) =>
  new Date(date).toISOString().slice(0, 10);

const isRowsPerPageOption = (value: number): value is RowsPerPage =>
  ROWS_PER_PAGE_OPTIONS.some((option) => option === value);

const getInitialRowsPerPage = (): RowsPerPage => {
  if (typeof window === "undefined") return DEFAULT_ROWS_PER_PAGE;

  try {
    const savedValue = Number(
      window.localStorage.getItem(ROWS_PER_PAGE_STORAGE_KEY),
    );

    return isRowsPerPageOption(savedValue) ? savedValue : DEFAULT_ROWS_PER_PAGE;
  } catch {
    return DEFAULT_ROWS_PER_PAGE;
  }
};

const ElementsTable = () => {
  const category = useAppSelector((state) => state.config.selectedCategory);
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const { data: expenses = [], isLoading } = useExpensesQuery(selectedMonth);
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const restoreExpenseMutation = useSaveExpenseMutation();
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    minCost: "",
    maxCost: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(
    getInitialRowsPerPage,
  );
  const [deletedExpense, setDeletedExpense] = useState<Expense | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

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

  useEffect(
    () => () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    },
    [],
  );

  const dismissUndo = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    setDeletedExpense(null);
    setRestoreError(null);
  };

  const showUndo = (expense: Expense) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    setDeletedExpense(expense);
    setRestoreError(null);
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedExpense(null);
      undoTimeoutRef.current = null;
    }, UNDO_DELETE_TIMEOUT_MS);
  };

  const handleDelete = async (id?: string) => {
    if (!id || deleteExpenseMutation.isPending) return;

    const expense = expenses.find((item) => item.id === id);
    if (!expense) return;

    try {
      await deleteExpenseMutation.mutateAsync(id);
      showUndo(expense);
    } catch {
      // The expense is still visible when the deletion request fails.
    }
  };

  const restoreDeletedExpense = async () => {
    if (!deletedExpense || restoreExpenseMutation.isPending) return;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    try {
      await restoreExpenseMutation.mutateAsync({
        expense: {
          name: deletedExpense.name,
          category: deletedExpense.category,
          date: deletedExpense.date,
          cost: deletedExpense.cost,
        },
      });
      setDeletedExpense(null);
      setRestoreError(null);
    } catch (error) {
      setRestoreError(
        error instanceof Error
          ? error.message
          : "Nie udało się przywrócić wydatku.",
      );
    }
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

  const isTableLoading = Boolean(isLoading);

  const areFiltersActive = Boolean(
    filters.name ||
    filters.category ||
    filters.startDate ||
    filters.endDate ||
    filters.minCost ||
    filters.maxCost,
  );

  return (
    <div className="flex min-h-[720px] min-w-0 flex-col gap-4 overflow-x-auto">
      <h2 className="text-xl font-semibold text-foreground">Moje wydatki</h2>

      <ExpenseFilters filters={filters} onFilterChange={setFilters} />

      {isTableLoading ? (
        <TableSkeleton rows={8} columns={5} className="min-h-[520px]" />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          message={
            areFiltersActive
              ? "Dla zastosowanych filtrów nie znaleziono wydatków."
              : "Brak wydatków w tym miesaicu"
          }
        />
      ) : (
        <ExpensesTable
          expenses={paginatedExpenses}
          rowColorByDate={rowColorByDate}
          handleDelete={handleDelete}
          deleting={deleteExpenseMutation.isPending}
        />
      )}

      {!isTableLoading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Pokazano {paginatedExpenses.length} z {filteredExpenses.length}{" "}
            wydatków
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Wiersze:</span>
              <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface">
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
                          ? "bg-primary text-primary-foreground"
                          : "text-muted hover:bg-surface-muted"
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
      )}

      {deletedExpense && (
        <div
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-xl"
          role="status"
          aria-live="polite"
        >
          <div className="min-w-0">
            <p className="font-medium">Wydatek usunięty</p>
            {restoreError && (
              <p className="mt-0.5 text-xs text-danger">{restoreError}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void restoreDeletedExpense()}
            disabled={restoreExpenseMutation.isPending}
            className="shrink-0"
          >
            {restoreExpenseMutation.isPending ? "Przywracanie..." : "Cofnij"}
          </Button>
          <button
            type="button"
            onClick={dismissUndo}
            className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Zamknij powiadomienie o usunięciu"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ElementsTable;
