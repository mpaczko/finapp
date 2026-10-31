import { useMemo } from "react";
import {
  useBudgetQuery,
  useYearlyBudgetsQuery,
  useUpdateBudgetMutation,
} from "../../../features/budgets/queries";
import { useCategoriesQuery } from "../../../features/categories/queries";
import { useYearlyExpenseTotalsQuery } from "../../../features/expenses/queries";
import { useYearlySummaryQuery } from "../../../features/summary/queries";
import { categoryChartColors } from "../../../lib/categoryColors";

type UseYearlyInvestmentSummaryDataParams = {
  userId: string | null;
  selectedMonth: string;
  year: number;
};

export const useYearlyInvestmentSummaryData = ({
  userId,
  selectedMonth,
  year,
}: UseYearlyInvestmentSummaryDataParams) => {
  const enabled = Boolean(userId);
  const { data: budgets = [] } = useBudgetQuery(selectedMonth, enabled);
  const { data: yearlyBudgets = [], isLoading: yearlyBudgetsLoading } =
    useYearlyBudgetsQuery(year, enabled);
  const updateBudgetMutation = useUpdateBudgetMutation(selectedMonth);
  const { data: summary, isLoading: summaryLoading } = useYearlySummaryQuery(
    year,
    enabled,
  );
  const { data: monthlyTotals = [], isLoading: monthlyTotalsLoading } =
    useYearlyExpenseTotalsQuery(year, enabled);
  const { data: categories = [] } = useCategoriesQuery(enabled);

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

  const comparisonData = useMemo(
    () =>
      Object.fromEntries(
        availableCategories.map((category) => {
          const categoryKey = categoryKeys[category];
          const planned = yearlyBudgets.reduce((sum, budget) => {
            if (!categoryKey) return sum;

            return (
              sum +
              Number((budget as Record<string, unknown>)[categoryKey] ?? 0)
            );
          }, 0);
          const actual = monthlyTotals
            .filter((entry) => entry.category === category)
            .reduce((sum, entry) => sum + entry.total, 0);

          return [category, { planned, actual }];
        }),
      ) as Record<string, { planned: number; actual: number }>,
    [availableCategories, categoryKeys, monthlyTotals, yearlyBudgets],
  );

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

  return {
    availableCategories,
    categoryColors,
    comparisonData,
    monthlyOverview,
    monthlyTotals,
    monthlyTotalsLoading,
    selectedBudget: budgets[0],
    summary,
    summaryLoading,
    updateBudgetMutation,
    yearlyBudgetsLoading,
  };
};
