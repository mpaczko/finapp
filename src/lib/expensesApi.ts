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

export const expensesApi = {
  listByMonth: (month: string, signal?: AbortSignal) =>
    apiRequest<Expense[]>(`/expenses?month=${encodeURIComponent(month)}`, {
      signal,
    }),

  create: (expense: IAddExpenseForm) =>
    apiRequest<Expense>("/expenses", {
      method: "POST",
      body: expense,
    }),

  update: (id: string, expense: IAddExpenseForm) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: "PATCH",
      body: expense,
    }),

  remove: (id: string) =>
    apiRequest<{ id: string }>(`/expenses/${id}`, {
      method: "DELETE",
    }),
};
