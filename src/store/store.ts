import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "./expensesSlice/expensesSlice";
import categoriesReducer from "./categoriesSlice/categoriesSlice";
import budgetReducer from "./selectedBudgetSlice/selectedBudgetSlice";

export const store = configureStore({
  reducer: {
    budget: budgetReducer,
    expenses: expensesReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
