import React, { useEffect, useState } from "react";
import { supabase } from "./createClient";
import { useDispatch } from "react-redux";
import ExpenseDialog from "./components/ExpenseDialog";
import { setExpenses } from "./store/expensesSlice/expensesSlice";
import ElementsTable from "./components/AllExpensesTable";
import { setCategories } from "./store/categoriesSlice/categoriesSlice";
import CategoriesSummaryTable from "./components/CategoriesSummaryTable";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { pl } from "date-fns/locale";

const App = () => {
  const dispatch = useDispatch();

  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM") // domyślnie aktualny miesiąc
  );

  // 🔹 Funkcja pobierająca wydatki tylko z wybranego miesiąca
  async function fetchExpenses(month) {
    const startDate = format(
      startOfMonth(new Date(month + "-01")),
      "yyyy-MM-dd"
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

  useEffect(() => {
    fetchExpenses(selectedMonth);
    fetchCategories();
  }, [selectedMonth]);

  const readableMonth = format(new Date(selectedMonth + "-01"), "LLLL yyyy", {
    locale: pl,
  });

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex flex-row gap-3 items-center">
          <h1 className="text-xl font-semibold text-gray-800">Budżet</h1>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded border px-3 py-1 text-sm font-bold"
          />
        </div>

        <ExpenseDialog fetchExpenses={() => fetchExpenses(selectedMonth)} />
      </nav>

      <main className="pt-20 flex flex-wrap justify-between gap-2 px-6">
        <CategoriesSummaryTable selectedMonth={selectedMonth} />
        <ElementsTable
          fetchExpenses={() => fetchExpenses(selectedMonth)}
          selectedMonth={selectedMonth}
        />
      </main>
    </div>
  );
};

export default App;
