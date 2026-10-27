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

  return (
    <main className="px-4 pb-20 pt-25 sm:px-6">
      <div className="mx-auto max-w-[1800px]">
        <div
          className="mb-6 inline-flex rounded-2xl border border-border bg-surface-muted p-1 shadow-sm"
          role="tablist"
          aria-label="Zakres podsumowania"
        >
          {(
            [
              ["monthly", "Miesiąc"],
              ["yearly", "Rok"],
            ] as const
          ).map(([view, label]) => {
            const active = summaryView === view;

            return (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectSummaryView(view)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                Podsumowanie: {label}
              </button>
            );
          })}
        </div>

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
