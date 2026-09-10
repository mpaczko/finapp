import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setExpenses } from "../../store/expensesSlice/expensesSlice";
import { setCategories } from "../../store/categoriesSlice/categoriesSlice";
import { setSelectedBudget } from "../../store/selectedBudgetSlice/selectedBudgetSlice";
import CategoriesSummaryTable from "../../modules/CategoriesSummaryTable";
import ElementsTable from "../../modules/AllExpensesTable";
import YearlyInvestmentSummary from "../../modules/YearlyInvestmentSummary";
import { expensesApi } from "../../lib/expensesApi";
import { budgetsApi } from "../../lib/budgetsApi";
import { categoriesApi } from "../../lib/categoriesApi";

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

    const data = await categoriesApi.list();
    dispatch(setCategories(data));
  }

  async function fetchBudget(month: string) {
    if (!userId) return;

    const data = await budgetsApi.listByMonth(month);
    dispatch(setSelectedBudget(data));
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
    <main className="grid grid-cols-1 gap-4 px-4 pb-20 pt-25 sm:px-6 xl:grid-cols-2 xl:items-start">
      <div className="min-w-0">
        <CategoriesSummaryTable />
      </div>
      <div className="grid min-w-0 gap-8">
        <YearlyInvestmentSummary userId={userId} />
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
