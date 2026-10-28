import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

import { useYearlyExpensesQuery } from "../../features/expenses/queries";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";

type YearlyExpensesListProps = {
  year: number;
  enabled: boolean;
};

const ROW_HEIGHT = 52;
const VIEWPORT_HEIGHT = 520;
const OVERSCAN = 8;

const YearlyExpensesList = ({ year, enabled }: YearlyExpensesListProps) => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useYearlyExpensesQuery(year, enabled);
  const [showValues] = useSummaryVisibility();
  const [scrollTop, setScrollTop] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const expenses = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  useEffect(() => {
    setScrollTop(0);
    setActiveIndex(0);
    viewportRef.current?.scrollTo({ top: 0 });
  }, [year]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(expenses.length - 1, 0)));
  }, [expenses.length]);

  const loadNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const moveToExpense = (nextIndex: number) => {
    if (expenses.length === 0) return;

    if (nextIndex >= expenses.length && hasNextPage) {
      loadNextPage();
      return;
    }

    const index = Math.max(0, Math.min(nextIndex, expenses.length - 1));
    const viewport = viewportRef.current;
    const rowTop = index * ROW_HEIGHT;
    const rowBottom = rowTop + ROW_HEIGHT;

    if (viewport) {
      if (rowTop < viewport.scrollTop) {
        viewport.scrollTo({ top: rowTop });
      } else if (rowBottom > viewport.scrollTop + viewport.clientHeight) {
        viewport.scrollTo({ top: rowBottom - viewport.clientHeight });
      }
    }

    setActiveIndex(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const pageSize = Math.max(1, Math.floor(VIEWPORT_HEIGHT / ROW_HEIGHT));

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveToExpense(activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveToExpense(activeIndex - 1);
        break;
      case "PageDown":
        event.preventDefault();
        moveToExpense(activeIndex + pageSize);
        break;
      case "PageUp":
        event.preventDefault();
        moveToExpense(activeIndex - pageSize);
        break;
      case "Home":
        event.preventDefault();
        moveToExpense(0);
        break;
      case "End":
        event.preventDefault();
        moveToExpense(expenses.length - 1);
        break;
    }
  };

  const { firstIndex, visibleExpenses } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(
      expenses.length,
      Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
    );

    return {
      firstIndex: start,
      visibleExpenses: expenses.slice(start, end),
    };
  }, [expenses, scrollTop]);
  const totalRowCount = expenses.length + (hasNextPage ? 1 : 0);

  return (
    <section className="mt-6 min-w-0 rounded-2xl border border-border-soft bg-surface shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-soft px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Wszystkie wydatki w {year}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Kolejne porcje są pobierane podczas przewijania i wirtualizowane.
          </p>
          <p id="yearly-expenses-keyboard-help" className="sr-only">
            Użyj strzałek góra i dół, Page Up, Page Down, Home oraz End, aby
            poruszać się po wydatkach.
          </p>
        </div>
        {!isLoading && (
          <p className="text-sm font-medium text-muted">
            {hasNextPage ? "Wczytano " : "Łącznie "}
            {expenses.length} {expenses.length === 1 ? "wydatek" : "wydatków"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 sm:p-5">
          <TableSkeleton rows={10} columns={4} className="min-h-[520px]" />
        </div>
      ) : isError && expenses.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-5">
          <p className="text-sm text-muted">
            Nie udało się pobrać wydatków. Spróbuj ponownie.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-lg border border-border-soft px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-5">
          Brak wydatków w wybranym roku.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div
              className="grid grid-cols-[minmax(190px,1.5fr)_minmax(150px,1fr)_120px_130px] gap-4 bg-surface-muted px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted sm:px-5"
              role="row"
            >
              <span role="columnheader">Nazwa</span>
              <span role="columnheader">Kategoria</span>
              <span role="columnheader">Data</span>
              <span role="columnheader" className="text-right">Koszt</span>
            </div>
            <div
              ref={viewportRef}
              className="overflow-y-auto"
              style={{ height: VIEWPORT_HEIGHT }}
              onScroll={(event) => {
                const nextScrollTop = event.currentTarget.scrollTop;
                const firstVisible = Math.floor(nextScrollTop / ROW_HEIGHT);
                const lastVisible = Math.min(
                  expenses.length - 1,
                  Math.floor(
                    (nextScrollTop + VIEWPORT_HEIGHT - 1) / ROW_HEIGHT,
                  ),
                );

                setScrollTop(nextScrollTop);
                setActiveIndex((index) =>
                  index < firstVisible
                    ? firstVisible
                    : index > lastVisible
                      ? lastVisible
                      : index,
                );

                if (
                  nextScrollTop + VIEWPORT_HEIGHT + ROW_HEIGHT * OVERSCAN >=
                  expenses.length * ROW_HEIGHT
                ) {
                  loadNextPage();
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => moveToExpense(activeIndex)}
              tabIndex={0}
              role="grid"
              aria-label={`Lista wydatków z roku ${year}`}
              aria-describedby="yearly-expenses-keyboard-help"
              aria-rowcount={hasNextPage ? -1 : expenses.length}
              aria-colcount={4}
              aria-activedescendant={`yearly-expense-${expenses[activeIndex]?.id}`}
            >
              <div
                className="relative"
                style={{ height: totalRowCount * ROW_HEIGHT }}
              >
                <div
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${firstIndex * ROW_HEIGHT}px)` }}
                >
                  {visibleExpenses.map((expense, index) => {
                    const itemIndex = firstIndex + index;

                    return (
                      <div
                        key={expense.id}
                        id={`yearly-expense-${expense.id}`}
                        role="row"
                        aria-rowindex={itemIndex + 2}
                        aria-selected={itemIndex === activeIndex}
                        onClick={() => moveToExpense(itemIndex)}
                        className={`grid h-[52px] cursor-pointer grid-cols-[minmax(190px,1.5fr)_minmax(150px,1fr)_120px_130px] items-center gap-4 border-b border-row-divider px-4 text-sm transition-colors hover:bg-surface-muted sm:px-5 ${
                          itemIndex === activeIndex
                            ? "bg-primary/10 outline outline-2 -outline-offset-2 outline-primary"
                            : itemIndex % 2 === 0
                              ? "bg-surface"
                              : "bg-surface-subtle"
                        }`}
                      >
                        <span role="gridcell" className="truncate font-medium text-foreground">
                          {expense.name}
                        </span>
                        <span role="gridcell" className="truncate text-foreground-soft">
                          {expense.category}
                        </span>
                        <span role="gridcell" className="tabular-nums text-foreground-soft">
                          {format(new Date(expense.date), "dd.MM.yyyy", {
                            locale: pl,
                          })}
                        </span>
                        <span role="gridcell" className="text-right font-semibold tabular-nums text-foreground">
                          {formatSummaryCurrency(expense.cost, showValues)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {hasNextPage && (
                  <div
                    className="absolute left-0 right-0 flex h-[52px] items-center justify-center border-b border-row-divider bg-surface text-sm text-muted"
                    style={{ transform: `translateY(${expenses.length * ROW_HEIGHT}px)` }}
                    role="status"
                  >
                    {isFetchingNextPage ? (
                      "Wczytywanie kolejnych wydatków…"
                    ) : isFetchNextPageError ? (
                      <button
                        type="button"
                        onClick={loadNextPage}
                        className="rounded-lg border border-border-soft px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                      >
                        Nie udało się wczytać kolejnych wydatków. Spróbuj ponownie
                      </button>
                    ) : (
                      "Przewiń, aby wczytać kolejne wydatki"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default YearlyExpensesList;
