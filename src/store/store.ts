import { configureStore } from "@reduxjs/toolkit";
import configSliceReducer from "./configSlice/configSlice";

export const store = configureStore({
  reducer: {
    config: configSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
