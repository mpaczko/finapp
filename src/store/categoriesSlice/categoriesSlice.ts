import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Category = {
  id: number;
  created_at: string;
  name: string;
};

type CategoryState = {
  items: Category[];
  loading: boolean;
  error: string | null;
};

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
