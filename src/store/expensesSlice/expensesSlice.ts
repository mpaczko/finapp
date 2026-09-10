import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Expense = {
  id: string;
  created_at: string;
  name: string;
  category: string;
  date: string;
  cost: number;
};

type ExpensesState = {
  items: Expense[];
  loading: boolean;
  error: string | null;
};

const initialState: ExpensesState = {
  items: [],
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenses: (state) => {
      state.items = [];
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.items = action.payload;
    },
  },
});

export const { clearExpenses, setExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
