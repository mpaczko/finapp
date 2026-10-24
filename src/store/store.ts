import { configureStore } from "@reduxjs/toolkit";
import configSliceReducer from "./configSlice/configSlice";

const reducer = {
  config: configSliceReducer,
};

export type RootState = {
  [Key in keyof typeof reducer]: ReturnType<(typeof reducer)[Key]>;
};

export const createAppStore = (preloadedState?: RootState) =>
  configureStore({
    reducer,
    preloadedState,
  });

export const store = createAppStore();

export type AppDispatch = typeof store.dispatch;
