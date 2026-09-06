import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Budget = {
  id: number;
  created_at: string;
  month: string;
  previous_month_savings: number;
  income: number;
  rent: number;
  media: number;
  home_stuff: number;
  food: number;
  hangouts: number;
  parties: number;
  suplements: number;
  entertainment: number;
  health_and_beauty: number;
  travels: number;
  transport: number;
  clothes: number;
  investments: number;
  company_cost: number;
  others: number;
  ip_box: number;
};

type BudgetState = {
  items: Budget[];
  loading: boolean;
  error: string | null;
};

const initialState: BudgetState = {
  items: [],
  loading: false,
  error: null,
};

const selectedBudgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    clearSelectedBudget: (state) => {
      state.items = [];
    },
    setSelectedBudget: (state, action: PayloadAction<Budget[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setSelectedBudget, clearSelectedBudget } =
  selectedBudgetSlice.actions;
export default selectedBudgetSlice.reducer;
