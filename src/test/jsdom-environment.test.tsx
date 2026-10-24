import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

it("provides browser APIs for component tests", () => {
  render(<button type="button">Zapisz</button>);

  expect(screen.getByRole("button", { name: "Zapisz" })).toBeInTheDocument();
  expect(window.localStorage).toBeDefined();
});
