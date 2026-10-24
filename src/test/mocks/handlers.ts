import { HttpResponse, http } from "msw";

import {
  createAuthUser,
  createBudget,
  createCategory,
  createExpense,
  createYearlySummary,
} from "../factories";

const apiPath = "*/api";

export const handlers = [
  http.get(`${apiPath}/auth/me`, () => HttpResponse.json(createAuthUser())),
  http.post(`${apiPath}/auth/login`, () =>
    HttpResponse.json({ user: createAuthUser() }),
  ),
  http.get(`${apiPath}/expenses/monthly-totals`, () =>
    HttpResponse.json([
      {
        category: "jedzenie",
        month: 10,
        total: 42.5,
      },
    ]),
  ),
  http.get(`${apiPath}/expenses`, () => HttpResponse.json([createExpense()])),
  http.post(`${apiPath}/expenses`, async ({ request }) => {
    const expense = (await request.json()) as Partial<
      ReturnType<typeof createExpense>
    >;

    return HttpResponse.json(
      createExpense({ ...expense, id: "expense-created" }),
      { status: 201 },
    );
  }),
  http.post(`${apiPath}/expenses/batch`, async ({ request }) => {
    const { expenses = [] } = (await request.json()) as {
      expenses?: Partial<ReturnType<typeof createExpense>>[];
    };

    return HttpResponse.json(
      expenses.map((expense, index) =>
        createExpense({ ...expense, id: `expense-created-${index + 1}` }),
      ),
      { status: 201 },
    );
  }),
  http.patch(`${apiPath}/expenses/:id`, async ({ params, request }) => {
    const expense = (await request.json()) as Partial<
      ReturnType<typeof createExpense>
    >;

    return HttpResponse.json(
      createExpense({ ...expense, id: String(params.id) }),
    );
  }),
  http.delete(`${apiPath}/expenses/:id`, ({ params }) =>
    HttpResponse.json({ id: String(params.id) }),
  ),
  http.get(`${apiPath}/budgets`, () => HttpResponse.json([createBudget()])),
  http.post(`${apiPath}/budgets`, async ({ request }) => {
    const budget = (await request.json()) as Partial<
      ReturnType<typeof createBudget>
    >;

    return HttpResponse.json(createBudget(budget), { status: 201 });
  }),
  http.patch(`${apiPath}/budgets/:id`, async ({ params, request }) => {
    const budget = (await request.json()) as Partial<
      ReturnType<typeof createBudget>
    >;

    return HttpResponse.json(
      createBudget({ ...budget, id: Number(params.id) }),
    );
  }),
  http.get(`${apiPath}/categories`, () =>
    HttpResponse.json([createCategory()]),
  ),
  http.get(`${apiPath}/summary/yearly`, () =>
    HttpResponse.json(createYearlySummary()),
  ),
];
