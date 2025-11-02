import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

type ConfigState = {
  selectedMonth: string;
};

const initialState: ConfigState = {
  selectedMonth: format(new Date(), "yyyy-MM"),
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
  },
});

export const { setSelectedMonth } = configSlice.actions;
export default configSlice.reducer;
