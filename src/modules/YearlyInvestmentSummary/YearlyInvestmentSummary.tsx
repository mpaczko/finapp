import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import {
  useBudgetQuery,
  useYearlyBudgetsQuery,
  useUpdateBudgetMutation,
} from "../../features/budgets/queries";
import { useYearlySummaryQuery } from "../../features/summary/queries";
import { useCategoriesQuery } from "../../features/categories/queries";
import { useYearlyExpenseTotalsQuery } from "../../features/expenses/queries";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";
import { categoryChartColors } from "../../lib/categoryColors";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch, useAppSelector } from "../../store/reduxHook";
import ComparisonCard from "./ComparisonCard";
import YearlyCategoryExpensesChart from "./YearlyCategoryExpensesChart";
import YearlyIncomeAndExpensesChart from "./YearlyIncomeAndExpensesChart";

type YearlyInvestmentSummaryProps = {
  userId: string | null;
  selectedMonth: string;
};

const SELECTED_CATEGORY_COOKIE = "finapp.yearlyChartSelectedCategory";
const COMPARISON_SLOTS_STORAGE_KEY = "finapp.yearlyComparisonSlots";
const DEFAULT_SELECTED_CATEGORY = "jedzenie";
const COMPARISON_SLOTS_COUNT = 2;

const getSelectedCategoryFromCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SELECTED_CATEGORY_COOKIE}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : DEFAULT_SELECTED_CATEGORY;
};

const saveSelectedCategoryToCookie = (category: string) => {
  document.cookie = `${SELECTED_CATEGORY_COOKIE}=${encodeURIComponent(category)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
};

const getComparisonSlotsFromStorage = (): (string | null)[] => {
  if (typeof window === "undefined") {
    return Array.from({ length: COMPARISON_SLOTS_COUNT }, () => null);
  }

  try {
    const savedValue = window.localStorage.getItem(
      COMPARISON_SLOTS_STORAGE_KEY,
    );
    const parsed = savedValue ? JSON.parse(savedValue) : [];

    if (!Array.isArray(parsed)) throw new Error("Invalid comparison slots");

    return Array.from({ length: COMPARISON_SLOTS_COUNT }, (_, index) =>
      typeof parsed[index] === "string" ? parsed[index] : null,
    );
  } catch {
    return Array.from({ length: COMPARISON_SLOTS_COUNT }, () => null);
  }
};

const YearlyInvestmentSummary = ({
  userId,
  selectedMonth,
}: YearlyInvestmentSummaryProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [editingIpBox, setEditingIpBox] = useState(false);
  const [ipBoxInputValue, setIpBoxInputValue] = useState("");
  const [showValues] = useSummaryVisibility();
  const [selectedCategory, setSelectedCategoryForChart] = useState(
    getSelectedCategoryFromCookie,
  );
  const [comparisonSlots, setComparisonSlots] = useState(
    getComparisonSlotsFromStorage,
  );
  const dispatch = useAppDispatch();
  const globallySelectedCategory = useAppSelector(
    (state) => state.config.selectedCategory,
  );
  const { data: budgets = [] } = useBudgetQuery(selectedMonth, Boolean(userId));
  const { data: yearlyBudgets = [], isLoading: yearlyBudgetsLoading } =
    useYearlyBudgetsQuery(year, Boolean(userId));
  const selectedBudget = budgets[0];
  const updateBudgetMutation = useUpdateBudgetMutation(selectedMonth);
  const { data: summary, isLoading: loading } = useYearlySummaryQuery(
    year,
    Boolean(userId),
  );
  const { data: monthlyTotals = [], isLoading: monthlyTotalsLoading } =
    useYearlyExpenseTotalsQuery(year, Boolean(userId));
  const { data: categories = [] } = useCategoriesQuery(Boolean(userId));

  const availableCategories = useMemo(() => {
    const names = categories.map((category) => category.name);
    monthlyTotals.forEach((entry) => {
      if (!names.includes(entry.category)) names.push(entry.category);
    });
    return names;
  }, [categories, monthlyTotals]);
  const categoryColors = useMemo(
    () =>
      Object.fromEntries(
        availableCategories.map((category, index) => [
          category,
          categoryChartColors[index % categoryChartColors.length],
        ]),
      ),
    [availableCategories],
  );
  const categoryKeys = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.name, category.key]),
      ),
    [categories],
  );
  const investmentCategoryName = useMemo(
    () =>
      categories.find((category) => category.key === "investments")?.name ??
      "inwestycje",
    [categories],
  );

  const comparisonData = useMemo(() => {
    return Object.fromEntries(
      availableCategories.map((category) => {
        const categoryKey = categoryKeys[category];
        const planned = yearlyBudgets.reduce((sum, budget) => {
          if (!categoryKey) return sum;

          return (
            sum + Number((budget as Record<string, unknown>)[categoryKey] ?? 0)
          );
        }, 0);
        const actual = monthlyTotals
          .filter((entry) => entry.category === category)
          .reduce((sum, entry) => sum + entry.total, 0);

        return [category, { planned, actual }];
      }),
    ) as Record<string, { planned: number; actual: number }>;
  }, [availableCategories, categoryKeys, monthlyTotals, yearlyBudgets]);

  const monthlyOverview = useMemo(() => {
    const values = Array.from({ length: 12 }, () => ({
      income: 0,
      planned: 0,
      actual: 0,
      investments: 0,
    }));

    yearlyBudgets.forEach((budget) => {
      const monthIndex = Number(budget.month?.slice(5, 7)) - 1;
      if (monthIndex < 0 || monthIndex > 11) return;

      values[monthIndex].income += Number(budget.income ?? 0);
      values[monthIndex].planned += Object.values(categoryKeys).reduce(
        (sum, key) =>
          sum + Number((budget as Record<string, unknown>)[key] ?? 0),
        0,
      );
    });

    monthlyTotals.forEach((entry) => {
      const monthIndex = entry.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        values[monthIndex].actual += entry.total;
        if (entry.category === investmentCategoryName) {
          values[monthIndex].investments += entry.total;
        }
      }
    });

    return values;
  }, [categoryKeys, investmentCategoryName, monthlyTotals, yearlyBudgets]);

  useEffect(() => {
    if (!availableCategories.includes(selectedCategory)) {
      const foodCategory = availableCategories.find(
        (category) => category.trim().toLocaleLowerCase("pl-PL") === "jedzenie",
      );

      const nextCategory =
        foodCategory ?? availableCategories[0] ?? DEFAULT_SELECTED_CATEGORY;
      setSelectedCategoryForChart(nextCategory);

      if (availableCategories.length > 0) {
        saveSelectedCategoryToCookie(nextCategory);
      }
    }
  }, [availableCategories, selectedCategory]);

  useEffect(() => {
    setComparisonSlots((slots) =>
      slots.map((category) =>
        category && availableCategories.includes(category) ? category : null,
      ),
    );
  }, [availableCategories]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        COMPARISON_SLOTS_STORAGE_KEY,
        JSON.stringify(comparisonSlots),
      );
    } catch {
      // Slots still work during the current session when storage is unavailable.
    }
  }, [comparisonSlots]);

  const placeCategoryInComparisonSlot = (
    slotIndex: number,
    category: string,
  ) => {
    if (!availableCategories.includes(category)) return;

    setComparisonSlots((slots) => {
      const nextSlots = slots.map((slotCategory) =>
        slotCategory === category ? null : slotCategory,
      );
      nextSlots[slotIndex] = category;
      return nextSlots;
    });
  };

  const clearComparisonSlot = (slotIndex: number) => {
    setComparisonSlots((slots) => {
      const remainingCategories = slots.filter(
        (category, index) => category && index !== slotIndex,
      );

      return Array.from(
        { length: COMPARISON_SLOTS_COUNT },
        (_, index) => remainingCategories[index] ?? null,
      );
    });
  };

  const selectedMonthIpBox = Number(selectedBudget?.ip_box ?? 0);
  const selectedMonthBelongsToYear = selectedBudget?.month.startsWith(
    `${year}-`,
  );

  const saveIpBoxValue = async () => {
    if (!selectedBudget) return;

    const value = Number(ipBoxInputValue);
    if (!Number.isFinite(value) || value < 0) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        budget: { ip_box: value },
      });
      setEditingIpBox(false);
    } catch (error) {
      console.error("Błąd podczas zapisu kwoty IP Box:", error);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-3xl border border-border-soft bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">
            Roczne podsumowanie finansów
          </p>
          <p className="max-w-lg text-sm text-muted">
            Podsumowanie roczne: inwestycje, podróże, ubrania/sprzęt sportowy
            oraz szacowany zwrot IP Box.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-3 py-2">
            <span className="text-sm text-muted">Rok</span>
            <input
              type="number"
              min="2000"
              max="2100"
              step="1"
              value={year}
              onChange={(e) => {
                const nextYear = Number(e.target.value);
                setYear(isNaN(nextYear) ? currentYear : nextYear);
              }}
              className="w-20 border-none bg-transparent text-right text-sm font-semibold text-foreground outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)] xl:items-start">
        <section className="min-w-0">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-border bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">
                Inwestycje — łączne wydatki w danym roku
              </p>

              <div className="mt-auto">
                {loading ? (
                  <div className="h-8 w-32 animate-pulse rounded bg-border" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {formatSummaryCurrency(
                      summary?.investmentSum ?? 0,
                      showValues,
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border gap-2 border-border bg-surface-muted p-4">
              <p className="text-sm font-medium text-muted">
                IP Box — szacowany zwrot za dany rok dotychczas
              </p>

              <div className="mt-auto">
                {loading || summary == null ? (
                  <div className="h-8 w-32 animate-pulse rounded bg-border" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {formatSummaryCurrency(summary.ipBoxSum, showValues)}
                  </p>
                )}
              </div>

              {selectedBudget && selectedMonthBelongsToYear && (
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
                    <span>Kwota dla {selectedBudget.month}</span>
                    {editingIpBox ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          setIpBoxInputValue(selectedMonthIpBox.toFixed(2));
                          setEditingIpBox(true);
                        }}
                        className="rounded p-1 text-muted transition hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Edytuj kwotę IP Box dla wybranego miesiąca"
                        title="Edytuj kwotę IP Box"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {editingIpBox ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        autoFocus
                        value={ipBoxInputValue}
                        onChange={(event) =>
                          setIpBoxInputValue(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveIpBoxValue();
                          if (event.key === "Escape") setEditingIpBox(false);
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-2 py-1 text-right text-sm font-semibold text-foreground outline-none focus:border-border-strong focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        disabled={updateBudgetMutation.isPending}
                        onClick={saveIpBoxValue}
                        className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Zapisz
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-foreground-soft">
                      {formatSummaryCurrency(selectedMonthIpBox, showValues)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <ComparisonCard
                title="Podróże — planowane vs zrealizowane"
                planned={summary?.travelPlanned ?? null}
                actual={summary?.travelActual ?? null}
                loading={loading}
                baseColor="var(--category-9)"
              />
            </div>

            <div className="min-w-0">
              <ComparisonCard
                title="Ubrania / sprzęt sportowy — planowane vs zrealizowane"
                planned={summary?.clothesPlanned ?? null}
                actual={summary?.clothesActual ?? null}
                loading={loading}
                baseColor="var(--category-11)"
              />
            </div>

            {comparisonSlots.map((category, slotIndex) => {
              if (slotIndex > 0 && !comparisonSlots[slotIndex - 1]) return null;

              const comparison = category ? comparisonData[category] : null;

              const dropHandlers = {
                onDragOver: (event: React.DragEvent<HTMLElement>) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                },
                onDrop: (event: React.DragEvent<HTMLElement>) => {
                  event.preventDefault();
                  placeCategoryInComparisonSlot(
                    slotIndex,
                    event.dataTransfer.getData("text/plain"),
                  );
                },
              };

              return (
                <div key={slotIndex} className="min-w-0" {...dropHandlers}>
                  {category && comparison ? (
                    <ComparisonCard
                      title={`${category} — planowane vs zrealizowane`}
                      planned={comparison.planned}
                      actual={comparison.actual}
                      loading={monthlyTotalsLoading || yearlyBudgetsLoading}
                      baseColor={
                        categoryColors[category] ?? categoryChartColors[0]
                      }
                      action={
                        <button
                          type="button"
                          onClick={() => clearComparisonSlot(slotIndex)}
                          className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`Usuń kategorię ${category} z porównania`}
                          title="Usuń z porównania"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        placeCategoryInComparisonSlot(
                          slotIndex,
                          selectedCategory,
                        )
                      }
                      className="flex min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted p-4 text-center text-sm font-medium text-muted transition hover:border-primary hover:bg-surface-subtle hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`Dodaj kategorię do pola porównania ${slotIndex + 1}`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current">
                        <Plus size={20} aria-hidden="true" />
                      </span>
                      <span>Przeciągnij tutaj kategorię</span>
                      <span className="text-xs font-normal">
                        lub dodaj wybraną kategorię
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-w-0">
          <div
            className="flex flex-wrap gap-2"
            aria-label="Wybór kategorii wykresu"
          >
            {availableCategories.map((category) => {
              const active = category === selectedCategory;
              const color = categoryColors[category];

              return (
                <button
                  key={category}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("text/plain", category);
                  }}
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedCategoryForChart(category);
                    saveSelectedCategoryToCookie(category);
                    if (globallySelectedCategory !== category) {
                      dispatch(setSelectedCategory(category));
                    }
                  }}
                  className={`shrink-0 cursor-grab rounded-xl border px-3 py-2 text-sm font-medium text-foreground-soft transition hover:brightness-95 active:cursor-grabbing ${
                    active ? "shadow-sm" : "bg-surface"
                  }`}
                  style={{
                    backgroundColor: active ? color : undefined,
                    borderColor: color,
                    color: active ? "var(--app-chart-label)" : undefined,
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <YearlyCategoryExpensesChart
            category={selectedCategory}
            color={categoryColors[selectedCategory] ?? categoryChartColors[0]}
            year={year}
            monthlyTotals={monthlyTotals}
            loading={monthlyTotalsLoading}
            showValues={showValues}
          />

          <YearlyIncomeAndExpensesChart
            year={year}
            monthlyOverview={monthlyOverview}
            loading={monthlyTotalsLoading || yearlyBudgetsLoading}
            showValues={showValues}
          />
        </section>
      </div>
    </div>
  );
};

export default YearlyInvestmentSummary;
