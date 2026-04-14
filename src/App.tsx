import { useEffect, useReducer, useState } from "react";
import { supabase } from "./createClient";
import { useDispatch } from "react-redux";
import ExpenseDialog from "./modules/ExpenseDialog";
import { setExpenses } from "./store/expensesSlice/expensesSlice";
import { setCategories } from "./store/categoriesSlice/categoriesSlice";
import CategoriesSummaryTable from "./modules/CategoriesSummaryTable";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { setSelectedBudget } from "./store/selectedBudgetSlice/selectedBudgetSlice";
import { useAppSelector } from "./store/reduxHook";
import { setSelectedMonth } from "./store/configSlice/configSlice";
import ElementsTable from "./modules/AllExpensesTable";
import SummaryTable from "./modules/SummaryTable";
import MultipleExpenses from "./modules/MultipleExpenses";

const App = () => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  async function fetchExpenses(month: string) {
    const startDate = format(
      startOfMonth(new Date(month + "-01")),
      "yyyy-MM-dd",
    );
    const endDate = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      console.error("Błąd podczas pobierania wydatków:", error);
    }

    if (data) {
      dispatch(setExpenses(data));
    }
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error(error);
    if (data) dispatch(setCategories(data));
  }

  async function fetchBudget(month: string) {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("month", month);

    if (error) console.error(error);
    if (data) dispatch(setSelectedBudget(data));
  }

  useEffect(() => {
    fetchExpenses(selectedMonth);
    fetchBudget(selectedMonth);
    fetchCategories();
  }, [selectedMonth]);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex flex-row gap-3 items-center">
          <h1 className="text-xl font-semibold text-gray-800">Budżet</h1>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
            className="rounded border px-3 py-1 text-sm font-bold"
          />
        </div>

        <div className="flex gap-5">
          <MultipleExpenses />
          <ExpenseDialog />
        </div>
      </nav>

      <main className="pt-20 flex flex-wrap gap-2 px-6 pb-20">
        <CategoriesSummaryTable />
        <div>
          <SummaryTable />
          <ElementsTable onDelete={() => fetchExpenses(selectedMonth)} />
        </div>
      </main>
    </div>
  );
};

export default App;
