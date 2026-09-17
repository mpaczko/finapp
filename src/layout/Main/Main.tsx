import { lazy, Suspense } from "react";
import CategoriesSummaryTable from "../../modules/CategoriesSummaryTable";
import ElementsTable from "../../modules/AllExpensesTable";
import { useExpensesQuery } from "../../features/expenses/queries";
import { useBudgetQuery } from "../../features/budgets/queries";
import { useCategoriesQuery } from "../../features/categories/queries";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";

type Props = {
  userId: string | null;
  selectedMonth: string;
};

const YearlyInvestmentSummary = lazy(
  () => import("../../modules/YearlyInvestmentSummary"),
);

const Main = ({ userId, selectedMonth }: Props) => {
  const queryEnabled = Boolean(userId);
  const expensesQuery = useExpensesQuery(selectedMonth, queryEnabled);
  const budgetQuery = useBudgetQuery(selectedMonth, queryEnabled);
  const categoriesQuery = useCategoriesQuery(queryEnabled);
  const loading =
    expensesQuery.isLoading ||
    budgetQuery.isLoading ||
    categoriesQuery.isLoading;
  const hasError =
    expensesQuery.isError || budgetQuery.isError || categoriesQuery.isError;

  if (loading) {
    return (
      <main className="grid grid-cols-1 gap-4 px-4 pb-20 pt-25 sm:px-6 xl:grid-cols-2 xl:items-start">
        <div className="min-w-0">
          <TableSkeleton rows={7} columns={4} className="min-h-[420px]" />
        </div>
        <div className="grid min-w-0 gap-8">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
          <TableSkeleton rows={8} columns={5} className="min-h-[520px]" />
        </div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="pt-20 flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-red-600">
          Nie udało się pobrać danych. Odśwież stronę i spróbuj ponownie.
        </p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-1 gap-4 px-4 pb-20 pt-25 sm:px-6 xl:grid-cols-2 xl:items-start">
      <div className="min-w-0">
        <CategoriesSummaryTable />
      </div>
      <div className="grid min-w-0 gap-8">
        <Suspense
          fallback={
            <div
              className="h-48 animate-pulse rounded-3xl bg-slate-100"
              aria-label="Ładowanie rocznego podsumowania"
            />
          }
        >
          <YearlyInvestmentSummary
            userId={userId}
            selectedMonth={selectedMonth}
          />
        </Suspense>
        <ElementsTable />
      </div>
    </main>
  );
};

export default Main;
