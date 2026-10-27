import { lazy, Suspense, useEffect, useState } from "react";
import CategoriesSummaryTable from "../../modules/CategoriesSummaryTable";
import MonthlyExpensesTotal from "../../modules/CategoriesSummaryTable/MonthlyExpensesTotal";
import SummaryTable from "../../modules/SummaryTable";
import ElementsTable from "../../modules/AllExpensesTable";
import { useExpensesQuery } from "../../features/expenses/queries";
import { useBudgetQuery } from "../../features/budgets/queries";
import { useCategoriesQuery } from "../../features/categories/queries";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";

type Props = {
  userId: string | null;
  selectedMonth: string;
};

type SummaryView = "monthly" | "yearly";

const SUMMARY_VIEW_HASHES: Record<SummaryView, string> = {
  monthly: "#summary-monthly",
  yearly: "#summary-yearly",
};

const getSummaryViewFromHash = (): SummaryView =>
  window.location.hash === SUMMARY_VIEW_HASHES.yearly ? "yearly" : "monthly";

const YearlyInvestmentSummary = lazy(
  () => import("../../modules/YearlyInvestmentSummary"),
);

const MonthlySummary = ({ userId, selectedMonth }: Props) => {
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
        <div className="min-w-0">
          <TableSkeleton rows={7} columns={4} className="min-h-[420px]" />
        </div>
        <div className="grid min-w-0 gap-8">
          <div className="h-56 animate-pulse rounded-3xl bg-surface-subtle" />
          <TableSkeleton rows={8} columns={5} className="min-h-[520px]" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-danger-border bg-danger-surface p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger-surface text-lg font-semibold text-danger">
            !
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Nie udało się pobrać danych
          </h2>
          <p className="mt-2 text-sm text-muted">
            Odśwież stronę i spróbuj ponownie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
      <div className="min-w-0">
        <CategoriesSummaryTable />
      </div>
      <div className="grid min-w-0 content-start gap-8 p-4">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Podsumowanie ogólne wybranego miesiąca
        </h2>
        <SummaryTable />
        <MonthlyExpensesTotal />
        <ElementsTable />
      </div>
    </div>
  );
};

const Main = ({ userId, selectedMonth }: Props) => {
  const [summaryView, setSummaryView] = useState<SummaryView>(() =>
    getSummaryViewFromHash(),
  );

  useEffect(() => {
    const syncSummaryView = () => setSummaryView(getSummaryViewFromHash());

    window.addEventListener("hashchange", syncSummaryView);
    return () => window.removeEventListener("hashchange", syncSummaryView);
  }, []);

  const selectSummaryView = (view: SummaryView) => {
    setSummaryView(view);
    window.location.hash = SUMMARY_VIEW_HASHES[view];
  };

  const toggleSummaryView = () => {
    selectSummaryView(summaryView === "monthly" ? "yearly" : "monthly");
  };

  return (
    <main className="px-4 pb-20 pt-25 sm:px-6">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Podsumowanie
          </h1>
          <button
            type="button"
            role="switch"
            aria-checked={summaryView === "yearly"}
            aria-label={`Przełącz na podsumowanie ${summaryView === "monthly" ? "roczne" : "miesięczne"}`}
            onClick={toggleSummaryView}
            className="relative inline-flex h-10 w-44 items-center rounded-full border border-border bg-surface-muted p-1 text-sm font-semibold shadow-sm transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out ${
                summaryView === "yearly" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <span
              className={`relative z-10 flex-1 text-center transition-colors ${
                summaryView === "monthly"
                  ? "text-primary-foreground"
                  : "text-muted"
              }`}
            >
              Miesiąc
            </span>
            <span
              className={`relative z-10 flex-1 text-center transition-colors ${
                summaryView === "yearly"
                  ? "text-primary-foreground"
                  : "text-muted"
              }`}
            >
              Rok
            </span>
          </button>
        </header>

        {summaryView === "monthly" ? (
          <MonthlySummary userId={userId} selectedMonth={selectedMonth} />
        ) : (
          <Suspense
            fallback={
              <div
                className="h-72 animate-pulse rounded-3xl bg-surface-subtle"
                aria-label="Ładowanie rocznego podsumowania"
              />
            }
          >
            <YearlyInvestmentSummary
              userId={userId}
              selectedMonth={selectedMonth}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
};

export default Main;
