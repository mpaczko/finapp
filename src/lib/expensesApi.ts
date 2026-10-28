import { IAddExpenseForm } from "../modules/ExpenseDialog/ExpenseForm/addExpenseForm.config";
import { apiRequest } from "./apiClient";

export type Expense = {
  id: string;
  created_at: string;
  name: string;
  category: string;
  date: string;
  cost: number;
};

export type MonthlyExpenseTotal = {
  category: string;
  month: number;
  total: number;
};

export type YearlyExpensesPage = {
  items: Expense[];
  nextCursor: string | null;
};

export type CreateExpenseDto = IAddExpenseForm;

const toExpenseDto = ({
  name,
  category,
  date,
  cost,
}: IAddExpenseForm): CreateExpenseDto => ({
  name,
  category,
  date,
  cost,
});

export const expensesApi = {
  listByMonth: (month: string, signal?: AbortSignal) =>
    apiRequest<Expense[]>(`/expenses?month=${encodeURIComponent(month)}`, {
      signal,
    }),

  listYearPage: (year: number, cursor?: string, signal?: AbortSignal) => {
    const query = new URLSearchParams({ year: String(year), limit: "100" });
    if (cursor) query.set("cursor", cursor);

    return apiRequest<YearlyExpensesPage>(`/expenses/yearly?${query}`, {
      signal,
    });
  },

  getMonthlyTotals: (year: number, signal?: AbortSignal) =>
    apiRequest<MonthlyExpenseTotal[]>(
      `/expenses/monthly-totals?year=${encodeURIComponent(year)}`,
      { signal },
    ),

  create: (expense: IAddExpenseForm) =>
    apiRequest<Expense>("/expenses", {
      method: "POST",
      body: toExpenseDto(expense),
    }),

  createMany: (expenses: CreateExpenseDto[]) =>
    apiRequest<Expense[]>("/expenses/batch", {
      method: "POST",
      body: { expenses },
    }),

  update: (id: string, expense: IAddExpenseForm) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: "PATCH",
      body: toExpenseDto(expense),
    }),

  remove: (id: string) =>
    apiRequest<{ id: string }>(`/expenses/${id}`, {
      method: "DELETE",
    }),
};
