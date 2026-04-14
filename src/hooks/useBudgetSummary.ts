import { useEffect, useState } from "react";
import { useAppSelector } from "../store/reduxHook";
import { supabase } from "../createClient";

export interface CategorySummary {
  name: string;
  actual: string;
  planned: string;
}

export const useBudgetSummary = () => {
  const expenses = useAppSelector((state) => state.expenses);
  const categories = useAppSelector((state) => state.categories.items);
  const budget = useAppSelector((state) => state.budget.items?.[0]);

  const { income, previous_month_savings, month: year_n_month } = budget || {};

  const [plannedMap, setPlannedMap] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const toFixedSafe = (value: number | undefined | null) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  useEffect(() => {
    if (budget && categories.length > 0) {
      const newMap: Record<string, number> = {};
      categories.forEach((cat) => {
        const key = cat.key || cat.name;
        const plannedValue = (budget as any)[key];
        newMap[cat.name] = plannedValue ?? 0;
      });
      setPlannedMap(newMap);
    } else {
      setPlannedMap({});
    }
  }, [budget, categories]);

  const summary: CategorySummary[] = categories.map((cat) => {
    const actualSum = expenses.items
      .filter((exp) => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.cost, 0);

    const plannedValue = plannedMap[cat.name] ?? 0;

    return {
      name: cat.name,
      planned: toFixedSafe(plannedValue),
      actual: toFixedSafe(actualSum),
    };
  });

  const plannedSum = summary.reduce(
    (sum, row) => sum + parseFloat(row.planned),
    0
  );

  const actualSum = summary.reduce(
    (sum, row) => sum + parseFloat(row.actual),
    0
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1–12

  let isCurrentMonth = false;

  if (typeof year_n_month === "string") {
    const [budgetYearStr, budgetMonthStr] = year_n_month.split("-");
    const budgetYear = Number(budgetYearStr);
    const budgetMonth = Number(budgetMonthStr);

    isCurrentMonth = budgetYear === currentYear && budgetMonth === currentMonth;
  }

  const currentDay = now.getDate();
  const isEarlyMonth = isCurrentMonth && currentDay < 8;

  const savingsCurrent = isEarlyMonth
    ? (previous_month_savings ?? 0) - actualSum
    : (previous_month_savings ?? 0) + (income ?? 0) - actualSum;

  const savingsEndMonth =
    (previous_month_savings ?? 0) + (income ?? 0) - plannedSum;

  const totals = {
    income: toFixedSafe(income),
    planned: toFixedSafe(plannedSum),
    actual: toFixedSafe(actualSum),
    diff: toFixedSafe(plannedSum - actualSum),

    previous_month_savings: previous_month_savings || 0,

    diffIncomePlanned: toFixedSafe((income ?? 0) - plannedSum),
    diffIncomeActual: toFixedSafe((income ?? 0) - actualSum),

    savingsCurrent: toFixedSafe(savingsCurrent),
    savingsEndMonth: toFixedSafe(savingsEndMonth),
  };

  const savePlannedValue = async (category: string, newValue: number) => {
    if (!budget) return;

    const key =
      categories.find((cat) => cat.name === category)?.key || category;

    setLoading(true);
    setPlannedMap((prev) => ({ ...prev, [category]: newValue }));

    const { error } = await supabase
      .from("budgets")
      .update({ [key]: newValue })
      .eq("id", budget.id);

    setLoading(false);
    if (error) console.error("Błąd podczas zapisu:", error);
  };

  return {
    summary,
    totals,
    editingCategory,
    inputValue,
    loading,
    setEditingCategory,
    setInputValue,
    savePlannedValue,
  };
};
