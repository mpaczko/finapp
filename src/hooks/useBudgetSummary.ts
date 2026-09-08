import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/reduxHook";
import { setSelectedBudget } from "../store/selectedBudgetSlice/selectedBudgetSlice";
import { budgetsApi } from "../lib/budgetsApi";

export interface CategorySummary {
  name: string;
  actual: string;
  planned: string;
}

export const useBudgetSummary = () => {
  const expenses = useAppSelector((state) => state.expenses);
  const categories = useAppSelector((state) => state.categories.items);
  const budget = useAppSelector((state) => state.budget.items?.[0]);

  const { income, previous_month_savings, income_received_at } = budget || {};

  const dispatch = useAppDispatch();

  const [plannedMap, setPlannedMap] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInputValue, setIncomeInputValue] = useState<string>("");
  const [editingPreviousMonthSavings, setEditingPreviousMonthSavings] =
    useState(false);
  const [previousMonthSavingsInputValue, setPreviousMonthSavingsInputValue] =
    useState<string>("");
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
    0,
  );

  const actualSum = summary.reduce(
    (sum, row) => sum + parseFloat(row.actual),
    0,
  );

  const incomeReceived = Boolean(income_received_at);
  const savingsCurrent =
    (previous_month_savings ?? 0) +
    (incomeReceived ? (income ?? 0) : 0) -
    actualSum;

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

    try {
      const updatedBudget = await budgetsApi.update(budget.id, {
        [key]: newValue,
      } as any);
      dispatch(setSelectedBudget([updatedBudget]));
    } catch (error) {
      console.error("Błąd podczas zapisu:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveIncomeValue = async (newValue: number) => {
    if (!budget) return;

    setLoading(true);

    try {
      const updatedBudget = await budgetsApi.update(budget.id, {
        income: newValue,
      });
      dispatch(setSelectedBudget([updatedBudget]));
    } catch (error) {
      console.error("Błąd podczas zapisu przychodu:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreviousMonthSavingsValue = async (newValue: number) => {
    if (!budget) return;

    setLoading(true);

    try {
      const updatedBudget = await budgetsApi.update(budget.id, {
        previous_month_savings: newValue,
      });
      dispatch(setSelectedBudget([updatedBudget]));
    } catch (error) {
      console.error("Błąd podczas zapisu oszczędności:", error);
    } finally {
      setLoading(false);
    }
  };

  const setIncomeReceived = async (received: boolean) => {
    if (!budget) return;

    setLoading(true);

    try {
      const updatedBudget = received
        ? await budgetsApi.confirmIncome(budget.id)
        : await budgetsApi.unconfirmIncome(budget.id);
      dispatch(setSelectedBudget([updatedBudget]));
    } catch (error) {
      console.error("Błąd podczas zmiany statusu wypłaty:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    summary,
    totals,
    incomeReceived,
    editingCategory,
    inputValue,
    editingIncome,
    incomeInputValue,
    editingPreviousMonthSavings,
    previousMonthSavingsInputValue,
    loading,
    setEditingCategory,
    setInputValue,
    setEditingIncome,
    setIncomeInputValue,
    setEditingPreviousMonthSavings,
    setPreviousMonthSavingsInputValue,
    savePlannedValue,
    saveIncomeValue,
    savePreviousMonthSavingsValue,
    setIncomeReceived,
  };
};
