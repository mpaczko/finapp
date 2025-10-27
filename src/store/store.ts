import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "./expensesSlice/expensesSlice";
import categoriesReducer from "./categoriesSlice/categoriesSlice";

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
