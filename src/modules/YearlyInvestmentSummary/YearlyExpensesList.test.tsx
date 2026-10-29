import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { expect, it } from "vitest";

import { server } from "../../test/mocks/server";
import { renderWithProviders } from "../../test/render";
import YearlyExpensesList from "./YearlyExpensesList";

it("requests yearly expenses with the selected category and month", async () => {
  const requestUrls: URL[] = [];
  server.use(
    http.get("*/api/expenses/yearly", ({ request }) => {
      requestUrls.push(new URL(request.url));
      return HttpResponse.json({ items: [], nextCursor: null });
    }),
  );
  const user = userEvent.setup();

  renderWithProviders(<YearlyExpensesList year={2026} enabled />);

  await screen.findByText("Brak wydatków w wybranym roku.");
  await user.selectOptions(screen.getByLabelText("Kategoria"), "jedzenie");

  await waitFor(() => {
    expect(requestUrls.at(-1)?.searchParams.get("category")).toBe("jedzenie");
  });

  await user.selectOptions(screen.getByLabelText("Miesiąc"), "10");

  await waitFor(() => {
    const requestUrl = requestUrls.at(-1);
    expect(requestUrl?.searchParams.get("category")).toBe("jedzenie");
    expect(requestUrl?.searchParams.get("month")).toBe("10");
  });
});
