import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { renderWithProviders } from "../../test/render";
import MultipleExpenses from "./MultipleExpenses";

it("keeps the import dialog open when every CSV row is invalid", async () => {
  const user = userEvent.setup();
  const { container } = renderWithProviders(<MultipleExpenses />);
  const fileInput = container.querySelector('input[type="file"]');
  const file = new File(
    ["Data;Opis;Kwota\nnie-data;Biedronka;nie-kwota"],
    "bledne-wydatki.csv",
    { type: "text/csv" },
  );

  expect(fileInput).not.toBeNull();
  await user.upload(fileInput as HTMLInputElement, file);

  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText(/Poprawne wydatki:/)).toHaveTextContent(
    "Poprawne wydatki: 0. Błędne wiersze: 1.",
  );
  expect(
    screen.getByText(
      "bledne-wydatki.csv, wiersz 2: Nieprawidłowa data (obsługiwane: RRRR-MM-DD, DD-MM-RRRR, DD.MM.RRRR).",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Wybierz inny plik" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Dodaj wszystkie (0)" }),
  ).toBeDisabled();
});
