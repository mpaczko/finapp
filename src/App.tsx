import { useEffect, useState } from "react";
import { supabase } from "./createClient";
import { useDispatch } from "react-redux";
import { setExpenses } from "./store/expensesSlice/expensesSlice";
import { setCategories } from "./store/categoriesSlice/categoriesSlice";
import { setSelectedBudget } from "./store/selectedBudgetSlice/selectedBudgetSlice";
import { useAppSelector } from "./store/reduxHook";
import { format, startOfMonth, endOfMonth } from "date-fns";

import Main from "./layout/Main";
import Nav from "./layout/Navigation";

const App = () => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    initUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchExpenses(month: string) {
    if (!userId) return;

    const startDate = format(
      startOfMonth(new Date(month + "-01")),
      "yyyy-MM-dd",
    );

    const endDate = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");

    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (data) dispatch(setExpenses(data));
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*");
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
    if (!userId) return;

    fetchExpenses(selectedMonth);
    fetchBudget(selectedMonth);
    fetchCategories();
  }, [selectedMonth, userId]);

  return (
    <div className="min-h-screen">
      <Nav userId={userId} />
      <Main fetchExpenses={fetchExpenses} />
    </div>
  );
};

export default App;
