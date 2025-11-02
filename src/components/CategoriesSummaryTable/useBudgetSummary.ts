import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";

export interface CategorySummary {
  name: string;
  actual: number;
  planned: number;
}

export const useBudgetSummary = () => {
  const expenses = useAppSelector((state) => state.expenses);
  const categories = useAppSelector((state) => state.categories.items);
  const budget = useAppSelector((state) => state.budget.items?.[0]);

  const [plannedMap, setPlannedMap] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budget && categories.length > 0) {
      const newMap: Record<string, number> = {};
      categories.forEach((cat) => {
        const key = cat.key || cat.name;
        const plannedValue = (budget as any)[key];
        if (plannedValue !== undefined) {
          newMap[cat.name] = plannedValue;
        }
      });
      setPlannedMap(newMap);
    }
  }, [budget, categories]);

  const summary: CategorySummary[] = categories.map((cat) => {
    const actualSum = expenses.items
      .filter((exp) => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.cost, 0);

    return {
      name: cat.name,
      planned: plannedMap[cat.name] ?? 0,
      actual: actualSum,
    };
  });

  const totals = {
    planned: summary.reduce((sum, row) => sum + row.planned, 0),
    actual: summary.reduce((sum, row) => sum + row.actual, 0),
    diff: 0,
  };

  totals.diff = totals.planned - totals.actual;

  totals["diff"] = totals.planned - totals.actual;

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
