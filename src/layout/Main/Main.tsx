import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../../createClient";
import { setExpenses } from "../../store/expensesSlice/expensesSlice";
import { setCategories } from "../../store/categoriesSlice/categoriesSlice";
import { setSelectedBudget } from "../../store/selectedBudgetSlice/selectedBudgetSlice";
import CategoriesSummaryTable from "../../modules/CategoriesSummaryTable";
import SummaryTable from "../../modules/SummaryTable";
import ElementsTable from "../../modules/AllExpensesTable";
import YearlyInvestmentSummary from "../../modules/YearlyInvestmentSummary";
import { expensesApi } from "../../lib/expensesApi";

type Props = {
  userId: string | null;
  selectedMonth: string;
};

const Main = ({ userId, selectedMonth }: Props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  async function fetchExpenses(month: string) {
    if (!userId) return;

    const data = await expensesApi.listByMonth(month);
    dispatch(setExpenses(data));
  }

  async function fetchCategories() {
    if (!userId) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    if (data) dispatch(setCategories(data));
  }

  async function fetchBudget(month: string) {
    if (!userId) return;

    const { data } = await supabase
      .from("budgets")
      .select("*")
      .eq("month", month)
      .eq("user_id", userId);

    if (data) dispatch(setSelectedBudget(data));
  }

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      setLoading(true);

      await Promise.all([
        fetchExpenses(selectedMonth),
        fetchBudget(selectedMonth),
        fetchCategories(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [selectedMonth, userId]);

  if (loading) {
    return (
      <main className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl px-8 py-6 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">
            Ładowanie danych...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-1 gap-6 px-6 pb-20 pt-20 xl:grid-cols-2 xl:items-start">
      <div className="min-w-0">
        <CategoriesSummaryTable />
      </div>
      <div className="min-w-0">
        <YearlyInvestmentSummary userId={userId} />
        <SummaryTable />
        <ElementsTable
          onDelete={async () => {
            await fetchExpenses(selectedMonth);
          }}
        />
      </div>
    </main>
  );
};

export default Main;
