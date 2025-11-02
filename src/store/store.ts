import { configureStore } from "@reduxjs/toolkit";
import configSliceReducer from "./configSlice/configSlice";
import expensesReducer from "./expensesSlice/expensesSlice";
import categoriesReducer from "./categoriesSlice/categoriesSlice";
import budgetReducer from "./selectedBudgetSlice/selectedBudgetSlice";

export const store = configureStore({
  reducer: {
    config: configSliceReducer,
    budget: budgetReducer,
    expenses: expensesReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
