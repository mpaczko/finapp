import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

type ConfigState = {
  selectedMonth: string;
  selectedCategory: string;
};

const initialState: ConfigState = {
  selectedMonth: format(new Date(), "yyyy-MM"),
  selectedCategory: "",
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory =
        state.selectedCategory === action.payload ? "" : action.payload;
    },
  },
});

export const { setSelectedMonth, setSelectedCategory } = configSlice.actions;
export default configSlice.reducer;
