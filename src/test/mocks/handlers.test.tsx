import { expect, it } from "vitest";

import { budgetsApi } from "../../lib/budgetsApi";
import { expensesApi } from "../../lib/expensesApi";

it("provides default API responses through MSW", async () => {
  const [expenses, budgets] = await Promise.all([
    expensesApi.listByMonth("2026-10"),
    budgetsApi.listByYear(2026),
  ]);

  expect(expenses).toHaveLength(1);
  expect(expenses[0]).toMatchObject({
    name: "Zakupy spożywcze",
    category: "jedzenie",
  });
  expect(budgets).toHaveLength(1);
  expect(budgets[0]).toMatchObject({ month: "2026-10", food: 1200 });
});
