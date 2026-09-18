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
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-lg font-semibold text-red-600">
            !
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Nie udało się pobrać danych
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Odśwież stronę i spróbuj ponownie.
          </p>
        </div>
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
