import { screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { useAppSelector } from "../store/reduxHook";
import { renderWithProviders } from "./render";

const SelectedMonth = () => {
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  return <span>{selectedMonth}</span>;
};

it("renders with an isolated Redux store and preloaded state", () => {
  const { store } = renderWithProviders(<SelectedMonth />, {
    preloadedState: {
      config: {
        selectedMonth: "2026-10",
        selectedCategory: "",
      },
    },
  });

  expect(screen.getByText("2026-10")).toBeInTheDocument();
  expect(store.getState().config.selectedMonth).toBe("2026-10");
});
